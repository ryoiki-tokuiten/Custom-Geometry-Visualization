
import React, { useState, useEffect } from 'react';
import { GeometricObject, ObjectType, CircleObject, VectorObject, AppParameters, Parameter, HyperbolaObject, HyperbolaForm, LineObject, LineSegmentObject, KNOWN_RADIAL_FUNCTIONS, CenterOnCurveParametric, CenterOnCurveVector } from '../types';
import { SliderInput } from './SliderInput';
import { EyeIcon, EyeSlashIcon, VectorIcon } from './icons';
import { DEFAULT_DISCRETE_TRACE_STEPS, DEFAULT_DIFFERENTIAL_ARC_ANGLE, MIN_DIFFERENTIAL_ARC_ANGLE, MAX_DIFFERENTIAL_ARC_ANGLE, STEP_DIFFERENTIAL_ARC_ANGLE } from '../constants';

interface PropertiesPanelProps {
  selectedObject: GeometricObject | null;
  objects: GeometricObject[];
  parameters: AppParameters;
  onUpdateObject: (id: string, updates: Partial<GeometricObject>) => void;
  onUpdateParameter: (id: string, value: number) => void;
  onSliderInteractionStart: (paramId: string) => void; 
  onSliderInteractionEnd: (paramId: string, finalValue: number) => void; 
  onAddVectorToCircle: (circleId: string) => void;
  onDeleteObject: (id: string) => void;
  checkCircularDependency: (editingCircleId: string, proposedParentId: string) => boolean;
  onToggleParameterAnimation: (paramId: string) => void;
}

