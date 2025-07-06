import { SceneConfig, SceneType, LabelConfigItem, TrigLabelKey, HyperbolicLabelKey, NaturalExponentialLabelKey, GeometricAreaProofLabelKey, SceneLabelVisibility, GeometricAreaProofValues, CustomProofsLabelKey } from './types';

export const APP_TITLE = "Interactive Geometric Visualizer"; 
export const INITIAL_ANGLE_DEGREES = 45;
export const INITIAL_SCENE_ID: SceneType = 'trigonometry';
export const INITIAL_AREA_PROOF_THETA_DEGREES = 30;
export const D_THETA_VIZ_DEG = 16; // For visualizing differential elements in geometric area proof


export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 550;
export const UNIT_CIRCLE_RADIUS_FACTOR = 0.35; 
export const HYPERBOLIC_RADIUS_FACTOR = 0.3; 
export const EULER_SPIRAL_RADIUS_FACTOR = 0.20; 
export const EULER_SPIRAL_TOTAL_ANGLE_RAD = 1;
export const AREA_PROOF_UNIT_SCALE_FACTOR = 0.30; // For OA = 1 scaled to canvas

export const COLORS = {
  background: '#10131C', 
  axes: '#4D5B73',       
  unitCircle: '#A0AEC0', 
  angleArc: '#718096',   
  
  sin: '#ef4444', 
  cos: '#3b82f6', 
  tan: '#22c55e', 
  sec: '#f97316', 
  csc: '#eab308', 
  cot: '#8b5cf6', 
  
  connectorLine: '#5A6478', 
  pointOnCircle: '#f472b6',   
  
  labelText: '#E8EEFF',      
  valueText: '#C9D1FF',      
  titleText: '#A971FF',      
  tangentLine: '#a0aec0', 
};

export const HYPERBOLIC_COLORS = {
  hyperbola: '#f0abfc', 
  asymptotes: '#6ee7b7', 
  pointOnHyperbola: '#fda4af', 
  rhoAngleArc: '#fda4af', 
  
  sinh: COLORS.sin,
  cosh: COLORS.cos,
  tanh: COLORS.tan,
  sech: COLORS.sec,
  csch: COLORS.csc,
  coth: COLORS.cot,

  connectorLine: COLORS.connectorLine, 
  labelText: COLORS.labelText,       
};

export const EULER_SPIRAL_COLORS = {
  unitCircle: '#86efac', 
  spiralPath: '#f0abfc', 
  finalPoint: '#fda4af', 
  constructionLine: COLORS.connectorLine, 
  constructionTriangleFill: '#3b82f6' + '33', 
  constructionTriangleStroke: '#3b82f6', 
  angle45Marker: '#facc15', 
  rightAngleMarker: '#fde047', 
  radialLine: '#6ee7b7', 
  referenceArc: COLORS.angleArc, 
  labelText: COLORS.labelText, 
  eValueText: '#fde047', 
  formulaText: '#cbd5e1', 
};

export const GEOMETRIC_AREA_PROOF_COLORS = {
  triangleFill: '#22c55e' + '4D', // Tan color with alpha
  triangleStroke: COLORS.tan,
  sideOA: COLORS.cos, // For base = 1
  sideAB: COLORS.tan, // For height = tan theta
  sideOB: COLORS.sec, // For hypotenuse = sec theta
  referenceCircle: '#718096', // A muted color for the reference unit circle
  angleMarker: COLORS.angleArc,
  dThetaMarker: '#f59e0b', // Amber for dTheta
  secThetaPlusDThetaLine: '#f59e0b', // Amber for sec(theta+dtheta) line
  labelText: '#E8EEFF',
  valueText: '#C9D1FF',
  rightAngleMarker: '#fde047',
  differentialTriangleFill: '#f97316' + '4D', // Orange color with alpha for secant related diff triangle
  differentialTriangleStroke: '#f97316',
  integralTextBoxBg: 'rgba(16, 19, 28, 0.85)', 
  integralTextBoxBorder: '#a971ff', 
  integralTextBoxText: '#E8EEFF',
  integralTextBoxDotColor: 'rgba(255, 255, 255, 0.0627)', 
  integralTextBoxPurpleGlowColor: 'rgba(168, 121, 255, 0.08)',
  integralTextBoxBlueGlowColor: 'rgba(66, 133, 244, 0.06)',
};


