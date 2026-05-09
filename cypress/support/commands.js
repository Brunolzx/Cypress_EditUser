
Cypress.Commands.add('login', () => {
    // Limpa todos os cookies antes de iniciar para garantir que o formulário
    // de login aparece sempre — sem isto, se já existir sessão ativa o OrangeHRM
    // redireciona para o dashboard e o cy.get('input[name="username"]') falha
    cy.clearAllCookies()
    cy.visit('/web/index.php/auth/login')

    // .should('not.be.disabled') aguarda que o campo esteja habilitado antes de escrever.
    cy.get('input[name="username"]').should('not.be.disabled').type('Admin')
    cy.get('input[name="password"]').should('not.be.disabled').type('admin123')

    cy.get('button[type="submit"]').click()

    // Aguarda a redirecção para confirmar que o login foi bem-sucedido antes
    // de qualquer comando seguinte (ex: navigateToUsers no beforeEach)
    cy.url().should('include', '/dashboard')
});
