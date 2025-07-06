import React from 'react';
import { TrigValues, SceneType, SceneConfig, HyperbolicValues, NaturalExponentialProofValues, GeometricAreaProofValues, LabelKey, LabelConfigItem, SceneLabelVisibility, TrigLabelKey } from '../types';
import { 
  COLORS, HYPERBOLIC_COLORS, EULER_SPIRAL_COLORS, GEOMETRIC_AREA_PROOF_COLORS,
  EULER_SPIRAL_TOTAL_ANGLE_RAD, SCENE_LABEL_CONFIGS,
  HYPERBOLIC_TRIG_OVERLAY_SLIDER_MIN, HYPERBOLIC_TRIG_OVERLAY_SLIDER_MAX, HYPERBOLIC_TRIG_OVERLAY_SLIDER_STEP
} from '../constants';
import ExplanationPanel from './ExplanationPanel'; // Import the new component

interface ControlsPanelProps {
  angleDegrees: number; 
  onAngleChange: (angle: number) => void;
  currentSceneId: SceneType;
  onSceneChange: (sceneId: SceneType) => void;
  scenes: SceneConfig[];
  sceneConfig: SceneConfig;
  showCircularInHyperbolic: boolean;
  onToggleShowCircularInHyperbolic: () => void;
  visibleLabels: SceneLabelVisibility; 
  onToggleLabelVisibility: (scene: SceneType, key: LabelKey) => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  angleDegrees,
  onAngleChange,
  currentSceneId,
  onSceneChange,
  scenes,
  sceneConfig,
  showCircularInHyperbolic,
  onToggleShowCircularInHyperbolic,
  visibleLabels, 
  onToggleLabelVisibility
}) => {
  
  const isHyperbolicWithOverlay = currentSceneId === 'hyperbolic_functions' && showCircularInHyperbolic;

  const actualSliderMin = isHyperbolicWithOverlay ? HYPERBOLIC_TRIG_OVERLAY_SLIDER_MIN : sceneConfig.sliderMin ?? 0;
  const actualSliderMax = isHyperbolicWithOverlay ? HYPERBOLIC_TRIG_OVERLAY_SLIDER_MAX : sceneConfig.sliderMax ?? 360;
  const actualSliderStep = isHyperbolicWithOverlay ? HYPERBOLIC_TRIG_OVERLAY_SLIDER_STEP : sceneConfig.sliderStep ?? 0.1;
  const actualParamLabel = isHyperbolicWithOverlay ? 'Trig. Angle (x)' : sceneConfig.paramLabel || 'Parameter';
  const actualParamUnit = isHyperbolicWithOverlay ? '°' : sceneConfig.paramUnit || '';

  const currentAngleDegreesForTrig = isHyperbolicWithOverlay ? angleDegrees : (currentSceneId === 'trigonometry' ? angleDegrees : 0);
  const trigAngleRadians = currentAngleDegreesForTrig * (Math.PI / 180);


  const formatValue = (value: number, precision: number = 3): string => {
    if (Number.isNaN(value)) return 'NaN';
    if (!Number.isFinite(value)) return value > 0 ? '\u221E' : '-\u221E'; 
    if (Math.abs(value) > 10000 || (Math.abs(value) < 0.0001 && value !== 0)) {
      return value.toExponential(precision);
    }
    return value.toFixed(precision);
  };

  const trigValues: TrigValues = {
    sin: Math.sin(trigAngleRadians),
    cos: Math.cos(trigAngleRadians),
    tan: Math.tan(trigAngleRadians),
    csc: 1 / Math.sin(trigAngleRadians),
    sec: 1 / Math.cos(trigAngleRadians),
    cot: 1 / Math.tan(trigAngleRadians),
  };
  
  const getHyperbolicValues = (): HyperbolicValues => {
    let rho: number;
    if (isHyperbolicWithOverlay) {
      const tan_x = Math.tan(angleDegrees * (Math.PI/180)); // angleDegrees is x here
      rho = Math.asinh(tan_x);
    } else {
      rho = Math.max(0, angleDegrees / 100.0); 
    }

    const sinh_rho = Math.sinh(rho);
    const cosh_rho = Math.cosh(rho);
    let tanh_rho = Math.tanh(rho);
    let sech_rho = 1 / cosh_rho;
    let csch_rho = (Math.abs(sinh_rho) < 1e-9) ? (rho === 0 ? Infinity : Math.sign(sinh_rho) * Infinity) : 1 / sinh_rho;
    let coth_rho = (Math.abs(tanh_rho) < 1e-9) ? (rho === 0 ? Infinity : Math.sign(tanh_rho) * Infinity) : 1 / tanh_rho;
    
    if (Math.abs(rho) > 20) { 
        tanh_rho = Math.sign(rho); 
        coth_rho = Math.sign(rho);
    }

    return { rho, sinh: sinh_rho, cosh: cosh_rho, tanh: tanh_rho, sech: sech_rho, csch: csch_rho, coth: coth_rho };
  };

  const getNaturalExponentialProofValues = (n_steps_input: number): NaturalExponentialProofValues => {
    const n_steps = Math.max(1, Math.round(n_steps_input)); 
    let r_val_geom = 1.0; 
    const d_theta_step_geom = EULER_SPIRAL_TOTAL_ANGLE_RAD / n_steps;
    for (let i = 0; i < n_steps; i++) {
        r_val_geom = r_val_geom * (Math.cos(d_theta_step_geom) + Math.sin(d_theta_step_geom));
    }
    const e_approx_val = Math.pow(Math.E, EULER_SPIRAL_TOTAL_ANGLE_RAD); 
    return {
      n_steps,
      d_theta_rad: d_theta_step_geom,
      r_n: r_val_geom,
      e_approx: e_approx_val,
      difference: Math.abs(r_val_geom - e_approx_val),
      theta_total_rad: EULER_SPIRAL_TOTAL_ANGLE_RAD, 
    };
  };

  const getGeometricAreaProofValues = (theta_deg: number): GeometricAreaProofValues => {
    const theta_rad = theta_deg * (Math.PI / 180);
    const tan_theta = Math.tan(theta_rad);
    const F_x = tan_theta * tan_theta; // tan^2(theta)
    const area = 0.5 * tan_theta;
    return {
      theta_deg,
      theta_rad,
      F_x,
      area,
      sec_theta: 1/Math.cos(theta_rad),
      tan_theta,
    };
  };


  const hyperbolicValues = currentSceneId === 'hyperbolic_functions' ? getHyperbolicValues() : {} as HyperbolicValues;
  const naturalExponentialValues = currentSceneId === 'natural_exponential_proof' ? getNaturalExponentialProofValues(angleDegrees) : {} as NaturalExponentialProofValues;
  const geometricAreaProofValues = currentSceneId === 'geometric_area_proof' ? getGeometricAreaProofValues(angleDegrees) : {} as GeometricAreaProofValues;


  const paramValueForDisplay = (): string => {
    if (isHyperbolicWithOverlay) return angleDegrees.toFixed(1);
    if (currentSceneId === 'hyperbolic_functions') return hyperbolicValues.rho.toFixed(3);
    if (currentSceneId === 'natural_exponential_proof') return Math.round(angleDegrees).toString();
    if (currentSceneId === 'geometric_area_proof') return angleDegrees.toFixed(1);
    return (angleDegrees % 360).toFixed(1); 
  };
  
  const displayedParamValue = paramValueForDisplay();

  const mainSceneLabelConfigs = SCENE_LABEL_CONFIGS[currentSceneId] || [];
  const currentSceneLabels = visibleLabels[currentSceneId] || {};

  const trigOverlayLabelConfigs = SCENE_LABEL_CONFIGS['trigonometry'] || [];
  const trigOverlayLabels = visibleLabels['trigonometry'] || {};


  return (
    <div className="controls-panel-inner">
      <div>
        <label htmlFor="sceneSelector" className="form-label">
          Select Proof / Scene:
        </label>
        <select
          id="sceneSelector"
          value={currentSceneId}
          onChange={(e) => onSceneChange(e.target.value as SceneType)}
          className="form-select"
          aria-label="Select proof or scene"
        >
          {scenes.map(scene => (
            <option key={scene.id} value={scene.id}>{scene.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="angleSlider" className="form-label">
          {actualParamLabel}: <span className="slider-param-value">{displayedParamValue}{actualParamUnit}</span>
        </label>
        <input
          id="angleSlider"
          type="range"
          min={actualSliderMin}
          max={actualSliderMax} 
          step={actualSliderStep} 
          value={angleDegrees} 
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          aria-label={`${actualParamLabel} slider`}
        />
      </div>
      
      {currentSceneId === 'hyperbolic_functions' && (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="showCircularInHyperbolicCheckbox"
            checked={showCircularInHyperbolic}
            onChange={onToggleShowCircularInHyperbolic}
            aria-label="Toggle circular geometry visibility"
          />
          <label className="form-check-label" htmlFor="showCircularInHyperbolicCheckbox">
            Show Circular Geometry
          </label>
        </div>
      )}

      <div className="label-visibility-group value-group">
        <h3 className="value-group-title">Visible Canvas Labels ({sceneConfig.title})</h3>
        {mainSceneLabelConfigs.map((labelConf: LabelConfigItem<LabelKey>) => (
          <div className="form-check form-check-circular" key={`label-toggle-div-${currentSceneId}-${labelConf.key}`}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`label-toggle-${currentSceneId}-${labelConf.key}`}
              checked={!!currentSceneLabels[labelConf.key as keyof typeof currentSceneLabels]}
              onChange={() => onToggleLabelVisibility(currentSceneId, labelConf.key)}
              aria-label={`Toggle visibility of ${labelConf.displayName}`}
            />
            <label className="form-check-label" htmlFor={`label-toggle-${currentSceneId}-${labelConf.key}`}>
              {labelConf.displayName}
            </label>
          </div>
        ))}
      </div>
      
      {isHyperbolicWithOverlay && (
         <div className="label-visibility-group value-group">
            <h3 className="value-group-title">Circular Overlay Labels</h3>
            {trigOverlayLabelConfigs.map((labelConf: LabelConfigItem<TrigLabelKey>) => (
              <div className="form-check form-check-circular" key={`label-toggle-div-trigoverlay-${labelConf.key}`}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`label-toggle-trigoverlay-${labelConf.key}`}
                  checked={!!trigOverlayLabels[labelConf.key]}
                  onChange={() => onToggleLabelVisibility('trigonometry', labelConf.key)}
                  aria-label={`Toggle visibility of ${labelConf.displayName} in overlay`}
                />
                <label className="form-check-label" htmlFor={`label-toggle-trigoverlay-${labelConf.key}`}>
                  {labelConf.displayName}
                </label>
              </div>
            ))}
        </div>
      )}


      {(currentSceneId === 'trigonometry' || isHyperbolicWithOverlay) && (
        <div className="value-group">
          <h3 className="value-group-title">Trigonometric Values (θ = {(currentAngleDegreesForTrig % 360).toFixed(1)}°)</h3>
          {(Object.keys(trigValues) as Array<keyof TrigValues>).map((key) => (
            <div key={key} className="value-item">
              <span className="value-key">{key}:</span>
              <span className="value-data" style={{color: COLORS[key] || COLORS.valueText }}>
                {formatValue(trigValues[key])}
              </span>
            </div>
          ))}
        </div>
      )}

      {currentSceneId === 'hyperbolic_functions' && (
        <div className="value-group">
          <h3 className="value-group-title">Hyperbolic Values (ρ = {hyperbolicValues.rho.toFixed(3)})</h3>
          {(Object.keys(hyperbolicValues) as Array<keyof HyperbolicValues>).filter(k => k !== 'rho').map((key) => (
            <div key={key} className="value-item">
              <span className="value-key">{key}:</span>
              <span className="value-data" style={{color: (HYPERBOLIC_COLORS as any)[key] || COLORS.valueText }}>
                {formatValue(hyperbolicValues[key as keyof Omit<HyperbolicValues, 'rho'>])}
              </span>
            </div>
          ))}
        </div>
      )}

      {currentSceneId === 'natural_exponential_proof' && (
        <div className="value-group">
          <h3 className="value-group-title">Geometric e Values</h3>
           <p className="form-text" style={{marginBottom: '0.75rem'}}>Total angle <span className="formula">&Theta;</span>: {naturalExponentialValues.theta_total_rad.toFixed(3)} rad (<span className="formula">&approx;</span> {(naturalExponentialValues.theta_total_rad * 180 / Math.PI).toFixed(1)}°)</p>
          <div className="value-item">
            <span className="value-key">n (Steps):</span>
            <span className="value-data" style={{color: COLORS.valueText}}>{naturalExponentialValues.n_steps}</span>
          </div>
          <div className="value-item">
            <span className="value-key"><span className="formula">dθ (&Theta;/n rad)</span>:</span>
            <span className="value-data" style={{color: COLORS.valueText}}>{formatValue(naturalExponentialValues.d_theta_rad, 5)}</span>
          </div>
          <div className="value-item">
            <span className="value-key" style={{color: EULER_SPIRAL_COLORS.finalPoint}}><span className="formula">r<sub>n</sub></span> (geom.):</span>
            <span className="value-data" style={{color: EULER_SPIRAL_COLORS.finalPoint}}>{formatValue(naturalExponentialValues.r_n, 7)}</span>
          </div>
          <div className="value-item">
            <span className="value-key" style={{color: EULER_SPIRAL_COLORS.eValueText}}><span className="formula">e<sup>&Theta;</sup></span> (Target):</span>
            <span className="value-data" style={{color: EULER_SPIRAL_COLORS.eValueText}}>{formatValue(naturalExponentialValues.e_approx, 7)}</span>
          </div>
          <div className="value-item">
            <span className="value-key" style={{color: COLORS.labelText}}><span className="formula">|r<sub>n</sub> - e<sup>&Theta;</sup>|</span>:</span>
            <span className="value-data" style={{color: COLORS.valueText}}>{formatValue(naturalExponentialValues.difference, 7)}</span>
          </div>
        </div>
      )}

       {currentSceneId === 'geometric_area_proof' && (
        <div className="value-group">
          <h3 className="value-group-title">Geometric Area Values (θ = {geometricAreaProofValues.theta_deg.toFixed(1)}°)</h3>
          <div className="value-item">
            <span className="value-key"><span className="formula">F(x) = tan<sup>2</sup>&theta;</span>:</span>
            <span className="value-data" style={{color: GEOMETRIC_AREA_PROOF_COLORS.valueText}}>{formatValue(geometricAreaProofValues.F_x, 4)}</span>
          </div>
          <div className="value-item">
            <span className="value-key"><span className="formula">tan &theta;</span>:</span>
            <span className="value-data" style={{color: GEOMETRIC_AREA_PROOF_COLORS.sideAB}}>{formatValue(geometricAreaProofValues.tan_theta, 4)}</span>
          </div>
          <div className="value-item">
            <span className="value-key"><span className="formula">sec &theta;</span>:</span>
            <span className="value-data" style={{color: GEOMETRIC_AREA_PROOF_COLORS.sideOB}}>{formatValue(geometricAreaProofValues.sec_theta, 4)}</span>
          </div>
          <div className="value-item">
            <span className="value-key">Area (½ tan θ):</span>
            <span className="value-data" style={{color: GEOMETRIC_AREA_PROOF_COLORS.triangleStroke}}>{formatValue(geometricAreaProofValues.area, 4)}</span>
          </div>
        </div>
      )}
      
      <ExplanationPanel
        sceneConfig={sceneConfig}
        angleDegrees={angleDegrees}
        naturalExponentialValues={currentSceneId === 'natural_exponential_proof' ? naturalExponentialValues : undefined}
        geometricAreaProofValues={currentSceneId === 'geometric_area_proof' ? geometricAreaProofValues : undefined}
      />
    </div>
  );
};

export default ControlsPanel;
