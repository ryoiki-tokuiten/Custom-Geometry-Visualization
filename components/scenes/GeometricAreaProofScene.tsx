
import React from 'react';
import { Point, ViewBox, SceneLabelVisibility } from '../../types';
import {
  COLORS, GEOMETRIC_AREA_PROOF_COLORS, STROKE_WIDTH, TEXT_OFFSET, SMALL_TEXT_OFFSET,
  RIGHT_ANGLE_MARKER_SIZE, D_THETA_VIZ_DEG
} from '../../constants';
import * as Draw from './DrawingUtils';

interface GeometricAreaProofSceneProps {
  angleDegrees: number;
  R_geom_proof_scaled_unit: number;
  visibleLabels: SceneLabelVisibility['geometric_area_proof'];
  viewBox: ViewBox;
  initialCenterX: number;
  initialCenterY: number;
}

export const GeometricAreaProofScene: React.FC<GeometricAreaProofSceneProps> = ({
  angleDegrees,
  R_geom_proof_scaled_unit,
  visibleLabels: vl,
  viewBox,
  initialCenterX,
  initialCenterY,
}) => {
  const toSvgCoords = React.useCallback((p: Point): Point => ({
    x: initialCenterX + p.x,
    y: initialCenterY - p.y,
  }), [initialCenterX, initialCenterY]);

  const R_unit = R_geom_proof_scaled_unit;
  const theta_rad = angleDegrees * (Math.PI / 180);
  const d_theta_viz_rad = D_THETA_VIZ_DEG * (Math.PI / 180);
  const perpendicularOffset = 6; // Math units for perpendicular offset of rotated labels

  const O_math = { x: 0, y: 0 };
  const A_math = { x: R_unit, y: 0 };
  const B_math = { x: R_unit, y: R_unit * Math.tan(theta_rad) };

  const O_svg = toSvgCoords(O_math);
  const A_svg = toSvgCoords(A_math);
  const B_svg = toSvgCoords(B_math);

  const elements: JSX.Element[] = [];

  if (vl.axesXYO) {
    elements.push(Draw.renderLine({ x: viewBox.x, y: O_svg.y }, { x: viewBox.x + viewBox.width, y: O_svg.y }, COLORS.axes, "gap_xaxis", STROKE_WIDTH.thin));
    elements.push(Draw.renderLine({ x: O_svg.x, y: viewBox.y }, { x: O_svg.x, y: viewBox.y + viewBox.height }, COLORS.axes, "gap_yaxis", STROKE_WIDTH.thin));
    if (vl.pointLabelsOAB) {
      elements.push(Draw.renderText("O", O_svg, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_Olabel", -SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET, "end", "top", "12px", "bold"));
    }
    elements.push(Draw.renderText("x", { x: viewBox.x + viewBox.width - 15, y: O_svg.y }, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_xlabel", 0, TEXT_OFFSET, "end", "middle", "12px"));
    elements.push(Draw.renderText("y", { x: O_svg.x, y: viewBox.y + 15 }, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_ylabel", -TEXT_OFFSET, 0, "end", "middle", "12px"));
  }

  if (vl.referenceUnitCircle) {
    elements.push(<circle cx={O_svg.x} cy={O_svg.y} r={R_unit} fill="none" stroke={GEOMETRIC_AREA_PROOF_COLORS.referenceCircle} strokeWidth={STROKE_WIDTH.default} strokeDasharray="3 3" key="gap_ref_circle" />);
  }

  const triangleOABPoints = `${O_svg.x},${O_svg.y} ${A_svg.x},${A_svg.y} ${B_svg.x},${B_svg.y}`;
  if (vl.triangleFill) {
    elements.push(Draw.renderPolygon(triangleOABPoints, GEOMETRIC_AREA_PROOF_COLORS.triangleFill, "none", "gap_triangle_fill", 0));
  }
  elements.push(Draw.renderLine(O_svg, A_svg, GEOMETRIC_AREA_PROOF_COLORS.sideOA, "gap_lineOA", STROKE_WIDTH.bold));
  elements.push(Draw.renderLine(A_svg, B_svg, GEOMETRIC_AREA_PROOF_COLORS.sideAB, "gap_lineAB", STROKE_WIDTH.bold));
  elements.push(Draw.renderLine(O_svg, B_svg, GEOMETRIC_AREA_PROOF_COLORS.sideOB, "gap_lineOB", STROKE_WIDTH.bold));

  if (vl.rightAngleMarkerA) {
    const raMarker = Draw.renderRightAngleMarker(A_svg, O_svg, B_svg, RIGHT_ANGLE_MARKER_SIZE, GEOMETRIC_AREA_PROOF_COLORS.rightAngleMarker, "gap_RA_A");
    if(raMarker) elements.push(raMarker);
  }

  if (vl.angleTheta) {
    const arcRadius = R_unit * 0.3;
    elements.push(...Draw.renderAngleArcMarker(O_svg, arcRadius, 0, theta_rad, GEOMETRIC_AREA_PROOF_COLORS.angleMarker, "gap_angle_theta", STROKE_WIDTH.thin, "\u03B8", 1.4, GEOMETRIC_AREA_PROOF_COLORS.labelText));
  }

  if (vl.pointLabelsOAB) {
    elements.push(Draw.renderText("A", A_svg, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_Alabel", SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET, "start", "top", "12px", "bold"));
    const B_label_dx = B_math.y >= 0 ? SMALL_TEXT_OFFSET : -SMALL_TEXT_OFFSET * 2;
    const B_label_dy = B_math.y >= 0 ? -SMALL_TEXT_OFFSET : SMALL_TEXT_OFFSET;
    elements.push(Draw.renderText("B", B_svg, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_Blabel", B_label_dx, B_label_dy, "start", "middle", "12px", "bold"));
  }

  if (vl.sideLabels) {
    elements.push(Draw.renderText("1", toSvgCoords({ x: R_unit / 2, y: -TEXT_OFFSET * 0.5 }), GEOMETRIC_AREA_PROOF_COLORS.sideOA, "gap_labelOA", 0, 0, "center", "top", "11px", "bold"));
    const labelAB_x_offset = TEXT_OFFSET * 0.7;
    elements.push(Draw.renderText(`tanθ = √F(x)`, toSvgCoords({ x: R_unit + labelAB_x_offset, y: B_math.y / 2 }), GEOMETRIC_AREA_PROOF_COLORS.sideAB, "gap_labelAB", 0, 0, "start", "middle", "11px", "bold", { fontStyle: "italic" }));
    
    // Label for secθ = √(1+F(x)) along OB
    const midOB_math = { x: B_math.x / 2, y: B_math.y / 2 };
    const OB_dir_math = { x: B_math.x, y: B_math.y }; // Vector from O to B
    const normOB = Math.sqrt(OB_dir_math.x ** 2 + OB_dir_math.y ** 2) || 1;
    // Perpendicular vector (points "above and left" of OB if OB is in Q1)
    const perpOB_unit_math = { x: -OB_dir_math.y / normOB, y: OB_dir_math.x / normOB };
    const labelOB_pos_math = {
      x: midOB_math.x + perpOB_unit_math.x * perpendicularOffset,
      y: midOB_math.y + perpOB_unit_math.y * perpendicularOffset
    };
    const labelOB_pos_svg = toSvgCoords(labelOB_pos_math);
    const rotationAngleOB_deg = -theta_rad * (180 / Math.PI);
    elements.push(Draw.renderText(
      `secθ = √(1+F(x))`, 
      labelOB_pos_svg, 
      GEOMETRIC_AREA_PROOF_COLORS.sideOB, 
      "gap_labelOB_rotated", 
      0, 0, "middle", "middle", "11px", "bold", 
      { fontStyle: "italic" },
      { transform: `rotate(${rotationAngleOB_deg} ${labelOB_pos_svg.x} ${labelOB_pos_svg.y})` }
    ));
  }

  const theta_plus_dtheta_rad = theta_rad + d_theta_viz_rad;
  const B_prime_math = { x: R_unit, y: R_unit * Math.tan(theta_plus_dtheta_rad) };
  const B_prime_svg = toSvgCoords(B_prime_math);
  const len_OH_math = R_unit / Math.cos(theta_plus_dtheta_rad); // Full length of sec(θ+dθ)
  const H_endpoint_math = { x: len_OH_math * Math.cos(theta_plus_dtheta_rad), y: len_OH_math * Math.sin(theta_plus_dtheta_rad) };
  const H_endpoint_svg = toSvgCoords(H_endpoint_math);
  const len_OB_math = R_unit / Math.cos(theta_rad);
  const C_math = { x: len_OB_math * Math.cos(theta_plus_dtheta_rad), y: len_OB_math * Math.sin(theta_plus_dtheta_rad) };
  const C_svg = toSvgCoords(C_math);

  if (vl.dthetaArcAtO) {
    const dThetaArcRadius = R_unit * 0.4;
    elements.push(...Draw.renderAngleArcMarker(O_svg, dThetaArcRadius, theta_rad, theta_plus_dtheta_rad, GEOMETRIC_AREA_PROOF_COLORS.dThetaMarker, "gap_dThetaArc", STROKE_WIDTH.thin, "dθ", 1.3));
  }

  if (vl.lineSecThetaPlusDtheta) {
    elements.push(Draw.renderLine(O_svg, H_endpoint_svg, GEOMETRIC_AREA_PROOF_COLORS.secThetaPlusDThetaLine, "gap_lineOH_sec_theta_plus_dtheta", STROKE_WIDTH.default));
    
    // Label for sec(θ+dθ) along OH
    const midOH_math = { x: H_endpoint_math.x / 2, y: H_endpoint_math.y / 2 };
    const OH_dir_math = H_endpoint_math; // Vector from O to H_endpoint
    const normOH = Math.sqrt(OH_dir_math.x ** 2 + OH_dir_math.y ** 2) || 1;
    const perpOH_unit_math = { x: -OH_dir_math.y / normOH, y: OH_dir_math.x / normOH };
    const labelOH_pos_math = {
      x: midOH_math.x + perpOH_unit_math.x * perpendicularOffset,
      y: midOH_math.y + perpOH_unit_math.y * perpendicularOffset
    };
    const labelOH_pos_svg = toSvgCoords(labelOH_pos_math);
    const rotationAngleOH_deg = -theta_plus_dtheta_rad * (180 / Math.PI);
    elements.push(Draw.renderText(
      "sec(θ+dθ)", 
      labelOH_pos_svg, 
      GEOMETRIC_AREA_PROOF_COLORS.secThetaPlusDThetaLine, 
      "gap_labelOH_rotated", 
      0, 0, "middle", "middle", "10px", "bold", 
      { fontStyle: "italic" },
      { transform: `rotate(${rotationAngleOH_deg} ${labelOH_pos_svg.x} ${labelOH_pos_svg.y})` }
    ));
  }

  if (vl.pointLabelsOAB) {
    elements.push(Draw.renderText("C", C_svg, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_Clabel", SMALL_TEXT_OFFSET * Math.cos(theta_plus_dtheta_rad - Math.PI / 4), -SMALL_TEXT_OFFSET * Math.sin(theta_plus_dtheta_rad - Math.PI / 4), "center", "middle", "10px", "bold"));
    elements.push(Draw.renderText("B'", B_prime_svg, GEOMETRIC_AREA_PROOF_COLORS.labelText, "gap_Bprimelabel", SMALL_TEXT_OFFSET, -SMALL_TEXT_OFFSET, "start", "bottom", "10px", "bold"));
  }

  if (vl.differentialTriangleBBprimeC) {
    const diffTrianglePoints = `${B_svg.x},${B_svg.y} ${B_prime_svg.x},${B_prime_svg.y} ${C_svg.x},${C_svg.y}`;
    elements.push(Draw.renderPolygon(diffTrianglePoints, GEOMETRIC_AREA_PROOF_COLORS.differentialTriangleFill, GEOMETRIC_AREA_PROOF_COLORS.differentialTriangleStroke, "gap_diff_triangle_BBprimeC", STROKE_WIDTH.thin));
    const raMarker = Draw.renderRightAngleMarker(C_svg, B_svg, B_prime_svg, RIGHT_ANGLE_MARKER_SIZE * 0.8, GEOMETRIC_AREA_PROOF_COLORS.rightAngleMarker, "gap_RA_C_BBprimeC");
    if(raMarker) elements.push(raMarker);
  }

  const labelFontSizeDiff = "9px"; 
  const labelColorDiff = GEOMETRIC_AREA_PROOF_COLORS.labelText;
  const diff_label_offset_val = 6; 

  if (vl.label_BBprime_dTanTheta) {
    const label_BBprime_pos_svg = { x: B_prime_svg.x + SMALL_TEXT_OFFSET * 1.5, y: (B_svg.y + B_prime_svg.y) / 2 };
    elements.push(Draw.renderText("d(tanθ) ≈ sec²θdθ", label_BBprime_pos_svg, labelColorDiff, "gap_label_BBprime_dTanTheta", 0, 0, "start", "middle", labelFontSizeDiff, "normal", { fontStyle: "italic" }));
  }

  if (vl.label_BC_arcSecDTheta) {
    const mid_BC_svg = { x: (B_svg.x + C_svg.x) / 2, y: (B_svg.y + C_svg.y) / 2 };
    const vec_BC_x_svg = C_svg.x - B_svg.x;
    const vec_BC_y_svg = C_svg.y - B_svg.y;
    const norm_BC = Math.sqrt(vec_BC_x_svg ** 2 + vec_BC_y_svg ** 2) || 1;
    
    const angle_BC_rad_svg = Math.atan2(vec_BC_y_svg, vec_BC_x_svg);
    const angle_BC_deg_svg = angle_BC_rad_svg * 180 / Math.PI;

    const perp_dx_bc = (vec_BC_y_svg / norm_BC) * diff_label_offset_val;
    const perp_dy_bc = (-vec_BC_x_svg / norm_BC) * diff_label_offset_val;
    const label_pos_bc_svg = { x: mid_BC_svg.x + perp_dx_bc, y: mid_BC_svg.y + perp_dy_bc };

    elements.push(Draw.renderText("BC ≈ secθdθ", label_pos_bc_svg, labelColorDiff, "gap_label_BC_arcSecDTheta", 0, 0, "middle", "middle", labelFontSizeDiff, "normal", 
        { fontStyle: "italic" }, 
        { transform: `rotate(${angle_BC_deg_svg} ${label_pos_bc_svg.x} ${label_pos_bc_svg.y})` }
    ));
  }

  if (vl.label_BprimeC_dSecTheta) {
    const mid_BprimeC_svg = { x: (C_svg.x + B_prime_svg.x) / 2, y: (C_svg.y + B_prime_svg.y) / 2 };
    const vec_BprimeC_x_svg = C_svg.x - B_prime_svg.x; 
    const vec_BprimeC_y_svg = C_svg.y - B_prime_svg.y; 
    const norm_BprimeC = Math.sqrt(vec_BprimeC_x_svg ** 2 + vec_BprimeC_y_svg ** 2) || 1;

    const angle_BprimeC_rad_svg = Math.atan2(vec_BprimeC_y_svg, vec_BprimeC_x_svg);
    const angle_BprimeC_deg_svg = angle_BprimeC_rad_svg * 180 / Math.PI;
    
    const perp_dx_bpc = (-vec_BprimeC_y_svg / norm_BprimeC) * diff_label_offset_val; 
    const perp_dy_bpc = (vec_BprimeC_x_svg / norm_BprimeC) * diff_label_offset_val;
    const label_pos_bpc_svg = { x: mid_BprimeC_svg.x + perp_dx_bpc, y: mid_BprimeC_svg.y + perp_dy_bpc };
    
    elements.push(Draw.renderText("B'C ≈ secθtanθdθ", label_pos_bpc_svg, labelColorDiff, "gap_label_BprimeC_dSecTheta", 0, 0, "middle", "middle", labelFontSizeDiff, "normal", 
        { fontStyle: "italic" },
        { transform: `rotate(${angle_BprimeC_deg_svg} ${label_pos_bpc_svg.x} ${label_pos_bpc_svg.y})` }
    ));
  }

  return <>{elements}</>;
};
