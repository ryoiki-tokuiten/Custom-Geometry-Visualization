
import React from 'react';
import { Point, ViewBox } from '../../types';
import { STROKE_WIDTH } from '../../constants';

export const renderLine = (
  p1: Point,
  p2: Point,
  color: string,
  keySuffix: string,
  strokeWidth: number = STROKE_WIDTH.default,
  dashed?: boolean,
  additionalProps?: React.SVGProps<SVGLineElement>
): JSX.Element => (
  <line
    x1={p1.x} y1={p1.y}
    x2={p2.x} y2={p2.y}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeDasharray={dashed ? "4 4" : "none"}
    key={`line-${keySuffix}`}
    {...additionalProps}
  />
);

export const renderPolygon = (
  points: string,
  fill: string,
  stroke: string,
  keySuffix: string,
  strokeWidth: number = STROKE_WIDTH.default,
  additionalProps?: React.SVGProps<SVGPolygonElement>
): JSX.Element => (
  <polygon
    points={points}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    key={`poly-${keySuffix}`}
    {...additionalProps}
  />
);

export const renderText = (
  text: string,
  p: Point,
  color: string,
  keySuffix: string,
  dx: number = 0,
  dy: number = 0,
  anchor: string = "middle",
  baseline: string = "middle",
  fontSize: string = "13px",
  fontWeight: string = "normal",
  additionalStyles: React.CSSProperties = {},
  additionalSVGAttributes?: React.SVGProps<SVGTextElement> // Added optional parameter
): JSX.Element => (
  <text
    x={p.x + dx}
    y={p.y + dy}
    fill={color}
    fontSize={fontSize}
    fontWeight={fontWeight}
    fontFamily="'SF Pro Rounded', SF Pro Display, Geneva, Verdana, sans-serif"
    textAnchor={anchor}
    dominantBaseline={baseline}
    key={`text-${keySuffix}`}
    style={additionalStyles}
    {...additionalSVGAttributes} // Spread additional SVG attributes
  >
    {text}
  </text>
);

export const renderTSpanText = (
  lines: { text: string, style?: React.CSSProperties & { fontSize?: string }, dy?: string }[],
  p: Point,
  defaultFillColor: string,
  keySuffix: string,
  dx: number = 0,
  dy: number = 0,
  anchor: string = "start",
  baseline: string = "hanging",
  baseFontSize: string = "10px", 
  fontWeight: string = "normal"
): JSX.Element => (
  <text
    x={p.x + dx}
    y={p.y + dy}
    fill={defaultFillColor}
    fontSize={baseFontSize} 
    fontWeight={fontWeight}
    fontFamily="'SF Pro Rounded', SF Pro Display, Cambria, 'Times New Roman', serif"
    textAnchor={anchor}
    dominantBaseline={baseline}
    key={`textgroup-${keySuffix}`}
  >
    {lines.map((line, index) => (
      <tspan
        key={`${keySuffix}-line-${index}`}
        x={p.x + dx}
        dy={line.dy !== undefined ? line.dy : (index === 0 ? "0" : "1.2em")} 
        style={{
          fill: line.style?.fill || defaultFillColor,
          fontStyle: line.style?.fontStyle,
          fontWeight: line.style?.fontWeight,
          ...(line.style?.fontSize && { fontSize: line.style.fontSize }), 
          ...line.style 
        }}
      >
        {line.text.replace(/ /g, '\u00A0')}
      </tspan>
    ))}
  </text>
);

export const renderRightAngleMarker = (
  vertex: Point,
  p1_arm: Point,
  p2_arm: Point,
  size: number,
  color: string,
  keyPrefix: string = "ra",
  strokeWidth: number = STROKE_WIDTH.thin
): JSX.Element | null => {
  const v1x = p1_arm.x - vertex.x;
  const v1y = p1_arm.y - vertex.y;
  const l1 = Math.sqrt(v1x * v1x + v1y * v1y);
  if (l1 === 0) return null;
  const u1x = v1x / l1;
  const u1y = v1y / l1;

  const v2x = p2_arm.x - vertex.x;
  const v2y = p2_arm.y - vertex.y;
  const l2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (l2 === 0) return null;
  const u2x = v2x / l2;
  const u2y = v2y / l2;

  const s1 = { x: vertex.x + size * u1x, y: vertex.y + size * u1y };
  const s2 = { x: vertex.x + size * u2x, y: vertex.y + size * u2y };
  const s3 = { x: s1.x + size * u2x, y: s1.y + size * u2y };

  return (
    <React.Fragment key={keyPrefix}>
      {renderLine(s1, s3, color, `${keyPrefix}-line1`, strokeWidth, false)}
      {renderLine(s2, s3, color, `${keyPrefix}-line2`, strokeWidth, false)}
    </React.Fragment>
  );
};

