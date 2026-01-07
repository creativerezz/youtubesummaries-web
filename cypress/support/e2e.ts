// Cypress E2E support file
import './commands'

// Global before each hook
beforeEach(() => {
  // Clear local storage between tests
  cy.clearLocalStorage()
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on Next.js hydration errors
  if (err.message.includes('Hydration failed')) {
    return false
  }
  // Prevent failing on ResizeObserver errors (common in modern apps)
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  return true
})