const VALUE_SEPARATOR = "::";

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  objects,
  parameters,
  onUpdateObject,
  onUpdateParameter,
  onSliderInteractionStart, 
  onSliderInteractionEnd,   
  onAddVectorToCircle,
  onDeleteObject,
  checkCircularDependency,
  onToggleParameterAnimation,
}) => {
  const [centerOnCurveError, setCenterOnCurveError] = useState<string | null>(null);

  useEffect(() => {
    setCenterOnCurveError(null);
  }, [selectedObject?.id]);


  if (!selectedObject) {
    return (
      <div className="card custom-proofs-properties-panel-wrapper">
        <div className="card-body">
            <p className="form-text">Select an object to see its properties.</p>
        </div>
      </div>
    );
  }

  const renderParameterSliders = (paramIds: string[], context?: string) => {
    return paramIds.map(paramId => {
      const param = parameters[paramId];
      if (!param) return <p key={paramId} className="text-xs text-red-500">Parameter {paramId} missing.</p>;
      
      const canAnimate = true; 

      return (
        <SliderInput
          key={param.id}
          id={param.id}
          label={param.label}
          value={param.value}
          min={param.min}
          max={param.max}
          step={param.step}
          onChange={(val) => onUpdateParameter(param.id, val)}
          onInteractionStart={() => onSliderInteractionStart(param.id)} 
          onInteractionEnd={(finalVal) => onSliderInteractionEnd(param.id, finalVal)} 
          isAnimating={param.isAnimating}
          onToggleAnimate={canAnimate ? () => onToggleParameterAnimation(param.id) : undefined}
          canAnimate={canAnimate}
          unit={param.label.toLowerCase().includes('angle') || param.role === 'centerOnCurvePosition' ? ' rad' : (context === 'radialFunction' ? ' (x)' : '')}
        />
      );
    });
  };
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateObject(selectedObject.id, { label: e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateObject(selectedObject.id, { color: e.target.value });
  };

  const handleToggleIntersection = (targetObjectId: string) => {
    if (!selectedObject) return;
    
    let currentIntersectionList: string[] = [];
    if ('showIntersectionsWith' in selectedObject && Array.isArray(selectedObject.showIntersectionsWith)) {
      currentIntersectionList = selectedObject.showIntersectionsWith;
    }

    const newIntersectionList = currentIntersectionList.includes(targetObjectId)
      ? currentIntersectionList.filter(id => id !== targetObjectId)
      : [...currentIntersectionList, targetObjectId];
    
    onUpdateObject(selectedObject.id, { showIntersectionsWith: newIntersectionList });
  };

  const renderIntersectionControls = () => {
    if (!selectedObject || 
        (selectedObject.type !== ObjectType.Circle && 
         selectedObject.type !== ObjectType.Line && 
         selectedObject.type !== ObjectType.LineSegment)) {
      return null;
    }

    const compatibleObjects = objects.filter(obj => 
      obj.id !== selectedObject.id &&
      (obj.type === ObjectType.Circle || obj.type === ObjectType.Line || obj.type === ObjectType.LineSegment)
    );

    if (compatibleObjects.length === 0) {
      return (
        <div className="value-group" style={{marginTop: '1rem'}}>
          <h4 className="value-group-title" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>Intersections</h4>
          <p className="form-text" style={{fontSize: '0.8rem', marginTop: 0}}>No other compatible objects available for intersection.</p>
        </div>
      );
    }
    
    const currentIntersectionList = ('showIntersectionsWith' in selectedObject && Array.isArray(selectedObject.showIntersectionsWith)) 
                                     ? selectedObject.showIntersectionsWith : [];

    return (
      <div className="value-group" style={{marginTop: '1rem'}}>
        <h4 className="value-group-title" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>Intersections</h4>
        <div className="space-y-1" style={{maxHeight: '7rem', overflowY: 'auto'}}>
          {compatibleObjects.map(obj => (
            <div key={obj.id} className="form-check form-check-circular" style={{marginTop: '0.2rem', marginBottom: '0.2rem'}}>
              <input
                type="checkbox"
                id={`intersect-toggle-${selectedObject.id}-${obj.id}`}
                checked={currentIntersectionList.includes(obj.id)}
                onChange={() => handleToggleIntersection(obj.id)}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor={`intersect-toggle-${selectedObject.id}-${obj.id}`} style={{fontSize: '0.8rem'}}>
                Show with: {obj.label || obj.type}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="card custom-proofs-properties-panel-wrapper">
      <div className="card-header">
        <h3 className="card-title">Properties: {selectedObject.label || selectedObject.type}</h3>
      </div>
      <div className="card-body">
        <div style={{marginBottom: '0.75rem'}}>
            <label htmlFor="objLabel" className="form-label">Label</label>
            <input
            type="text"
            id="objLabel"
            value={selectedObject.label}
            onChange={handleLabelChange}
            className="form-control"
            />
        </div>
        <div style={{marginBottom: '0.75rem'}}>
            <label htmlFor="objColor" className="form-label">Color</label>
            <input
            type="color"
            id="objColor"
            value={selectedObject.color}
            onChange={handleColorChange}
            className="form-control" 
            style={{height: '2.5rem', padding: '0.2rem'}} 
            />
        </div>


      {selectedObject.type === ObjectType.Circle && (() => {
        const circle = selectedObject as CircleObject;
        const discreteTraceStepsPseudoParamId = `${circle.id}_traceSteps_interaction`;
        
        const handleCenterOnCurveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setCenterOnCurveError(null);

            if (!value) {
                onUpdateObject(circle.id, { centerOnCurve: undefined });
                return;
            }

            const parts = value.split(VALUE_SEPARATOR);
            const type = parts[0];
            const parentId = parts[1];
            const vectorId = parts.length > 2 ? parts[2] : undefined;


            if (parentId === circle.id) {
                setCenterOnCurveError("A circle cannot be centered on itself.");
                return;
            }
            if (checkCircularDependency(circle.id, parentId)) {
                setCenterOnCurveError("This selection creates a circular dependency.");
                return;
            }

            if (type === 'parametric' && parentId) {
                const oldParamId = (circle.centerOnCurve?.type === 'parametric' && circle.centerOnCurve.parameterId) 
                                    ? circle.centerOnCurve.parameterId 
                                    : `param_coc_${circle.id}_pos`;
                onUpdateObject(circle.id, {
                    centerOnCurve: { type: 'parametric', parentId, parameterId: oldParamId }
                });
            } else if (type === 'vector' && parentId && vectorId) {
                onUpdateObject(circle.id, {
                    centerOnCurve: { type: 'vector', parentId, vectorId }
                });
            } else {
                console.error("Error parsing centerOnCurve selection:", value, parts);
                setCenterOnCurveError("Invalid selection. Please try again.");
            }
        };
        
        let currentCenterOnCurveValue = "";
        if (circle.centerOnCurve) {
            if (circle.centerOnCurve.type === 'parametric') {
                currentCenterOnCurveValue = `parametric${VALUE_SEPARATOR}${circle.centerOnCurve.parentId}`;
            } else if (circle.centerOnCurve.type === 'vector') {
                currentCenterOnCurveValue = `vector${VALUE_SEPARATOR}${circle.centerOnCurve.parentId}${VALUE_SEPARATOR}${(circle.centerOnCurve as CenterOnCurveVector).vectorId}`;
            }
        }

        return (
          <>
            <SliderInput
              label="Center X" id={`${circle.id}-cx`} value={circle.cx} min={-10} max={10} step={0.1}
              onChange={(val) => onUpdateObject(circle.id, { cx: val })} 
              onInteractionStart={() => onSliderInteractionStart(circle.id + '_cx')}
              onInteractionEnd={(finalVal) => onSliderInteractionEnd(circle.id + '_cx', finalVal) }
              disabled={!!circle.centerOnCurve}
              canAnimate={!circle.centerOnCurve}
            />
            <SliderInput
              label="Center Y" id={`${circle.id}-cy`} value={circle.cy} min={-10} max={10} step={0.1}
              onChange={(val) => onUpdateObject(circle.id, { cy: val })}
              onInteractionStart={() => onSliderInteractionStart(circle.id + '_cy')}
              onInteractionEnd={(finalVal) => onSliderInteractionEnd(circle.id + '_cy', finalVal)}
              disabled={!!circle.centerOnCurve}
              canAnimate={!circle.centerOnCurve}
            />
            {!circle.isFixedRadius && !circle.radialFunction && ( 
              <SliderInput
                label="Radius" id={`${circle.id}-r`} value={circle.r} min={0.01} max={10} step={0.01}
                onChange={(val) => onUpdateObject(circle.id, { r: Math.max(0.01, val) })}
                onInteractionStart={() => onSliderInteractionStart(circle.id + '_r')}
                onInteractionEnd={(finalVal) => onSliderInteractionEnd(circle.id + '_r', Math.max(0.01, finalVal))}
                canAnimate={true}
              />
            )}
            
            {!circle.isFixedRadius && (
            <div className="value-group" style={{marginTop: '0.5rem'}}>
                <label className="form-label" style={{fontSize: '0.9rem', color: '#A971FF'}}>Radial Function (r = |f(x)|)</label>
                 <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem'}}>
                    <select
                        value={circle.radialFunction?.funcStr || ""}
                        onChange={(e) => {
                            const funcStr = e.target.value;
                             if (funcStr) { 
                                const newParamId = circle.radialFunction?.parameterId || `param_rf_${circle.id}_x`;
                                onUpdateObject(circle.id, { 
                                    radialFunction: { 
                                        funcStr: funcStr,
                                        parameterId: newParamId
                                    }
                                });
                            } else { 
                                onUpdateObject(circle.id, { radialFunction: undefined } );
                            }
                        }}
                        className="form-select"
                    >
                        <option value="">Select function or None</option>
                        {KNOWN_RADIAL_FUNCTIONS.map(f => (
                            <option key={f.funcStr} value={f.funcStr}>{f.name}</option>
                        ))}
                    </select>
                    {circle.radialFunction && (
                        <button 
                            onClick={() => onUpdateObject(circle.id, { radialFunction: undefined })}
                            title="Clear radial function"
                            className="custom-proofs-play-pause-button"
                            style={{color: '#ff7070'}}
                        >&#x2715;</button>
                     )}
                </div>

                {circle.radialFunction && renderParameterSliders([circle.radialFunction.parameterId], 'radialFunction')}

                {circle.radialFunction && (
                  <div className="form-check form-check-circular" style={{marginTop: '0.5rem'}}>
                    <input
                        type="checkbox"
                        id={`${circle.id}-showtraces`}
                        checked={!!circle.showDiscreteTraces}
                        onChange={(e) => onUpdateObject(circle.id, { showDiscreteTraces: e.target.checked })}
                        className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor={`${circle.id}-showtraces`} style={{fontSize: '0.8rem'}}>Show Discrete Traces</label>
                    {circle.showDiscreteTraces && (
                       <div style={{marginTop: '0.25rem', paddingLeft: '0.5rem'}}>
                         <SliderInput
                            label="Number of Traces"
                            id={`${circle.id}-traceSteps`}
                            value={circle.discreteTraceSteps || DEFAULT_DISCRETE_TRACE_STEPS}
                            min={2}
                            max={400} 
                            step={1}
                            onChange={(val) => {
                                onUpdateObject(circle.id, { discreteTraceSteps: val });
                            }}
                            onInteractionStart={() => {
                                onSliderInteractionStart(discreteTraceStepsPseudoParamId);
                            }}
                            onInteractionEnd={(finalVal) => {
                                onUpdateObject(circle.id, { discreteTraceSteps: finalVal });
                                onSliderInteractionEnd(discreteTraceStepsPseudoParamId, finalVal);
                            }}
                            canAnimate={false}
                          />
                       </div>
                    )}
                  </div>
                )}
            </div>
            )}

            <div className="value-group" style={{marginTop: '0.5rem'}}>
                <label className="form-label" style={{fontSize: '0.9rem', color: '#A971FF'}}>Center on Curve / Follow Vector</label>
                 <select
                    value={currentCenterOnCurveValue}
                    onChange={handleCenterOnCurveChange}
                    className="form-select" style={{marginTop: '0.25rem'}}
                >
                    <option value="">None (Fixed Center)</option>
                    {objects.filter(obj => obj.type === ObjectType.Circle && obj.id !== circle.id).map(parentCircleObj => (
                        <React.Fragment key={parentCircleObj.id}>
                            <option value={`parametric${VALUE_SEPARATOR}${parentCircleObj.id}`}>
                                Position on {parentCircleObj.label || parentCircleObj.id} (Parametric)
                            </option>
                            {objects.filter(obj => obj.type === ObjectType.Vector && (obj as VectorObject).parentId === parentCircleObj.id)
                                .map(vectorObj => (
                                    <option key={vectorObj.id} value={`vector${VALUE_SEPARATOR}${parentCircleObj.id}${VALUE_SEPARATOR}${vectorObj.id}`}>
                                        Follow {vectorObj.label || vectorObj.id} (on {parentCircleObj.label || parentCircleObj.id})
                                    </option>
                                ))
                            }
                        </React.Fragment>
                    ))}
                </select>
                {centerOnCurveError && (
                    <p className="form-text text-xs text-red-500" style={{marginTop:'0.25rem'}}>{centerOnCurveError}</p>
                )}
                {circle.centerOnCurve?.type === 'parametric' && renderParameterSliders([circle.centerOnCurve.parameterId])}
                {circle.centerOnCurve?.type === 'vector' && (() => {
                  const followedVector = objects.find(obj => obj.id === (circle.centerOnCurve as CenterOnCurveVector).vectorId && obj.type === ObjectType.Vector) as VectorObject | undefined;
                  if (followedVector) {
                    const vectorAngleParam = parameters[followedVector.angleParameterId];
                    if (vectorAngleParam) {
                      return (
                        <div style={{marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(168,121,255,0.3)'}}>
                          <p className="form-text text-xs" style={{marginTop:0, marginBottom:'0.25rem'}}>
                            Adjusting angle for: <span style={{fontWeight:'500'}}>"{followedVector.label || 'Vector'}"</span>
                          </p>
                          {renderParameterSliders([followedVector.angleParameterId])}
                        </div>
                      );
                    }
                  }
                  return <p className="form-text text-xs text-red-500" style={{marginTop:'0.25rem'}}>Error: Followed vector or its angle parameter not found.</p>;
                })()}
            </div>
            
            {renderIntersectionControls()}

            <button
              onClick={() => onAddVectorToCircle(circle.id)}
              className="custom-proofs-panel-button" style={{marginTop: '1rem'}}
            >
              <VectorIcon /> Add Vector
            </button>
          </>
        );
      })()}

      {selectedObject.type === ObjectType.Vector && (() => {
        const vector = selectedObject as VectorObject;
        const angleParamExists = parameters[vector.angleParameterId];
        return (
          <>
            {angleParamExists ? renderParameterSliders([vector.angleParameterId]) : <p className="text-xs text-red-500">Angle parameter missing for {vector.label}.</p>}
            <div className="form-check form-check-circular" style={{marginTop: '0.75rem'}}>
                <input
                    type="checkbox"
                    id={`${vector.id}-showPerp`}
                    checked={!!vector.showPerpendicular}
                    onChange={(e) => onUpdateObject(vector.id, { showPerpendicular: e.target.checked })}
                    className="form-check-input"
                />
                <label className="form-check-label" htmlFor={`${vector.id}-showPerp`}>Show Perpendicular Line</label>
            </div>
             <div className="form-check form-check-circular" style={{marginTop: '0.5rem'}}>
                <input
                    type="checkbox"
                    id={`${vector.id}-showDeriv`}
                    checked={!!vector.showDerivative}
                    onChange={(e) => onUpdateObject(vector.id, { showDerivative: e.target.checked })}
                    className="form-check-input"
                    aria-describedby={`${vector.id}-derivative-desc`}
                />
                <label className="form-check-label" htmlFor={`${vector.id}-showDeriv`}>Show Derivative (d/dθ)</label>
            </div>
            <p id={`${vector.id}-derivative-desc`} className="form-text text-xs" style={{paddingLeft: '1.7em', marginTop:'-0.25rem', marginBottom: '0.5rem'}}>
                Visualizes the rate of change of the vector's tip position.
            </p>
            <div className="value-group" style={{marginTop: '0.5rem'}}>
                <div className="form-check form-check-circular" style={{marginTop: '0', marginBottom:'0.25rem'}}>
                  <input
                      type="checkbox"
                      id={`${vector.id}-showDiff`}
                      checked={!!vector.showDifferentials}
                      onChange={(e) => onUpdateObject(vector.id, { showDifferentials: e.target.checked })}
                      className="form-check-input"
                      aria-describedby={`${vector.id}-differentials-desc`}
                  />
                  <label className="form-check-label" htmlFor={`${vector.id}-showDiff`}>Show Differentials (Δx, Δy for Δθ)</label>
                </div>
                 <p id={`${vector.id}-differentials-desc`} className="form-text text-xs" style={{paddingLeft: '1.7em', marginTop:'-0.25rem', marginBottom: '0.25rem'}}>
                    Visualizes Δx & Δy components from a small change Δθ.
                </p>
                {vector.showDifferentials && (
                    <div style={{marginTop: '0.25rem'}}>
                        <SliderInput
                            label="Δθ (Delta Theta)"
                            id={`${vector.id}-deltaTheta`}
                            value={vector.differentialArcAngle ?? DEFAULT_DIFFERENTIAL_ARC_ANGLE}
                            min={MIN_DIFFERENTIAL_ARC_ANGLE}
                            max={MAX_DIFFERENTIAL_ARC_ANGLE}
                            step={STEP_DIFFERENTIAL_ARC_ANGLE}
                            onChange={(val) => onUpdateObject(vector.id, { differentialArcAngle: val })}
                            onInteractionStart={() => onSliderInteractionStart(`${vector.id}_deltaTheta_interaction`)}
                            onInteractionEnd={(finalVal) => {
                                onUpdateObject(vector.id, { differentialArcAngle: finalVal });
                                onSliderInteractionEnd(`${vector.id}_deltaTheta_interaction`, finalVal);
                            }}
                            unit=" rad"
                            canAnimate={false} 
                        />
                    </div>
                )}
            </div>
          </>
        );
      })()}
      
      { (selectedObject.type === ObjectType.Line || selectedObject.type === ObjectType.LineSegment) && (() => {
        const line = selectedObject as (LineObject | LineSegmentObject);
        return (
          <>
            <p className="form-text text-xs" style={{marginTop: '0.25rem'}}>P1: ({line.p1.x.toFixed(2)}, {line.p1.y.toFixed(2)})</p>
            <p className="form-text text-xs" style={{marginTop: '0.1rem'}}>P2: ({line.p2.x.toFixed(2)}, {line.p2.y.toFixed(2)})</p>
            <p className="form-text text-xs" style={{marginTop: '0.5rem', color: '#7facff'}}>This object is draggable when selected. Click and drag to move.</p>
            {renderIntersectionControls()}
          </>
        );
      })()}

      {selectedObject.type === ObjectType.Hyperbola && (() => {
        const hyperbola = selectedObject as HyperbolaObject;
        return (
            <div style={{marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <div>
                    <label htmlFor={`${hyperbola.id}-hform`} className="form-label">Form</label>
                    <select
                        id={`${hyperbola.id}-hform`}
                        value={hyperbola.form}
                        onChange={(e) => onUpdateObject(hyperbola.id, { form: e.target.value as HyperbolaForm })}
                        className="form-select"
                    >
                        <option value={HyperbolaForm.XSquaredMinusYSquared}>{HyperbolaForm.XSquaredMinusYSquared.replace('k', String(hyperbola.constantValue))}</option>
                        <option value={HyperbolaForm.YSquaredMinusXSquared}>{HyperbolaForm.YSquaredMinusXSquared.replace('k', String(hyperbola.constantValue))}</option>
                    </select>
                </div>
                <SliderInput
                    label="Center X" id={`${hyperbola.id}-hcx`} value={hyperbola.cx} min={-10} max={10} step={0.1}
                    onChange={(val) => onUpdateObject(hyperbola.id, { cx: val })}
                    onInteractionStart={() => onSliderInteractionStart(hyperbola.id + '_hcx')}
                    onInteractionEnd={(finalVal) => onSliderInteractionEnd(hyperbola.id + '_hcx', finalVal)}
                    canAnimate={true}
                />
                <SliderInput
                    label="Center Y" id={`${hyperbola.id}-hcy`} value={hyperbola.cy} min={-10} max={10} step={0.1}
                    onChange={(val) => onUpdateObject(hyperbola.id, { cy: val })}
                    onInteractionStart={() => onSliderInteractionStart(hyperbola.id + '_hcy')}
                    onInteractionEnd={(finalVal) => onSliderInteractionEnd(hyperbola.id + '_hcy', finalVal)}
                    canAnimate={true}
                />
                <SliderInput
                    label="Constant Value (k)" id={`${hyperbola.id}-hConst`} value={hyperbola.constantValue} min={0.01} max={10} step={0.01}
                    onChange={(val) => onUpdateObject(hyperbola.id, { constantValue: Math.max(0.01, val) })}
                     onInteractionStart={() => onSliderInteractionStart(hyperbola.id + '_hConst')}
                    onInteractionEnd={(finalVal) => onSliderInteractionEnd(hyperbola.id + '_hConst', Math.max(0.01, finalVal))}
                    canAnimate={true}
                />
            </div>
        );
      })()}

      <button
        onClick={() => onDeleteObject(selectedObject.id)}
        className="custom-proofs-panel-button delete-button" style={{marginTop: '1.5rem'}}
      >
        Delete Object
      </button>
    </div>
    </div>
  );
};
