import { defineConfig } from 'cypress'

export default defineConfig({
  eyesIsDisabled: false,
  eyesFailCypressOnDiff: true,
  eyesDisableBrowserFetching: false,
  eyesTestConcurrency: 5,
  eyesRemoveDuplicateTests: false,
  universalDebug: false,
  appliConfFile: {
    batch: {
      id: '3daca773-6ae6-4baa-bf74-9f7080601cc4',
    },
  },
  eyesIsGlobalHooksSupported: false,
  eyesPort: 52735,
  isComponent: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4200',
  },
})