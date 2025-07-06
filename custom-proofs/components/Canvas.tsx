import React, { useRef, useEffect, useState, useCallback } from 'react';
import { zoom, zoomIdentity, type ZoomTransform as D3ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import {
  GeometricObject, Point, ObjectType, CircleObject, VectorObject, HyperbolaObject, LineObject, LineSegmentObject, AppParameters, DrawingMode
} from '../types';
import {
  SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, INITIAL_SCALE, GRID_LINE_COLOR, AXIS_LINE_COLOR, DEFAULT_OBJECT_COLOR,
  POLAR_GRID_COLOR, DISCRETE_TRACE_COLOR, DEFAULT_DISCRETE_TRACE_STEPS,
  INTERSECTION_POINT_COLOR, INTERSECTION_POINT_RADIUS_SVG, DERIVATIVE_VECTOR_COLOR,
  DX_COLOR, DY_COLOR, D_THETA_HYPOTENUSE_COLOR, D_THETA_ARC_COLOR, DEFAULT_DIFFERENTIAL_ARC_ANGLE, D_THETA_AUX_VECTOR_COLOR
} from '../constants';
import { 
    getEffectiveCircleRadius, getEffectiveCircleCenter, transformPointToSvg, generateHyperbolaPath, transformPointFromSvg,
    getLineLineIntersectionPoints, getLineCircleIntersectionPoints, getCircleCircleIntersectionPoints
} from '../utils/geometry';
import { evaluateFunction } from '../utils/mathParser';


interface CanvasProps {
  objects: GeometricObject[];
  parameters: AppParameters;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  zoomTransform: D3ZoomTransform;
  onZoomChange: (transform: D3ZoomTransform) => void;
  drawingMode: DrawingMode;
  onAddPointForDrawing: (point: Point) => void;
  showPolarGrid: boolean;
  showCartesianGrid: boolean;
  onUpdateObject: (id: string, updates: Partial<GeometricObject>) => void; // For dragging
}

export const Canvas: React.FC<CanvasProps> = ({
  objects,
  parameters,
  selectedObjectId,
  onSelectObject,
  zoomTransform,
  onZoomChange,
  drawingMode,
  onAddPointForDrawing,
  showPolarGrid,
  showCartesianGrid,
  onUpdateObject
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [gridLines, setGridLines] = useState<{xLines: number[], yLines: number[]}>({xLines: [], yLines: []});
  const scale = INITIAL_SCALE; 

  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [draggedObjectInfo, setDraggedObjectInfo] = useState<{
    id: string;
    originalP1: Point;
    originalP2: Point;
    dragStartGeomPoint: Point;
  } | null>(null);

  const onUpdateObjectRef = useRef(onUpdateObject);
  const zoomTransformRef = useRef(zoomTransform);

  useEffect(() => {
    onUpdateObjectRef.current = onUpdateObject;
  }, [onUpdateObject]);

  useEffect(() => {
    zoomTransformRef.current = zoomTransform;
  }, [zoomTransform]);


  const updateCartesianGridLines = useCallback(() => {
    const currentZoom = zoomTransformRef.current;
    if (!currentZoom) return;
    const newGridLinesData: { xLines: number[]; yLines: number[] } = { xLines: [], yLines: [] };
    const { k, x: tx, y: ty } = currentZoom;

    // Calculate geometric bounds of the current view
    const geomXMin = transformPointFromSvg({ x: 0, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).x;
    const geomXMax = transformPointFromSvg({ x: SVG_VIEWBOX_WIDTH, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).x;
    const geomYMin = transformPointFromSvg({ x: 0, y: SVG_VIEWBOX_HEIGHT }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).y;
    const geomYMax = transformPointFromSvg({ x: 0, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).y;
    
    const idealSpacing = 50 / k; 
    let geomSpacing = 1;
         if (idealSpacing > 20) geomSpacing = 5;
    else if (idealSpacing > 8) geomSpacing = 2;
    else if (idealSpacing > 4) geomSpacing = 1;
    else if (idealSpacing > 2) geomSpacing = 0.5;
    else if (idealSpacing > 0.8) geomSpacing = 0.2;
    else if (idealSpacing > 0.4) geomSpacing = 0.1;
    else if (idealSpacing > 0.2) geomSpacing = 0.05;
    else geomSpacing = 0.025;

    for (let gx = Math.ceil(Math.min(geomXMin, geomXMax) / geomSpacing) * geomSpacing; gx <= Math.max(geomXMin, geomXMax); gx += geomSpacing) {
      newGridLinesData.xLines.push(gx);
    }
    for (let gy = Math.ceil(Math.min(geomYMin, geomYMax) / geomSpacing) * geomSpacing; gy <= Math.max(geomYMin, geomYMax); gy += geomSpacing) {
      newGridLinesData.yLines.push(gy);
    }
    setGridLines(newGridLinesData);
  }, [scale]); 

  useEffect(() => {
    updateCartesianGridLines();
  }, [zoomTransform, updateCartesianGridLines]);


  useEffect(() => {
    if (!svgRef.current) return;
    const svgNode = select(svgRef.current);
    const d3ZoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .filter((event) => {
        if (isDraggingObject) return false;
        return (!event.target || (event.target as SVGElement).isSameNode(svgRef.current!) || (event.target as SVGElement).tagName === 'g');
      })
      .on('zoom', (event: { transform: D3ZoomTransform }) => {
         onZoomChange(event.transform);
      });
    svgNode.call(d3ZoomBehavior);
    if (zoomTransformRef.current) {
        const currentD3Transform = select<SVGSVGElement, unknown>(svgRef.current).property("__zoom");
        if (currentD3Transform.k !== zoomTransformRef.current.k || 
            currentD3Transform.x !== zoomTransformRef.current.x || 
            currentD3Transform.y !== zoomTransformRef.current.y) {
            d3ZoomBehavior.transform(svgNode, zoomTransformRef.current);
        }
    }
  }, [onZoomChange, isDraggingObject]);

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = event.target as SVGElement;
    if (target.closest("[data-id]") || target.closest("[data-intersection-point]")) {
      return;
    }
    if (drawingMode !== DrawingMode.None) {
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const svgPoint: Point = { x: event.clientX - svgRect.left, y: event.clientY - svgRect.top };
      const geometricPoint = transformPointFromSvg(svgPoint, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, zoomTransformRef.current, scale);
      onAddPointForDrawing(geometricPoint);
    } else {
      onSelectObject(null); 
    }
  };

  useEffect(() => {
    const mouseMoveHandler = (event: MouseEvent) => {
      if (!draggedObjectInfo || !svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const currentMouseSvgPoint: Point = { x: event.clientX - svgRect.left, y: event.clientY - svgRect.top };
      const currentZoom = zoomTransformRef.current;
      const currentMouseGeomPoint = transformPointFromSvg(currentMouseSvgPoint, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale);
      const deltaX = currentMouseGeomPoint.x - draggedObjectInfo.dragStartGeomPoint.x;
      const deltaY = currentMouseGeomPoint.y - draggedObjectInfo.dragStartGeomPoint.y;
      const newP1: Point = {
        x: draggedObjectInfo.originalP1.x + deltaX,
        y: draggedObjectInfo.originalP1.y + deltaY,
      };
      const newP2: Point = {
        x: draggedObjectInfo.originalP2.x + deltaX,
        y: draggedObjectInfo.originalP2.y + deltaY,
      };
      requestAnimationFrame(() => {
         onUpdateObjectRef.current(draggedObjectInfo.id, { p1: newP1, p2: newP2 });
      });
    };
    const mouseUpHandler = () => {
      setIsDraggingObject(false);
      setDraggedObjectInfo(null);
    };
    if (isDraggingObject) {
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
      if(svgRef.current) svgRef.current.classList.add('dragging-object');
      return () => {
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        if(svgRef.current) svgRef.current.classList.remove('dragging-object');
      };
    }
  }, [isDraggingObject, draggedObjectInfo, setIsDraggingObject, setDraggedObjectInfo]);

  const handleDragInitiation = (
    event: React.MouseEvent<SVGElement>, 
    objectToDrag: LineObject | LineSegmentObject 
  ) => {
    event.preventDefault(); 
    if (!svgRef.current) return;
    onSelectObject(objectToDrag.id); 
    const svgRect = svgRef.current.getBoundingClientRect();
    const rEvClientX = event.clientX; 
    const rEvClientY = event.clientY;
    const dragStartMouseSvgPoint: Point = { x: rEvClientX - svgRect.left, y: rEvClientY - svgRect.top };
    const dragStartGeomPoint = transformPointFromSvg(dragStartMouseSvgPoint, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, zoomTransformRef.current, scale);
    setDraggedObjectInfo({
      id: objectToDrag.id,
      originalP1: { ...objectToDrag.p1 }, 
      originalP2: { ...objectToDrag.p2 }, 
      dragStartGeomPoint: dragStartGeomPoint,
    });
    setIsDraggingObject(true); 
  };

  const renderPolarGrid = () => {
    const { k } = zoomTransformRef.current;
    const originSvg = transformPointToSvg({ x: 0, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);
    const elements = [];
    const maxScreenDim = Math.max(SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT);
    let idealRadiusStepPx = 75 / k; 
    let geomRadiusStep = 1;
         if (idealRadiusStepPx > 20 * scale) geomRadiusStep = 5;
    else if (idealRadiusStepPx > 8 * scale) geomRadiusStep = 2;
    else if (idealRadiusStepPx > 4 * scale) geomRadiusStep = 1;
    else if (idealRadiusStepPx > 2 * scale) geomRadiusStep = 0.5;
    else geomRadiusStep = 0.25;
    const maxGeomRadius = (maxScreenDim / 2) / (k * scale) + geomRadiusStep;
    for (let r = geomRadiusStep; r <= maxGeomRadius; r += geomRadiusStep) {
        elements.push(
            <circle key={`polar-circ-${r}`} cx={originSvg.x} cy={originSvg.y} r={r * scale}
                stroke={POLAR_GRID_COLOR} strokeWidth={0.5 / k} fill="none" />
        );
    }
    const numRadialLines = 12; 
    const lineLength = maxScreenDim / k; 
    for (let i = 0; i < numRadialLines; i++) {
        const angle = (i * 2 * Math.PI) / numRadialLines;
        const p2x = originSvg.x + lineLength * Math.cos(angle);
        const p2y = originSvg.y + lineLength * Math.sin(angle); 
        elements.push(
            <line key={`polar-line-${i}`} x1={originSvg.x} y1={originSvg.y} x2={p2x} y2={p2y}
                stroke={POLAR_GRID_COLOR} strokeWidth={0.5 / k} />
        );
    }
    return <g>{elements}</g>;
  };

  const renderIntersectionPoints = (obj: GeometricObject) => {
    if (!('showIntersectionsWith' in obj) || !obj.showIntersectionsWith || obj.showIntersectionsWith.length === 0) {
        return null;
    }
    const intersectionElements: React.ReactNode[] = [];
    const currentK = zoomTransformRef.current.k || 1;
    obj.showIntersectionsWith.forEach((targetId, index) => {
        const targetObj = objects.find(o => o.id === targetId);
        if (!targetObj) return;
        let points: Point[] = [];
        if (obj.type === ObjectType.Circle && targetObj.type === ObjectType.Circle) {
            points = getCircleCircleIntersectionPoints(obj as CircleObject, targetObj as CircleObject, parameters, objects);
        } else if (obj.type === ObjectType.Circle && (targetObj.type === ObjectType.Line || targetObj.type === ObjectType.LineSegment)) {
            points = getLineCircleIntersectionPoints(targetObj as LineObject | LineSegmentObject, obj as CircleObject, parameters, objects);
        } else if ((obj.type === ObjectType.Line || obj.type === ObjectType.LineSegment) && targetObj.type === ObjectType.Circle) {
            points = getLineCircleIntersectionPoints(obj as LineObject | LineSegmentObject, targetObj as CircleObject, parameters, objects);
        } 
        else if ((obj.type === ObjectType.Line || obj.type === ObjectType.LineSegment) && (targetObj.type === ObjectType.Line || targetObj.type === ObjectType.LineSegment)) {
            points = getLineLineIntersectionPoints(obj as LineObject | LineSegmentObject, targetObj as LineObject | LineSegmentObject);
        }
        points.forEach((p, pIndex) => {
            const svgP = transformPointToSvg(p, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);
            intersectionElements.push(
                <circle
                    key={`intersect-${obj.id}-${targetId}-${pIndex}`}
                    cx={svgP.x} cy={svgP.y}
                    r={INTERSECTION_POINT_RADIUS_SVG / currentK}
                    fill={INTERSECTION_POINT_COLOR}
                    stroke="black" 
                    strokeWidth={0.5 / currentK}
                    data-intersection-point 
                    style={{ pointerEvents: 'none' }} 
                />
            );
        });
    });
    return <g key={`${obj.id}-intersections`}>{intersectionElements}</g>;
  };

  const renderTextLabel = (text: string, x: number, y: number, color: string, fontSize: number, options?: { dx?: string, dy?: string, textAnchor?: string, dominantBaseline?: string }) => {
    return (
        <text
            x={x}
            y={y}
            fill={color}
            fontSize={fontSize}
            paintOrder="stroke"
            stroke="white"
            strokeWidth={fontSize / 4}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            style={{ pointerEvents: 'none', userSelect: 'none', fill: color }}
            dx={options?.dx}
            dy={options?.dy}
            textAnchor={options?.textAnchor || "middle"}
            dominantBaseline={options?.dominantBaseline || "central"}
        >
            {text}
        </text>
    );
  };

  const renderObject = (obj: GeometricObject) => {
    const objScale = scale; 
    const isSelected = obj.id === selectedObjectId;
    const baseColor = obj.color || DEFAULT_OBJECT_COLOR;
    const effectiveColor = isSelected ? '#A971FF' : baseColor;
    const currentK = zoomTransformRef.current.k || 1;
    const strokeWidth = isSelected ? 2 / currentK : 1 / currentK;
    const labelFontSize = 8 / currentK;
    let cursorClass = 'cursor-pointer'; 
    if (isSelected && (obj.type === ObjectType.Line || obj.type === ObjectType.LineSegment)) {
      cursorClass = 'cursor-move'; 
    }
    if (isDraggingObject && draggedObjectInfo?.id === obj.id) {
        cursorClass = 'cursor-grabbing'; 
    }
    const objectEventHandlers = {
      onClick: (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation(); 
        if (!isDraggingObject) { 
             onSelectObject(obj.id);
        }
      },
      onMouseDown: (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation(); 
        if (obj.type === ObjectType.Line || obj.type === ObjectType.LineSegment) {
          handleDragInitiation(e, obj as LineObject | LineSegmentObject);
        } else {
          onSelectObject(obj.id); 
        }
      },
    };
    const mainElement = (() => {
        switch (obj.type) {
          case ObjectType.Circle: {
            const circle = obj as CircleObject;
            const centerGeom = getEffectiveCircleCenter(circle, parameters, objects);
            const radiusGeom = getEffectiveCircleRadius(circle, parameters, objects);
            const centerSvg = transformPointToSvg(centerGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            const radiusSvg = radiusGeom * objScale;
            const elements = [];
            if (circle.radialFunction && circle.showDiscreteTraces) {
                const xParam = parameters[circle.radialFunction.parameterId];
                if (xParam) {
                    const numSteps = circle.discreteTraceSteps || DEFAULT_DISCRETE_TRACE_STEPS;
                    const stepSize = (xParam.max - xParam.min) / Math.max(1, numSteps -1); 
                    for (let i = 0; i < numSteps; i++) {
                        const xVal = xParam.min + i * stepSize;
                        const traceRadiusGeom = evaluateFunction(circle.radialFunction.funcStr, { x: xVal });
                        if (traceRadiusGeom !== null && traceRadiusGeom >= 0) {
                            const traceRadiusSvg = Math.abs(traceRadiusGeom) * objScale;
                            elements.push(
                                <circle
                                    key={`${circle.id}-trace-${i}`}
                                    cx={centerSvg.x} cy={centerSvg.y} r={Math.max(0, traceRadiusSvg)}
                                    fill="none" stroke={DISCRETE_TRACE_COLOR} strokeWidth={0.7 / currentK}
                                    strokeOpacity="0.6"
                                    strokeDasharray={`${3 / currentK},${3 / currentK}`}
                                />
                            );
                        }
                    }
                }
            }
            elements.push(
              <circle
                key={circle.id} data-id={circle.id}
                cx={centerSvg.x} cy={centerSvg.y} r={Math.max(0, radiusSvg)}
                fill={effectiveColor} fillOpacity="0.3" stroke={effectiveColor} strokeWidth={strokeWidth * 2}
                {...objectEventHandlers}
                className={cursorClass}
              />
            );
            return <g key={`${circle.id}-group`}>{elements}</g>;
          }
          case ObjectType.Hyperbola: {
            const hyperbola = obj as HyperbolaObject;
            const pathData = generateHyperbolaPath(hyperbola, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            return (
              <path
                key={hyperbola.id} data-id={hyperbola.id}
                d={pathData}
                stroke={effectiveColor} strokeWidth={strokeWidth * 1.5} fill="none"
                {...objectEventHandlers}
                className={cursorClass}
              />
            );
          }
          case ObjectType.Line: {
            const line = obj as LineObject;
            if (!line.p1 || !line.p2) return null; 
            const dir = { x: line.p2.x - line.p1.x, y: line.p2.y - line.p1.y };
            const length = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
            if (Math.abs(length) < 1e-9) return null; 
            const largeFactor = Math.max(SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT) * 2 / (scale * currentK); 
            const p1Extended = { x: line.p1.x - dir.x/length * largeFactor, y: line.p1.y - dir.y/length * largeFactor };
            const p2Extended = { x: line.p2.x + dir.x/length * largeFactor, y: line.p2.y + dir.y/length * largeFactor };
            const p1Svg = transformPointToSvg(p1Extended, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            const p2Svg = transformPointToSvg(p2Extended, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            return (
               <line key={line.id} data-id={line.id}
                x1={p1Svg.x} y1={p1Svg.y} x2={p2Svg.x} y2={p2Svg.y}
                stroke={effectiveColor} strokeWidth={strokeWidth * 2} 
                {...objectEventHandlers}
                className={cursorClass}
              />
            );
          }
           case ObjectType.LineSegment: {
            const segment = obj as LineSegmentObject;
            if (!segment.p1 || !segment.p2) return null;
            const p1Svg = transformPointToSvg(segment.p1, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            const p2Svg = transformPointToSvg(segment.p2, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            return (
              <line key={segment.id} data-id={segment.id}
                x1={p1Svg.x} y1={p1Svg.y} x2={p2Svg.x} y2={p2Svg.y}
                stroke={effectiveColor} strokeWidth={strokeWidth * 2.5} 
                {...objectEventHandlers}
                className={cursorClass}
              />
            );
          }
          case ObjectType.Vector: {
            const vector = obj as VectorObject;
            const parentCircle = objects.find(o => o.id === vector.parentId && o.type === ObjectType.Circle) as CircleObject | undefined;
            if (!parentCircle) {
                console.warn(`Parent circle ID ${vector.parentId} not found for vector ${vector.id}`);
                return null;
            }
            const angleParam = parameters[vector.angleParameterId];
            if (!angleParam) {
                console.warn(`Angle parameter ID ${vector.angleParameterId} not found for vector ${vector.id}`);
                return null;
            }
            const angleRad = angleParam.value; 
            const parentCenterGeom = getEffectiveCircleCenter(parentCircle, parameters, objects);
            const parentRadiusGeom = getEffectiveCircleRadius(parentCircle, parameters, objects);
            const tipGeom: Point = {
              x: parentCenterGeom.x + parentRadiusGeom * Math.cos(angleRad),
              y: parentCenterGeom.y + parentRadiusGeom * Math.sin(angleRad)
            };
            const parentCenterSvg = transformPointToSvg(parentCenterGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            const tipSvg = transformPointToSvg(tipGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
            const vectorElements = [];
            const arcRadius = Math.min(20 / currentK, parentRadiusGeom * objScale * 0.3); 
            if (arcRadius > 3 / currentK) { 
                const arcStartX = parentCenterSvg.x + arcRadius;
                const arcStartY = parentCenterSvg.y;
                const arcEndX = parentCenterSvg.x + arcRadius * Math.cos(angleRad);
                const arcEndY = parentCenterSvg.y - arcRadius * Math.sin(-angleRad);
                const largeArcFlag = angleRad > Math.PI ? 1 : 0;
                const sweepFlag = 1; 
                vectorElements.push(
                    <path
                        key={`${vector.id}-anglearc`}
                        d={`M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${arcEndX} ${arcEndY}`}
                        fill="none"
                        stroke={effectiveColor}
                        strokeWidth={0.8 / currentK}
                        opacity="0.7"
                    />
                );
            }
             vectorElements.push(
                <line
                  key={`${vector.id}-line`}
                  x1={parentCenterSvg.x} y1={parentCenterSvg.y}
                  x2={tipSvg.x} y2={tipSvg.y}
                  stroke={effectiveColor} strokeWidth={strokeWidth * 1.5} markerEnd={`url(#arrowhead-${obj.id})`}
                />
            );
            if (vector.showPerpendicular) {
              const perpendicularFootGeom: Point = { x: tipGeom.x, y: parentCenterGeom.y };
              const perpendicularFootXGeom: Point = {x: parentCenterGeom.x, y: tipGeom.y };
              const perpLineYEndSvg = transformPointToSvg(perpendicularFootGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
              const perpLineXEndSvg = transformPointToSvg(perpendicularFootXGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
              vectorElements.push(
                <line
                  key={`${vector.id}-perplinetoyaxis`}
                  x1={tipSvg.x} y1={tipSvg.y}
                  x2={perpLineYEndSvg.x} y2={perpLineYEndSvg.y}
                  stroke={effectiveColor} strokeWidth={strokeWidth} strokeDasharray={`${4 / currentK},${2 / currentK}`} opacity="0.7"
                />
              );
              vectorElements.push(
                <line
                  key={`${vector.id}-perplinetoxaxis`}
                  x1={tipSvg.x} y1={tipSvg.y}
                  x2={perpLineXEndSvg.x} y2={perpLineXEndSvg.y}
                  stroke={effectiveColor} strokeWidth={strokeWidth} strokeDasharray={`${4 / currentK},${2 / currentK}`} opacity="0.7"
                />
              );
            }
            if (vector.showDerivative && parentRadiusGeom > 1e-6) {
                const dx_dtheta = -parentRadiusGeom * Math.sin(angleRad);
                const dy_dtheta = parentRadiusGeom * Math.cos(angleRad);
                const derivStartGeom = tipGeom; 
                const derivEndGeom: Point = {
                    x: derivStartGeom.x + dx_dtheta,
                    y: derivStartGeom.y + dy_dtheta,
                };
                const derivStartSvg = transformPointToSvg(derivStartGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
                const derivEndSvg = transformPointToSvg(derivEndGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
                vectorElements.push(
                    <line
                        key={`${vector.id}-derivative-line`}
                        x1={derivStartSvg.x} y1={derivStartSvg.y}
                        x2={derivEndSvg.x} y2={derivEndSvg.y}
                        stroke={DERIVATIVE_VECTOR_COLOR}
                        strokeWidth={strokeWidth * 1.2} 
                        markerEnd={`url(#arrowhead-deriv-${obj.id})`}
                    />
                );
            }
            if (vector.showDifferentials && parentRadiusGeom > 1e-6) {
                const deltaTheta = vector.differentialArcAngle || DEFAULT_DIFFERENTIAL_ARC_ANGLE;
                const angleInitial = angleRad;
                const angleFinal = angleRad + deltaTheta;
                const pInitialGeom: Point = tipGeom;
                const pFinalGeom: Point = {
                    x: parentCenterGeom.x + parentRadiusGeom * Math.cos(angleFinal),
                    y: parentCenterGeom.y + parentRadiusGeom * Math.sin(angleFinal)
                };
                const qGeom: Point = { x: pFinalGeom.x, y: pInitialGeom.y };
                const pInitialSvg = tipSvg;
                const pFinalSvg = transformPointToSvg(pFinalGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
                const qSvg = transformPointToSvg(qGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
                const differentialStrokeWidth = strokeWidth * 1.1;
                vectorElements.push(
                    <line
                        key={`${vector.id}-vectorAtDeltaTheta`}
                        x1={parentCenterSvg.x} y1={parentCenterSvg.y}
                        x2={pFinalSvg.x} y2={pFinalSvg.y}
                        stroke={D_THETA_AUX_VECTOR_COLOR}
                        strokeWidth={strokeWidth * 1.2} 
                        strokeDasharray={`${3 / currentK},${3 / currentK}`}
                        opacity="0.8"
                    />
                );
                const parentRadiusSvg = parentRadiusGeom * objScale;
                if (parentRadiusSvg > 1e-6) {
                    const arcTipFinalSvgX = parentCenterSvg.x + parentRadiusSvg * Math.cos(angleFinal);
                    const arcTipFinalSvgY = parentCenterSvg.y - parentRadiusSvg * Math.sin(-angleFinal);
                    const largeArcFlag = deltaTheta > Math.PI ? 1 : 0;
                    const sweepFlag = deltaTheta >= 0 ? 1 : 0; 
                     vectorElements.push(
                        <path
                            key={`${vector.id}-deltaThetaArc`}
                            d={`M ${tipSvg.x} ${tipSvg.y} A ${parentRadiusSvg} ${parentRadiusSvg} 0 ${largeArcFlag} ${sweepFlag} ${arcTipFinalSvgX} ${arcTipFinalSvgY}`}
                            fill="none"
                            stroke={D_THETA_ARC_COLOR}
                            strokeWidth={differentialStrokeWidth * 0.8}
                        />
                    );
                    const midAngle = angleInitial + deltaTheta / 2;
                    const labelRadius = parentRadiusGeom * 1.05; 
                    const labelPosGeom = {
                        x: parentCenterGeom.x + labelRadius * Math.cos(midAngle),
                        y: parentCenterGeom.y + labelRadius * Math.sin(midAngle)
                    };
                    const labelPosSvg = transformPointToSvg(labelPosGeom, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, objScale);
                    vectorElements.push(renderTextLabel("Δθ", labelPosSvg.x, labelPosSvg.y, D_THETA_ARC_COLOR, labelFontSize * 0.9));
                }
                const rIsOne = Math.abs(parentRadiusGeom - 1) < 0.01;
                const rStr = rIsOne ? "" : parentRadiusGeom.toFixed(1);
                const dxLabelText = `-${rStr}sin(θ)Δθ`;
                vectorElements.push(
                    <line key={`${vector.id}-dxLine`} x1={pInitialSvg.x} y1={pInitialSvg.y} x2={qSvg.x} y2={qSvg.y}
                          stroke={DX_COLOR} strokeWidth={differentialStrokeWidth}/>
                );
                vectorElements.push(renderTextLabel(dxLabelText, (pInitialSvg.x + qSvg.x)/2, (pInitialSvg.y + qSvg.y)/2, DX_COLOR, labelFontSize * 0.9, {dy: `${-labelFontSize*0.7}px`}));
                const dyLabelText = `${rStr}cos(θ)Δθ`;
                vectorElements.push(
                    <line key={`${vector.id}-dyLine`} x1={qSvg.x} y1={qSvg.y} x2={pFinalSvg.x} y2={pFinalSvg.y}
                          stroke={DY_COLOR} strokeWidth={differentialStrokeWidth}/>
                );
                vectorElements.push(renderTextLabel(dyLabelText, (qSvg.x + pFinalSvg.x)/2, (qSvg.y + pFinalSvg.y)/2, DY_COLOR, labelFontSize * 0.9, {dx: `${labelFontSize*0.7}px`}));
                vectorElements.push(
                    <line key={`${vector.id}-hypLine`} x1={pInitialSvg.x} y1={pInitialSvg.y} x2={pFinalSvg.x} y2={pFinalSvg.y}
                          stroke={D_THETA_HYPOTENUSE_COLOR} strokeWidth={differentialStrokeWidth * 0.8} strokeDasharray={`${2/currentK},${2/currentK}`}/>
                );
                 vectorElements.push(renderTextLabel("≈R·Δθ", (pInitialSvg.x + pFinalSvg.x)/2, (pInitialSvg.y + pFinalSvg.y)/2, D_THETA_HYPOTENUSE_COLOR, labelFontSize * 0.9, {dy: `${labelFontSize*0.7}px`}));
                const ras = 3 / currentK;
                const dxDir = Math.sign(pInitialSvg.x - qSvg.x); 
                const dyDir = Math.sign(pFinalSvg.y - qSvg.y);   
                vectorElements.push(
                    <polyline key={`${vector.id}-rightAngle`}
                              points={`${qSvg.x + dxDir * ras},${qSvg.y} ${qSvg.x},${qSvg.y} ${qSvg.x},${qSvg.y + dyDir * ras}`}
                              stroke={D_THETA_HYPOTENUSE_COLOR} strokeWidth={differentialStrokeWidth * 0.7} fill="none"/>
                );
            }
            return (
              <g key={vector.id} data-id={vector.id} {...objectEventHandlers} className={cursorClass}>
                <defs>
                  <marker 
                    id={`arrowhead-${obj.id}`} 
                    markerWidth="7" markerHeight="6" 
                    refX="7" refY="3" 
                    orient="auto-start-reverse" 
                  >
                    <polygon points="0 1, 7 3, 0 5" fill={effectiveColor} /> 
                  </marker>
                  {vector.showDerivative && (
                     <marker 
                        id={`arrowhead-deriv-${obj.id}`} 
                        markerWidth="6" markerHeight="5"
                        refX="6" refY="2.5" 
                        orient="auto-start-reverse" 
                     >
                        <polygon points="0 0.5, 6 2.5, 0 4.5" fill={DERIVATIVE_VECTOR_COLOR} /> 
                     </marker>
                  )}
                </defs>
                {vectorElements}
              </g>
            );
          }
          default:
            return null;
        }
    })();
    const intersectionDots = renderIntersectionPoints(obj);
    return (
        <g key={`obj-group-${obj.id}`}>
            {mainElement}
            {intersectionDots}
        </g>
    );
  };

  // Calculate geometric bounds for main axes
  const currentZoom = zoomTransformRef.current;
  const geomXMin = transformPointFromSvg({ x: 0, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).x;
  const geomXMax = transformPointFromSvg({ x: SVG_VIEWBOX_WIDTH, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).x;
  const geomYMinWorld = transformPointFromSvg({ x: 0, y: SVG_VIEWBOX_HEIGHT }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).y;
  const geomYMaxWorld = transformPointFromSvg({ x: 0, y: 0 }, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, currentZoom, scale).y;

  const mainAxisX_p1 = transformPointToSvg({x: Math.min(geomXMin, geomXMax), y:0}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);
  const mainAxisX_p2 = transformPointToSvg({x: Math.max(geomXMin, geomXMax), y:0}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);
  const mainAxisY_p1 = transformPointToSvg({x:0, y: Math.min(geomYMinWorld, geomYMaxWorld)}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);
  const mainAxisY_p2 = transformPointToSvg({x:0, y: Math.max(geomYMinWorld, geomYMaxWorld)}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale);

  return (
    <div className="custom-proofs-canvas-container" style={{ touchAction: 'none' }}> 
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleCanvasClick}
        className={`${drawingMode !== DrawingMode.None && !isDraggingObject ? 'cursor-crosshair' : ''} ${isDraggingObject ? 'dragging-object' : ''}`}
      >
        <g transform={currentZoom.toString()}>
          {showPolarGrid && renderPolarGrid()}
          
          {/* Main X and Y axes (part of zoom/pan) */}
          <line key="main-geom-x-axis" x1={mainAxisX_p1.x} y1={mainAxisX_p1.y} x2={mainAxisX_p2.x} y2={mainAxisX_p2.y} stroke={AXIS_LINE_COLOR} strokeWidth={1 / currentZoom.k} />
          <line key="main-geom-y-axis" x1={mainAxisY_p1.x} y1={mainAxisY_p1.y} x2={mainAxisY_p2.x} y2={mainAxisY_p2.y} stroke={AXIS_LINE_COLOR} strokeWidth={1 / currentZoom.k} />

          {/* Finer Cartesian Grid Lines (subdivisions) */}
          {showCartesianGrid && gridLines.xLines.map((gx) => {
            if (Math.abs(gx) < 1e-9) return null; // Avoid re-drawing Y-axis
            const xSvg = transformPointToSvg({x: gx, y: 0}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).x;
            const y1Svg = transformPointToSvg({x: gx, y: Math.min(geomYMinWorld, geomYMaxWorld)}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).y;
            const y2Svg = transformPointToSvg({x: gx, y: Math.max(geomYMinWorld, geomYMaxWorld)}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).y;
            return <line key={`grid-x-${gx.toFixed(3)}`} x1={xSvg} y1={y1Svg} x2={xSvg} y2={y2Svg} stroke={GRID_LINE_COLOR} strokeWidth={0.6 / currentZoom.k} />;
          })}
          {showCartesianGrid && gridLines.yLines.map((gy) => {
            if (Math.abs(gy) < 1e-9) return null; // Avoid re-drawing X-axis
            const ySvg = transformPointToSvg({x: 0, y: gy}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).y;
            const x1Svg = transformPointToSvg({x: Math.min(geomXMin, geomXMax), y: gy}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).x;
            const x2Svg = transformPointToSvg({x: Math.max(geomXMin, geomXMax), y: gy}, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, scale).x;
            return <line key={`grid-y-${gy.toFixed(3)}`} x1={x1Svg} y1={ySvg} x2={x2Svg} y2={ySvg} stroke={GRID_LINE_COLOR} strokeWidth={0.6 / currentZoom.k} />;
          })}
          
          {objects.map(renderObject)}
        </g>
      </svg>
    </div>
  );
};
