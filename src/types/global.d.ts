// Asegurar que TypeScript reconozca los archivos de módulo
declare module '*.tsx';
declare module '*.ts';
declare module '*.jsx';
declare module '*.js';
// Asegurar que los módulos de componentes se resuelvan correct
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Asegurar que las imágenes se importen correctamente
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Asegurar que los archivos de fuentes se importen correctamente
declare module '*.woff';
declare module '*.woff2';
declare module '*.ttf';
declare module '*.eot';
