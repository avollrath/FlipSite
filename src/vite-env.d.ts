/// <reference types="vite/client" />

declare module '*.svg?react' {
  const component: import('react').FC<import('react').SVGProps<SVGSVGElement>>
  export default component
}
