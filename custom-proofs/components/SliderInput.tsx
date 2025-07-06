import React from 'react';
import { PlayIcon, PauseIcon } from './icons';

interface SliderInputProps {
  label: string;
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void; // Called continuously during drag for live updates
  onInteractionStart?: () => void;    // Called on mousedown/touchstart
  onInteractionEnd?: (value: number) => void; // Called on mouseup/touchend with final value
  unit?: string;
  disabled?: boolean;
  isAnimating?: boolean;
  onToggleAnimate?: () => void;
  canAnimate?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  id,
  value,
  min,
  max,
  step,
  onChange,
  onInteractionStart,
  onInteractionEnd,
  unit,
  disabled,
  isAnimating,
  onToggleAnimate,
  canAnimate = true,
}) => {
  const effectiveDisabled = disabled || isAnimating;

  const handleMouseDown = () => {
    if (onInteractionStart) {
      onInteractionStart();
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (onInteractionEnd) {
      onInteractionEnd(parseFloat((event.target as HTMLInputElement).value));
    }
  };


  return (
    <div className="custom-proofs-slider-container" style={{ marginBottom: '0.75rem' }}>
      <div className={`form-label ${effectiveDisabled ? 'disabled' : ''}`}>
        <span>{label}: {value.toFixed(2)}{unit}</span>
        {canAnimate && onToggleAnimate && (
          <button
            type="button"
            onClick={onToggleAnimate}
            title={isAnimating ? 'Pause animation' : 'Play animation'}
            className="custom-proofs-play-pause-button"
            aria-pressed={isAnimating}
            aria-label={isAnimating ? `Pause animation for ${label}` : `Play animation for ${label}`}
          >
            {isAnimating ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown} // Use same handler for touch
        onTouchEnd={handleMouseUp}     // Use same handler for touch
        disabled={effectiveDisabled}
      />
    </div>
  );
};
