
import React, { useCallback } from 'react';
import { Point, ViewBox, TrigLabelKey, SceneLabelVisibility } from '../../types';
import { COLORS, STROKE_WIDTH, TEXT_OFFSET, SMALL_TEXT_OFFSET, TICK_LENGTH, HYPERBOLIC_COLORS } from '../../constants';
import * as Draw from './DrawingUtils';

interface TrigonometrySceneProps {
  angleDegrees: number;
  R: number; // R_canvas or R_hp for overlay
  visibleLabels: SceneLabelVisibility['trigonometry'];
  viewBox: ViewBox;
  initialCenterX: number;
  initialCenterY: number;
  isOverlay: boolean;
  showCombinedCoshSec?: boolean; // For specific label text in hyperbolic overlay
  showCombinedSinhTan?: boolean; // For specific label text in hyperbolic overlay
}

export const TrigonometryScene: React.FC<TrigonometrySceneProps> = ({
  angleDegrees,
  R,
  visibleLabels: vl,
  viewBox,
  initialCenterX,
  initialCenterY,
  isOverlay,
  showCombinedCoshSec = false,
  showCombinedSinhTan = false,
}) => {
  const toSvgCoords = useCallback((p: Point): Point => ({
    x: initialCenterX + p.x,
    y: initialCenterY - p.y,
  }), [initialCenterX, initialCenterY]);

  const angleRad = angleDegrees * (Math.PI / 180);

  const P_math: Point = { x: R * Math.cos(angleRad), y: R * Math.sin(angleRad) };
  const P_svg = toSvgCoords(P_math);
  const O_svg = toSvgCoords({ x: 0, y: 0 });

  const cosRad = Math.cos(angleRad);
  const sinRad = Math.sin(angleRad);

  let tanValue = R * Math.tan(angleRad);
  let secValue = R / cosRad;
  let cotValue = R / Math.tan(angleRad);
  let cscValue = R / sinRad;

  const limit = R * 4;
  tanValue = Math.max(-limit, Math.min(limit, tanValue));
  secValue = Math.max(-limit, Math.min(limit, secValue));
  cotValue = Math.max(-limit, Math.min(limit, cotValue));
  cscValue = Math.max(-limit, Math.min(limit, cscValue));

  const isSinZero = Math.abs(sinRad) < 1e-9;
  const isCosZero = Math.abs(cosRad) < 1e-9;

  const X_axis_R_svg = toSvgCoords({ x: R, y: 0 });
  const Y_axis_R_svg = toSvgCoords({ x: 0, y: R });

  const T_tan_svg = toSvgCoords({ x: R, y: tanValue });
  const T_cot_svg = toSvgCoords({ x: cotValue, y: R });

  const keyPfx = isOverlay ? 'ovr_' : '';
  const elements: JSX.Element[] = [];
  
  const currentColors = isOverlay ? HYPERBOLIC_COLORS : COLORS;


  if (!isOverlay) {
    if (vl.axesXYO) {
      elements.push(Draw.renderLine({ x: viewBox.x, y: O_svg.y }, { x: viewBox.x + viewBox.width, y: O_svg.y }, COLORS.axes, `${keyPfx}xaxis`, STROKE_WIDTH.extraThin));
      elements.push(Draw.renderLine({ x: O_svg.x, y: viewBox.y }, { x: O_svg.x, y: viewBox.y + viewBox.height }, COLORS.axes, `${keyPfx}yaxis`, STROKE_WIDTH.extraThin));
      elements.push(Draw.renderText("O", O_svg, COLORS.labelText, `${keyPfx}Olabel`, -SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET, "end", "top", "10px"));
      elements.push(Draw.renderText("x", { x: viewBox.x + viewBox.width - 15, y: O_svg.y }, COLORS.labelText, `${keyPfx}xlabel`, 0, TEXT_OFFSET, "end", "middle", "12px"));
      elements.push(Draw.renderText("y", { x: O_svg.x, y: viewBox.y + 15 }, COLORS.labelText, `${keyPfx}ylabel`, -TEXT_OFFSET, 0, "end", "middle", "12px"));
    }
    if (vl.tickMarks) {
      [-1, 1].forEach(tick => {
        const tickX_svg = toSvgCoords({ x: tick * R, y: 0 });
        const tickY_svg = toSvgCoords({ x: 0, y: tick * R });
        elements.push(
          <React.Fragment key={`${keyPfx}tick-trig-${tick}`}>
            {Draw.renderLine({ x: tickX_svg.x, y: tickX_svg.y - TICK_LENGTH }, { x: tickX_svg.x, y: tickX_svg.y + TICK_LENGTH }, COLORS.axes, `${keyPfx}tx${tick}`, STROKE_WIDTH.extraThin)}
            {Draw.renderText(String(tick), tickX_svg, COLORS.labelText, `${keyPfx}txt${tick}`, 0, tick > 0 ? TICK_LENGTH + SMALL_TEXT_OFFSET : -TICK_LENGTH - SMALL_TEXT_OFFSET, "middle", tick > 0 ? "top" : "bottom", "10px")}
            {Draw.renderLine({ x: tickY_svg.x - TICK_LENGTH, y: tickY_svg.y }, { x: tickY_svg.x + TICK_LENGTH, y: tickY_svg.y }, COLORS.axes, `${keyPfx}ty${tick}`, STROKE_WIDTH.extraThin)}
            {Draw.renderText(String(tick), tickY_svg, COLORS.labelText, `${keyPfx}tyt${tick}`, tick > 0 ? -TICK_LENGTH - SMALL_TEXT_OFFSET : TICK_LENGTH + SMALL_TEXT_OFFSET, 3, tick > 0 ? "end" : "start", "middle", "10px")}
          </React.Fragment>
        );
      });
    }
  }

  elements.push(<circle cx={O_svg.x} cy={O_svg.y} r={R} fill="none" stroke={isOverlay ? HYPERBOLIC_COLORS.asymptotes : COLORS.unitCircle} strokeWidth={STROKE_WIDTH.default} key={`${keyPfx}unitCircle`} />);
  if (vl.angleTheta) {
    elements.push(...Draw.renderAngleArcMarker(O_svg, R * 0.3, 0, angleRad, COLORS.angleArc, `${keyPfx}mainTrigAngle`, STROKE_WIDTH.thin, "\u03B8", 1.3));
  }
  elements.push(Draw.renderLine(O_svg, P_svg, COLORS.connectorLine, `${keyPfx}radiusP`, STROKE_WIDTH.thin));
  elements.push(<circle cx={P_svg.x} cy={P_svg.y} r="4" fill={COLORS.pointOnCircle} stroke="#ffffff" strokeWidth="1" key={`${keyPfx}Pmarker`} />);
  if (vl.pointP) {
    elements.push(Draw.renderText("P", P_svg, COLORS.pointOnCircle, `${keyPfx}Plabel`, P_math.x >= 0 ? SMALL_TEXT_OFFSET : -SMALL_TEXT_OFFSET, P_math.y >= 0 ? -SMALL_TEXT_OFFSET : SMALL_TEXT_OFFSET * 1.5, P_math.x >= 0 ? "start" : "end", P_math.y >= 0 ? "bottom" : "top", "12px", "bold"));
  }

  if (!isSinZero && vl.sin) {
    elements.push(Draw.renderLine(toSvgCoords({ x: P_math.x, y: 0 }), P_svg, COLORS.sin, `${keyPfx}sinLine`, STROKE_WIDTH.bold));
    elements.push(Draw.renderText("sin\u03B8", toSvgCoords({ x: P_math.x + TEXT_OFFSET * Math.sign(P_math.x || 1) * 0.6, y: P_math.y / 2 }), COLORS.sin, `${keyPfx}sinLabel`, 0, 0, P_math.x >= 0 ? "start" : "end", "middle", "14px", "bold"));
  }
  if (!isCosZero && vl.cos) {
    elements.push(Draw.renderLine(O_svg, toSvgCoords({ x: P_math.x, y: 0 }), COLORS.cos, `${keyPfx}cosLine`, STROKE_WIDTH.bold));
    elements.push(Draw.renderText("cos\u03B8", toSvgCoords({ x: P_math.x / 2, y: -TEXT_OFFSET * Math.sign(P_math.y || -1) * 0.6 }), COLORS.cos, `${keyPfx}cosLabel`, 0, 0, "middle", P_math.y >= 0 ? "top" : "bottom", "14px", "bold"));
  }

  if (!isCosZero && Math.abs(tanValue) < limit) {
    if (vl.tan) {
      elements.push(Draw.renderLine(X_axis_R_svg, T_tan_svg, COLORS.tan, `${keyPfx}stdTanLine`, STROKE_WIDTH.bold));
      elements.push(Draw.renderText("tan\u03B8", toSvgCoords({ x: R + TEXT_OFFSET * 0.7, y: tanValue / 2 }), COLORS.tan, `${keyPfx}stdTanLabel`, 0, 0, "start", "middle", "14px", "bold"));
    }
    if (vl.sec) {
      elements.push(Draw.renderLine(O_svg, T_tan_svg, COLORS.sec, `${keyPfx}stdSecLine`, STROKE_WIDTH.bold));
      elements.push(Draw.renderText("sec\u03B8", toSvgCoords({ x: R * cosRad / 2 + (R / cosRad - R * cosRad) / 2 * cosRad, y: R * sinRad / 2 + tanValue / 2 * sinRad }), COLORS.sec, `${keyPfx}stdSecLabel`, TEXT_OFFSET * 0.5 * cosRad, -TEXT_OFFSET * 0.5 * sinRad, "center", "middle", "14px", "bold"));
    }
  }
  if (!isSinZero && Math.abs(cotValue) < limit) {
    if (vl.cot) {
      elements.push(Draw.renderLine(Y_axis_R_svg, T_cot_svg, COLORS.cot, `${keyPfx}stdCotLine`, STROKE_WIDTH.bold));
      elements.push(Draw.renderText("cot\u03B8", toSvgCoords({ x: cotValue / 2, y: R + TEXT_OFFSET * 0.7 }), COLORS.cot, `${keyPfx}stdCotLabel`, 0, 0, "middle", "bottom", "14px", "bold"));
    }
    if (vl.csc) {
      elements.push(Draw.renderLine(O_svg, T_cot_svg, COLORS.csc, `${keyPfx}stdCscLine`, STROKE_WIDTH.bold));
      elements.push(Draw.renderText("csc\u03B8", toSvgCoords({ x: R * cosRad / 2 + (cotValue - R * cosRad) / 2 * cosRad, y: R * sinRad / 2 + (R - R * sinRad) / 2 * sinRad }), COLORS.csc, `${keyPfx}stdCscLabel`, TEXT_OFFSET * 0.5 * cosRad, -TEXT_OFFSET * 0.5 * sinRad, "center", "middle", "14px", "bold"));
    }
  }
  if (!isOverlay && (vl.tan || vl.sec || vl.csc || vl.cot)) {
    if (!isCosZero && Math.abs(tanValue) < limit) elements.push(<line x1={X_axis_R_svg.x} y1={viewBox.y} x2={X_axis_R_svg.x} y2={viewBox.y + viewBox.height} stroke={COLORS.connectorLine} strokeWidth={STROKE_WIDTH.extraThin} strokeDasharray="2 2" key={`${keyPfx}tanAxisLimit`} />);
    if (!isSinZero && Math.abs(cotValue) < limit) elements.push(<line x1={viewBox.x} y1={Y_axis_R_svg.y} x2={viewBox.x + viewBox.width} y2={Y_axis_R_svg.y} stroke={COLORS.connectorLine} strokeWidth={STROKE_WIDTH.extraThin} strokeDasharray="2 2" key={`${keyPfx}cotAxisLimit`} />);
  }


  if (vl.tangentPerspective) {
    const tangentLineColor = isOverlay ? HYPERBOLIC_COLORS.asymptotes : COLORS.tangentLine;
    const labelFontSize = "12px";
    const labelFontWeight = "500";

    let Sx_math: Point | null = null;
    let Sy_math: Point | null = null;

    if (!isCosZero) Sx_math = { x: R / cosRad, y: 0 };
    if (!isSinZero) Sy_math = { x: 0, y: R / sinRad };

    const tangentDir = { dx: -sinRad, dy: cosRad };
    const tangentDrawLength = Math.max(viewBox.width, viewBox.height) * 1.5;
    const T1_math = { x: P_math.x + tangentDir.dx * tangentDrawLength, y: P_math.y + tangentDir.dy * tangentDrawLength };
    const T2_math = { x: P_math.x - tangentDir.dx * tangentDrawLength, y: P_math.y - tangentDir.dy * tangentDrawLength };
    elements.push(Draw.renderLine(toSvgCoords(T1_math), toSvgCoords(T2_math), tangentLineColor, `${keyPfx}mainTangentLine`, STROKE_WIDTH.thin));

    if (Sx_math) {
      const Sx_svg = toSvgCoords(Sx_math);
      elements.push(Draw.renderLine(O_svg, Sx_svg, COLORS.sec, `${keyPfx}OSxLine`, STROKE_WIDTH.bold));

      const OSx_label_pos = toSvgCoords({ x: Sx_math.x / 2, y: SMALL_TEXT_OFFSET * Math.sign(Sx_math.x) * (P_math.y < 0 ? -1 : 1) * (isCosZero ? 0 : 1) * 0.7 });
      if (showCombinedCoshSec) {
        elements.push(Draw.renderText("sec θ = cosh ρ", OSx_label_pos, COLORS.sec, `${keyPfx}comb_coshSecLabel`, 0, 0, "center", P_math.y < 0 ? "top" : "bottom", "13px", "bold"));
      } else {
        elements.push(Draw.renderText("sec \u03B8", OSx_label_pos, COLORS.sec, `${keyPfx}OSxLabel`, 0, 0, "center", P_math.y < 0 ? "top" : "bottom", labelFontSize, labelFontWeight));
      }

      elements.push(Draw.renderLine(P_svg, Sx_svg, COLORS.tan, `${keyPfx}PSxLine`, STROKE_WIDTH.bold));
      if (!showCombinedSinhTan) {
        const PSx_mid_math = { x: (P_math.x + Sx_math.x) / 2, y: P_math.y / 2 };
        const PSx_label_offset_dir_math = { x: P_math.x, y: P_math.y };
        const normPSx = Math.sqrt(PSx_label_offset_dir_math.x ** 2 + PSx_label_offset_dir_math.y ** 2) || 1;
        const PSx_label_pos = toSvgCoords({
          x: PSx_mid_math.x + (PSx_label_offset_dir_math.x / normPSx) * TEXT_OFFSET * 0.3,
          y: PSx_mid_math.y + (PSx_label_offset_dir_math.y / normPSx) * TEXT_OFFSET * 0.3,
        });
        elements.push(Draw.renderText("tan \u03B8", PSx_label_pos, COLORS.tan, `${keyPfx}PSxLabel`, 0, 0, "center", "middle", labelFontSize, labelFontWeight));
      }
    }

    if (Sy_math) {
      const Sy_svg = toSvgCoords(Sy_math);
      elements.push(Draw.renderLine(O_svg, Sy_svg, COLORS.csc, `${keyPfx}OSyLine`, STROKE_WIDTH.bold));
      const OSy_label_pos = toSvgCoords({ x: SMALL_TEXT_OFFSET * Math.sign(Sy_math.y) * (P_math.x < 0 ? -1 : 1) * (isSinZero ? 0 : 1) * 0.7, y: Sy_math.y / 2 });
      elements.push(Draw.renderText("csc \u03B8", OSy_label_pos, COLORS.csc, `${keyPfx}OSyLabel`, 0, 0, P_math.x < 0 ? "right" : "left", "middle", labelFontSize, labelFontWeight));

      elements.push(Draw.renderLine(P_svg, Sy_svg, COLORS.cot, `${keyPfx}PSyLine`, STROKE_WIDTH.bold));
      const PSy_mid_math = { x: P_math.x / 2, y: (P_math.y + Sy_math.y) / 2 };
      const PSy_label_offset_dir_math = { x: P_math.x, y: P_math.y };
      const normPSy = Math.sqrt(PSy_label_offset_dir_math.x ** 2 + PSy_label_offset_dir_math.y ** 2) || 1;
      const PSy_label_pos = toSvgCoords({
        x: PSy_mid_math.x + (PSy_label_offset_dir_math.x / normPSy) * TEXT_OFFSET * 0.3,
        y: PSy_mid_math.y + (PSy_label_offset_dir_math.y / normPSy) * TEXT_OFFSET * 0.3,
      });
      elements.push(Draw.renderText("cot \u03B8", PSy_label_pos, COLORS.cot, `${keyPfx}PSyLabel`, 0, 0, "center", "middle", labelFontSize, labelFontWeight));
    }
  }

  return <>{elements}</>;
};