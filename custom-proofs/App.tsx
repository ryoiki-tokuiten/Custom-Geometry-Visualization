import React, { useState, useCallback, useEffect, useRef } from 'react';
import { zoomIdentity, type ZoomTransform as D3ZoomTransform } from 'd3-zoom';
import { ControlsPanel } from './components/ControlsPanel';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { 
    GeometricObject, ObjectType, Point, AppParameters, Parameter, 
    CircleObject, VectorObject, HyperbolaObject, HyperbolaForm, 
    LineObject, LineSegmentObject, DrawingMode, KNOWN_RADIAL_FUNCTIONS,
    CenterOnCurveParametric, CenterOnCurveVector
} from './types';
import { INITIAL_SCALE, DEFAULT_OBJECT_COLOR, SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, DEFAULT_DISCRETE_TRACE_STEPS, DEFAULT_DIFFERENTIAL_ARC_ANGLE } from './constants';

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

interface AppStateHistoryEntry {
  objects: GeometricObject[];
  parameters: AppParameters;
}

const App: React.FC = () => {
  const [objects, setObjects] = useState<GeometricObject[]>([]);
  const [parameters, setParameters] = useState<AppParameters>({});
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [zoomTransform, setZoomTransform] = useState<D3ZoomTransform>(zoomIdentity);
  
  const [drawingMode, setDrawingModeState] = useState<DrawingMode>(DrawingMode.None);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [showPolarGrid, setShowPolarGrid] = useState<boolean>(false);
  const [showCartesianGrid, setShowCartesianGrid] = useState<boolean>(true); // New state for Cartesian grid
  const [history, setHistory] = useState<AppStateHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const MAX_HISTORY_LENGTH = 50;
  const animationFrameId = useRef<number | null>(null);
  const prevParametersRef = useRef<AppParameters>(parameters);
  const activeSliderInteractionParamIdRef = useRef<string | null>(null);


  const pushToHistory = useCallback((currentObjects: GeometricObject[], currentParameters: AppParameters) => {
    const newStateEntry: AppStateHistoryEntry = {
      objects: deepClone(currentObjects),
      parameters: deepClone(currentParameters),
    };
    setHistory(prevHistory => {
      const newHistorySlice = prevHistory.slice(0, historyIndex + 1);
      let updatedHistory = [...newHistorySlice, newStateEntry];
      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        updatedHistory = updatedHistory.slice(updatedHistory.length - MAX_HISTORY_LENGTH);
      }
      setHistoryIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  }, [historyIndex]);

  useEffect(() => {
    const unitCircleId = generateId();
    const unitCircle: CircleObject = {
      id: unitCircleId, type: ObjectType.Circle, label: 'Unit Circle', color: DEFAULT_OBJECT_COLOR,
      cx: 0, cy: 0, r: 1, isFixedRadius: true, showIntersectionsWith: [],
    };
    const initialObjects = [unitCircle];
    const initialParameters = {};
    setObjects(initialObjects);
    setParameters(initialParameters);
    prevParametersRef.current = initialParameters;
    setSelectedObjectId(unitCircleId);
    // Initial history entry
    const initialHistoryEntry = { objects: deepClone(initialObjects), parameters: deepClone(initialParameters) };
    setHistory([initialHistoryEntry]);
    setHistoryIndex(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddObject = useCallback((type: ObjectType, options?: any) => {
    const id = generateId();
    let newObject: GeometricObject | null = null;
    const newParamsToAdd: AppParameters = {};
    const defaultLabelBase = type.charAt(0).toUpperCase() + type.slice(1);
    const newLabel = options?.label || `${defaultLabelBase} ${objects.filter(o => o.type === type).length + 1}`;

    switch (type) {
      case ObjectType.Circle:
        let radialFunctionOpts, centerOnCurveOpts;
        let showDiscreteTraces = false;
        let discreteTraceSteps = DEFAULT_DISCRETE_TRACE_STEPS;
        const isFixedRadius = options?.isFixedRadius ?? false;

        if (options?.isRadial && !isFixedRadius) {
            const paramId = `param_rf_${id}_x`;
            newParamsToAdd[paramId] = { id: paramId, label: `x for ${newLabel}`, value: 0, min: -5, max: 5, step: 0.1, objectId: id, role: 'radialFunctionX' };
            radialFunctionOpts = { funcStr: options?.funcStr || KNOWN_RADIAL_FUNCTIONS[0].funcStr, parameterId: paramId };
            showDiscreteTraces = options?.showDiscreteTraces ?? false;
            discreteTraceSteps = options?.discreteTraceSteps ?? DEFAULT_DISCRETE_TRACE_STEPS;
        }
        
        if (options?.centerOnCurveParentId) { 
            const paramId = `param_coc_${id}_pos`;
            newParamsToAdd[paramId] = { id: paramId, label: `Position for ${newLabel}`, value: 0, min: 0, max: 2 * Math.PI, step: 0.01, objectId: id, role: 'centerOnCurvePosition' };
            centerOnCurveOpts = { type: 'parametric', parentId: options.centerOnCurveParentId, parameterId: paramId } as CenterOnCurveParametric;
        }

        newObject = {
          id, type, label: newLabel, color: DEFAULT_OBJECT_COLOR,
          cx: options?.cx ?? Math.random() * 4 - 2, cy: options?.cy ?? Math.random() * 4 - 2,
          r: Math.max(0.01, options?.r ?? Math.random() * 0.5 + 0.5),
          isFixedRadius: isFixedRadius, radialFunction: isFixedRadius ? undefined : radialFunctionOpts,
          centerOnCurve: centerOnCurveOpts, showDiscreteTraces: isFixedRadius ? false : showDiscreteTraces,
          discreteTraceSteps: isFixedRadius ? DEFAULT_DISCRETE_TRACE_STEPS : discreteTraceSteps,
          showIntersectionsWith: [],
        } as CircleObject;
        break;
      case ObjectType.Hyperbola:
        newObject = {
          id, type, label: newLabel, color: '#ef4444', 
          form: options?.form || HyperbolaForm.XSquaredMinusYSquared,
          cx: options?.cx ?? 0, cy: options?.cy ?? 0,
          constantValue: Math.max(0.01, options?.constantValue ?? 1),
        } as HyperbolaObject;
        break;
    }

    if (newObject) {
      const nextObjects = [...objects, newObject!];
      const nextParameters = {...parameters, ...newParamsToAdd};
      setObjects(nextObjects);
      setParameters(nextParameters);
      setSelectedObjectId(id);
      pushToHistory(nextObjects, nextParameters);
    }
  }, [objects, parameters, pushToHistory]);

  const computeNextParametersForUpdate = useCallback((
    currentParams: AppParameters,
    objectId: string,
    updatedObject: GeometricObject,
    originalObject: GeometricObject
  ): AppParameters => {
    let nextParams = { ...currentParams };
    const newLabel = updatedObject.label;
    const oldLabel = originalObject.label;
    const paramIdsToClean = new Set<string>();

    if (updatedObject.type === ObjectType.Circle && originalObject.type === ObjectType.Circle) {
        const circle = updatedObject as CircleObject;
        const oldCircle = originalObject as CircleObject;

        if (!circle.isFixedRadius && circle.radialFunction) {
            const paramId = circle.radialFunction.parameterId;
            const defaultParamProps = { value: 0, min: -5, max: 5, step: 0.1, objectId: objectId, role: 'radialFunctionX' as Parameter['role'] };
            nextParams[paramId] = { ...(nextParams[paramId] || defaultParamProps), id: paramId, label: `x for ${newLabel}` };
            if (oldCircle.radialFunction && oldCircle.radialFunction.parameterId !== paramId && oldCircle.radialFunction.parameterId.startsWith(`param_rf_${objectId}`)) {
                paramIdsToClean.add(oldCircle.radialFunction.parameterId);
            }
        } else if (oldCircle.radialFunction?.parameterId && oldCircle.radialFunction.parameterId.startsWith(`param_rf_${objectId}`)) {
            paramIdsToClean.add(oldCircle.radialFunction.parameterId);
        }
        
        const oldCocParam = oldCircle.centerOnCurve?.type === 'parametric' ? oldCircle.centerOnCurve.parameterId : null;
        if (oldCocParam && oldCocParam.startsWith(`param_coc_${objectId}`)) {
             if (!(circle.centerOnCurve?.type === 'parametric' && circle.centerOnCurve.parameterId === oldCocParam)) {
                paramIdsToClean.add(oldCocParam);
            }
        }

        if (circle.centerOnCurve?.type === 'parametric') {
            const paramId = circle.centerOnCurve.parameterId;
            const defaultParamProps = { value: 0, min: 0, max: 2 * Math.PI, step: 0.01, objectId: objectId, role: 'centerOnCurvePosition' as Parameter['role'] };
            nextParams[paramId] = { ...(nextParams[paramId] || defaultParamProps), id: paramId, label: `Position for ${newLabel}` };
        }
    }
    
    if (newLabel !== oldLabel) {
        Object.keys(nextParams).forEach(paramId => {
            if (nextParams[paramId].objectId === objectId) {
                const param = nextParams[paramId];
                const forKeyword = " for ";
                const forIndex = param.label.lastIndexOf(forKeyword);
                if (forIndex !== -1 && param.label.substring(forIndex + forKeyword.length) === oldLabel) {
                    const labelPrefix = param.label.substring(0, forIndex);
                    nextParams[paramId] = { ...param, label: `${labelPrefix}${forKeyword}${newLabel}` };
                } else if (param.label.startsWith(`Angle for ${oldLabel}`)) {
                     nextParams[paramId] = { ...param, label: `Angle for ${newLabel}` };
                } else if (param.label.startsWith(`x for ${oldLabel}`)) {
                     nextParams[paramId] = { ...param, label: `x for ${newLabel}` };
                } else if (param.label.startsWith(`Position for ${oldLabel}`)) {
                     nextParams[paramId] = { ...param, label: `Position for ${newLabel}` };
                }
            }
        });
    }
    
    paramIdsToClean.forEach(pId => {
        if (nextParams[pId]) {
            let isActivelyUsed = false;
            if (updatedObject.type === ObjectType.Circle) {
                const currentUpdatedCircle = updatedObject as CircleObject;
                if (currentUpdatedCircle.radialFunction && currentUpdatedCircle.radialFunction.parameterId === pId) {
                    isActivelyUsed = true;
                }
                if (!isActivelyUsed && currentUpdatedCircle.centerOnCurve && currentUpdatedCircle.centerOnCurve.type === 'parametric') {
                    if ((currentUpdatedCircle.centerOnCurve as CenterOnCurveParametric).parameterId === pId) {
                        isActivelyUsed = true;
                    }
                }
            }
            if (!isActivelyUsed) {
                delete nextParams[pId];
            }
        }
    });
    return nextParams;
  }, []);

 const handleUpdateObject = useCallback((id: string, updates: Partial<GeometricObject>) => {
    const objectToUpdate = objects.find(o => o.id === id);
    if (!objectToUpdate) return;

    let finalUpdatedObject = { ...objectToUpdate, ...updates } as GeometricObject;

    if (finalUpdatedObject.type === ObjectType.Circle) {
        let typedFinalObject = finalUpdatedObject as CircleObject;
        if (updates.hasOwnProperty('r') && typeof (updates as Partial<CircleObject>).r === 'number' && !typedFinalObject.isFixedRadius) {
            typedFinalObject.r = Math.max(0.01, (updates as Partial<CircleObject>).r!);
        }
        if (updates.hasOwnProperty('discreteTraceSteps')) {
          const steps = Number((updates as Partial<CircleObject>).discreteTraceSteps);
          typedFinalObject.discreteTraceSteps = (steps && steps >= 2 && steps <= 400) ? steps : DEFAULT_DISCRETE_TRACE_STEPS; 
        }
        if (updates.hasOwnProperty('radialFunction')) {
            const radialFunctionUpdate = (updates as Partial<CircleObject>).radialFunction;
            if (radialFunctionUpdate && typeof radialFunctionUpdate.funcStr === 'string') {
                 const paramId = radialFunctionUpdate.parameterId || (objectToUpdate as CircleObject).radialFunction?.parameterId || `param_rf_${id}_x`;
                 typedFinalObject.radialFunction = { funcStr: radialFunctionUpdate.funcStr, parameterId: paramId };
                 if (!(objectToUpdate as CircleObject).radialFunction) {
                    typedFinalObject.showDiscreteTraces = typedFinalObject.showDiscreteTraces ?? false;
                    typedFinalObject.discreteTraceSteps = typedFinalObject.discreteTraceSteps ?? DEFAULT_DISCRETE_TRACE_STEPS;
                 }
            } else { 
                delete typedFinalObject.radialFunction; delete typedFinalObject.showDiscreteTraces; delete typedFinalObject.discreteTraceSteps;
            }
        } else if (typedFinalObject.isFixedRadius && typedFinalObject.radialFunction) {
            delete typedFinalObject.radialFunction; delete typedFinalObject.showDiscreteTraces; delete typedFinalObject.discreteTraceSteps;
        }
        if (updates.hasOwnProperty('centerOnCurve')) {
            const cocUpdate = (updates as Partial<CircleObject>).centerOnCurve;
            if (cocUpdate === undefined) {
                delete typedFinalObject.centerOnCurve;
            } else if (cocUpdate.type === 'parametric') {
                const oldCoc = (objectToUpdate as CircleObject).centerOnCurve;
                const paramId = cocUpdate.parameterId || (oldCoc && oldCoc.type === 'parametric' ? oldCoc.parameterId : `param_coc_${id}_pos`);
                typedFinalObject.centerOnCurve = { type: 'parametric', parentId: cocUpdate.parentId, parameterId: paramId };
            } else if (cocUpdate.type === 'vector') {
                typedFinalObject.centerOnCurve = { type: 'vector', parentId: cocUpdate.parentId, vectorId: cocUpdate.vectorId };
            }
        }
        if (updates.hasOwnProperty('showIntersectionsWith')) {
            typedFinalObject.showIntersectionsWith = Array.isArray((updates as Partial<CircleObject>).showIntersectionsWith) ? (updates as Partial<CircleObject>).showIntersectionsWith : [];
        }
        finalUpdatedObject = typedFinalObject;
    } else if (finalUpdatedObject.type === ObjectType.Line || finalUpdatedObject.type === ObjectType.LineSegment) {
        let typedFinalObject = finalUpdatedObject as LineObject | LineSegmentObject;
        if (updates.hasOwnProperty('showIntersectionsWith')) {
            typedFinalObject.showIntersectionsWith = Array.isArray((updates as Partial<LineObject | LineSegmentObject>).showIntersectionsWith) ? (updates as Partial<LineObject | LineSegmentObject>).showIntersectionsWith : [];
        }
        finalUpdatedObject = typedFinalObject;
    } else if (finalUpdatedObject.type === ObjectType.Hyperbola) {
        let typedFinalObject = finalUpdatedObject as HyperbolaObject;
        if (updates.hasOwnProperty('constantValue') && typeof (updates as Partial<HyperbolaObject>).constantValue === 'number') {
            typedFinalObject.constantValue = Math.max(0.01, (updates as Partial<HyperbolaObject>).constantValue!);
        }
        finalUpdatedObject = typedFinalObject;
    } else if (finalUpdatedObject.type === ObjectType.Vector) {
        let typedFinalObject = finalUpdatedObject as VectorObject;
        if (updates.hasOwnProperty('differentialArcAngle') && typeof (updates as Partial<VectorObject>).differentialArcAngle === 'number') {
            typedFinalObject.differentialArcAngle = (updates as Partial<VectorObject>).differentialArcAngle;
        }
         if (updates.hasOwnProperty('showDifferentials') && typeof (updates as Partial<VectorObject>).showDifferentials === 'boolean') {
            typedFinalObject.showDifferentials = (updates as Partial<VectorObject>).showDifferentials;
            if (typedFinalObject.showDifferentials && typedFinalObject.differentialArcAngle === undefined) {
                typedFinalObject.differentialArcAngle = DEFAULT_DIFFERENTIAL_ARC_ANGLE;
            }
        }
        finalUpdatedObject = typedFinalObject;
    }

    const nextObjects = objects.map(obj => (obj.id === id ? finalUpdatedObject : obj));
    const nextParametersForObjectUpdate = computeNextParametersForUpdate(parameters, id, finalUpdatedObject, objectToUpdate);
    
    setObjects(nextObjects);
    setParameters(nextParametersForObjectUpdate);
    
    if (!activeSliderInteractionParamIdRef.current) {
        pushToHistory(nextObjects, nextParametersForObjectUpdate);
    }
  }, [objects, parameters, pushToHistory, computeNextParametersForUpdate]);

  const handleUpdateParameter = useCallback((paramId: string, value: number) => {
    setParameters(prevParams => {
      if (!prevParams[paramId] && !paramId.endsWith('_interaction')) { // Allow pseudo-params for interaction tracking
         console.warn(`Attempted to update non-existent parameter: ${paramId}`);
         return prevParams;
      }
      const updatedParams = {
        ...prevParams,
        [paramId]: { ...(prevParams[paramId] || { id: paramId, label: 'Interaction Param', min:0, max:1, step:0.1 }), value, isAnimating: false, lastFrameTime: undefined },
      };
      
      if (activeSliderInteractionParamIdRef.current !== paramId && (!prevParams[paramId] || !prevParams[paramId].isAnimating)) {
        // Only push to history if not part of an active slider drag AND if the parameter is not currently animating.
        // For pseudo-params like 'discreteTraceSteps_interaction', don't push history here.
        if (!paramId.endsWith('_interaction')) {
            pushToHistory(objects, updatedParams);
        }
      }
      return updatedParams;
    });
  }, [objects, pushToHistory]); 

  const handleSliderInteractionStart = useCallback((paramId: string) => {
    activeSliderInteractionParamIdRef.current = paramId;
    pushToHistory(objects, parameters);
  }, [objects, parameters, pushToHistory]);

  const handleSliderInteractionEnd = useCallback((paramId: string, finalValue: number) => {
    if (activeSliderInteractionParamIdRef.current === paramId) {
      activeSliderInteractionParamIdRef.current = null;
      setParameters(prevParams => {
        // For pseudo-params (like discreteTraceSteps_interaction), they might not exist in prevParams.
        // The crucial part is that `pushToHistory` is called with the current `objects` and `parameters` state.
        // If it's a real parameter, update it one last time.
        let updatedParams = { ...prevParams };
        if (prevParams[paramId] && !paramId.endsWith('_interaction')) {
          updatedParams[paramId] = { ...prevParams[paramId], value: finalValue, isAnimating: false, lastFrameTime: undefined };
        }
        // Always push the current state of objects and parameters.
        // For discreteTraceSteps, `objects` would have been updated live.
        // For real parameters, `updatedParams` reflects the final value.
        pushToHistory(objects, updatedParams); 
        return updatedParams;
      });
    }
  }, [objects, parameters, pushToHistory]); // Include parameters for safety in the final push

  const toggleParameterAnimation = useCallback((paramId: string) => {
    setParameters(prevParams => {
        const param = prevParams[paramId];
        if (!param) return prevParams;
        const newParams = { ...prevParams };
        const isCurrentlyAnimating = !!param.isAnimating;
        if (!isCurrentlyAnimating) {
            pushToHistory(objects, prevParams); 
            let initialDirection = param.animationDirection || 'forward';
            if (param.value >= param.max) initialDirection = 'backward';
            else if (param.value <= param.min) initialDirection = 'forward';
            newParams[paramId] = {
                ...param, isAnimating: true, animationDirection: initialDirection,
                animationSpeed: param.animationSpeed || (param.max - param.min) / 5, 
                lastFrameTime: performance.now(), 
            };
        } else {
            newParams[paramId] = { ...param, isAnimating: false, lastFrameTime: undefined };
            pushToHistory(objects, newParams); 
        }
        return newParams;
    });
  }, [pushToHistory, objects]);

  useEffect(() => { 
    let animationRunning = false;
    Object.values(parameters).forEach(p => { if (p.isAnimating) animationRunning = true; });

    const animate = (timestamp: number) => {
      let somethingChangedInLoop = false;
      
      setParameters(currentParamsSnapshot => {
        const nextAnimatedParams: AppParameters = {...currentParamsSnapshot};
        let stillAnimating = false;

        Object.keys(currentParamsSnapshot).forEach(paramId => {
          const param = currentParamsSnapshot[paramId];
          if (param.isAnimating) {
            const lastFrameTime = param.lastFrameTime || timestamp; 
            const deltaTime = (timestamp - lastFrameTime) / 1000;

            if (deltaTime > 0 || !param.lastFrameTime) { 
                const speed = param.animationSpeed || (param.max - param.min) / 5;
                let newValue = param.value; 
                let newIsAnimating = true; 
                let newDirection = param.animationDirection;

                if (param.animationDirection === 'forward') {
                    newValue += speed * deltaTime;
                    if (newValue >= param.max) { newValue = param.max; newIsAnimating = false; }
                } else { 
                    newValue -= speed * deltaTime;
                    if (newValue <= param.min) { newValue = param.min; newIsAnimating = false; }
                }
                nextAnimatedParams[paramId] = { ...param, value: newValue, isAnimating: newIsAnimating, animationDirection: newDirection, lastFrameTime: timestamp };
                somethingChangedInLoop = true;
            } else {
                nextAnimatedParams[paramId] = param; 
            }
            if (nextAnimatedParams[paramId].isAnimating) stillAnimating = true;
          }
        });
        
        if (somethingChangedInLoop) {
            if (!stillAnimating && animationFrameId.current) { 
            }
            return nextAnimatedParams;
        }
        return currentParamsSnapshot; 
      });
      
      let nextFrameNeeded = false;
      Object.values(parameters).forEach(p => { if (p.isAnimating) nextFrameNeeded = true; });

      if (nextFrameNeeded) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null;
      }
    };

    if (animationRunning && animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else if (!animationRunning && animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); 
        animationFrameId.current = null;
      }
    };
  }, [parameters]); 

  useEffect(() => { 
    const previousParams = prevParametersRef.current;
    let needsHistoryPushForNaturalCompletion = false;
    Object.keys(parameters).forEach(paramId => {
        const currentParam = parameters[paramId]; 
        const prevParam = previousParams[paramId];
        if (prevParam?.isAnimating && currentParam && !currentParam.isAnimating) {
            if (currentParam.value === currentParam.min || currentParam.value === currentParam.max) {
                 const lastHistoryEntry = history[historyIndex];
                 if(!lastHistoryEntry || (JSON.stringify(lastHistoryEntry.parameters[paramId]?.value) !== JSON.stringify(currentParam.value))) {
                    needsHistoryPushForNaturalCompletion = true;
                 }
            }
        }
    });
    if (needsHistoryPushForNaturalCompletion) {
        pushToHistory(objects, parameters);
    }
    prevParametersRef.current = deepClone(parameters); 
  }, [parameters, objects, pushToHistory, history, historyIndex]);

  const handleDeleteObject = useCallback((id: string) => {
    const objectToDelete = objects.find(o => o.id === id);
    if (!objectToDelete) return;

    const paramsToDeleteIds = new Set<string>();
    Object.values(parameters).forEach(param => {
        if (param.objectId === id) paramsToDeleteIds.add(param.id);
    });

    const objectsToRemoveIds = new Set<string>([id]);
    let updatedObjectsDuringDelete = [...objects];
    const nextParametersCleaned = { ...parameters };

    if (objectToDelete.type === ObjectType.Circle) {
        updatedObjectsDuringDelete.forEach((obj, index) => {
            if (obj.type === ObjectType.Vector && (obj as VectorObject).parentId === id) {
                objectsToRemoveIds.add(obj.id);
                paramsToDeleteIds.add((obj as VectorObject).angleParameterId);
            }
            if (obj.type === ObjectType.Circle) {
                const cObj = obj as CircleObject;
                if (cObj.centerOnCurve?.parentId === id) {
                    const newObj = {...cObj}; delete newObj.centerOnCurve;
                    updatedObjectsDuringDelete[index] = newObj;
                    if (cObj.centerOnCurve.type === 'parametric' && cObj.centerOnCurve.parameterId.startsWith(`param_coc_${obj.id}`)) {
                       paramsToDeleteIds.add(cObj.centerOnCurve.parameterId);
                    }
                }
            }
        });
    } else if (objectToDelete.type === ObjectType.Vector) {
        paramsToDeleteIds.add((objectToDelete as VectorObject).angleParameterId);
        updatedObjectsDuringDelete.forEach((obj, index) => {
            if (obj.type === ObjectType.Circle) {
                const cObj = obj as CircleObject;
                if (cObj.centerOnCurve?.type === 'vector' && cObj.centerOnCurve.vectorId === id) {
                    const newObj = {...cObj}; delete newObj.centerOnCurve;
                    updatedObjectsDuringDelete[index] = newObj;
                }
            }
        });
    }
    
    paramsToDeleteIds.forEach(paramId => { delete nextParametersCleaned[paramId]; });
    
    updatedObjectsDuringDelete = updatedObjectsDuringDelete.map(obj => {
        if (!objectsToRemoveIds.has(obj.id) && 'showIntersectionsWith' in obj && Array.isArray(obj.showIntersectionsWith)) {
            const newIntersections = obj.showIntersectionsWith.filter(intersectId => !objectsToRemoveIds.has(intersectId));
            if (newIntersections.length !== obj.showIntersectionsWith.length) {
                return { ...obj, showIntersectionsWith: newIntersections };
            }
        }
        return obj;
    });
    
    const nextObjects = updatedObjectsDuringDelete.filter(obj => !objectsToRemoveIds.has(obj.id));
    setObjects(nextObjects);
    setParameters(nextParametersCleaned);
    if (selectedObjectId && objectsToRemoveIds.has(selectedObjectId)) setSelectedObjectId(null);
    pushToHistory(nextObjects, nextParametersCleaned);
  }, [objects, parameters, selectedObjectId, pushToHistory]);

  const handleAddVectorToCircle = useCallback((circleId: string) => {
    const circle = objects.find(obj => obj.id === circleId && obj.type === ObjectType.Circle) as CircleObject | undefined;
    if (!circle) return;
    const vectorId = generateId();
    const angleParamId = `param_vec_${vectorId}_angle`;
    const vectorLabel = `Vector on ${circle.label || 'Circle'}`;
    const newVector: VectorObject = {
      id: vectorId, type: ObjectType.Vector, label: vectorLabel, color: circle.color, 
      parentId: circleId, angleParameterId: angleParamId, 
      showPerpendicular: true, 
      showDerivative: false,
      showDifferentials: false,
      differentialArcAngle: DEFAULT_DIFFERENTIAL_ARC_ANGLE,
    };
    const newParameter: Parameter = {
      id: angleParamId, label: `Angle for ${vectorLabel}`, value: Math.PI / 6, 
      min: 0, max: 2 * Math.PI, step: 0.01, objectId: vectorId, role: 'vectorAngle',
    };
    const nextObjects = [...objects, newVector];
    const nextParameters = { ...parameters, [angleParamId]: newParameter };
    setObjects(nextObjects); setParameters(nextParameters); setSelectedObjectId(vectorId);
    pushToHistory(nextObjects, nextParameters);
  }, [objects, parameters, pushToHistory]); 

 const zoomByFactor = (factor: number) => {
    setZoomTransform(prevZoom => {
      const newK = Math.max(0.1, Math.min(10, prevZoom.k * factor));
      const centerX = SVG_VIEWBOX_WIDTH / 2; const centerY = SVG_VIEWBOX_HEIGHT / 2;
      const [pX, pY] = prevZoom.invert([centerX, centerY]);
      const newX = centerX - pX * newK; const newY = centerY - pY * newK;
      return zoomIdentity.translate(newX, newY).scale(newK);
    });
  };
  const resetZoom = () => setZoomTransform(zoomIdentity);
  const setDrawingModeAndClearPoints = (mode: 'line' | 'segment' | null) => {
    if (mode === 'line') setDrawingModeState(DrawingMode.LinePt1);
    else if (mode === 'segment') setDrawingModeState(DrawingMode.SegmentPt1);
    else setDrawingModeState(DrawingMode.None);
    setDrawingPoints([]);
  };
  const handleAddPointForDrawing = (point: Point) => {
    const currentPoints = [...drawingPoints, point];
    let finalObjects: GeometricObject[] | null = null;
    let finalParameters: AppParameters = parameters; 
    let newObjectId: string | null = null;
    if (drawingMode === DrawingMode.LinePt1) {
       setDrawingModeState(DrawingMode.LinePt2); setDrawingPoints(currentPoints);
    } else if (drawingMode === DrawingMode.SegmentPt1) {
       setDrawingModeState(DrawingMode.SegmentPt2); setDrawingPoints(currentPoints);
    } else if (drawingMode === DrawingMode.LinePt2 && currentPoints.length >= 2) {
        const id = generateId();
        finalObjects = [...objects, {
            id, type: ObjectType.Line, label: `Line ${objects.filter(o => o.type === ObjectType.Line).length + 1}`,
            color: DEFAULT_OBJECT_COLOR, p1: currentPoints[0], p2: currentPoints[1], p1Id:'', p2Id:'', showIntersectionsWith: [],
        } as LineObject]; newObjectId = id;
    } else if (drawingMode === DrawingMode.SegmentPt2 && currentPoints.length >= 2) {
        const id = generateId();
        finalObjects = [...objects, {
            id, type: ObjectType.LineSegment, label: `Segment ${objects.filter(o => o.type === ObjectType.LineSegment).length + 1}`,
            color: DEFAULT_OBJECT_COLOR, p1: currentPoints[0], p2: currentPoints[1], showIntersectionsWith: [],
        } as LineSegmentObject]; newObjectId = id;
    }
    if (finalObjects && newObjectId) {
        setObjects(finalObjects); setSelectedObjectId(newObjectId);
        setDrawingModeState(DrawingMode.None); setDrawingPoints([]);
        pushToHistory(finalObjects, finalParameters);
    }
  };
  const togglePolarGrid = () => setShowPolarGrid(prev => !prev);
  const toggleCartesianGrid = () => setShowCartesianGrid(prev => !prev); 

  const checkCircularDependency = useCallback((editingCircleId: string, proposedParentId: string ): boolean => {
    let currentIdToCheck: string | undefined = proposedParentId;
    const visited = new Set<string>(); 
    while (currentIdToCheck) {
      if (currentIdToCheck === editingCircleId) return true; 
      if (visited.has(currentIdToCheck)) return false; 
      visited.add(currentIdToCheck);
      const currentObject = objects.find(obj => obj.id === currentIdToCheck);
      if (currentObject?.type === ObjectType.Circle) {
          const coc = (currentObject as CircleObject).centerOnCurve;
          currentIdToCheck = coc?.parentId;
      } else {
          currentIdToCheck = undefined;
      }
    }
    return false; 
  }, [objects]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevStateIndex = historyIndex - 1;
      const prevState = history[prevStateIndex];
      setObjects(deepClone(prevState.objects)); 
      setParameters(deepClone(prevState.parameters));
      setHistoryIndex(prevStateIndex); setSelectedObjectId(null); 
      setDrawingModeState(DrawingMode.None); setDrawingPoints([]);
      activeSliderInteractionParamIdRef.current = null; 
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextStateIndex = historyIndex + 1;
      const nextState = history[nextStateIndex];
      setObjects(deepClone(nextState.objects));
      setParameters(deepClone(nextState.parameters));
      setHistoryIndex(nextStateIndex); setSelectedObjectId(null); 
      setDrawingModeState(DrawingMode.None); setDrawingPoints([]);
      activeSliderInteractionParamIdRef.current = null; 
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="custom-proofs-main-layout">
      <div className="custom-proofs-controls-panel-wrapper">
        <ControlsPanel
          onAddObject={handleAddObject} onZoomIn={() => zoomByFactor(1.2)} onZoomOut={() => zoomByFactor(1/1.2)}
          onResetZoom={resetZoom} setDrawingMode={setDrawingModeAndClearPoints}
          onTogglePolarGrid={togglePolarGrid} isPolarGridVisible={showPolarGrid}
          onToggleCartesianGrid={toggleCartesianGrid} isCartesianGridVisible={showCartesianGrid}
          onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo}
        />
      </div>
      <div className="custom-proofs-canvas-wrapper">
        <Canvas
          objects={objects} parameters={parameters} selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId} zoomTransform={zoomTransform} onZoomChange={setZoomTransform}
          drawingMode={drawingMode} onAddPointForDrawing={handleAddPointForDrawing}
          showPolarGrid={showPolarGrid} showCartesianGrid={showCartesianGrid}
          onUpdateObject={handleUpdateObject} 
        />
      </div>
      <div className="custom-proofs-properties-panel-wrapper">
        <PropertiesPanel
          selectedObject={objects.find(obj => obj.id === selectedObjectId) || null}
          objects={objects} parameters={parameters} 
          onUpdateObject={handleUpdateObject} 
          onUpdateParameter={handleUpdateParameter} 
          onSliderInteractionStart={handleSliderInteractionStart} 
          onSliderInteractionEnd={handleSliderInteractionEnd} 
          onAddVectorToCircle={handleAddVectorToCircle}
          onDeleteObject={handleDeleteObject} checkCircularDependency={checkCircularDependency}
          onToggleParameterAnimation={toggleParameterAnimation}
        />
      </div>
    </div>
  );
};

export default App;