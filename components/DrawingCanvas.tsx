
import React, { useRef, useState, WheelEvent, MouseEvent as ReactMouseEvent, useCallback, useEffect } from 'react';
import { Point, SceneType, ViewBox, SceneLabelVisibility } from '../types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, UNIT_CIRCLE_RADIUS_FACTOR, HYPERBOLIC_RADIUS_FACTOR,
  EULER_SPIRAL_RADIUS_FACTOR, AREA_PROOF_UNIT_SCALE_FACTOR,
  COLORS, GEOMETRIC_AREA_PROOF_COLORS
} from '../constants';
import { TrigonometryScene } from './scenes/TrigonometryScene';
import { HyperbolicScene } from './scenes/HyperbolicScene';
import { NaturalExponentialProofScene } from './scenes/NaturalExponentialProofScene';
import { GeometricAreaProofScene } from './scenes/GeometricAreaProofScene';
import { SecantIntegralProofScene } from './scenes/SecantIntegralProofScene';

interface DrawingCanvasProps {
  angleDegrees: number;
  currentSceneId: SceneType;
  viewBox: ViewBox;
  onViewBoxChange: (newViewBox: ViewBox) => void;
  showCircularInHyperbolic: boolean;
  visibleLabels: SceneLabelVisibility;
}

interface PanState {
  svgPointAtMouseDown: Point;
  viewBoxAtMouseDown: ViewBox;
  inverseCTMAtMouseDown: DOMMatrix | null;
}

