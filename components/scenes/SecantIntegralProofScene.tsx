// src/components/scenes/SecantIntegralProofScene.tsx

import React from 'react';
import { Point, ViewBox, SceneLabelVisibility } from '../../types';
import {
  COLORS, STROKE_WIDTH, TEXT_OFFSET, SMALL_TEXT_OFFSET, HYPERBOLA_POINTS
} from '../../constants';
import * as Draw from './DrawingUtils';

// Define specific colors for this new scene
export const SECANT_PROOF_COLORS = {
  hyperbola: '#f0abfc',
  unitCircle: '#86efac', // Color for the new reference circle
  asymptotes: '#6ee7b7',
  pointOnHyperbola: '#fda4af',
  constructionLine: '#5A6478',
  angleAlpha: '#fde047',
  areaP: 'rgba(253, 164, 175, 0.2)',
  areaPStroke: 'rgba(253, 164, 175, 0.8)',
  differentialArea: 'rgba(249, 115, 22, 0.5)',
  differentialAreaStroke: '#f97316',
  secantLine: '#3b82f6',
  tangentLine: '#22c55e',
  labelText: '#E8EEFF',
  formulaText: '#A971FF',
  proofBoxBg: 'rgba(16, 19, 28, 0.7)',
  proofBoxStroke: '#5A6478'
};

const DottedFillPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
    <circle cx="2" cy="2" r="0.7" fill={SECANT_PROOF_COLORS.areaPStroke} fillOpacity="0.7" />
  </pattern>
);

interface SecantIntegralProofSceneProps {
  angleDegrees: number;
  R_hp: number;
  visibleLabels: SceneLabelVisibility['secant_integral_proof'];
  viewBox: ViewBox;
  initialCenterX: number;
  initialCenterY: number;
}

