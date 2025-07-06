import { Point, CircleObject, GeometricObject, ObjectType, AppParameters, HyperbolaForm, HyperbolaObject, LineObject, LineSegmentObject, VectorObject } from '../types';
import { evaluateFunction } from './mathParser';
import { INITIAL_SCALE, HYPERBOLA_RENDER_RANGE_T, HYPERBOLA_POINTS } from '../constants';

export function getEffectiveCircleRadius(
  circle: CircleObject,
  parameters: AppParameters,
  objects: GeometricObject[]
): number {
  if (circle.radialFunction) {
    const xParam = parameters[circle.radialFunction.parameterId];
    if (xParam) {
      const evaluatedRadius = evaluateFunction(circle.radialFunction.funcStr, { x: xParam.value });
      if (evaluatedRadius !== null) {
        return Math.max(0, Math.abs(evaluatedRadius)); // Ensure non-negative radius
      }
    }
    // Fallback or initial, ensure non-negative
    return Math.max(0, Math.abs(evaluateFunction(circle.radialFunction.funcStr, { x: 0 }) || circle.r));
  }
  return Math.max(0, circle.r); // Ensure non-negative radius
}

export function getEffectiveCircleCenter(
  circle: CircleObject,
  parameters: AppParameters,
  objects: GeometricObject[]
): Point {
  if (circle.centerOnCurve) {
    const parentObj = objects.find(obj => obj.id === circle.centerOnCurve!.parentId);
    
    if (parentObj && parentObj.type === ObjectType.Circle) {
      const parentCircle = parentObj as CircleObject;
      const parentRadius = getEffectiveCircleRadius(parentCircle, parameters, objects);
      const parentCenter = getEffectiveCircleCenter(parentCircle, parameters, objects);

      if (circle.centerOnCurve.type === 'parametric') {
        const positionParam = parameters[circle.centerOnCurve.parameterId];
        if (positionParam) {
          const angle = positionParam.value; // Assuming this parameter is an angle in radians
          return {
            x: parentCenter.x + parentRadius * Math.cos(angle),
            y: parentCenter.y + parentRadius * Math.sin(angle),
          };
        }
      } else if (circle.centerOnCurve.type === 'vector') {
        const vectorToFollow = objects.find(obj => obj.id === (circle.centerOnCurve as any).vectorId && obj.type === ObjectType.Vector) as VectorObject | undefined;
        if (vectorToFollow && vectorToFollow.parentId === parentCircle.id) {
          const angleParam = parameters[vectorToFollow.angleParameterId];
          if (angleParam) {
            const vectorAngle = angleParam.value;
            return {
              x: parentCenter.x + parentRadius * Math.cos(vectorAngle),
              y: parentCenter.y + parentRadius * Math.sin(vectorAngle),
            };
          }
        } else {
            console.warn(`Vector ID ${(circle.centerOnCurve as any).vectorId} not found or not parented to ${parentCircle.id} for circle ${circle.id}`);
        }
      }
    } else if (parentObj) {
        console.warn(`Center on curve type ${parentObj.type} not fully supported yet or parameter missing for circle ${circle.id}.`);
    } else if (circle.centerOnCurve.parentId){
        console.warn(`Parent object ID ${circle.centerOnCurve.parentId} not found for circle ${circle.id}.`);
    }
  }
  return { x: circle.cx, y: circle.cy };
}

export function transformPointToSvg(
  point: Point,
  svgWidth: number,
  svgHeight: number,
  scale: number = INITIAL_SCALE
): Point {
  return {
    x: svgWidth / 2 + point.x * scale,
    y: svgHeight / 2 - point.y * scale, // SVG y-axis is inverted
  };
}

export function transformPointFromSvg(
  svgPoint: Point,
  svgWidth: number,
  svgHeight: number,
  currentZoomTransform: {k: number, x: number, y: number},
  scale: number = INITIAL_SCALE
): Point {
  const originalSvgX = (svgPoint.x - currentZoomTransform.x) / currentZoomTransform.k;
  const originalSvgY = (svgPoint.y - currentZoomTransform.y) / currentZoomTransform.k;

  return {
    x: (originalSvgX - svgWidth / 2) / scale,
    y: (svgHeight / 2 - originalSvgY) / scale,
  };
}