const IntegralExplanationContent: React.FC = () => (
  <div className="integral-explanation-box-content">
    <ol>
      <li>
        <strong>Only in I quadrant, so tanθ is +ve real no:</strong>
        <p className="sub-item">Let tanθ = √F(x)</p>
        <p className="sub-item">Area(ΔOAB) = ½ tanθ = ½√F(x)</p>
      </li>
      <li>
        <strong>You know How Polar Area is calculated:</strong>
        <p className="sub-item">A = ½ ∫ r²dφ. For r(φ)=secφ:</p>
        <p className="sub-item">A = ½ ∫<sub>0</sub><sup>θ</sup> sec²φ dφ = ½ tanθ</p>
      </li>
      <li>
        <strong>We want to see how θ and x interplay:</strong>
        <p className="sub-item">If θ = arctan(√F(x)), then</p>
        <p className="sub-item">dθ = F'(x)dx / [2√F(x)(1+F(x))]</p>
      </li>
      <li>
        <strong>The Area Integral thus becomes:</strong>
        <p className="sub-item">A = ½ ∫<sub>x₀</sub><sup>xₜ</sup> sec²θ dθ</p>
        <p className="sub-item" style={{ marginLeft: '1.5em' }}>= ½ ∫<sub>x₀</sub><sup>xₜ</sup> (1+F(x)) • dθ</p>
        <p className="sub-item" style={{ marginLeft: '1.5em' }}>= ½ ∫<sub>x₀</sub><sup>xₜ</sup> [F'(x) / 2√F(x)] dx</p>
      </li>
      <li>
        <strong>But we already know the area is (1/2)√F(x<sub>t</sub>):</strong>
        <p className="formula-emphasis"> ∴   ∫<sub>x₀</sub><sup>xₜ</sup> [F'(x)/2√F(x)]dx = √F(x<sub>t</sub>)</p>
      </li>
    </ol>
  </div>
);


const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  angleDegrees,
  currentSceneId,
  viewBox,
  onViewBoxChange,
  showCircularInHyperbolic,
  visibleLabels
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<PanState | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const getSvgCoordinatesWithGivenCTM = (event: { clientX: number, clientY: number }, svg: SVGSVGElement, invCTM: DOMMatrix): Point => {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(invCTM);
  };

  const getSvgCoordinatesFallback = (event: ReactMouseEvent | WheelEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return { x: 0, y: 0 };
    return pt.matrixTransform(screenCTM.inverse());
  };


  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (!svgRef.current) return;
    const svg = svgRef.current;

    let mousePos: Point;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const invCTM = ctm.inverse();
      mousePos = getSvgCoordinatesWithGivenCTM(event, svg, invCTM);
    } else {
      mousePos = getSvgCoordinatesFallback(event);
    }

    const zoomFactor = event.deltaY > 0 ? 1.1 : 1 / 1.1;

    const newWidth = viewBox.width * zoomFactor;
    const newHeight = viewBox.height * zoomFactor;

    const newX = mousePos.x - (mousePos.x - viewBox.x) * zoomFactor;
    const newY = mousePos.y - (mousePos.y - viewBox.y) * zoomFactor;

    onViewBoxChange({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleMouseDown = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const invCTM = ctm.inverse();

    const mousePos = getSvgCoordinatesWithGivenCTM(event, svg, invCTM);

    setIsPanning(true);
    setPanStart({
      svgPointAtMouseDown: mousePos,
      viewBoxAtMouseDown: { ...viewBox },
      inverseCTMAtMouseDown: invCTM
    });

    svg.style.cursor = 'grabbing';
  };

  const performPan = useCallback((mousePos: Point) => {
    if (!isPanning || !panStart) return;

    const dx = mousePos.x - panStart.svgPointAtMouseDown.x;
    const dy = mousePos.y - panStart.svgPointAtMouseDown.y;

    onViewBoxChange({
      width: panStart.viewBoxAtMouseDown.width,
      height: panStart.viewBoxAtMouseDown.height,
      x: panStart.viewBoxAtMouseDown.x - dx,
      y: panStart.viewBoxAtMouseDown.y - dy,
    });
  }, [isPanning, panStart, onViewBoxChange]);

  const handleMouseMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!isPanning || !panStart || !panStart.inverseCTMAtMouseDown || !svgRef.current) return;
    event.preventDefault();

    const svg = svgRef.current;
    const invCTM = panStart.inverseCTMAtMouseDown;
    const mousePos = getSvgCoordinatesWithGivenCTM(event, svg, invCTM);

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(() => {
      performPan(mousePos);
    });
  };

  const handleMouseUpOrLeave = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (event.type === 'mouseup' && event.button !== 0 && isPanning) return;

    if (isPanning) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (panStart && panStart.inverseCTMAtMouseDown && svgRef.current) {
        const svg = svgRef.current;
        const invCTM = panStart.inverseCTMAtMouseDown;
        const mousePos = getSvgCoordinatesWithGivenCTM(event, svg, invCTM);
        performPan(mousePos);
      }
      setIsPanning(false);
      setPanStart(null);
      if (svgRef.current) {
        svgRef.current.style.cursor = 'grab';
      }
    }
  };

  useEffect(() => {
    const currentSvgRef = svgRef.current;
    if (currentSvgRef) {
      currentSvgRef.style.cursor = 'grab';
    }
    const idRef = animationFrameId;
    return () => {
      if (idRef.current) {
        cancelAnimationFrame(idRef.current);
        idRef.current = null;
      }
    };
  }, []);

  const initialCenterX = (currentSceneId === 'natural_exponential_proof' || currentSceneId === 'geometric_area_proof') ? CANVAS_WIDTH * 0.35 : CANVAS_WIDTH / 2;
  const initialCenterY = CANVAS_HEIGHT / 2;

  const baseRadius = Math.min(initialCenterX, initialCenterY) * 0.8;
  const R_canvas = baseRadius * (UNIT_CIRCLE_RADIUS_FACTOR / 0.35);
  const R_hp = baseRadius * (HYPERBOLIC_RADIUS_FACTOR / 0.35);
  const R_geom_proof_scaled_unit = baseRadius * (AREA_PROOF_UNIT_SCALE_FACTOR / 0.35);

  const eulerCanvasVisibleRadius = Math.min(initialCenterX * 0.9, initialCenterY * 0.9);
  const R_euler_unit_vis = eulerCanvasVisibleRadius * EULER_SPIRAL_RADIUS_FACTOR / 0.25;

  const commonSceneProps = {
    angleDegrees,
    viewBox,
    initialCenterX,
    initialCenterY,
  };

  const showIntegralBox = currentSceneId === 'geometric_area_proof' && visibleLabels.geometric_area_proof.integralExplanationText;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ 
            backgroundColor: COLORS.background,
            display: 'block',
            width: '100%',
            height: '100%',
         }}
        aria-label="Geometric visualization canvas"
        role="img"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="subtleGlowingBorder" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor={GEOMETRIC_AREA_PROOF_COLORS.integralTextBoxBorder} floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* SVG patterns for text box removed as it's now HTML */}
        </defs>
        <title>{
          currentSceneId === 'trigonometry' ? 'Trigonometric Functions Visualization' :
            currentSceneId === 'hyperbolic_functions' ? "Hyperbolic Functions Visualization" + (showCircularInHyperbolic ? " with Circular Overlay (ρ = asinh(tan(x)))" : "") :
              currentSceneId === 'natural_exponential_proof' ? "Geometric Derivation of e Visualization" :
                currentSceneId === 'geometric_area_proof' ? "Generalized integral result using Pythagoras theorem Visualization" :
                  "Geometric Visualization"
        }</title>

        {currentSceneId === 'trigonometry' && (
          <TrigonometryScene
            {...commonSceneProps}
            R={R_canvas}
            visibleLabels={visibleLabels.trigonometry}
            isOverlay={false}
          />
        )}
        {currentSceneId === 'hyperbolic_functions' && (
          <>
            <HyperbolicScene
              {...commonSceneProps}
              R_hp={R_hp}
              visibleLabels={visibleLabels.hyperbolic_functions}
              trigVisibleLabels={visibleLabels.trigonometry}
              showCircularInHyperbolic={showCircularInHyperbolic}
            />
            {showCircularInHyperbolic && (
              <TrigonometryScene
                {...commonSceneProps}
                R={R_hp} // Use R_hp for overlay radius
                visibleLabels={visibleLabels.trigonometry}
                isOverlay={true}
                showCombinedCoshSec={visibleLabels.hyperbolic_functions.cosh && visibleLabels.trigonometry.tangentPerspective}
                showCombinedSinhTan={visibleLabels.hyperbolic_functions.sinh && visibleLabels.trigonometry.tangentPerspective}
              />
            )}
          </>
        )}
        {currentSceneId === 'natural_exponential_proof' && (
          <NaturalExponentialProofScene
            {...commonSceneProps}
            R_euler_unit_vis={R_euler_unit_vis}
            visibleLabels={visibleLabels.natural_exponential_proof}
          />
        )}
        {currentSceneId === 'geometric_area_proof' && (
          <GeometricAreaProofScene
            {...commonSceneProps}
            R_geom_proof_scaled_unit={R_geom_proof_scaled_unit}
            visibleLabels={visibleLabels.geometric_area_proof}
          />
        )}

        {currentSceneId === 'secant_integral_proof' && (
          <SecantIntegralProofScene
            {...commonSceneProps}
            R_hp={R_hp}
            visibleLabels={visibleLabels.secant_integral_proof}
          />
        )}
        
      </svg>
      {showIntegralBox && (
        <div className="integral-explanation-box-html" role="document" aria-label="Integral Explanation">
          <IntegralExplanationContent />
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