export const SecantIntegralProofScene: React.FC<SecantIntegralProofSceneProps> = ({
  angleDegrees,
  R_hp,
  visibleLabels: vl,
  viewBox,
  initialCenterX,
  initialCenterY,
}) => {
  const toSvgCoords = React.useCallback((p: Point): Point => ({
    x: initialCenterX + p.x,
    y: initialCenterY - p.y,
  }), [initialCenterX, initialCenterY]);

  const R = R_hp;
  const O_svg = toSvgCoords({ x: 0, y: 0 });
  const elements: JSX.Element[] = [];

  const safe_alpha_rad = Math.max(0.001, Math.min(angleDegrees * (Math.PI / 180), Math.PI / 2 - 0.01));
  const sec_a = 1 / Math.cos(safe_alpha_rad);
  const tan_a = Math.tan(safe_alpha_rad);
  const P_math = { x: R * sec_a, y: R * tan_a };
  const P_svg = toSvgCoords(P_math);
  const P_param = Math.log(sec_a + tan_a);

  elements.push(<defs key="defs"><DottedFillPattern id="dottedFill" /></defs>);

  if (vl.axesXYO) {
    elements.push(Draw.renderLine({ x: viewBox.x, y: O_svg.y }, { x: viewBox.x + viewBox.width, y: O_svg.y }, COLORS.axes, "sip_xaxis", STROKE_WIDTH.extraThin));
    elements.push(Draw.renderLine({ x: O_svg.x, y: viewBox.y }, { x: O_svg.x, y: viewBox.y + viewBox.height }, COLORS.axes, "sip_yaxis", STROKE_WIDTH.extraThin));
    elements.push(Draw.renderText("O", O_svg, SECANT_PROOF_COLORS.labelText, "sip_Olabel", -SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET, "end", "top", "12px"));
  }

  if (vl.referenceUnitCircle) {
      elements.push(<circle cx={O_svg.x} cy={O_svg.y} r={R} fill="none" stroke={SECANT_PROOF_COLORS.unitCircle} strokeWidth={STROKE_WIDTH.thin} strokeDasharray="4 4" key="sip_ref_circle" />);
  }

  if (vl.unitHyperbola) {
    let hyperbolaPathPoints = "";
    const max_rho_draw = 3.5;
    for (let i = 0; i <= HYPERBOLA_POINTS; i++) {
        const rho = (i / HYPERBOLA_POINTS) * max_rho_draw;
        const p_upper = toSvgCoords({ x: R * Math.cosh(rho), y: R * Math.sinh(rho) });
        if (i === 0) hyperbolaPathPoints += `M ${p_upper.x} ${p_upper.y} `;
        else hyperbolaPathPoints += `L ${p_upper.x} ${p_upper.y} `;
    }
    elements.push(<path d={hyperbolaPathPoints} stroke={SECANT_PROOF_COLORS.hyperbola} strokeWidth={STROKE_WIDTH.default} fill="none" key="sip_hyperbola" />);
  }
  
  if (vl.constructionLines) {
    elements.push(Draw.renderLine(O_svg, P_svg, SECANT_PROOF_COLORS.constructionLine, "sip_OP_ray", STROKE_WIDTH.thin, true));
    const Px_proj_svg = toSvgCoords({x: P_math.x, y: 0});
    elements.push(Draw.renderLine(P_svg, Px_proj_svg, SECANT_PROOF_COLORS.constructionLine, "sip_P_proj_x", STROKE_WIDTH.extraThin, true));
  }

  if (vl.labels) {
    elements.push(Draw.renderLine(O_svg, toSvgCoords({x:P_math.x, y:0}), SECANT_PROOF_COLORS.secantLine, "sip_sec_line", STROKE_WIDTH.bold));
    elements.push(Draw.renderText("sec α", toSvgCoords({ x: P_math.x / 2, y: -TEXT_OFFSET * 0.7 }), SECANT_PROOF_COLORS.secantLine, "sip_sec_label", 0,0, "center", "top", "14px", "bold"));
    
    elements.push(Draw.renderLine(toSvgCoords({x:P_math.x, y:0}), P_svg, SECANT_PROOF_COLORS.tangentLine, "sip_tan_line", STROKE_WIDTH.bold));
    elements.push(Draw.renderText("tan α", toSvgCoords({ x: P_math.x + TEXT_OFFSET * 0.7, y: P_math.y / 2 }), SECANT_PROOF_COLORS.tangentLine, "sip_tan_label", 0,0, "start", "center", "14px", "bold"));
    
    elements.push(Draw.renderText("P(sec α, tan α)", P_svg, SECANT_PROOF_COLORS.pointOnHyperbola, "sip_P_label", SMALL_TEXT_OFFSET, -SMALL_TEXT_OFFSET, "start", "bottom", "12px", "bold"));
    elements.push(...Draw.renderAngleArcMarker(O_svg, R * 0.4, 0, safe_alpha_rad, SECANT_PROOF_COLORS.angleAlpha, "sip_alpha_arc", STROKE_WIDTH.thin, "α", 1.3));
  }
  
  if (vl.hyperbolicArea) {
    let areaPathD = `M ${toSvgCoords({x: R, y: 0}).x} ${toSvgCoords({x: R, y: 0}).y} `;
    const areaPoints = 50;
    for (let i = 0; i <= areaPoints; i++) {
        const rho = (i / areaPoints) * P_param;
        const p_area = toSvgCoords({ x: R * Math.cosh(rho), y: R * Math.sinh(rho) });
        areaPathD += `L ${p_area.x} ${p_area.y} `;
    }
    areaPathD += `L ${O_svg.x} ${O_svg.y} Z`;
    elements.push(<path d={areaPathD} fill="url(#dottedFill)" stroke={SECANT_PROOF_COLORS.areaPStroke} strokeWidth={STROKE_WIDTH.extraThin} key="sip_area_path" />);
    const area_label_angle = P_param / 2;
    const area_label_pos_math = { x: R * 0.7 * Math.cosh(area_label_angle), y: R * 0.7 * Math.sinh(area_label_angle) };
    elements.push(Draw.renderText("Area = P/2", toSvgCoords(area_label_pos_math), SECANT_PROOF_COLORS.labelText, "sip_area_label", 0,0, "center", "middle", "12px"));
  }

  if (vl.differentialTriangle) {
    const d_alpha = 0.05;
    const sec_a_prime = sec_a + sec_a * tan_a * d_alpha;
    const tan_a_prime = tan_a + sec_a * sec_a * d_alpha;
    const P_prime_math = { x: R * sec_a_prime, y: R * tan_a_prime };
    const P_prime_svg = toSvgCoords(P_prime_math);

    const diff_triangle_points = `${O_svg.x},${O_svg.y} ${P_svg.x},${P_svg.y} ${P_prime_svg.x},${P_prime_svg.y}`;
    elements.push(Draw.renderPolygon(diff_triangle_points, SECANT_PROOF_COLORS.differentialArea, SECANT_PROOF_COLORS.differentialAreaStroke, "sip_diff_triangle", STROKE_WIDTH.thin));
    
    if (vl.areaCalculationDetails) {
        const textLines = [
            { text: "Area of sliver, d(Area) = dP/2", style: { fill: SECANT_PROOF_COLORS.labelText, fontStyle: 'italic', fontSize: '11px'} },
            { text: "Area is also Area(ΔOPP')", dy: "1.4em", style: { fill: SECANT_PROOF_COLORS.labelText, fontStyle: 'italic', fontSize: '11px'} },
            { text: " = ½ | x_p y_p' - y_p x_p' |", dy: "1.4em", style: { fill: SECANT_PROOF_COLORS.labelText, fontStyle: 'italic', fontSize: '11px'} },
            { text: " = ½ sec(α) dα", dy: "1.4em", style: { fill: SECANT_PROOF_COLORS.labelText, fontStyle: 'italic', fontSize: '11px'} },
            { text: "∴ dP = sec(α) dα", dy: "1.6em", style: { fill: SECANT_PROOF_COLORS.formulaText, fontWeight: 'bold', fontSize: '12px' } },
        ];
        const rect_pos_math = { x: P_math.x * 1.05, y: P_math.y * 0.8 };
        const rect_pos_svg = toSvgCoords(rect_pos_math);
        const rectWidth = 180;
        const rectHeight = 95;
        
        elements.push(<rect 
            x={rect_pos_svg.x} y={rect_pos_svg.y - rectHeight + 10} 
            width={rectWidth} height={rectHeight} 
            fill={SECANT_PROOF_COLORS.proofBoxBg} 
            stroke={SECANT_PROOF_COLORS.proofBoxStroke} 
            rx="5" key="sip_proof_box"
        />);
        elements.push(Draw.renderTSpanText(textLines, {x: rect_pos_svg.x + 10, y: rect_pos_svg.y - rectHeight + 20}, SECANT_PROOF_COLORS.labelText, "sip_proof_text"));
    } else {
        const mid_PPprime_math = { x: (P_math.x + P_prime_math.x) / 2, y: (P_math.y + P_prime_math.y) / 2 };
        const label_pos_svg = toSvgCoords({x: mid_PPprime_math.x * 0.8, y: mid_PPprime_math.y * 0.8});
        elements.push(Draw.renderText("dP/2 = ½ sec(α)dα", label_pos_svg, SECANT_PROOF_COLORS.differentialAreaStroke, "sip_diff_area_label", 0,0, "center", "middle", "12px", "bold"));
    }
  }

  if (vl.finalFormula) {
      const formula_pos = { x: initialCenterX, y: initialCenterY + R * 1.5 };
      elements.push(Draw.renderText("∫ sec(α) dα = P = ln(sec α + tan α)", formula_pos, SECANT_PROOF_COLORS.formulaText, "sip_final_formula", 0, 0, "center", "middle", "18px", "bold", {fontStyle: 'italic'}));
  }

  elements.push(<circle cx={P_svg.x} cy={P_svg.y} r="4" fill={SECANT_PROOF_COLORS.pointOnHyperbola} stroke="#ffffff" strokeWidth="1" key="sip_Pmarker" />);

  return <>{elements}</>;
};