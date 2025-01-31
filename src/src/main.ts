import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

// Default configuration
const defaultConfig = {
  source: '/questions.xml',
  debug: false,
  expiry_in_days: 90,
  state: {}
};

// Initialize quiz with configuration
function init(elementId: string, config = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const target = document.getElementById(elementId);
  
  if (!target) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  return mount(App, {
    target,
    props: {
      config: mergedConfig
    }
  });
}

// Export for global usage
window.Quiz = { init };

export default { init };