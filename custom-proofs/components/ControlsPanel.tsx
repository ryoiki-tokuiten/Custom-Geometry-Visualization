import React from 'react';
import { CircleIcon, HyperbolaIcon, LineIcon, PlusIcon, PolarGridIcon, CartesianGridIcon, UndoIcon, RedoIcon } from './icons'; // Added CartesianGridIcon
import { ObjectType, HyperbolaForm } from '../types';

interface ControlsPanelProps {
  onAddObject: (type: ObjectType, options?: any) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  setDrawingMode: (mode: 'line' | 'segment' | null) => void;
  onTogglePolarGrid: () => void;
  isPolarGridVisible: boolean;
  onToggleCartesianGrid: () => void; // New prop
  isCartesianGridVisible: boolean; // New prop
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string; active?: boolean, disabled?: boolean }> = 
  ({ onClick, children, title, active, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`custom-proofs-panel-button ${active ? 'active' : ''}`}
  >
    {children}
  </button>
);

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
    onAddObject, 
    onZoomIn, 
    onZoomOut, 
    onResetZoom, 
    setDrawingMode, 
    onTogglePolarGrid, 
    isPolarGridVisible,
    onToggleCartesianGrid, // New prop
    isCartesianGridVisible, // New prop
    onUndo,
    onRedo,
    canUndo,
    canRedo
 }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add Objects</h3>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: '1rem' /* Replaces space-y-2 somewhat */ }}>
            <ControlButton onClick={() => onAddObject(ObjectType.Circle, { r: 1, cx: 0, cy: 0, label: 'Unit Circle', isFixedRadius: true })} title="Add Unit Circle">
            <CircleIcon /> Unit Circle
            </ControlButton>
            <ControlButton onClick={() => onAddObject(ObjectType.Circle)} title="Add Custom Circle">
            <PlusIcon /> Custom Circle
            </ControlButton>
            <ControlButton onClick={() => onAddObject(ObjectType.Hyperbola)} title="Add Hyperbola">
            <HyperbolaIcon /> Add Hyperbola
            </ControlButton>
            <ControlButton onClick={() => setDrawingMode('line')} title="Draw Line">
            <LineIcon style={{transform: 'rotate(45deg)'}}/> Draw Line
            </ControlButton>
            <ControlButton onClick={() => setDrawingMode('segment')} title="Draw Line Segment">
            <LineIcon /> Draw Segment
            </ControlButton>
        </div>

        <div className="card-header" style={{ margin: '1.5rem -0.85rem 0.75rem', paddingLeft: '0.85rem', paddingRight: '0.85rem'}}>
            <h3 className="card-title">Edit</h3>
        </div>
        <div style={{ marginBottom: '1rem' }}>
            <ControlButton onClick={onUndo} title="Undo" disabled={!canUndo}>
            <UndoIcon /> Undo
            </ControlButton>
            <ControlButton onClick={onRedo} title="Redo" disabled={!canRedo}>
            <RedoIcon /> Redo
            </ControlButton>
        </div>

        <div className="card-header" style={{ margin: '1.5rem -0.85rem 0.75rem', paddingLeft: '0.85rem', paddingRight: '0.85rem'}}>
            <h3 className="card-title">View Controls</h3>
        </div>
        <div>
            <ControlButton onClick={onZoomIn} title="Zoom In">
            <PlusIcon /> Zoom In
            </ControlButton>
            <ControlButton onClick={onZoomOut} title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2z"/></svg> Zoom Out
            </ControlButton>
            <ControlButton onClick={onResetZoom} title="Reset Zoom">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5C8.134 5 5 8.134 5 12s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"/><path d="M12.707 8.707a1 1 0 0 0-1.414 0L9.001 11H8v2h2v-1.001l2.293-2.292a1 1 0 0 0 0-1.414L12.707 8.707zM15 11h-2v2H11.001L13.292 15.293a1 1 0 0 0 1.414 0L16 13.707V13h-1v-2z"/></svg> Reset Zoom
            </ControlButton>
            <ControlButton onClick={onToggleCartesianGrid} title={isCartesianGridVisible ? "Hide Cartesian Grid" : "Show Cartesian Grid"} active={isCartesianGridVisible}>
              <CartesianGridIcon /> {isCartesianGridVisible ? "Hide Cartesian Grid" : "Show Cartesian Grid"}
            </ControlButton>
            <ControlButton onClick={onTogglePolarGrid} title={isPolarGridVisible ? "Hide Polar Grid" : "Show Polar Grid"} active={isPolarGridVisible}>
            <PolarGridIcon /> {isPolarGridVisible ? "Hide Polar Grid" : "Show Polar Grid"}
            </ControlButton>
        </div>
      </div>
    </div>
  );
};