export function generateHyperbolaPath(
  hyperbola: HyperbolaObject,
  svgWidth: number,
  svgHeight: number,
  scale: number
): string {
  const points: Point[] = [];
  const tStep = (2 * HYPERBOLA_RENDER_RANGE_T) / HYPERBOLA_POINTS;
  // Ensure constantValue is positive for sqrt; UI/update logic should enforce this.
  const sqrtConstant = Math.sqrt(Math.max(0.0001, hyperbola.constantValue)); 

  for (let i = 0; i <= HYPERBOLA_POINTS; i++) {
    const t = -HYPERBOLA_RENDER_RANGE_T + i * tStep;
    let xGeo: number, yGeo: number;
    if (hyperbola.form === HyperbolaForm.XSquaredMinusYSquared) {
      xGeo = hyperbola.cx + sqrtConstant * Math.cosh(t);
      yGeo = hyperbola.cy + sqrtConstant * Math.sinh(t);
    } else { // YSquaredMinusXSquared
      xGeo = hyperbola.cx + sqrtConstant * Math.sinh(t);
      yGeo = hyperbola.cy + sqrtConstant * Math.cosh(t);
    }
    points.push(transformPointToSvg({ x: xGeo, y: yGeo }, svgWidth, svgHeight, scale));
  }

  const pointsBranch2: Point[] = [];
   for (let i = 0; i <= HYPERBOLA_POINTS; i++) {
    const t = -HYPERBOLA_RENDER_RANGE_T + i * tStep;
    let xGeo: number, yGeo: number;
    if (hyperbola.form === HyperbolaForm.XSquaredMinusYSquared) {
      xGeo = hyperbola.cx - sqrtConstant * Math.cosh(t); 
      yGeo = hyperbola.cy + sqrtConstant * Math.sinh(t); 
    } else { // YSquaredMinusXSquared
      xGeo = hyperbola.cx + sqrtConstant * Math.sinh(t);
      yGeo = hyperbola.cy - sqrtConstant * Math.cosh(t);
    }
    pointsBranch2.push(transformPointToSvg({ x: xGeo, y: yGeo }, svgWidth, svgHeight, scale));
  }

  const pathData1 = points.length > 0 ? "M" + points.map(p => `${p.x} ${p.y}`).join(" L") : "";
  // For YSquaredMinusXSquared, the second branch points should be connected logically.
  // For XSquaredMinusYSquared, pointsBranch2 is already in a logical order for drawing.
  // If YSquaredMinusXSquared, reverse to draw from "bottom" up, or adjust t range.
  // Current t-range and point generation creates continuous paths for each branch.
  const pathData2 = pointsBranch2.length > 0 ? "M" + pointsBranch2.map(p => `${p.x} ${p.y}`).join(" L") : "";
  
  return `${pathData1} ${pathData2}`;
}

// Intersection Functions

const EPSILON = 1e-9; // Small number for float comparisons

function isPointOnLineSegment(p: Point, a: Point, b: Point): boolean {
    // Check if p is collinear with a and b
    const crossProduct = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y);
    if (Math.abs(crossProduct) > EPSILON) return false; // Not collinear

    // Check if p is within the bounding box of segment ab
    if (p.x < Math.min(a.x, b.x) - EPSILON || p.x > Math.max(a.x, b.x) + EPSILON ||
        p.y < Math.min(a.y, b.y) - EPSILON || p.y > Math.max(a.y, b.y) + EPSILON) {
        return false;
    }
    return true;
}

export function getLineLineIntersectionPoints(
    obj1: LineObject | LineSegmentObject,
    obj2: LineObject | LineSegmentObject
): Point[] {
    const p1 = obj1.p1, p2 = obj1.p2;
    const p3 = obj2.p1, p4 = obj2.p2;

    const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(den) < EPSILON) { // Lines are parallel or collinear
        // For simplicity, we're not handling collinear overlapping segments.
        // This can be extended if needed.
        return []; 
    }

    const tNum = (p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x);
    const uNum = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x));
    
    const t = tNum / den;
    const u = uNum / den;

    const intersectionPt: Point = {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
    };

    // If obj1 is a segment, check if intersection is on it
    if (obj1.type === ObjectType.LineSegment && (t < -EPSILON || t > 1 + EPSILON)) {
        return [];
    }
    // If obj2 is a segment, check if intersection is on it
    if (obj2.type === ObjectType.LineSegment && (u < -EPSILON || u > 1 + EPSILON)) {
        return [];
    }
    
    return [intersectionPt];
}

