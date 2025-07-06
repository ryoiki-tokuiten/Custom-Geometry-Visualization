
import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CircleIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
  </svg>
);

export const HyperbolaIcon: React.FC<IconProps> = ({ className, style }) => (
 <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M4 4 C8 10 8 14 4 20 L6 20 C10 14 10 10 6 4 Z"/>
    <path d="M20 4 C16 10 16 14 20 20 L18 20 C14 14 14 10 18 4 Z"/>
  </svg>
);

export const LineIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M21.707 2.293a1 1 0 0 0-1.414 0l-18 18a1 1 0 0 0 0 1.414 1 1 0 0 0 .707.293.997.997 0 0 0 .707-.293l18-18a1 1 0 0 0 0-1.414z"/>
  </svg>
);

export const VectorIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
    <path d="M12 11h6.414l-2.707-2.707a1 1 0 1 1 1.414-1.414l4.5 4.5a.997.997 0 0 1 .234.309.997.997 0 0 1 0 .782.997.997 0 0 1-.234.309l-4.5 4.5a1 1 0 0 1-1.414-1.414L18.414 13H12a1 1 0 0 1 0-2z"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z"/>
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 6.5c2.76 0 5 2.24 5 5 0 .5-.1 1-.27 1.46l2.66 2.66C21.13 14.2 22.61 12.13 23 12c-1.73-4.39-6-7.5-11-7.5-1.46 0-2.85.32-4.12.89l2.27 2.27C11 6.6 11.5 6.5 12 6.5zm-9.43 1.93L4.27 10.1C4.1 10.73 4 11.35 4 12c0 2.76 2.24 5 5 5 .65 0 1.27-.1 1.86-.27l1.69 1.69C11.73 18.79 10.41 19 9 19c-5 0-9.27-3.11-11-7.5.91-2.27 2.69-4.14 4.57-5.57zM1 3.43l2.28 2.28.74.74C2.29 7.58 1.17 9.61 1 12c1.73 4.39 6 7.5 11 7.5 2.39 0 4.58-.88 6.25-2.31l2.33 2.33 1.41-1.41L2.41 2 1 3.43z"/>
  </svg>
);

export const PolarGridIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" opacity="0.3"/>
    <path d="M12 2c-1.392 0-2.734.289-3.98.832L12 12V2zM8.02.832A9.953 9.953 0 0 0 4.832 3.98L12 12H2c0-1.392.289-2.734.832-3.98L12 12V2zM3.98 4.832A9.953 9.953 0 0 0 .832 8.02L12 12V2c1.392 0 2.734-.289 3.98-.832L12 12H2z" transform="rotate(45 12 12)"/>
    <path d="M12 2v10H2c.053-.328.12-.652.196-.97l9.43-5.444A9.933 9.933 0 0 0 12 2zm10 10h-10V2c.328.053.652.12.97.196l5.444 9.43A9.933 9.933 0 0 0 22 12zm-10 10v-10h10c-.053.328-.12.652-.196.97l-9.43 5.444A9.933 9.933 0 0 0 12 22zm-10-10h10v10c-.328-.053-.652-.12-.97-.196L2.374 12.374A9.933 9.933 0 0 0 2 12z"/>
  </svg>
);

export const CartesianGridIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM3 3v18h2V3H3zm4 0v18h2V3H7zm4 0v18h2V3h-2zm4 0v18h2V3h-2zm4 0v18h2V3h-2z" opacity="0.6"/>
    <rect x="2" y="2" width="20" height="20" rx="1" ry="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);


export const UndoIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12.5 8C9.81 8 7.45 8.99 5.6 10.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C20.38 10.33 16.79 8 12.5 8z"/>
  </svg>
);

export const RedoIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18.4 10.6C16.55 8.99 14.19 8 11.5 8c-4.29 0-7.88 2.33-9.37 5.5L0 12.72C1.45 7.31 6.04 4 11.5 4c2.62 0 5.04.88 7.01 2.62L22 3v9h-9l3.4-3.4z"/>
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M8 5v14l11-7L8 5z"/>
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
