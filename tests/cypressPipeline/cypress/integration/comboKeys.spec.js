    describe('Editor controls', function () {
        it('Checks different keyboard shortcuts', function () {
            cy.createPage()

            // 1. Add element, press Esc, check if the editor closes
            cy.addElement('Basic Button', true)
            cy.get('.vcv-layout-bar.vcv-ui-content-all--visible')
            cy.get('body').type('{esc}')
            cy.get('.vcv-layout-bar.vcv-ui-content--hidden')

            // 2. Press Shift + T, check if tree view opens
            cy.get('body').trigger('keydown', { shiftKey: true, keyCode: 84, which: 84 })
            cy.get('.vcv-ui-tree-layout-container')

            // 3. Press ctrl/command + Z, check if this undo last action(adding element)
            cy.get('body').trigger('keydown', { ctrlKey: true, keyCode: 90, which: 90 })
            cy.get('.vce-button--style-basic-container.vce-button--style-basic-container--align-left').should('not.exist')

            // 4. Press ctrl/command + shift + Z, check if this redo the last action
            cy.get('body').trigger('keydown', { ctrlKey: true, shiftKey:true, keyCode: 90, which: 90 })
            cy.wait(500)
            cy.get('button').find('.vce-button--style-basic-container').should('exist')
        }) 
    })