export const STROKE_WIDTH = {
  default: 2,
  bold: 2.5,
  thin: 1.5, 
  extraThin: 0.75,
};

export const TEXT_OFFSET = 15;
export const SMALL_TEXT_OFFSET = 8;
export const TICK_LENGTH = 5;
export const RIGHT_ANGLE_MARKER_SIZE = 10;
export const ANGLE_MARKER_SIZE_SMALL = 6;
export const HYPERBOLA_MAX_RHO_DRAW = 3.5; 
export const HYPERBOLA_POINTS = 100; 

// Slider configurations for Hyperbolic scene when Trig overlay is active
export const HYPERBOLIC_TRIG_OVERLAY_SLIDER_MIN = 0;
export const HYPERBOLIC_TRIG_OVERLAY_SLIDER_MAX = 360;
export const HYPERBOLIC_TRIG_OVERLAY_SLIDER_STEP = 0.1;
export const HYPERBOLIC_TRIG_OVERLAY_DEFAULT_PARAM_VALUE = INITIAL_ANGLE_DEGREES; // e.g., 45


export const SCENES: SceneConfig[] = [
  {
    id: 'trigonometry',
    title: 'Trigonometric Functions',
    descriptionHTML: `<span class="formula">Visualize <span class="text-normal">sin</span> <span class="text-normal">&theta;</span>, <span class="text-normal">cos</span> <span class="text-normal">&theta;</span>, <span class="text-normal">tan</span> <span class="text-normal">&theta;</span>, <span class="text-normal">sec</span> <span class="text-normal">&theta;</span>, <span class="text-normal">csc</span> <span class="text-normal">&theta;</span>, <span class="text-normal">cot</span> <span class="text-normal">&theta;</span></span> on the unit circle. Includes standard and tangent-line perspectives.`,
    paramLabel: 'Angle (θ)',
    paramUnit: '°',
    sliderMin: 0,
    sliderMax: 360,
    sliderStep: 0.1,
    defaultParamValue: 45,
  },
  {
    id: 'hyperbolic_functions',
    title: 'Hyperbolic Functions',
    descriptionHTML: `<span class="formula">Visualize <span class="text-normal">sinh</span> <span class="text-normal">&rho;</span>, <span class="text-normal">cosh</span> <span class="text-normal">&rho;</span>, <span class="text-normal">tanh</span> <span class="text-normal">&rho;</span>, etc., on the unit hyperbola <span class="text-normal">x<sup>2</sup> - y<sup>2</sup> = R<sup>2</sup></span>. The parameter <span class="text-normal">&rho;</span> is the hyperbolic angle. When "Show Circular Geometry" is active, the slider controls trig. angle <span class="text-normal">x</span>, and <span class="text-normal">&rho; = asinh(tan(x))</span>.</span>`,
    paramLabel: 'Parameter (ρ)', // Default label
    paramUnit: '', // Default unit
    sliderMin: 0, 
    sliderMax: 350, 
    sliderStep: 1,  
    defaultParamValue: 100, // Corresponds to rho = 1.0
  },
  {
    id: 'natural_exponential_proof',
    title: 'Geometric Derivation of e',
    descriptionHTML: `<span class="formula">Visualizes the geometric construction <span class="text-normal">r<sub>k+1</sub> = r<sub>k</sub>(<span class="text-normal">cos</span>(d&theta;) + <span class="text-normal">sin</span>(d&theta;))</span>. For small <span class="text-normal">d&theta;</span>, this is approximately <span class="text-normal">r<sub>k</sub>(1+d&theta;)</span>.
    The product <span class="text-normal">&prod;(<span class="text-normal">cos</span>(d&theta;)+<span class="text-normal">sin</span>(d&theta;))</span> over <span class="text-normal">n</span> steps, where <span class="text-normal">d&theta; = &Theta;/n</span>, approaches <span class="text-normal">e<sup>&Theta;</sup></span> as <span class="text-normal">n</span> increases.
    Here, total angle <span class="text-normal">&Theta; = ${EULER_SPIRAL_TOTAL_ANGLE_RAD}</span> radian. Max ${50} steps.</span>`,
    paramLabel: 'Number of steps (n)',
    paramUnit: '',
    sliderMin: 1,
    sliderMax: 50,
    sliderStep: 1,
    defaultParamValue: 10,
    detailedExplanationHTML: (angleDegrees, naturalExponentialValues) => `
      <p class="form-text">
        This visualization demonstrates a geometric approach to deriving Euler's number, <span class="formula">e</span>, or more generally <span class="formula">e<sup>&Theta;</sup></span>.
        The core idea, inspired by user-provided notes, involves constructing a series of similar isosceles right-angled (45-45-90) triangles.
      </p>
      <p class="form-text">
        <strong>Construction Details:</strong>
        Starting with <span class="formula">r<sub>0</sub> = 1</span> at angle 0.
        For each step <span class="formula">k</span> (from 0 to <span class="formula">n-1</span>):
        <ol>
          <li>Current radius is <span class="formula">r<sub>k</sub></span> at angle <span class="formula">&theta;<sub>k</sub></span>.</li>
          <li>The next point <span class="formula">P<sub>k+1</sub></span> will be at angle <span class="formula">&theta;<sub>k+1</sub> = &theta;<sub>k</sub> + d&theta;</span>, where <span class="formula">d&theta; = &Theta;/n</span>.</li>
          <li>A small triangle <span class="formula">&Delta;P<sub>k</sub>A'P<sub>k+1</sub></span> is constructed such that <span class="formula">&angle;P<sub>k</sub>A'P<sub>k+1</sub> = 90&deg;</span> and <span class="formula">&angle;A'P<sub>k</sub>P<sub>k+1</sub> = &angle;A'P<sub>k+1</sub>P<sub>k</sub> = 45&deg;</span>.</li>
          <li>This implies <span class="formula">P<sub>k</sub>A' = A'P<sub>k+1</sub></span>. Also, <span class="formula">P<sub>k</sub>A' = r<sub>k</sub> <span class="text-normal">sin</span>(d&theta;)</span> (height of <span class="formula">&Delta;OP<sub>k</sub>A'</span> where <span class="formula">OA' = r<sub>k</sub> <span class="text-normal">cos</span>(d&theta;)</span>).</li>
          <li>So, the increment in radius <span class="formula">&Delta;r<sub>k</sub> = A'P<sub>k+1</sub> = r<sub>k</sub> <span class="text-normal">sin</span>(d&theta;)</span>.</li>
          <li>The new radius is <span class="formula">r<sub>k+1</sub> = OA' + A'P<sub>k+1</sub> = r<sub>k</sub> <span class="text-normal">cos</span>(d&theta;) + r<sub>k</sub> <span class="text-normal">sin</span>(d&theta;) = r<sub>k</sub>(<span class="text-normal">cos</span>(d&theta;) + <span class="text-normal">sin</span>(d&theta;))</span>.</li>
        </ol>
      </p>
      <p class="form-text">
        For small <span class="formula">d&theta;</span>, <span class="formula"><span class="text-normal">cos</span>(d&theta;) &approx; 1</span> and <span class="formula"><span class="text-normal">sin</span>(d&theta;) &approx; d&theta;</span>.
        Thus, <span class="formula">r<sub>k+1</sub> &approx; r<sub>k</sub>(1 + d&theta;)</span>.
        After <span class="formula">n</span> steps, <span class="formula">r<sub>n</sub> &approx; r<sub>0</sub>(1 + d&theta;)<sup>n</sup> = (1 + &Theta;/n)<sup>n</sup></span>.
        As <span class="formula">n &rarr; &infin;</span>, this approaches <span class="formula">e<sup>&Theta;</sup></span>.
        The visualization shows <span class="formula">r<sub>n</sub></span> calculated using the precise geometric sum, which also converges to <span class="formula">e<sup>&Theta;</sup></span>.
      </p>
      ${naturalExponentialValues && 'n_steps' in naturalExponentialValues ? `<p class="form-text muted-text">Current calculation for n=${naturalExponentialValues.n_steps}: <span class="formula">r<sub>${naturalExponentialValues.n_steps}</sub> &approx; ${naturalExponentialValues.r_n.toFixed(7)}</span>, Target <span class="formula">e<sup>${naturalExponentialValues.theta_total_rad}</sup> &approx; ${naturalExponentialValues.e_approx.toFixed(7)}</span>.</p>` : ''}
      <p class="form-text muted-text">Original user hint: "If you remove <span class="formula"><span class="text-normal">tan</span> d&theta;</span> factor from <span class="formula"><span class="text-normal">sec</span> &theta;</span>'s construction from scratch, you get <span class="formula">e</span> of <span class="formula"><span class="text-normal">sec</span> &theta;</span>." This method uses <span class="formula"><span class="text-normal">sin</span> d&theta;</span> for the incremental radial component.</p>
    `
  },
  {
    id: 'geometric_area_proof',
    title: 'Generalized integral result using Pythagoras theorem',
    descriptionHTML: `Visualizes the area of a right triangle OAB, where OA=1, and compares two methods of calculating its area. Let <span class="formula">&theta;</span> be the angle at O. Then AB = <span class="formula"><span class="text-normal">tan</span> &theta; = &radic;<span class="overline">F(x)</span></span> and OB = <span class="formula"><span class="text-normal">sec</span> &theta; = &radic;<span class="overline">1+F(x)</span></span>. The visualization also shows differential elements related to the integral <span class="formula">&int; [F'(x) / 2&radic;F(x)] dx = &radic;F(x)</span>.`,
    paramLabel: 'Angle (θ)',
    paramUnit: '°',
    sliderMin: 0.1,
    sliderMax: 89.9,
    sliderStep: 0.1,
    defaultParamValue: INITIAL_AREA_PROOF_THETA_DEGREES,
    detailedExplanationHTML: (angleDegrees, values) => {
      const proofValues = values as GeometricAreaProofValues;
      const theta_rad_text = proofValues ? proofValues.theta_rad.toFixed(3) : "θ";
      const tan_theta_text = proofValues ? proofValues.tan_theta.toFixed(3) : "tan θ";
      const Fx_text = proofValues ? proofValues.F_x.toFixed(3) : "F(x)";
      
      return `
      <p class="form-text">
        This visualization explores the area of a right-angled triangle OAB.
        We fix OA = 1 along the x-axis, with O at the origin. Angle AOB = <span class="formula">&theta;</span>.
        Thus, AB (height) = <span class="formula">1 &middot; <span class="text-normal">tan</span> &theta; = <span class="text-normal">tan</span> &theta;</span>.
        The hypotenuse OB = <span class="formula">&radic;<span class="overline">OA<sup>2</sup> + AB<sup>2</sup></span> = &radic;<span class="overline">1 + <span class="text-normal">tan</span><sup>2</sup>&theta;</span> = <span class="text-normal">sec</span> &theta;</span>.
      </p>
      <p class="form-text">
        A function <span class="formula">F(x)</span> is introduced such that AB = <span class="formula">&radic;<span class="overline">F(x)</span></span>.
        Therefore, <span class="formula"><span class="text-normal">tan</span> &theta; = &radic;<span class="overline">F(x)</span></span>, which implies <span class="formula">F(x) = <span class="text-normal">tan</span><sup>2</sup>&theta;</span>.
        And OB = <span class="formula">&radic;<span class="overline">1+F(x)</span></span>.
      </p>
      <p class="form-text"><strong>Method 1: Area of Triangle (Cartesian)</strong></p>
      <p class="form-text">
        Area(<span class="formula">&Delta;OAB</span>) = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &sdot; Base &sdot; Height = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &sdot; OA &sdot; AB</span><br/>
        Area(<span class="formula">&Delta;OAB</span>) = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &sdot; 1 &sdot; <span class="text-normal">tan</span> &theta; = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> <span class="text-normal">tan</span> &theta;</span>.
      </p>
      <p class="form-text"><strong>Method 2: Area using Polar Coordinates</strong></p>
      <p class="form-text">
        The area of a sector in polar coordinates is <span class="formula">A = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &int; r(&phi;)<sup>2</sup> d&phi;</span>.
        Using <span class="formula">r(&phi;) = <span class="text-normal">sec</span> &phi;</span> as the boundary for the shape:
        Area = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &int;<sub>0</sub><sup>&theta;</sup> (<span class="text-normal">sec</span> &phi;)<sup>2</sup> d&phi; = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> [<span class="text-normal">tan</span> &phi;]<sub>0</sub><sup>&theta;</sup> = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> <span class="text-normal">tan</span> &theta;</span>.
      </p>
      <p class="form-text">Both methods yield Area = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> <span class="text-normal">tan</span> &theta;</span> = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &radic;<span class="overline">F(x)</span></span>.
      </p>
      
      <p class="form-text"><strong>Relating to the Integral <span class="formula">&int; [F'(x) / 2&radic;F(x)] dx</span> and Differential Elements:</strong></p>
      <p class="form-text">
          The visualization shows differential elements. With B' at (OA, tan(θ+dθ)) and C on the sec(θ+dθ) line from O, such that OC=OB:
          <br/>&nbsp;&nbsp;<b>BB'</b> = d(tanθ) ≈ sec²θ dθ
          <br/>&nbsp;&nbsp;<b>BC</b> ≈ secθ dθ
          <br/>&nbsp;&nbsp;<b>B'C</b> ≈ d(secθ) ≈ secθ tanθ dθ
      </p>
      <p class="form-text">
        By substituting <span class="formula">&theta; = <span class="text-normal">arctan</span>(&radic;<span class="overline">F(x)</span>)</span> and <span class="formula">r<sup>2</sup> = (<span class="text-normal">sec</span> &theta;)<sup>2</sup> = 1+F(x)</span> into the polar area integral (transforming it to an integral over <span class="formula">x</span> from <span class="formula">x<sub>0</sub></span> to <span class="formula">x<sub>t</sub></span>), one gets:
      </p>
      <p class="form-text" style="text-align: center;">
        <span class="formula">Area = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &int;<sub>x<sub>0</sub></sub><sup>x<sub>t</sub></sup> <span class="fraction"><sup>F'(x)</sup><sub><span class="text-normal">2&radic;<span class="overline">F(x)</span></span></sub></span> dx</span>
      </p>
      <p class="form-text">
        Since <span class="formula">&int; <span class="fraction"><sup>F'(x)</sup><sub><span class="text-normal">2&radic;<span class="overline">F(x)</span></span></sub></span> dx = &radic;<span class="overline">F(x)</span> + C</span>,
        the definite integral becomes <span class="formula">[&radic;<span class="overline">F(x)</span>]<sub>x<sub>0</sub></sub><sup>x<sub>t</sub></sup> = &radic;<span class="overline">F(x<sub>t</sub>)</span> - &radic;<span class="overline">F(x<sub>0</sub>)</span></span>.
      </p>
      <p class="form-text">
        Thus, Area = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> (&radic;<span class="overline">F(x<sub>t</sub>)</span> - &radic;<span class="overline">F(x<sub>0</sub>)</span>)</span>.
        If we define <span class="formula">F(x<sub>0</sub>)=0</span> (so <span class="formula">&theta;<sub>0</sub>=0</span>) and <span class="formula">x<sub>t</sub>=x</span>, then Area = <span class="formula"><span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &radic;<span class="overline">F(x)</span></span>, which is consistent.
      </p>
      <p class="form-text">
        A differential angle <span class="formula">d&theta;</span> is shown at origin O, extending from OB. The line through O at <span class="formula">&theta;+d&theta;</span> has length <span class="formula"><span class="text-normal">sec</span>(&theta;+d&theta;)</span>. 
        Point B' is at <span class="formula">(OA, <span class="text-normal">tan</span>(&theta;+d&theta;))</span>. Point C is on the <span class="formula">&theta;+d&theta;</span> line such that <span class="formula">OC=OB=<span class="text-normal">sec</span>&theta;</span>.
        The differential triangle <span class="formula">&Delta;BB'C</span> (right-angled at C) relates these changes.
        These relationships are key to the geometric interpretation of the derivatives used in the integral transformation.
      </p>
      <p class="form-text">For the current visualization with <span class="formula">&theta;=${(angleDegrees || 0).toFixed(1)}&deg;</span> (<span class="formula">${theta_rad_text}</span> rad):<br/>
        <span class="formula">F(x) = <span class="text-normal">tan</span><sup>2</sup>(${theta_rad_text}) &approx; ${Fx_text}</span><br/>
        <span class="formula">Area = <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> <span class="text-normal">tan</span>(${theta_rad_text}) &approx; <span class="text-normal"><sup>1</sup>&frasl;<sub>2</sub></span> &sdot; ${tan_theta_text} &approx; ${proofValues ? proofValues.area.toFixed(3) : "..."}</span>
      </p>
      `;
    }
  },
  {
    id: 'custom_proofs',
    title: 'Custom Proofs',
    descriptionHTML: `Create and interact with your own geometric constructions. This section uses a separate interface.`,
    // No specific params for the main controls panel as this scene renders its own UI
  }
];


