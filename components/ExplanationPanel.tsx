import React, { useState } from 'react';
import { SceneConfig, NaturalExponentialProofValues, GeometricAreaProofValues } from '../types';

interface ExplanationPanelProps {
  sceneConfig: SceneConfig;
  angleDegrees: number;
  naturalExponentialValues?: NaturalExponentialProofValues;
  geometricAreaProofValues?: GeometricAreaProofValues;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  sceneConfig,
  angleDegrees,
  naturalExponentialValues,
  geometricAreaProofValues,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  let detailedExplanationContent = sceneConfig.detailedExplanationHTML;
  if (typeof detailedExplanationContent === 'function') {
    let valuesForFunction: NaturalExponentialProofValues | GeometricAreaProofValues | undefined = undefined;
    if (sceneConfig.id === 'natural_exponential_proof' && naturalExponentialValues) {
        valuesForFunction = naturalExponentialValues;
    } else if (sceneConfig.id === 'geometric_area_proof' && geometricAreaProofValues) {
        valuesForFunction = geometricAreaProofValues;
    }
    detailedExplanationContent = detailedExplanationContent(angleDegrees, valuesForFunction);
  }

  return (
    <div>
      <button
        type="button"
        className="explanation-toggle-button"
        onClick={() => setShowExplanation(!showExplanation)}
        aria-expanded={showExplanation}
        aria-controls={`explanation-content-area-${sceneConfig.id}`}
      >
        Explanation
        <span className={`toggle-icon ${showExplanation ? 'expanded' : ''}`} aria-hidden="true">▼</span>
      </button>
      {showExplanation && (
        <div className="explanation-content-wrapper" id={`explanation-content-area-${sceneConfig.id}`}>
          <div className="explanation-content">
            <h4>{sceneConfig.title}</h4>
            {sceneConfig.descriptionHTML && (
              <p className="form-text" dangerouslySetInnerHTML={{ __html: sceneConfig.descriptionHTML }} />
            )}
            {detailedExplanationContent && (
              <div dangerouslySetInnerHTML={{ __html: detailedExplanationContent }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
