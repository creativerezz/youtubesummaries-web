describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    cy.get('h1').should('be.visible')
    cy.title().should('contain', 'YouTube')
  })

  it('should display the main navigation', () => {
    cy.get('nav').should('be.visible')
  })

  it('should have working links', () => {
    // Check that key links exist
    cy.get('a').should('have.length.greaterThan', 0)
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('body').should('be.visible')

    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.get('body').should('be.visible')

    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })
})