// --- LABEL VISIBILITY CONFIGURATIONS ---

export const TRIG_LABEL_CONFIG: LabelConfigItem<TrigLabelKey>[] = [
  { key: 'sin', displayName: 'sin θ Label (Standard)' },
  { key: 'cos', displayName: 'cos θ Label (Standard)' },
  { key: 'tan', displayName: 'tan θ Label (Standard)' },
  { key: 'sec', displayName: 'sec θ Label (Standard)' },
  { key: 'csc', displayName: 'csc θ Label (Standard)' },
  { key: 'cot', displayName: 'cot θ Label (Standard)' },
  { key: 'pointP', displayName: 'Point P Label' },
  { key: 'angleTheta', displayName: 'Angle θ Arc & Label' },
  { key: 'axesXYO', displayName: 'Axes (x, y, O) & Labels' },
  { key: 'tickMarks', displayName: 'Tick Marks & Values' },
  { key: 'tangentPerspective', displayName: 'Tangent Line Perspective' },
];

export const HYPERBOLIC_LABEL_CONFIG: LabelConfigItem<HyperbolicLabelKey>[] = [
  { key: 'sinh', displayName: 'sinh ρ Label' },
  { key: 'cosh', displayName: 'cosh ρ Label' },
  { key: 'tanh', displayName: 'tanh ρ Label' },
  { key: 'sech', displayName: 'sech ρ Label' },
  { key: 'csch', displayName: 'csch ρ Label' },
  { key: 'coth', displayName: 'coth ρ Label' },
  { key: 'pointP', displayName: 'Point P Label' },
  { key: 'axesXYO', displayName: 'Axes (x, y, O) & Labels' },
  { key: 'asymptotes', displayName: 'Asymptotes' },
  { key: 'rhoAngleVisual', displayName: 'Hyperbolic Angle ρ Arc' },
];

