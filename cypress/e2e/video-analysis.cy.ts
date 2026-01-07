describe('Video Analysis Flow', () => {
  const testVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const testVideoId = 'dQw4w9WgXcQ'

  beforeEach(() => {
    cy.visit('/')

    // Mock external APIs to avoid rate limiting
    cy.intercept('GET', '**/youtube/metadata*', {
      statusCode: 200,
      body: {
        title: 'Test Video Title',
        author_name: 'Test Channel',
        thumbnail_url: `https://img.youtube.com/vi/${testVideoId}/maxresdefault.jpg`,
      },
    }).as('getMetadata')

    cy.intercept('GET', '**/youtube/timestamps*', {
      statusCode: 200,
      body: {
        video_id: testVideoId,
        timestamps: [
          { time: 0, text: 'Hello everyone...' },
          { time: 5, text: 'Welcome to this video...' },
          { time: 12, text: 'Today we will discuss...' },
        ],
      },
    }).as('getTranscript')
  })

  it('should display input field for video URL', () => {
    cy.get('input[type="text"], input[type="url"], input[placeholder*="youtube" i], input[placeholder*="video" i], input[placeholder*="url" i]')
      .should('exist')
  })

  it('should handle search functionality', () => {
    // Test that search page loads
    cy.visit('/search')
    cy.get('body').should('be.visible')
  })
})
