import adminPage from '../pages/adminPage'

describe('Edit User', () => {

    // SETUP — Cria o utilizador via API antes de correr qualquer teste.
    //
    // Motivo: o site do OrangeHRM é partilhado e os utilizadores
    // criados manualmente muitas vezes desaparecem. Criar via API no before() garante que
    // qualquer outra pessoa (para além do localhost) consegue correr o teste sem preparação manual.
    //
    // Porquê cy.login() em vez de lógica de login manual:
    // cy.login() já trata de cy.clearAllCookies() + cy.visit() + credenciais +
    // wait para o dashboard. Duplicar essa lógica aqui causava falhas no after()
    // porque cy.visit('/auth/login') redirecionava para o dashboard (sessão ativa)
    // e input[name="username"] não era encontrado.
    //
    // Fluxo:
    //   1. Login via cy.login() (limpa cookies + autentica via browser)
    //   2. Buscar o "Employee Name" do "John" dinamicamente via API (utilizado o "John" para estes testes pois é o nome mais estável para o preenchimento")
    //   3. Verificar se o utilizador já existe
    //   4. Criar o utilizador apenas se não existir
    // ─────────────────────────────────────────────────────────────────────────
    before(() => {
        // Passo 1: Login usando o comando existente — garante sessão autenticada
        // de forma consistente com o beforeEach, sem duplicar lógica
        cy.login()

        // Passo 2: Buscar o "Employee Name" do "John" dinamicamente via API
        // (o cookie de sessão do cy.login() é partilhado com cy.request())
        cy.request('/web/index.php/api/v2/pim/employees?nameOrId=John&includeEmployees=onlyCurrent')
            .then(res => {
                const empNumber = res.body.data[0].empNumber

                // Passo 3: Verificar se o utilizador já existe para não duplicar
                cy.request({
                    method: 'GET',
                    url: '/web/index.php/api/v2/admin/users?username=testuser001',
                    failOnStatusCode: false
                }).then(checkRes => {

                    // Passo 4: Criar utilizador apenas se ainda não existir
                    if (checkRes.body.data.length === 0) {
                        cy.request({
                            method: 'POST',
                            url: '/web/index.php/api/v2/admin/users',
                            body: {
                                username:   'testuser001',
                                password:   'testuser001!',
                                status:     true,       // true = Enabled
                                empNumber:  empNumber,
                                userRoleId: 1           // 1 = Admin, 2 = ESS
                            }
                        })
                    }
                })
            })
    })

    // Apagar o utilizador via API após todos os testes terminarem.
    //
    // Mantém o ambiente limpo e garante que o próximo teste começa sempre
    // com o utilizador no estado correto (criado de novo pelo before).
    after(() => {
        // Login usando o comando existente — cy.login() faz cy.clearAllCookies()
        // antes de visitar a página, garantindo que não há redirecionamento para
        // o dashboard mesmo que a sessão do último beforeEach ainda esteja ativa
        cy.login()

        // Buscar o ID interno do utilizador para poder apagá-lo via API
        cy.request('/web/index.php/api/v2/admin/users?username=testuser001')
            .then(res => {
                if (res.body.data.length > 0) {
                    const userId = res.body.data[0].id

                    cy.request({
                        method: 'DELETE',
                        url: '/web/index.php/api/v2/admin/users',
                        body: { ids: [userId] }
                    })
                }
            })
    })

   
    // BEFORE EACH — Faz login e navega até à página de edição antes de cada TC
    beforeEach(() => {
        cy.login()
        adminPage.navigateToUsers()
        adminPage.searchAndEditUser('testuser001')
    })


    // TEST CASES //

    // GIVEN que o ADMIN já está logado e já se encontra na página de "Admin"


    // TC01 — Aceder à funcionalidade/página para edição
    it("TC01 - Access the edit user page successfully", () => {
        cy.url().should('include', '/admin/saveSystemUser')
    })

    // TC02 — Visualizar dados atuais do utilizador
    it("TC02 - Validate the user's current data", () => {
        adminPage.userRoleValue.should('contain.text', 'Admin')
        adminPage.statusValue.should('contain.text', 'Enabled')
        adminPage.employeeNameInput.should('contain.value', 'John')
        adminPage.usernameInput.should('have.value', 'testuser001')
    })

    // TC03 — Editar role do utilizador com sucesso
    // Restaura o role original no final para não afetar os testes seguintes.
    it("TC03 - Edit User's Role successfully", () => {
        adminPage.selectUserRole('ESS')
        adminPage.save()
        adminPage.successToast.should('be.visible')

        // Restaurar role original (Admin) para manter o estado do utilizador
        adminPage.selectUserRole('Admin')
        adminPage.save()
    })

    // TC04 — Editar status do utilizador com sucesso.
    // Restaura o status original no final para não afetar os testes seguintes.
    it("TC04 - Edit User's Status successfully", () => {
        adminPage.selectStatus('Disabled')
        adminPage.save()
        adminPage.successToast.should('be.visible')

        // Restaurar status original (Enabled) para manter o estado do utilizador
        adminPage.selectStatus('Enabled')
        adminPage.save()
    })

    // TC05 — Alterar password com dados válidos
    it("TC05 - Edit the User's Password successfully", () => {
        adminPage.enableChangePassword()
        adminPage.setPassword('testuser001!', 'testuser001!')
        adminPage.save()
        adminPage.successToast.should('be.visible')
    })

    // TC06 — Impedir gravação com campo username obrigatórios vazio
    it("TC06 - Don't allow the system to save the new data with required fields empty", () => {
        adminPage.clearUsername()
        adminPage.save()
        adminPage.errorMessages.should('be.visible')
    })

    // TC07 —Impedir gravação com password diferente do campo confirm password
    it("TC07 - Don't allow the system to save the new data if the passwords don't match", () => {
        adminPage.enableChangePassword()
        adminPage.setPassword('testuser001!', 'differentPassword!')
        adminPage.save()
        adminPage.errorMessages.should('be.visible')
    })
})