export const NATURAL_EXPONENTIAL_LABEL_CONFIG: LabelConfigItem<NaturalExponentialLabelKey>[] = [
  { key: 'r0_circle', displayName: 'r₀=1 & Unit Circle' },
  { key: 'intermediate_Pk', displayName: 'Intermediate Pk Labels' },
  { key: 'construction_details', displayName: 'Construction Details (Markers & Formulas)' },
  { key: 'final_Pn', displayName: 'Final Point Pₙ Label' },
  { key: 'final_Rn_e_theta', displayName: 'Final Radius rₙ Label' },
  { key: 'total_angle_Theta', displayName: 'Total Angle Θ Arc & Label' },
  { key: 'axesXYO', displayName: 'Axes (x, y, O) & Labels' },
  { key: 'grid_lines', displayName: 'Background Grid Lines' },
];

export const GEOMETRIC_AREA_PROOF_LABEL_CONFIG: LabelConfigItem<GeometricAreaProofLabelKey>[] = [
  { key: 'triangleFill', displayName: 'Fill Triangle OAB' },
  { key: 'sideLabels', displayName: 'Side Length Labels (OA, AB, OB)' },
  { key: 'angleTheta', displayName: 'Angle θ Arc & Label (at O)' },
  { key: 'pointLabelsOAB', displayName: 'Point Labels (O, A, B, B\', C)' }, // Updated: Removed H
  { key: 'axesXYO', displayName: 'Axes (x, y, O) & Labels' },
  { key: 'referenceUnitCircle', displayName: 'Reference Unit Circle (radius OA=1)' },
  { key: 'rightAngleMarkerA', displayName: 'Right Angle Marker at A' },
  { key: 'dthetaArcAtO', displayName: 'dθ Arc (at O)'},
  { key: 'lineSecThetaPlusDtheta', displayName: 'Line sec(θ+dθ) & Label'}, // Simplified label, point H removed
  { key: 'differentialTriangleBBprimeC', displayName: 'Differential Triangle (BB\'C)' }, 
  { key: 'label_BBprime_dTanTheta', displayName: 'Label: BB\' = d(tanθ)' }, 
  { key: 'label_BC_arcSecDTheta', displayName: 'Label: BC ≈ secθdθ' }, 
  { key: 'label_BprimeC_dSecTheta', displayName: 'Label: B\'C ≈ secθtanθdθ' }, 
  { key: 'integralExplanationText', displayName: 'Integral Explanation Text Box' },
];