export const renderAngleArcMarker = (
  center: Point,
  radius: number,
  startAngleRadMath: number,
  endAngleRadMath: number,
  color: string,
  keySuffix: string,
  strokeWidth: number = STROKE_WIDTH.thin,
  label?: string,
  labelOffsetFactor: number = 1.2,
  labelColor?: string,
  labelFontSize: string = "10px"
): JSX.Element[] => {
  const startPt = {
    x: center.x + radius * Math.cos(startAngleRadMath),
    y: center.y - radius * Math.sin(startAngleRadMath) 
  };
  const endPt = {
    x: center.x + radius * Math.cos(endAngleRadMath),
    y: center.y - radius * Math.sin(endAngleRadMath) 
  };

  const largeArcFlag = Math.abs(endAngleRadMath - startAngleRadMath) % (2 * Math.PI) > Math.PI ? 1 : 0;
  const sweepFlag = endAngleRadMath > startAngleRadMath ? 0 : 1; 

  const d = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endPt.x} ${endPt.y}`;

  const elements = [<path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" key={`anglearc-${keySuffix}`} />];

  if (label) {
    const midAngleRadMath = (startAngleRadMath + endAngleRadMath) / 2;
    const labelRadius = radius * labelOffsetFactor;
    const labelPt = {
      x: center.x + labelRadius * Math.cos(midAngleRadMath),
      y: center.y - labelRadius * Math.sin(midAngleRadMath) 
    };
    elements.push(renderText(label, labelPt, labelColor || color, `anglelabel-${keySuffix}`, 0, 0, "center", "middle", labelFontSize));
  }
  return elements;
};


export const renderFixedAngleMarker = (
  vertex: Point,
  p_arm1: Point,
  p_arm2: Point,
  size: number,
  color: string,
  keySuffix: string,
  labelText: string = "45°",
  strokeWidthValue: number = STROKE_WIDTH.extraThin,
  labelFontSize: string = "8px" 
): (JSX.Element | null)[] => {
  const v_arm1 = { x: p_arm1.x - vertex.x, y: p_arm1.y - vertex.y };
  const v_arm2 = { x: p_arm2.x - vertex.x, y: p_arm2.y - vertex.y };

  const mag_v1 = Math.sqrt(v_arm1.x ** 2 + v_arm1.y ** 2);
  const mag_v2 = Math.sqrt(v_arm2.x ** 2 + v_arm2.y ** 2);
  if (mag_v1 === 0 || mag_v2 === 0) return [null];

  const u_arm1 = { x: v_arm1.x / mag_v1, y: v_arm1.y / mag_v1 };
  const u_arm2 = { x: v_arm2.x / mag_v2, y: v_arm2.y / mag_v2 };

  const arc_p1 = { x: vertex.x + u_arm1.x * size, y: vertex.y + u_arm1.y * size };
  const arc_p2 = { x: vertex.x + u_arm2.x * size, y: vertex.y + u_arm2.y * size };

  const cross_product_z = u_arm1.x * u_arm2.y - u_arm1.y * u_arm2.x;
  const largeArcFlag = 0; 
  const svgSweepFlag = cross_product_z > 0 ? 0 : 1; 

  const d = `M ${arc_p1.x} ${arc_p1.y} A ${size} ${size} 0 ${largeArcFlag} ${svgSweepFlag} ${arc_p2.x} ${arc_p2.y}`;

  const elements: (JSX.Element | null)[] = [
    <path d={d} stroke={color} strokeWidth={strokeWidthValue} fill="none" key={`fixedangle-arc-${keySuffix}`} />,
    renderLine(vertex, arc_p1, color, `fixedangle-line1-${keySuffix}`, strokeWidthValue, false),
    renderLine(vertex, arc_p2, color, `fixedangle-line2-${keySuffix}`, strokeWidthValue, false),
  ];

  const u_bisector = { x: u_arm1.x + u_arm2.x, y: u_arm1.y + u_arm2.y };
  const mag_bisector = Math.sqrt(u_bisector.x ** 2 + u_bisector.y ** 2);
  if (mag_bisector > 0) {
    const label_p = {
      x: vertex.x + (u_bisector.x / mag_bisector) * size * 1.5,
      y: vertex.y + (u_bisector.y / mag_bisector) * size * 1.5
    };
    elements.push(renderText(labelText, label_p, color, `fixedangle-label-${keySuffix}`, 0, 0, "center", "middle", labelFontSize)); 
  }
  return elements;
};

export const renderGrid = (
    o_svg: Point, 
    spacing: number,
    color: string,
    strokeWidthVal: number,
    viewBox: ViewBox, 
    keyPrefix: string
  ): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const { x: vbX, y: vbY, width: vbW, height: vbH } = viewBox;
  
    for (let x = o_svg.x; x <= vbX + vbW; x += spacing) {
      if (x >= vbX) elements.push(renderLine({ x, y: vbY }, { x, y: vbY + vbH }, color, `${keyPrefix}-vxpos-${x.toFixed(0)}`, strokeWidthVal));
    }
    for (let x = o_svg.x - spacing; x >= vbX; x -= spacing) {
      if (x <= vbX + vbW) elements.push(renderLine({ x, y: vbY }, { x, y: vbY + vbH }, color, `${keyPrefix}-vxneg-${x.toFixed(0)}`, strokeWidthVal));
    }
  
    for (let y = o_svg.y; y <= vbY + vbH; y += spacing) {
      if (y >= vbY) elements.push(renderLine({ x: vbX, y }, { x: vbX + vbW, y }, color, `${keyPrefix}-hypos-${y.toFixed(0)}`, strokeWidthVal));
    }
    for (let y = o_svg.y - spacing; y >= vbY; y -= spacing) {
      if (y <= vbY + vbH) elements.push(renderLine({ x: vbX, y }, { x: vbX + vbW, y }, color, `${keyPrefix}-hyneg-${y.toFixed(0)}`, strokeWidthVal));
    }
    return elements;
  };
