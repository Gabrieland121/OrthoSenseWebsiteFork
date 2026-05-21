const fs = require('fs');
const path = require('path');
const dicomParser = require('dicom-parser');
const { PNG } = require('pngjs');

function toInt(value) {
  return value == null ? null : Number(value);
}

function getFirstNumber(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return toInt(value[0]);
  return toInt(value);
}

function normalizePixelArray(pixelArray, pixelRepresentation) {
  if (pixelRepresentation !== 1) {
    return pixelArray;
  }

  const result = new Int16Array(pixelArray.length);
  for (let i = 0; i < pixelArray.length; i++) {
    const value = pixelArray[i];
    result[i] = value & 0x8000 ? value - 0x10000 : value;
  }
  return result;
}

function extractPixelData(dataSet, rows, cols, samplesPerPixel, bitsAllocated, pixelRepresentation) {
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) {
    throw new Error('No pixel data found in DICOM file.');
  }

  const pixelByteArray = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
  if (bitsAllocated === 16) {
    return normalizePixelArray(new Uint16Array(pixelByteArray.buffer, pixelByteArray.byteOffset, pixelByteArray.length / 2), pixelRepresentation);
  }

  return new Uint8Array(pixelByteArray.buffer, pixelByteArray.byteOffset, pixelByteArray.length);
}

function applyRescale(value, slope, intercept) {
  return value * slope + intercept;
}

function createImagePixels(pixelArray, rows, cols, photometricInterpretation, slope, intercept) {
  const colorSize = rows * cols;
  const image = new Float64Array(colorSize);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < colorSize; i++) {
    let sample = pixelArray[i];
    if (slope !== 1 || intercept !== 0) {
      sample = applyRescale(sample, slope, intercept);
    }
    image[i] = sample;
    min = Math.min(min, sample);
    max = Math.max(max, sample);
  }

  const invert = photometricInterpretation === 'MONOCHROME1';
  const range = max - min || 1;
  const output = new Uint8ClampedArray(colorSize);

  for (let i = 0; i < colorSize; i++) {
    const normalized = ((image[i] - min) / range) * 255;
    const value = invert ? 255 - Math.round(normalized) : Math.round(normalized);
    output[i] = Math.max(0, Math.min(255, value));
  }

  return output;
}

function savePng(outputPath, rows, cols, imagePixels) {
  const png = new PNG({ width: cols, height: rows });
  for (let i = 0; i < rows * cols; i++) {
    const gray = imagePixels[i];
    const base = i * 4;
    png.data[base] = gray;
    png.data[base + 1] = gray;
    png.data[base + 2] = gray;
    png.data[base + 3] = 255;
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    png.pack().pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

function convertDicomFile(filePath, outputDir, outputName) {
  const rawBuffer = fs.readFileSync(filePath);
  const dataSet = dicomParser.parseDicom(rawBuffer);

  const rows = getFirstNumber(dataSet.uint16('x00280010'));
  const cols = getFirstNumber(dataSet.uint16('x00280011'));
  const samplesPerPixel = getFirstNumber(dataSet.uint16('x00280002')) || 1;
  const bitsAllocated = getFirstNumber(dataSet.uint16('x00280100')) || 8;
  const pixelRepresentation = getFirstNumber(dataSet.uint16('x00280103')) || 0;
  const photometricInterpretation = dataSet.string('x00280004') || 'MONOCHROME2';
  const slope = Number(dataSet.floatString('x00281053') || 1);
  const intercept = Number(dataSet.floatString('x00281052') || 0);

  if (!rows || !cols) {
    throw new Error('Invalid image dimensions.');
  }

  if (samplesPerPixel !== 1) {
    throw new Error('Only single-sample monochrome DICOMs are supported by this converter.');
  }

  const pixelData = extractPixelData(dataSet, rows, cols, samplesPerPixel, bitsAllocated, pixelRepresentation);
  const imagePixels = createImagePixels(pixelData, rows, cols, photometricInterpretation, slope, intercept);

  const outputPath = path.join(outputDir, outputName);
  return savePng(outputPath, rows, cols, imagePixels).then(() => outputPath);
}

async function main() {
  const inputDir = process.argv[2] || path.resolve(process.cwd(), 'dicom-input');
  const outputDir = process.argv[3] || path.resolve(process.cwd(), 'client', 'public', 'cases');

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const dicomFiles = fs
    .readdirSync(inputDir)
    .filter((name) => /\.(dcm|dicom)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const caseDefinitions = [
    { caseNumber: 3, views: 3 },
    { caseNumber: 4, views: 2 },
    { caseNumber: 5, views: 3 }
  ];
  const expectedFileCount = caseDefinitions.reduce((total, def) => total + def.views, 0);

  if (dicomFiles.length !== expectedFileCount) {
    console.error(
      `Expected exactly ${expectedFileCount} DICOM files for cases 03-05 (` +
      `3 + 2 + 3 views). Found ${dicomFiles.length}. ` +
      `Place the files in the input folder in case order and run again.`
    );
    process.exit(1);
  }

  console.log(`Converting ${dicomFiles.length} file(s) from ${inputDir} to ${outputDir}...`);

  let fileIndex = 0;
  for (const caseDef of caseDefinitions) {
    for (let viewIndex = 0; viewIndex < caseDef.views; viewIndex += 1) {
      const fileName = dicomFiles[fileIndex];
      const caseId = String(caseDef.caseNumber).padStart(2, '0');
      const viewId = viewIndex + 1;
      const outputName = `case-${caseId}-view-${viewId}.png`;
      const filePath = path.join(inputDir, fileName);

      try {
        const outputPath = await convertDicomFile(filePath, outputDir, outputName);
        console.log(`Converted ${fileName} -> ${path.relative(process.cwd(), outputPath)}`);
      } catch (error) {
        console.error(`Failed to convert ${fileName}: ${error.message}`);
      }

      fileIndex += 1;
    }
  }

  console.log('Conversion complete. Review the generated PNG files in the output folder.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
