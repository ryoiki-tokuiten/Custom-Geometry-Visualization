export const SVG_VIEWBOX_WIDTH = 800;
export const SVG_VIEWBOX_HEIGHT = 600;
export const INITIAL_SCALE = 50; // 50 pixels per geometric unit
export const GRID_LINE_COLOR = '#484848'; // Darker, subtle grid lines
export const AXIS_LINE_COLOR = '#a0a0a0'; // Main axes color
export const DEFAULT_OBJECT_COLOR = '#3b82f6'; // Tailwind blue-500

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;

export const HYPERBOLA_RENDER_RANGE_T = 3; // For parametric t from -range to +range
export const HYPERBOLA_POINTS = 50; // Number of points to plot for each branch

export const TEMP_POINT_COLOR = '#ef4444'; // Tailwind red-500 for point selection

export const POLAR_GRID_COLOR = '#cccccc'; // Color for polar grid lines
export const DISCRETE_TRACE_COLOR = '#ff00ff'; // Magenta for visibility of discrete traces
export const DEFAULT_DISCRETE_TRACE_STEPS = 20; // Default number of steps for discrete traces

export const INTERSECTION_POINT_COLOR = '#00ff00'; // Bright green for intersection points
export const INTERSECTION_POINT_RADIUS_SVG = 3; // SVG pixel radius for intersection markers

export const DERIVATIVE_VECTOR_COLOR = '#22c55e'; // Tailwind green-500

// For d(sinX), d(cosX) visualization
export const DX_COLOR = '#FF8C00'; // DarkOrange
export const DY_COLOR = '#1E90FF'; // DodgerBlue
export const D_THETA_HYPOTENUSE_COLOR = '#696969'; // DimGray
export const D_THETA_ARC_COLOR = '#A9A9A9'; // DarkGray
export const D_THETA_AUX_VECTOR_COLOR = '#A0A0A0'; // Gray for the vector at theta + dTheta

export const DEFAULT_DIFFERENTIAL_ARC_ANGLE = 0.1; // radians
export const MIN_DIFFERENTIAL_ARC_ANGLE = 0.01;
export const MAX_DIFFERENTIAL_ARC_ANGLE = 0.5;
export const STEP_DIFFERENTIAL_ARC_ANGLE = 0.01;
