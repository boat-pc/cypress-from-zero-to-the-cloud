describe('Customer Service Center', () => {
  beforeEach(() => {
    cy.visit('./src/index.html')
  })
  // [1] - check the title
  it('1-checks the application title', () => {
    cy.title().should('contain','TAT Customer Service Center')
  })

  // [2] - fill in the form
  it('2.0-fills in the required fields and submits the form', () => {
    cy.get('#firstName').type('First')
    cy.get('#lastName').type('Last')
    cy.get('#email').type('email@test.com')
    cy.get('#open-text-area').type('Feedback')
    cy.get('button[type="submit"]').click()
    cy.get('.success').should('be.visible')
  })
  it('2.1-fills in with delay', () => {
    // delay=0 : no need to wait for the typing in running the test
    const longTxt = Cypress._.repeat('abcdefghijklmnopqrstuvwxyz', 20)
    cy.get('#open-text-area').type(longTxt, {delay: 0})
  })
  it('2.2-displays an error message when submitting the form with an email with invalid formatting', () => {
    cy.get('#firstName').type('First')
    cy.get('#lastName').type('Last')
    cy.get('button[type="submit"]').click()
    cy.get('.error').should('be.visible')
  })
  it('2.3-validate field accept only number', () => {
    cy.get('#phone')
      .type('abc')
      .should('have.value', '')
  })
  it('2.4-displays an error message when the phone becomes required but is not filled in before the form submission', () => {
    cy.get('#firstName').type('First')
    cy.get('#lastName').type('Last')
    cy.get('#email').type('email@test.com')
    cy.get('#open-text-area').type('Feedback')
    cy.get('#phone-checkbox').check()
    cy.get('button[type="submit"]').click()
    cy.get('.error').should('be.visible')
  })
  it('2.5-fills and clears fields', () => {
    cy.get('#firstName')
      .type('First').should('have.value', 'First')
      .clear().should('have.value', '')
    cy.get('#lastName')
      .type('Last').should('have.value', 'Last')
      .clear().should('have.value', '')
    cy.get('#email')
      .type('email@test.com').should('have.value','email@test.com')
      .clear().should('have.value', '')
  })
  it('2.6-displays an error message when submitting the form without filling the required fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('.error').should('be.visible')
  })
  it('2.7-using a custom command', () => {
    const data = {
      firstName: 'First',
      lastName: 'Last',
      email: 'email@test.com',
      feedback: 'Feedback'
    }
    // add command in cypress/support/commands.js -> call fuction
    cy.fillMandatoryFieldsAndSubmit(data)
    cy.get('.success').should('be.visible')
  })
  it('2.8-identify elements with cy.contain', () => {
    // e.g. <button type="submit" class="button">Send</button>
    // use in cy.contains('CSS selector', 'HTML tag')
    cy.contains('button', 'Send').click()
  })

  // [3] - select options (dropdown)
  it('3.0-selects a product by its content', () => {
    cy.get('#product').select('YouTube')
      .should('have.value', 'youtube')
  })
  it('3.1-selects a product by its value', () => {
    cy.get('#product').select('mentorship')
     .should('have.value', 'mentorship')
  })
  it('3.2-selects a product by its index', () => {
    cy.get('#product').select(1)
     .should('have.value', 'blog')
  })

  // [4] - radio buttons
  it('4.0-checks the type of service "Feedback"', () => {
    cy.get('input[type="radio"][value="feedback"]')
      .check()    // radio button -> check()
      .should('be.checked')
  })
  it('4.1-checks each type of service', () => {
    cy.get('#support-type')
      .find('input[type="radio"]')
      // .each() -> iterate over each element
      // .wrap() -> wrap the element in a jQuery object
      .each((typeOptions) => {
        cy.wrap(typeOptions).check().should('be.checked')
      })
  })

  // [5] - checkboxes
  it('5.0-checks both checkboxes, then unchecks the last one', () => {
    cy.get('input[type="checkbox"]')
      // checkbox -> check(), uncheck()
      .check().should('be.checked')
      .last().uncheck().should('not.be.checked')
  })
  it('5.1-displays an error message when the phone becomes required but is not filled in', () => {
    cy.fillMandatoryFieldsAndSubmit()
    cy.get('#phone-checkbox').check()
    cy.get('button[type="submit"]').click()
    cy.get('.error').should('be.visible')
  })

  // [6] - upload files
  it('6.0-selects a file from the fixtures folder', () => {
    cy.get('#file-upload').selectFile('cypress/fixtures/example.json')
    .should((input) => {
      // console.log(input)
      expect(input[0].files[0].name).to.equal('example.json')
    })
  })
  it('6.1-selects a file simulating a drag-and-drop', () => {
    cy.get('#file-upload').selectFile('cypress/fixtures/example.json', { action: 'drag-drop' })
      .should((input) => {
        expect(input[0].files[0].name).to.equal('example.json')
      })
  })
  it('6.2-selects a file using a fixture alias', () => {
    cy.fixture('example.json').as('sampleFile')   // fixture -> don't pass the path (get file from 'cypress/fixtures')
    cy.get('#file-upload').selectFile('@sampleFile')  // alias -> @name
      .should((input) => {
        expect(input[0].files[0].name).to.equal('example.json')
      })
  })

  // [7] - links
  it('7.0-verifies that the page opens in another tab without the need for a click', () => {
    // anchor tag -> target="_blank" -> opens in another tab
    cy.get('#privacy a')
      .should('have.attr', 'href', 'privacy.html')
      .and('have.attr', 'target', '_blank')
  })
  it('7.1-access the page by removing the target, then clicking on the link', () => {
    cy.contains('a', 'Privacy Policy')
     .invoke('removeAttr', 'target')  // remove attr -> open in the same tab
     .click()
    cy.contains('h1', 'TAT CSC - Privacy Policy').should('be.visible')
  })
  it('7.2-independently test the page', () => {
    cy.contains('a', 'Privacy Policy')
    .invoke('removeAttr', 'target')  // remove attr -> open in the same tab
    .click()
   cy.contains('h1', 'TAT CSC - Privacy Policy').should('be.visible')
   const text = 'We do not save data submitted in the TAT CSC application form.'
   cy.get('#white-background.privacy').should('contain',text)
   cy.contains('p', 'Talking About Testing').should('be.visible')
  })
})