export function getLineCircleIntersectionPoints(
    lineObj: LineObject | LineSegmentObject,
    circleObj: CircleObject,
    parameters: AppParameters,
    objects: GeometricObject[]
): Point[] {
    const p1 = lineObj.p1;
    const p2 = lineObj.p2;
    const center = getEffectiveCircleCenter(circleObj, parameters, objects);
    const radius = getEffectiveCircleRadius(circleObj, parameters, objects);

    if (radius < EPSILON) return []; // Circle is a point or invalid

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (p1.x - center.x) + dy * (p1.y - center.y));
    const c = (p1.x - center.x) ** 2 + (p1.y - center.y) ** 2 - radius * radius;

    const discriminant = b * b - 4 * a * c;
    const intersections: Point[] = [];

    if (Math.abs(a) < EPSILON) { // p1 and p2 are the same point - not a line
        return [];
    }

    if (discriminant < -EPSILON) { // No real intersection
        return [];
    } else if (Math.abs(discriminant) < EPSILON) { // One intersection (tangent)
        const t = -b / (2 * a);
        const pt: Point = { x: p1.x + t * dx, y: p1.y + t * dy };
        if (lineObj.type === ObjectType.LineSegment) {
            if (t >= -EPSILON && t <= 1 + EPSILON) intersections.push(pt);
        } else {
            intersections.push(pt);
        }
    } else { // Two intersections
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        const pt1: Point = { x: p1.x + t1 * dx, y: p1.y + t1 * dy };
        const pt2: Point = { x: p1.x + t2 * dx, y: p1.y + t2 * dy };

        if (lineObj.type === ObjectType.LineSegment) {
            if (t1 >= -EPSILON && t1 <= 1 + EPSILON) intersections.push(pt1);
            if (t2 >= -EPSILON && t2 <= 1 + EPSILON && (Math.abs(t1-t2) > EPSILON || intersections.length === 0)) { // Avoid duplicate for tangent on segment edge
                 intersections.push(pt2);
            }
        } else {
            intersections.push(pt1);
            if (Math.abs(t1-t2) > EPSILON) intersections.push(pt2); // Avoid duplicate if it was a tangent
        }
    }
    return intersections;
}


export function getCircleCircleIntersectionPoints(
    circle1Obj: CircleObject,
    circle2Obj: CircleObject,
    parameters: AppParameters,
    objects: GeometricObject[]
): Point[] {
    const c1 = getEffectiveCircleCenter(circle1Obj, parameters, objects);
    const r1 = getEffectiveCircleRadius(circle1Obj, parameters, objects);
    const c2 = getEffectiveCircleCenter(circle2Obj, parameters, objects);
    const r2 = getEffectiveCircleRadius(circle2Obj, parameters, objects);

    if (r1 < EPSILON || r2 < EPSILON) return []; // One or both circles are points or invalid

    const d_sq = (c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2;
    const d = Math.sqrt(d_sq);

    // Check for no intersection or containment
    if (d > r1 + r2 + EPSILON || d < Math.abs(r1 - r2) - EPSILON) {
        return []; // Circles are separate or one contains another without touching
    }
    
    // Check for coincident circles (infinite intersections - return none for now)
    if (d < EPSILON && Math.abs(r1 - r2) < EPSILON) {
        return []; // Coincident
    }

    // Distance from c1 to the radical axis intersection point P
    // (r1^2 - r2^2 + d^2) / (2d)
    const a = (r1 * r1 - r2 * r2 + d_sq) / (2 * d);

    // Midpoint P between intersection points on the line connecting centers
    const p_mid_x = c1.x + (a / d) * (c2.x - c1.x);
    const p_mid_y = c1.y + (a / d) * (c2.y - c1.y);

    // Distance from P to each intersection point
    const h_sq = r1 * r1 - a * a;
    if (h_sq < -EPSILON) return []; // Should be caught by earlier checks, but as safety
    const h = Math.sqrt(Math.max(0, h_sq)); // Ensure h is not NaN from tiny negative h_sq

    const intersections: Point[] = [];

    const dx_perp = -(c2.y - c1.y) / d; // -(dy/d)
    const dy_perp = (c2.x - c1.x) / d;  //  (dx/d)

    intersections.push({
        x: p_mid_x + h * dx_perp,
        y: p_mid_y + h * dy_perp
    });

    if (Math.abs(h) > EPSILON) { // If h is not zero, there's a second distinct point
        intersections.push({
            x: p_mid_x - h * dx_perp,
            y: p_mid_y - h * dy_perp
        });
    }
    
    return intersections;
}