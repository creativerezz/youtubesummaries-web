// Custom Cypress commands

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Submit a YouTube video URL for analysis
       */
      submitVideoUrl(url: string): Chainable<void>

      /**
       * Wait for video analysis to complete
       */
      waitForAnalysis(): Chainable<void>

      /**
       * Mock the transcript API response
       */
      mockTranscriptApi(videoId: string, transcript: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('submitVideoUrl', (url: string) => {
  cy.get('[data-testid="video-url-input"]').clear().type(url)
  cy.get('[data-testid="analyze-button"]').click()
})

Cypress.Commands.add('waitForAnalysis', () => {
  cy.get('[data-testid="loading-indicator"]', { timeout: 30000 }).should('not.exist')
  cy.get('[data-testid="video-metadata"]', { timeout: 30000 }).should('be.visible')
})

Cypress.Commands.add('mockTranscriptApi', (videoId: string, transcript: string) => {
  cy.intercept('GET', `**/transcripts/${videoId}`, {
    statusCode: 200,
    body: {
      success: true,
      result: {
        video_id: videoId,
        captions: transcript,
        title: 'Test Video',
        author: 'Test Author',
      },
    },
  }).as('getTranscript')
})

export {}
