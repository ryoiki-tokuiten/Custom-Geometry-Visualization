import React from 'react';
import { Point, ViewBox, SceneLabelVisibility } from '../../types';
import { COLORS, HYPERBOLIC_COLORS, STROKE_WIDTH, TEXT_OFFSET, SMALL_TEXT_OFFSET, HYPERBOLA_MAX_RHO_DRAW, HYPERBOLA_POINTS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import * as Draw from './DrawingUtils';

interface HyperbolicSceneProps {
  angleDegrees: number; // This is the raw slider value
  R_hp: number;
  visibleLabels: SceneLabelVisibility['hyperbolic_functions'];
  trigVisibleLabels: SceneLabelVisibility['trigonometry']; // For combined labels
  viewBox: ViewBox;
  initialCenterX: number;
  initialCenterY: number;
  showCircularInHyperbolic: boolean;
}

export const HyperbolicScene: React.FC<HyperbolicSceneProps> = ({
  angleDegrees,
  R_hp,
  visibleLabels: vl,
  trigVisibleLabels: trigVL,
  viewBox,
  initialCenterX,
  initialCenterY,
  showCircularInHyperbolic,
}) => {
  const toSvgCoords = React.useCallback((p: Point): Point => ({
    x: initialCenterX + p.x,
    y: initialCenterY - p.y,
  }), [initialCenterX, initialCenterY]);

  const R = R_hp;

  let rho: number;
  if (showCircularInHyperbolic) {
    const trigAngleRadians = angleDegrees * (Math.PI / 180);
    const tan_x = Math.tan(trigAngleRadians);
    rho = Math.asinh(tan_x);
  } else {
    rho = Math.max(1e-3, angleDegrees / 100.0);
  }

  const O_svg = toSvgCoords({ x: 0, y: 0 });
  const elements: JSX.Element[] = [];

  let hyperbolaPathPoints = "";
  const currentMaxRhoDraw = HYPERBOLA_MAX_RHO_DRAW + Math.max(0, Math.log(Math.max(viewBox.width, viewBox.height) / Math.min(CANVAS_WIDTH, CANVAS_HEIGHT)));

  for (let i = 0; i <= HYPERBOLA_POINTS; i++) {
    const t = (i / HYPERBOLA_POINTS) * currentMaxRhoDraw;
    const p_lower = toSvgCoords({ x: R * Math.cosh(t), y: -R * Math.sinh(t) });
    if (i === 0) {
      hyperbolaPathPoints += `M ${p_lower.x} ${p_lower.y} `;
    } else {
      hyperbolaPathPoints += `L ${p_lower.x} ${p_lower.y} `;
    }
  }
  for (let i = HYPERBOLA_POINTS; i >= 0; i--) {
    const t = (i / HYPERBOLA_POINTS) * currentMaxRhoDraw;
    const p_upper = toSvgCoords({ x: R * Math.cosh(t), y: R * Math.sinh(t) });
    hyperbolaPathPoints += `L ${p_upper.x} ${p_upper.y} `;
  }

  const P_math = { x: R * Math.cosh(rho), y: R * Math.sinh(rho) };
  const P_svg = toSvgCoords(P_math);

  const sinh_val_math = R * Math.sinh(rho);
  const cosh_val_math = R * Math.cosh(rho);

  const T_tanh_math = { x: R, y: R * Math.tanh(rho) };
  const T_tanh_svg = toSvgCoords(T_tanh_math);

  const sech_x_coord_math = (Math.abs(Math.cosh(rho)) < 1e-9) ? R * 1e9 : R / Math.cosh(rho);
  const T_sech_math = { x: sech_x_coord_math, y: 0 };
  const T_sech_svg = toSvgCoords(T_sech_math);

  const T_csch_math = { x: 0, y: (Math.abs(Math.sinh(rho)) < 1e-9) ? Math.sign(rho) * R * 1000 : R / Math.sinh(rho) };
  const T_csch_svg = toSvgCoords(T_csch_math);
  const T_coth_math = { x: (Math.abs(Math.tanh(rho)) < 1e-9) ? Math.sign(rho) * R * 1000 : R / Math.tanh(rho), y: R };
  const T_coth_svg = toSvgCoords(T_coth_math);

  const limit = R * 3;
  const clamp = (val: number, lim: number) => Math.max(-lim, Math.min(lim, val));

  const showCombinedCoshSec = showCircularInHyperbolic && vl.cosh && trigVL.tangentPerspective;
  const showCombinedSinhTan = showCircularInHyperbolic && vl.sinh && trigVL.tangentPerspective;

  if (vl.axesXYO) {
    elements.push(Draw.renderLine({ x: viewBox.x, y: O_svg.y }, { x: viewBox.x + viewBox.width, y: O_svg.y }, COLORS.axes, "h_xaxis", STROKE_WIDTH.extraThin));
    elements.push(Draw.renderLine({ x: O_svg.x, y: viewBox.y }, { x: O_svg.x, y: viewBox.y + viewBox.height }, COLORS.axes, "h_yaxis", STROKE_WIDTH.extraThin));
    elements.push(Draw.renderText("O", O_svg, HYPERBOLIC_COLORS.labelText, "h_Olabel", -SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET, "end", "top", "10px"));
    elements.push(Draw.renderText("x", { x: viewBox.x + viewBox.width - 15, y: O_svg.y }, HYPERBOLIC_COLORS.labelText, "h_xlabel", 0, TEXT_OFFSET, "end", "middle", "12px"));
    elements.push(Draw.renderText("y", { x: O_svg.x, y: viewBox.y + 15 }, HYPERBOLIC_COLORS.labelText, "h_ylabel", -TEXT_OFFSET, 0, "end", "middle", "12px"));
  }

  if (vl.asymptotes) {
    const asym_len = Math.max(viewBox.width, viewBox.height) * 1.5;
    const asym_p1_start = toSvgCoords({ x: -asym_len, y: -asym_len });
    const asym_p1_end = toSvgCoords({ x: asym_len, y: asym_len });
    const asym_p2_start = toSvgCoords({ x: -asym_len, y: asym_len });
    const asym_p2_end = toSvgCoords({ x: asym_len, y: -asym_len });
    elements.push(Draw.renderLine(asym_p1_start, asym_p1_end, HYPERBOLIC_COLORS.asymptotes, "h_asym1", STROKE_WIDTH.thin, true));
    elements.push(Draw.renderLine(asym_p2_start, asym_p2_end, HYPERBOLIC_COLORS.asymptotes, "h_asym2", STROKE_WIDTH.thin, true));
  }

  elements.push(<path d={hyperbolaPathPoints} stroke={HYPERBOLIC_COLORS.hyperbola} strokeWidth={STROKE_WIDTH.default} fill="none" key="h_hyperbola" />);

  if (Math.abs(rho) <= currentMaxRhoDraw * 1.5) {
    elements.push(Draw.renderLine(O_svg, P_svg, HYPERBOLIC_COLORS.connectorLine, "h_OPline", STROKE_WIDTH.thin));
    elements.push(<circle cx={P_svg.x} cy={P_svg.y} r="4" fill={HYPERBOLIC_COLORS.pointOnHyperbola} stroke="#ffffff" strokeWidth="1" key="h_Pmarker" />);
    if (vl.pointP) {
      elements.push(Draw.renderText("P", P_svg, HYPERBOLIC_COLORS.pointOnHyperbola, "h_Plabel", P_math.x >= 0 ? SMALL_TEXT_OFFSET : -SMALL_TEXT_OFFSET, P_math.y >= 0 ? -SMALL_TEXT_OFFSET : SMALL_TEXT_OFFSET * 1.5, "start", "middle", "12px", "bold"));
    }

    if (vl.rhoAngleVisual && Math.abs(P_math.x) > 1e-6) {
      const angleToP_rad = Math.atan2(P_math.y, P_math.x);
      const arcRadius = R * 0.25;
      elements.push(...Draw.renderAngleArcMarker(O_svg, arcRadius, 0, angleToP_rad, HYPERBOLIC_COLORS.rhoAngleArc, "h_rhoAngle", STROKE_WIDTH.thin, "\u03C1", 1.3, HYPERBOLIC_COLORS.pointOnHyperbola));
    }

    elements.push(Draw.renderLine(O_svg, toSvgCoords({ x: cosh_val_math, y: 0 }), HYPERBOLIC_COLORS.cosh, "h_coshLine", STROKE_WIDTH.bold));
    if (!showCombinedCoshSec && vl.cosh) {
      elements.push(Draw.renderText("cosh\u03C1", toSvgCoords({ x: cosh_val_math / 2, y: -TEXT_OFFSET * 0.6 * Math.sign(P_math.y || -1) }), HYPERBOLIC_COLORS.cosh, "h_coshLabel", 0, 0, "middle", "top", "14px", "bold"));
    }
    elements.push(Draw.renderLine(P_svg, toSvgCoords({ x: cosh_val_math, y: 0 }), HYPERBOLIC_COLORS.connectorLine, "h_coshHelper", STROKE_WIDTH.extraThin, true));

    if (Math.abs(sinh_val_math) > 1e-3 * R) {
      elements.push(Draw.renderLine(toSvgCoords({ x: cosh_val_math, y: 0 }), P_svg, HYPERBOLIC_COLORS.sinh, "h_sinhLine", STROKE_WIDTH.bold));
      if (showCombinedSinhTan) {
        elements.push(Draw.renderText("tan θ = sinh ρ", toSvgCoords({ x: cosh_val_math + TEXT_OFFSET * 0.6, y: sinh_val_math / 2 }), HYPERBOLIC_COLORS.sinh, "h_comb_sinhTanLabel", 0, 0, "start", "middle", "13px", "bold"));
      } else if (vl.sinh) {
        elements.push(Draw.renderText("sinh\u03C1", toSvgCoords({ x: cosh_val_math + TEXT_OFFSET * 0.6, y: sinh_val_math / 2 }), HYPERBOLIC_COLORS.sinh, "h_sinhLabel", 0, 0, "start", "middle", "14px", "bold"));
      }
      elements.push(Draw.renderLine(P_svg, toSvgCoords({ x: 0, y: sinh_val_math }), HYPERBOLIC_COLORS.connectorLine, "h_sinhHelper", STROKE_WIDTH.extraThin, true));
    }

    if (vl.tanh && Math.abs(T_tanh_math.y) < limit) {
      elements.push(Draw.renderLine(toSvgCoords({ x: R, y: 0 }), T_tanh_svg, HYPERBOLIC_COLORS.tanh, "h_tanhLine", STROKE_WIDTH.bold));
      elements.push(Draw.renderText("tanh\u03C1", toSvgCoords({ x: R + TEXT_OFFSET * 0.7, y: clamp(T_tanh_math.y / 2, limit) }), HYPERBOLIC_COLORS.tanh, "h_tanhLabel", 0, 0, "start", "middle", "14px", "bold"));
    }

    if (vl.sech && Math.abs(T_sech_math.x) < limit && Math.abs(Math.cosh(rho)) > 1e-9) {
      elements.push(Draw.renderLine(O_svg, T_sech_svg, HYPERBOLIC_COLORS.sech, "h_sechLine", STROKE_WIDTH.bold));
      elements.push(Draw.renderText("sech\u03C1", toSvgCoords({ x: clamp(T_sech_math.x / 2, limit), y: TEXT_OFFSET * 0.7 * Math.sign(P_math.y || 1) }), HYPERBOLIC_COLORS.sech, "h_sechLabel", 0, 0, "middle", P_math.y >= 0 ? "bottom" : "top", "14px", "bold"));
    }

    if (vl.csch && Math.abs(rho) > 1e-2 && Math.abs(T_csch_math.y) < limit && Math.abs(Math.sinh(rho)) > 0.01) {
      elements.push(Draw.renderLine(O_svg, T_csch_svg, HYPERBOLIC_COLORS.csch, "h_cschLine", STROKE_WIDTH.bold));
      elements.push(Draw.renderText("csch\u03C1", toSvgCoords({ x: TEXT_OFFSET * 0.7 * Math.sign(T_csch_math.x - O_svg.x || P_math.x || 1), y: clamp(T_csch_math.y / 2, limit) }), HYPERBOLIC_COLORS.csch, "h_cschLabel", 0, 0, (T_csch_math.x - O_svg.x || P_math.x) >= 0 ? "start" : "end", "middle", "14px", "bold"));
    }

    if (vl.coth && Math.abs(rho) > 1e-2 && Math.abs(T_coth_math.x) < limit && Math.abs(Math.sinh(rho)) > 0.1) {
      elements.push(Draw.renderLine(toSvgCoords({ x: 0, y: R }), T_coth_svg, HYPERBOLIC_COLORS.coth, "h_cothLine", STROKE_WIDTH.bold));
      elements.push(Draw.renderText("coth\u03C1", toSvgCoords({ x: clamp(T_coth_math.x / 2, limit), y: R + TEXT_OFFSET * 0.7 }), HYPERBOLIC_COLORS.coth, "h_cothLabel", 0, 0, "middle", "bottom", "14px", "bold"));
    }
  }
  const tan_cot_axis_limit_y = viewBox.y + viewBox.height;
  const tan_cot_axis_limit_x = viewBox.x + viewBox.width;
  elements.push(<line x1={toSvgCoords({ x: R, y: 0 }).x} y1={viewBox.y} x2={toSvgCoords({ x: R, y: 0 }).x} y2={tan_cot_axis_limit_y} stroke={HYPERBOLIC_COLORS.connectorLine} strokeWidth={STROKE_WIDTH.extraThin} strokeDasharray="2 2" key="h_tanhAxisLimit" />);
  elements.push(<line x1={viewBox.x} y1={toSvgCoords({ x: 0, y: R }).y} x2={tan_cot_axis_limit_x} y2={toSvgCoords({ x: 0, y: R }).y} stroke={HYPERBOLIC_COLORS.connectorLine} strokeWidth={STROKE_WIDTH.extraThin} strokeDasharray="2 2" key="h_cothAxisLimit" />);

  return <>{elements}</>;
};
