/// <reference types="vite/client" />

interface Window {
  Quiz: {
    init: (elementId: string, config?: any) => any;
  };
}