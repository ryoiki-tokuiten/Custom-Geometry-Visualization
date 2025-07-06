import React from 'react';
import { Point, ViewBox, SceneLabelVisibility } from '../../types';
import { COLORS, EULER_SPIRAL_COLORS, STROKE_WIDTH, TEXT_OFFSET, SMALL_TEXT_OFFSET, RIGHT_ANGLE_MARKER_SIZE, ANGLE_MARKER_SIZE_SMALL, EULER_SPIRAL_TOTAL_ANGLE_RAD } from '../../constants';
import * as Draw from './DrawingUtils';

interface NaturalExponentialProofSceneProps {
  angleDegrees: number; // Represents n_steps
  R_euler_unit_vis: number;
  visibleLabels: SceneLabelVisibility['natural_exponential_proof'];
  viewBox: ViewBox;
  initialCenterX: number;
  initialCenterY: number;
}

export const NaturalExponentialProofScene: React.FC<NaturalExponentialProofSceneProps> = ({
  angleDegrees,
  R_euler_unit_vis,
  visibleLabels: vl,
  viewBox,
  initialCenterX,
  initialCenterY,
}) => {
  const toSvgCoords = React.useCallback((p: Point): Point => ({
    x: initialCenterX + p.x,
    y: initialCenterY - p.y,
  }), [initialCenterX, initialCenterY]);

  const n_steps = Math.max(1, Math.round(angleDegrees));
  const total_angle_Theta = EULER_SPIRAL_TOTAL_ANGLE_RAD;
  const d_theta_step = total_angle_Theta / n_steps;

  const O_math = { x: 0, y: 0 };
  const O_svg = toSvgCoords(O_math);
  const elements: JSX.Element[] = [];

  if (vl.grid_lines) {
    const gridSpacing = R_euler_unit_vis * 0.5;
    elements.push(...Draw.renderGrid(O_svg, gridSpacing, EULER_SPIRAL_COLORS.constructionLine + '33', STROKE_WIDTH.extraThin, viewBox, "nep_grid"));
  }

  if (vl.axesXYO) {
    elements.push(Draw.renderLine({ x: viewBox.x, y: O_svg.y }, { x: viewBox.x + viewBox.width, y: O_svg.y }, COLORS.axes, "nep_xaxis", STROKE_WIDTH.thin));
    elements.push(Draw.renderLine({ x: O_svg.x, y: viewBox.y }, { x: O_svg.x, y: viewBox.y + viewBox.height }, COLORS.axes, "nep_yaxis", STROKE_WIDTH.thin));
    elements.push(Draw.renderText("O", O_svg, EULER_SPIRAL_COLORS.labelText, "nep_Olabel", -SMALL_TEXT_OFFSET - 2, SMALL_TEXT_OFFSET, "end", "top", "12px", "bold"));
    elements.push(Draw.renderText("x", { x: viewBox.x + viewBox.width - 15, y: O_svg.y }, EULER_SPIRAL_COLORS.labelText, "nep_xlabel", 0, TEXT_OFFSET, "end", "middle", "12px"));
    elements.push(Draw.renderText("y", { x: O_svg.x, y: viewBox.y + 15 }, EULER_SPIRAL_COLORS.labelText, "nep_ylabel", -TEXT_OFFSET, 0, "end", "middle", "12px"));
  }

  if (vl.r0_circle) {
    elements.push(<circle cx={O_svg.x} cy={O_svg.y} r={R_euler_unit_vis} fill="none" stroke={EULER_SPIRAL_COLORS.unitCircle} strokeWidth={STROKE_WIDTH.default} key="nep_unit_circle_r0" />);
    elements.push(Draw.renderText("r\u2080=1", toSvgCoords({ x: R_euler_unit_vis * Math.cos(Math.PI / 6), y: R_euler_unit_vis * Math.sin(Math.PI / 6) + SMALL_TEXT_OFFSET }), EULER_SPIRAL_COLORS.unitCircle, "nep_ucLabel", 0, 0, "left", "top", "10px"));
  }

  let current_r_math_unit = 1.0;
  const pathPoints_svg: Point[] = [];
  pathPoints_svg.push(toSvgCoords({ x: current_r_math_unit * R_euler_unit_vis, y: 0 }));

  for (let k = 0; k < n_steps; k++) {
    const theta_k = k * d_theta_step;
    const theta_k_plus_1 = (k + 1) * d_theta_step;

    const P_k_math = {
      x: current_r_math_unit * Math.cos(theta_k),
      y: current_r_math_unit * Math.sin(theta_k)
    };
    const P_k_svg = toSvgCoords({ x: P_k_math.x * R_euler_unit_vis, y: P_k_math.y * R_euler_unit_vis });
    if (k > 0) pathPoints_svg.push(P_k_svg);

    const dist_OA_prime_math_unit = current_r_math_unit * Math.cos(d_theta_step);
    const A_prime_math = {
      x: dist_OA_prime_math_unit * Math.cos(theta_k_plus_1),
      y: dist_OA_prime_math_unit * Math.sin(theta_k_plus_1)
    };
    const A_prime_svg = toSvgCoords({ x: A_prime_math.x * R_euler_unit_vis, y: A_prime_math.y * R_euler_unit_vis });

    const len_Pk_Aprime_math_unit = current_r_math_unit * Math.sin(d_theta_step);
    const delta_r_k_math_unit = len_Pk_Aprime_math_unit;
    const next_r_math_unit = dist_OA_prime_math_unit + delta_r_k_math_unit;

    const P_k_plus_1_math = {
      x: next_r_math_unit * Math.cos(theta_k_plus_1),
      y: next_r_math_unit * Math.sin(theta_k_plus_1)
    };
    const P_k_plus_1_svg = toSvgCoords({ x: P_k_plus_1_math.x * R_euler_unit_vis, y: P_k_plus_1_math.y * R_euler_unit_vis });

    if (vl.construction_details) {
      const triangle_points_str = `${P_k_svg.x},${P_k_svg.y} ${A_prime_svg.x},${A_prime_svg.y} ${P_k_plus_1_svg.x},${P_k_plus_1_svg.y}`;
      elements.push(Draw.renderPolygon(triangle_points_str, EULER_SPIRAL_COLORS.constructionTriangleFill, EULER_SPIRAL_COLORS.constructionTriangleStroke, `constructTriangle${k}`, STROKE_WIDTH.thin));
    }

    const showDetailsBasedOnN = n_steps <= 20;
    if (vl.construction_details && showDetailsBasedOnN) {
        const raMarker = Draw.renderRightAngleMarker(A_prime_svg, P_k_svg, P_k_plus_1_svg, RIGHT_ANGLE_MARKER_SIZE * 0.7, EULER_SPIRAL_COLORS.rightAngleMarker, `nep_ra_Aprime${k}`);
        if(raMarker) elements.push(raMarker);
        elements.push(...Draw.renderFixedAngleMarker(P_k_svg, A_prime_svg, P_k_plus_1_svg, ANGLE_MARKER_SIZE_SMALL, EULER_SPIRAL_COLORS.angle45Marker, `nep_ang_Pk${k}`, "45°"));
        elements.push(...Draw.renderFixedAngleMarker(P_k_plus_1_svg, A_prime_svg, P_k_svg, ANGLE_MARKER_SIZE_SMALL, EULER_SPIRAL_COLORS.angle45Marker, `nep_ang_Pk+1${k}`, "45°"));

      const mid_Pk_Aprime_svg = { x: (P_k_svg.x + A_prime_svg.x) / 2, y: (P_k_svg.y + A_prime_svg.y) / 2 };
      const perp_Pk_Aprime_dx = (A_prime_svg.y - P_k_svg.y) * 0.1;
      const perp_Pk_Aprime_dy = -(A_prime_svg.x - P_k_svg.x) * 0.1;
      elements.push(Draw.renderText(`r${k}sin(d\u03B8)`, mid_Pk_Aprime_svg, EULER_SPIRAL_COLORS.formulaText, `nep_lblAAprime${k}`, perp_Pk_Aprime_dx, perp_Pk_Aprime_dy, "center", "middle", "7px"));

      const mid_Aprime_Pkplus1_svg = { x: (A_prime_svg.x + P_k_plus_1_svg.x) / 2, y: (A_prime_svg.y + P_k_plus_1_svg.y) / 2 };
      const entlang_Aprime_Pkplus1_dx = (P_k_plus_1_svg.x - A_prime_svg.x) * 0.1;
      const entlang_Aprime_Pkplus1_dy = (P_k_plus_1_svg.y - A_prime_svg.y) * 0.1;
      elements.push(Draw.renderText(`\u0394r${k}`, mid_Aprime_Pkplus1_svg, EULER_SPIRAL_COLORS.formulaText, `nep_lblAprimeB${k}`, -entlang_Aprime_Pkplus1_dy * 1.5, entlang_Aprime_Pkplus1_dx * 1.5, "center", "middle", "7px"));
    }

    current_r_math_unit = next_r_math_unit;
    if (k === n_steps - 1) {
      pathPoints_svg.push(P_k_plus_1_svg);
    }
  }

  if (pathPoints_svg.length > 1) {
    let spiralPathD = `M ${pathPoints_svg[0].x} ${pathPoints_svg[0].y}`;
    for (let i = 1; i < pathPoints_svg.length; i++) {
      spiralPathD += ` L ${pathPoints_svg[i].x} ${pathPoints_svg[i].y}`;
    }
    elements.push(<path d={spiralPathD} fill="none" stroke={EULER_SPIRAL_COLORS.spiralPath} strokeWidth={STROKE_WIDTH.bold} key="nep_spiral_path_main" />);
  }

  pathPoints_svg.forEach((p_svg, i) => {
    elements.push(Draw.renderLine(O_svg, p_svg, EULER_SPIRAL_COLORS.radialLine, `radialLine_P${i}`, STROKE_WIDTH.extraThin, true));
    if (vl.intermediate_Pk) {
      if (i === 0) {
        elements.push(Draw.renderText("P\u2080(A)", p_svg, EULER_SPIRAL_COLORS.labelText, "nep_P0Label", SMALL_TEXT_OFFSET, SMALL_TEXT_OFFSET * 1.5, "start", "top", "10px"));
      } else if (n_steps <= 10 && i < pathPoints_svg.length - 1) {
        const angle_for_label = i * d_theta_step;
        elements.push(Draw.renderText(`P${i}`, p_svg, EULER_SPIRAL_COLORS.labelText, `nep_Plbl${i}`,
          SMALL_TEXT_OFFSET * Math.cos(angle_for_label + Math.PI / 8),
          -SMALL_TEXT_OFFSET * Math.sin(angle_for_label + Math.PI / 8),
          "start", "middle", "9px")
        );
      }
    }
  });

  const P_final_svg = pathPoints_svg[pathPoints_svg.length - 1];
  const final_angle_rad = total_angle_Theta;
  elements.push(<circle cx={P_final_svg.x} cy={P_final_svg.y} r="4" fill={EULER_SPIRAL_COLORS.finalPoint} stroke="#ffffff" strokeWidth="1" key="nep_final_marker" />);
  if (vl.final_Pn) {
    elements.push(Draw.renderText(`P\u2099(Z)`, P_final_svg, EULER_SPIRAL_COLORS.finalPoint, "nep_Zlabel",
      SMALL_TEXT_OFFSET * Math.cos(final_angle_rad + Math.PI / 4),
      -SMALL_TEXT_OFFSET * Math.sin(final_angle_rad + Math.PI / 4),
      "start", "bottom", "11px", "bold")
    );
  }

  if (vl.final_Rn_e_theta) {
    const oz_label_pos_svg = {
      x: O_svg.x + (P_final_svg.x - O_svg.x) * 0.5,
      y: O_svg.y + (P_final_svg.y - O_svg.y) * 0.5,
    };
    const oz_label_offset_angle = final_angle_rad + Math.PI / 2;
    elements.push(Draw.renderText(`r\u2099 \u2248 e^\u0398`, oz_label_pos_svg, EULER_SPIRAL_COLORS.eValueText, "nep_OZeLabel",
      TEXT_OFFSET * 0.4 * Math.cos(oz_label_offset_angle),
      -TEXT_OFFSET * 0.4 * Math.sin(oz_label_offset_angle),
      "center", "middle", "11px", "bold")
    );
  }

  if (vl.total_angle_Theta) {
    const total_angle_arc_radius_svg = R_euler_unit_vis * 0.3;
    elements.push(...Draw.renderAngleArcMarker(O_svg, total_angle_arc_radius_svg, 0, total_angle_Theta, EULER_SPIRAL_COLORS.referenceArc, "nep_totalAngleArc", STROKE_WIDTH.thin, `\u0398=${total_angle_Theta.toFixed(0)}rad`, 1.3));
  }

  return <>{elements}</>;
};
