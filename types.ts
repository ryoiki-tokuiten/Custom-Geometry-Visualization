export interface Point {
  x: number;
  y: number;
}

export interface TrigValues {
  sin: number;
  cos: number;
  tan: number;
  sec: number;
  csc: number;
  cot: number;
}

export type SceneType = 'trigonometry' | 'hyperbolic_functions' | 'natural_exponential_proof' | 'geometric_area_proof' | 'custom_proofs';

export interface HyperbolicValues {
  rho: number;
  sinh: number;
  cosh: number;
  tanh: number;
  sech: number;
  csch: number;
  coth: number;
}

export interface NaturalExponentialProofValues {
  n_steps: number;
  d_theta_rad: number; 
  r_n: number;         
  e_approx: number;
  difference: number;
  theta_total_rad: number; 
}

export interface GeometricAreaProofValues {
  theta_deg: number;
  theta_rad: number;
  F_x: number;
  area: number;
  sec_theta: number;
  tan_theta: number;
}

export interface SceneConfig {
  id: SceneType;
  title: string;
  descriptionHTML: string; 
  paramLabel?: string; 
  paramUnit?: string; 
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  defaultParamValue?: number;
  detailedExplanationHTML?: string | ((angleDegrees: number, values?: NaturalExponentialProofValues | GeometricAreaProofValues) => string);
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Label Visibility Types
export type TrigLabelKey = 'sin' | 'cos' | 'tan' | 'sec' | 'csc' | 'cot' | 'pointP' | 'angleTheta' | 'axesXYO' | 'tickMarks' | 'tangentPerspective';
export type HyperbolicLabelKey = 'sinh' | 'cosh' | 'tanh' | 'sech' | 'csch' | 'coth' | 'pointP' | 'axesXYO' | 'asymptotes' | 'rhoAngleVisual';
export type NaturalExponentialLabelKey = 'r0_circle' | 'intermediate_Pk' | 'construction_details' | 'final_Pn' | 'final_Rn_e_theta' | 'total_angle_Theta' | 'axesXYO' | 'grid_lines';
export type GeometricAreaProofLabelKey = 
  'triangleFill' | 
  'sideLabels' | 
  'angleTheta' | 
  'pointLabelsOAB' | // Now implies O, A, B, B', C (H removed)
  'axesXYO' | 
  'referenceUnitCircle' | 
  'rightAngleMarkerA' |
  'dthetaArcAtO' |            
  'lineSecThetaPlusDtheta' |  
  'differentialTriangleBBprimeC' | 
  'label_BBprime_dTanTheta' |      
  'label_BC_arcSecDTheta' |        
  'label_BprimeC_dSecTheta' |      
  'integralExplanationText';

// Placeholder for Custom Proofs labels, if any are managed by the main app's controls
export type CustomProofsLabelKey = never; // No specific labels for custom proofs managed by main panel

export type LabelKey = TrigLabelKey | HyperbolicLabelKey | NaturalExponentialLabelKey | GeometricAreaProofLabelKey | CustomProofsLabelKey;

export interface SceneLabelVisibility {
  trigonometry: Partial<Record<TrigLabelKey, boolean>>;
  hyperbolic_functions: Partial<Record<HyperbolicLabelKey, boolean>>;
  natural_exponential_proof: Partial<Record<NaturalExponentialLabelKey, boolean>>;
  geometric_area_proof: Partial<Record<GeometricAreaProofLabelKey, boolean>>;
  custom_proofs: Partial<Record<CustomProofsLabelKey, boolean>>;
}

export interface LabelConfigItem<T extends LabelKey> {
  key: T;
  displayName: string;
}