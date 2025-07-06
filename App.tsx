import React, { useState, useCallback, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import ControlsPanel from './components/ControlsPanel';
import { 
  INITIAL_ANGLE_DEGREES, 
  SCENES, 
  INITIAL_SCENE_ID, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  DEFAULT_LABEL_VISIBILITY,
  HYPERBOLIC_TRIG_OVERLAY_DEFAULT_PARAM_VALUE,
  INITIAL_AREA_PROOF_THETA_DEGREES
} from './constants';
import { SceneType, ViewBox, SceneConfig, SceneLabelVisibility, LabelKey } from './types';

// Import for Custom Proofs scene
import CustomProofsApp from './custom-proofs/App';
import CustomProofsErrorBoundary from './custom-proofs/components/ErrorBoundary';


const App: React.FC = () => {
  const [angleDegrees, setAngleDegrees] = useState<number>(INITIAL_ANGLE_DEGREES);
  const [currentSceneId, setCurrentSceneId] = useState<SceneType>(INITIAL_SCENE_ID);
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
  const [showCircularInHyperbolic, setShowCircularInHyperbolic] = useState<boolean>(false);
  const [visibleLabels, setVisibleLabels] = useState<SceneLabelVisibility>(DEFAULT_LABEL_VISIBILITY);
  const [isControlsPanelVisible, setIsControlsPanelVisible] = useState<boolean>(true);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth <= 1023);

  const handleAngleChange = useCallback((newAngle: number) => {
    setAngleDegrees(newAngle);
  }, []);

  const handleSceneChange = useCallback((newSceneId: SceneType) => {
    setCurrentSceneId(newSceneId);
    
    // Reset viewbox for standard scenes, custom proofs handles its own
    if (newSceneId !== 'custom_proofs') {
        setViewBox({ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }); 
    }
    
    if (newSceneId !== 'hyperbolic_functions') {
      setShowCircularInHyperbolic(false);
    }

    const newSceneConfig = SCENES.find(s => s.id === newSceneId);
    if (!newSceneConfig || newSceneId === 'custom_proofs') return; // Custom proofs doesn't use these params

    let paramToValidate = angleDegrees;
    let defaultParamForNewScene = newSceneConfig.defaultParamValue ?? INITIAL_ANGLE_DEGREES;

    if (newSceneId === 'hyperbolic_functions' && showCircularInHyperbolic) {
      defaultParamForNewScene = HYPERBOLIC_TRIG_OVERLAY_DEFAULT_PARAM_VALUE;
    } else if (newSceneId === 'geometric_area_proof') {
      defaultParamForNewScene = INITIAL_AREA_PROOF_THETA_DEGREES;
    }

    if (paramToValidate < (newSceneConfig.sliderMin ?? 0) || paramToValidate > (newSceneConfig.sliderMax ?? 360)) {
      setAngleDegrees(defaultParamForNewScene);
    }
  }, [angleDegrees, showCircularInHyperbolic]);

  const handleViewBoxChange = useCallback((newViewBox: ViewBox) => {
    setViewBox(newViewBox);
  }, []);

  const handleToggleShowCircularInHyperbolic = useCallback(() => {
    setShowCircularInHyperbolic(prev => {
      const newShowCircular = !prev;
      if (currentSceneId === 'hyperbolic_functions') {
        const hyperbolicSceneConfig = SCENES.find(s => s.id === 'hyperbolic_functions');
        if (newShowCircular) {
          setAngleDegrees(HYPERBOLIC_TRIG_OVERLAY_DEFAULT_PARAM_VALUE);
        } else {
          setAngleDegrees(hyperbolicSceneConfig?.defaultParamValue ?? 100);
        }
      }
      return newShowCircular;
    });
  }, [currentSceneId]);

  const handleToggleLabelVisibility = useCallback((scene: SceneType, key: LabelKey) => {
    setVisibleLabels(prev => {
      const sceneLabels = prev[scene] || {};
      const newSceneSpecificLabels = {
        ...sceneLabels,
        [key]: !sceneLabels[key as keyof typeof sceneLabels]
      };
      return {
        ...prev,
        [scene]: newSceneSpecificLabels
      };
    });
  }, []);

  const toggleControlsPanel = useCallback(() => {
    setIsControlsPanelVisible(prev => !prev);
  }, []);

  const currentSceneConfig = SCENES.find(s => s.id === currentSceneId) || SCENES[0];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1023);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  let controlsToggleButtonStyle: React.CSSProperties = {
    position: 'absolute', 
    zIndex: 1050,
    transition: 'left 0.3s ease-in-out, top 0.3s ease-in-out, transform 0.3s ease-in-out, background-color 0.2s',
  };

  if (!isMobileView) { // Desktop
    controlsToggleButtonStyle.top = '50%';
    if (isControlsPanelVisible) {
      controlsToggleButtonStyle.left = '24rem'; 
      controlsToggleButtonStyle.transform = 'translateY(-50%) translateX(-50%)';
    } else { // Panel Hidden
      controlsToggleButtonStyle.left = '0rem'; 
      controlsToggleButtonStyle.transform = 'translateY(-50%) translateX(50%)'; 
    }
  } else { // Mobile
    controlsToggleButtonStyle.top = '0.5rem';
    controlsToggleButtonStyle.left = '0.5rem';
    controlsToggleButtonStyle.transform = 'none'; 
  }


  return (
    <div className="app-container">
      <header className="app-header">
      </header>
      
      <div className="content-wrapper">
        {currentSceneId !== 'custom_proofs' && (
         <button 
            className="controls-toggle-button"
            onClick={toggleControlsPanel}
            style={controlsToggleButtonStyle}
            title={isControlsPanelVisible ? "Hide Controls" : "Show Controls"}
            aria-label={isControlsPanelVisible ? "Hide controls panel" : "Show controls panel"}
            aria-expanded={isControlsPanelVisible}
          >
            {isControlsPanelVisible ? '«' : '»'}
          </button>
        )}

        {currentSceneId === 'custom_proofs' ? (
          <div className="custom-proofs-wrapper">
            <CustomProofsErrorBoundary>
              <CustomProofsApp />
            </CustomProofsErrorBoundary>
          </div>
        ) : (
          <main className="main-content-area">
            <div className={`controls-column ${isControlsPanelVisible ? '' : 'hidden'}`}>
              <div className="card"> 
                <div className="card-body"> 
                  <ControlsPanel
                    angleDegrees={angleDegrees}
                    onAngleChange={handleAngleChange}
                    currentSceneId={currentSceneId}
                    onSceneChange={handleSceneChange}
                    scenes={SCENES}
                    sceneConfig={currentSceneConfig}
                    showCircularInHyperbolic={showCircularInHyperbolic}
                    onToggleShowCircularInHyperbolic={handleToggleShowCircularInHyperbolic}
                    visibleLabels={visibleLabels} 
                    onToggleLabelVisibility={handleToggleLabelVisibility}
                  />
                </div>
              </div>
            </div>
            <div className="canvas-column">
              <div className="card"> 
                <div className="card-body"> 
                  <DrawingCanvas 
                    angleDegrees={angleDegrees} 
                    currentSceneId={currentSceneId}
                    viewBox={viewBox}
                    onViewBoxChange={handleViewBoxChange}
                    showCircularInHyperbolic={showCircularInHyperbolic}
                    visibleLabels={visibleLabels} 
                  />
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      <footer className="app-footer">
      </footer>
    </div>
  );
};

export default App;