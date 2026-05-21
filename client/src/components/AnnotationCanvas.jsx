import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';

const DRAW_COLOR = 'rgba(71, 215, 198, 0.92)';

function drawStroke(context, stroke, width, height) {
  if (!stroke?.points?.length) return;

  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = Math.max(1, stroke.size * width);
  context.globalCompositeOperation = stroke.tool === 'erase' ? 'destination-out' : 'source-over';
  context.strokeStyle = DRAW_COLOR;
  context.shadowBlur = stroke.tool === 'erase' ? 0 : 10;
  context.shadowColor = stroke.tool === 'erase' ? 'transparent' : 'rgba(71, 215, 198, 0.35)';

  context.beginPath();

  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    const x = point.x * width;
    const y = point.y * height;
    context.arc(x, y, Math.max(1, (stroke.size * width) / 2), 0, Math.PI * 2);
    context.fillStyle = stroke.tool === 'erase' ? 'rgba(0,0,0,1)' : DRAW_COLOR;
    if (stroke.tool === 'erase') {
      context.globalCompositeOperation = 'destination-out';
    }
    context.fill();
  } else {
    stroke.points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  }

  context.restore();
}

const AnnotationCanvas = forwardRef(function AnnotationCanvas(
  { imageUrl, overlayUrl, showExpertOverlay, tool, brushSize, aspectRatio, onStrokeCountChange },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [activeStroke, setActiveStroke] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const totalStrokes = useMemo(
    () => strokes.length + (activeStroke ? 1 : 0),
    [strokes.length, activeStroke]
  );

  useEffect(() => {
    onStrokeCountChange?.(strokes.length);
  }, [strokes.length, onStrokeCountChange]);

  useEffect(() => {
    setStrokes([]);
    setActiveStroke(null);
    setIsDrawing(false);
  }, [imageUrl]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setCanvasSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvasSize.width || !canvasSize.height) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvasSize.width * ratio);
    canvas.height = Math.floor(canvasSize.height * ratio);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const redraw = () => {
      context.clearRect(0, 0, canvasSize.width, canvasSize.height);
      strokes.forEach((stroke) => drawStroke(context, stroke, canvasSize.width, canvasSize.height));
      if (activeStroke) {
        drawStroke(context, activeStroke, canvasSize.width, canvasSize.height);
      }
    };

    redraw();
  }, [strokes, activeStroke, canvasSize]);

  const pointFromEvent = useCallback((event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
  }, []);

  const beginStroke = useCallback(
    (event) => {
      if (!canvasRef.current) return;
      event.preventDefault();
      const point = pointFromEvent(event);
      if (!point) return;

      event.currentTarget.setPointerCapture?.(event.pointerId);
      setIsDrawing(true);
      setActiveStroke({
        id: crypto.randomUUID(),
        tool,
        size: brushSize / Math.max(canvasSize.width || 1, 1),
        points: [point]
      });
    },
    [tool, brushSize, canvasSize.width, pointFromEvent]
  );

  const continueStroke = useCallback(
    (event) => {
      if (!isDrawing) return;
      event.preventDefault();
      const point = pointFromEvent(event);
      if (!point) return;

      setActiveStroke((current) => {
        if (!current) return current;
        return {
          ...current,
          points: [...current.points, point]
        };
      });
    },
    [isDrawing, pointFromEvent]
  );

  const endStroke = useCallback(
    (event) => {
      if (!isDrawing) return;
      event.preventDefault();
      const completedStroke = activeStroke;
      setIsDrawing(false);
      setActiveStroke(null);
      if (completedStroke) {
        setStrokes((current) => [...current, completedStroke]);
      }
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    },
    [isDrawing, activeStroke]
  );

  const buildPayload = useCallback(async () => {
    const baseImage = imageRef.current;
    if (!baseImage) {
      throw new Error('Base image is not loaded yet.');
    }

    const exportWidth = baseImage.naturalWidth || canvasSize.width || 1200;
    const exportHeight = baseImage.naturalHeight || canvasSize.height || 900;
    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;

    const context = offscreen.getContext('2d');
    context.drawImage(baseImage, 0, 0, exportWidth, exportHeight);
    strokes.forEach((stroke) => drawStroke(context, stroke, exportWidth, exportHeight));

    return {
      strokes,
      imageDataUrl: offscreen.toDataURL('image/png'),
      canvas: {
        width: exportWidth,
        height: exportHeight
      },
      displayCanvas: canvasSize
    };
  }, [strokes, canvasSize]);

  useImperativeHandle(
    ref,
    () => ({
      undo() {
        setStrokes((current) => current.slice(0, -1));
      },
      clear() {
        setStrokes([]);
        setActiveStroke(null);
      },
      async exportBundle() {
        return buildPayload();
      },
      getStrokeCount() {
        return totalStrokes;
      }
    }),
    [buildPayload, totalStrokes]
  );

  return (
    <div className="viewer-card">
      <div className="viewer-topbar">
        <div>
          <div className="viewer-title">Image Workspace</div>
          <div className="viewer-subtitle">
            Draw directly over the radiograph with the active {tool === 'draw' ? 'marker' : 'eraser'} tool.
          </div>
        </div>
        <div className="value-pill">{totalStrokes} stroke{totalStrokes === 1 ? '' : 's'}</div>
      </div>

      <div
        className="image-stage"
        ref={containerRef}
        style={{ aspectRatio }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Orthopedic X-ray case"
          className="base-xray"
          draggable="false"
        />
        {showExpertOverlay && overlayUrl && (
          <img
            src={overlayUrl}
            alt="Expert annotation overlay"
            className="expert-overlay"
            draggable="false"
          />
        )}
        <canvas
          ref={canvasRef}
          className="annotation-canvas"
          onPointerDown={beginStroke}
          onPointerMove={continueStroke}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
        />
      </div>
    </div>
  );
});

export default AnnotationCanvas;
