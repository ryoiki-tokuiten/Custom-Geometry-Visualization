export interface Point {
  x: number;
  y: number;
}

export enum ObjectType {
  Circle = 'circle',
  Hyperbola = 'hyperbola',
  Line = 'line',
  LineSegment = 'lineSegment',
  Vector = 'vector',
}

export interface BaseObject {
  id: string;
  type: ObjectType;
  label: string;
  color: string;
}

export interface CenterOnCurveParametric {
  type: 'parametric';
  parentId: string;      // ID of the parent circle
  parameterId: string; // Parameter controlling position (angle) on parent circle
}

export interface CenterOnCurveVector {
  type: 'vector';
  parentId: string;      // ID of the parent circle (the vector is on)
  vectorId: string;    // ID of the vector on the parent circle to follow
}


export interface CircleObject extends BaseObject {
  type: ObjectType.Circle;
  cx: number; // Base center x
  cy: number; // Base center y
  r: number;  // Base radius
  isFixedRadius?: boolean; // If true, radius cannot be changed and radialFunction cannot be applied.
  centerOnCurve?: CenterOnCurveParametric | CenterOnCurveVector;
  radialFunction?: {
    funcStr: string;
    parameterId: string; // Controls 'x' in f(x) for radius
  };
  showDiscreteTraces?: boolean; // For radialFunction circles
  discreteTraceSteps?: number; // Number of steps for discrete traces
  showIntersectionsWith?: string[]; // IDs of objects to show intersections with
}

export enum HyperbolaForm {
  XSquaredMinusYSquared = 'x^2-y^2=k',
  YSquaredMinusXSquared = 'y^2-x^2=k',
}

export interface HyperbolaObject extends BaseObject {
  type: ObjectType.Hyperbola;
  form: HyperbolaForm;
  cx: number; // Center x
  cy: number; // Center y
  constantValue: number; // The 'k' in x^2-y^2=k or y^2-x^2=k. Must be > 0.
}

export interface LineObject extends BaseObject {
  type: ObjectType.Line;
  p1Id: string; // ID of a PointObject or implicitly defined
  p2Id: string; // ID of a PointObject or implicitly defined
  // For simplicity, store points directly if not linking to separate PointObjects
  p1: Point;
  p2: Point;
  showIntersectionsWith?: string[]; // IDs of objects to show intersections with
}

export interface LineSegmentObject extends BaseObject {
  type: ObjectType.LineSegment;
  p1: Point;
  p2: Point;
  showIntersectionsWith?: string[]; // IDs of objects to show intersections with
}

export interface VectorObject extends BaseObject {
  type: ObjectType.Vector;
  parentId: string; // ID of the circle it's on
  angleParameterId: string; // Controls vector angle
  showPerpendicular: boolean;
  showDerivative?: boolean;
  showDifferentials?: boolean; // For visualizing dx, dy from dTheta
  differentialArcAngle?: number; // The dTheta value for differentials visualization (e.g. 0.1 rad)
}

export type GeometricObject = CircleObject | HyperbolaObject | LineObject | LineSegmentObject | VectorObject;

export interface Parameter {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  objectId?: string; // Optional: associates parameter with a specific object
  role?: 'radialFunctionX' | 'centerOnCurvePosition' | 'vectorAngle' | 'generic'; // Helps manage parameter lifecycle
  isAnimating?: boolean;
  animationSpeed?: number; // Units per second
  animationDirection?: 'forward' | 'backward';
  lastFrameTime?: number; // Timestamp for delta calculation (performance.now())
}

export interface AppParameters {
  [id: string]: Parameter;
}

// Custom ZoomTransform removed. Will use `type { ZoomTransform } from 'd3-zoom';` directly.

export enum DrawingMode {
  None,
  LinePt1,
  LinePt2,
  SegmentPt1,
  SegmentPt2,
}

export interface KnownFunction {
  name: string; // e.g., "Sine: sin(x)"
  funcStr: string; // e.g., "sin(x)"
}

export const KNOWN_RADIAL_FUNCTIONS: KnownFunction[] = [
  { name: "Constant: 1", funcStr: "1" },
  { name: "Linear: x", funcStr: "x" },
  { name: "Sine: sin(x)", funcStr: "sin(x)" },
  { name: "Cosine: cos(x)", funcStr: "cos(x)" },
  { name: "Secant: sec(x)", funcStr: "sec(x)" }, // sec(x) = 1/cos(x)
  { name: "Tangent: tan(x)", funcStr: "tan(x)" }, // tan(x) = sin(x)/cos(x)
  { name: "Cosecant: csc(x)", funcStr: "csc(x)" }, // csc(x) = 1/sin(x)
  { name: "Cotangent: cot(x)", funcStr: "cot(x)" }, // cot(x) = cos(x)/sin(x)
  { name: "Square: x^2", funcStr: "x^2" },
  { name: "Cube: x^3", funcStr: "x^3" },
  { name: "Square Root: sqrt(x)", funcStr: "sqrt(x)" }, // Ensure x >= 0
  { name: "Exponential: exp(x)", funcStr: "exp(x)" },
  { name: "Logarithm: log(x)", funcStr: "log(x)" }, // Ensure x > 0
  { name: "Reciprocal: 1/x", funcStr: "1/x" }, // Ensure x != 0
];