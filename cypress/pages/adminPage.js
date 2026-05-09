class AdminPage {

    // SELECTORS — Página de listagem de utilizadores (Admin > Users)

    // Primeiro input de texto no formulário de pesquisa (campo Username)
    get usernameSearchInput() {
        return cy.get('form .oxd-input').first()
    }

    // Botão "Search" do formulário de pesquisa
    get searchButton() {
        return cy.contains('button', 'Search')
    }

    // SELECTORS — Página de edição de utilizador (Edit User)

    // Dropdown "User Role" — seleciona pelo label para ser resiliente a mudanças de index
    get userRoleDropdown() {
        return cy.contains('.oxd-label', 'User Role')
            .parents('.oxd-input-group')
            .find('.oxd-select-text')
    }

    // Valor atualmente selecionado no dropdown "User Role" (leitura — usado no TC02)
    get userRoleValue() {
        return cy.contains('.oxd-label', 'User Role')
            .parents('.oxd-input-group')
            .find('.oxd-select-text-input')
    }

    // Dropdown "Status"
    get statusDropdown() {
        return cy.contains('.oxd-label', 'Status')
            .parents('.oxd-input-group')
            .find('.oxd-select-text')
    }

    // Valor atualmente selecionado no dropdown "Status" (leitura — usado no TC02)
    get statusValue() {
        return cy.contains('.oxd-label', 'Status')
            .parents('.oxd-input-group')
            .find('.oxd-select-text-input')
    }

    // Input de autocomplete do campo "Employee Name"
    get employeeNameInput() {
        return cy.get('.oxd-autocomplete-text-input input')
    }

    // Input de texto do campo "Username" — usa label para evitar seleção por index
    get usernameInput() {
        return cy.contains('.oxd-label', 'Username')
            .parents('.oxd-input-group')
            .find('input.oxd-input')
    }

    // Toggle "Change Password" (ativa os campos de password)
    get changePasswordToggle() {
        return cy.get('input[type="checkbox"]')
    }

    // Campo de nova password (só visível após ativar o toggle)
    get passwordInput() {
        return cy.get('input[type="password"]').eq(0)
    }

    // Campo de confirmação de password
    get confirmPasswordInput() {
        return cy.get('input[type="password"]').eq(1)
    }

    // Botão "Save" do formulário.
    // O Cancel usa .oxd-button--ghost; .last() resolve o caso em que a página tem dois
    // botões --secondary (ex: no header e no footer do form) — o Save é sempre o último.
    get saveButton() {
        return cy.get('.oxd-button--secondary').last()
    }

    // Toast de sucesso exibido após guardar com sucesso
    get successToast() {
        return cy.get('.oxd-toast--success')
    }

    // Mensagens de erro de validação nos campos do formulário
    get errorMessages() {
        return cy.get('.oxd-input-field-error-message')
    }

    // METHODS
   
    // Navega diretamente para a listagem de utilizadores do Admin
    navigateToUsers() {
        cy.visit('/web/index.php/admin/viewSystemUsers')
    }

    // Pesquisa um utilizador pelo username no formulário de pesquisa
    searchUser(username) {
        this.usernameSearchInput.clear().type(username)
        this.searchButton.click()
    }

    // Clica no botão de edição (o lápis) do primeiro resultado da tabela.
    // Usa o ícone bi-pencil-fill em vez de index (.eq(0)/.eq(1)) porque os
    // botões de Eliminar e Editar partilham o mesmo container e a ordem pode
    // variar — ao selecionar por índice corria o risco de clicar em Eliminar e abrir o
    // diálogo de confirmação em vez de navegar para a edição.
    clickEditOnFirstResult() {
        cy.get('.oxd-table-body .oxd-table-row')
            .first()
            .find('button.oxd-icon-button:has(i.bi-pencil-fill)')
            .click()
    }

    // Pesquisa pelo utilizador e abre a sua página de edição
    searchAndEditUser(username) {
        this.searchUser(username)
        this.clickEditOnFirstResult()
    }

    // Seleciona um valor no dropdown "User Role" (ex: 'Admin', 'ESS').
    // Usa .oxd-select-option (classe de cada opção individual) em vez de
    // .oxd-select-dropdown (container) para evitar apanhar outros dropdowns
    // globais da página que partilham a mesma classe de container.
    selectUserRole(role) {
        this.userRoleDropdown.click()
        cy.get('.oxd-select-option').contains(role).click()
        this.userRoleValue.should('contain.text', role)
    }

    // Seleciona um valor no dropdown "Status" (ex: 'Enabled', 'Disabled').
    selectStatus(status) {
        this.statusDropdown.click()
        cy.get('.oxd-select-option').contains(status).click()
        this.statusValue.should('contain.text', status)
    }

    // Preenche o campo "Employee Name" com estabilização via cy.intercept.
    // O autocomplete do OrangeHRM é instável: sem aguardar a resposta da API
    // antes de clicar na sugestão, o clique pode ocorrer antes da lista aparecer.
    selectEmployeeName(name) {
        // Interceta a chamada de pesquisa de employees para saber quando os dados chegam
        cy.intercept('GET', '**/api/v2/pim/employees**').as('employeeSearch')

        // Escreve devagar para garantir que o "name" consiga aparecer nas sugestões de autocomplete
        this.employeeNameInput.clear().type(name, { delay: 100 })

        // Aguarda a resposta da API antes de tentar clicar na sugestão
        cy.wait('@employeeSearch')

        // Clica na primeira sugestão da lista de autocomplete
        cy.get('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first().click()
    }

    // Ativa o toggle "Change Password" para revelar os campos de password.
    // O input do toggle está visualmente oculto por CSS (o visual é um span estilizado),
    // por isso { force: true } é necessário para contornar a verificação de visibilidade.
    enableChangePassword() {
        this.changePasswordToggle.check({ force: true })
    }

    // Preenche os campos de nova password e de confirmação
    setPassword(password, confirmPassword) {
        this.passwordInput.type(password)
        this.confirmPasswordInput.type(confirmPassword)
    }

    // Limpa o campo "Username" (usado no TC06 para testar validação de campo obrigatório vazio)
    clearUsername() {
        this.usernameInput.clear()
    }

    // Submete o formulário clicando em "Save"
    save() {
        this.saveButton.click()
    }
}

export default new AdminPage()
