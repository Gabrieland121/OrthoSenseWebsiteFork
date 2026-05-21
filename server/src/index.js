const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const submissionsRoot = path.join(__dirname, '..', 'submissions');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

function slugify(value) {
  return String(value || 'anonymous')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'anonymous';
}

function decodeDataUrlToBuffer(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    throw new Error('Invalid PNG data URL');
  }
  return Buffer.from(match[2], 'base64');
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'OrthoSense annotation backend',
    submissionsRoot
  });
});

app.post('/api/annotations', async (req, res) => {
  try {
    const {
      annotatorName,
      caseId,
      caseLabel,
      bodyRegion,
      view,
      showExpertOverlayAtSubmission,
      submittedAt,
      strokes,
      canvas,
      displayCanvas,
      imageDataUrl
    } = req.body || {};

    if (!caseId || !imageDataUrl || !Array.isArray(strokes)) {
      return res.status(400).json({
        error: 'Missing required fields: caseId, strokes, and imageDataUrl are required.'
      });
    }

    const safeAnnotator = slugify(annotatorName);
    const safeCaseId = slugify(caseId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetDirectory = path.join(submissionsRoot, safeAnnotator, safeCaseId, timestamp);

    await fs.mkdir(targetDirectory, { recursive: true });

    const imageBuffer = decodeDataUrlToBuffer(imageDataUrl);

    const annotationRecord = {
      annotatorName,
      annotatorSlug: safeAnnotator,
      caseId,
      caseLabel,
      bodyRegion,
      view,
      showExpertOverlayAtSubmission,
      submittedAt,
      savedAt: new Date().toISOString(),
      canvas,
      displayCanvas,
      strokeCount: strokes.length,
      strokes,
      annotatedImageFilename: 'annotated-image.png'
    };

    await fs.writeFile(
      path.join(targetDirectory, 'annotation.json'),
      JSON.stringify(annotationRecord, null, 2),
      'utf-8'
    );

    await fs.writeFile(path.join(targetDirectory, 'annotated-image.png'), imageBuffer);

    return res.status(201).json({
      message: 'Annotation saved successfully.',
      savedTo: {
        relativeDirectory: path.relative(path.join(__dirname, '..'), targetDirectory),
        files: ['annotation.json', 'annotated-image.png']
      }
    });
  } catch (error) {
    console.error('Failed to save annotation:', error);
    return res.status(500).json({
      error: 'Failed to save annotation.',
      details: error.message
    });
  }
});

app.use('/submissions', express.static(submissionsRoot));

app.listen(PORT, async () => {
  await fs.mkdir(submissionsRoot, { recursive: true });
  console.log(`OrthoSense backend listening on http://localhost:${PORT}`);
});