export const CUSTOM_PROOFS_LABEL_CONFIG: LabelConfigItem<CustomProofsLabelKey>[] = []; // No labels for custom proofs managed by main panel

export const SCENE_LABEL_CONFIGS: Record<SceneType, LabelConfigItem<any>[]> = {
  trigonometry: TRIG_LABEL_CONFIG,
  hyperbolic_functions: HYPERBOLIC_LABEL_CONFIG,
  natural_exponential_proof: NATURAL_EXPONENTIAL_LABEL_CONFIG,
  geometric_area_proof: GEOMETRIC_AREA_PROOF_LABEL_CONFIG,
  custom_proofs: CUSTOM_PROOFS_LABEL_CONFIG,
};

export const DEFAULT_LABEL_VISIBILITY: SceneLabelVisibility = {
  trigonometry: {
    sin: false, 
    cos: false, 
    tan: false, 
    sec: false, 
    csc: false,
    cot: false,
    pointP: true,
    angleTheta: true,
    axesXYO: true,
    tickMarks: false,
    tangentPerspective: true, 
  },
  hyperbolic_functions: {
    sinh: true, 
    cosh: true, 
    tanh: false, 
    sech: false,
    csch: false,
    coth: false,
    pointP: true,
    axesXYO: true, 
    asymptotes: false, 
    rhoAngleVisual: true, 
  },
  natural_exponential_proof: {
    r0_circle: true, intermediate_Pk: false, construction_details: true,
    final_Pn: true, final_Rn_e_theta: true, total_angle_Theta: true,
    axesXYO: true, grid_lines: false,
  },
  geometric_area_proof: {
    triangleFill: true,
    sideLabels: true,
    angleTheta: true,
    pointLabelsOAB: true, 
    axesXYO: true,
    referenceUnitCircle: true,
    rightAngleMarkerA: true,
    dthetaArcAtO: true,
    lineSecThetaPlusDtheta: true, 
    differentialTriangleBBprimeC: true, 
    label_BBprime_dTanTheta: true,      
    label_BC_arcSecDTheta: true,
    label_BprimeC_dSecTheta: true,     
    integralExplanationText: false, // Changed from true to false
  },
  custom_proofs: {}, // Custom proofs manages its own visibility internally
};