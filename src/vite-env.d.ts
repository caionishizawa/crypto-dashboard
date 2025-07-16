/// <reference types="vite/client" />

declare module '*.tsx' {
  import React from 'react';
  const component: React.FunctionComponent<any>;
  export default component;
} 