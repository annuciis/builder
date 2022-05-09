// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/* global Cypress, cy */

/** Login to WordPress dashboard
 *  Visits /wp-login.php page,
 *  Enters username and password.
 *
 *  On CI environment activates Visual Composer plugin.
 *
 *  @param none
 */
 Cypress.Commands.add('login', () => {
    cy.server()
    cy.visit('/wp-login.php')
    cy.wait(200)
    cy.get('#user_login').clear().type(Cypress.env('wpUserName'))
    cy.get('#user_pass').clear().type(`${Cypress.env('wpPassword')}{enter}`)
    // // Plugin activation
    if (Cypress.env('serverType') !== 'local' && Cypress.env('serverType') !== 'ci') {
      cy.visit('/wp-admin/plugins.php')
      cy.get(`[data-plugin="${Cypress.env('dataPlugin')}"]`).then(($block) => {
        if (!$block.hasClass('active')) {
          // cy.get(`[data-slug="${Cypress.env('slug')}"] .deactivate a`).click()
          // cy.get(`#vcv-visual-composer-website-builder a.vcv-deactivation-submit-button`).click()
          cy.get(`[data-plugin="${Cypress.env('dataPlugin')}"] .activate a`).click()
        }
      })
    }
  })
  
  /** Create a new page with Visual Composer
   *  Visits the new page by opening a link,
   *  link is specified in the cypress.json file under newPage property.
   *
   * @param none
   */
  Cypress.Commands.add('createPage', () => {
    cy.visit(Cypress.env('newPage'))
    cy.window().then((win) => {
      cy.route('POST', win.vcvAdminAjaxUrl).as('loadContentRequest')
    })
    cy.wait('@loadContentRequest')
  })
  
  /** Add element
   *  Opens Add Element panel by clicking on the Add Element icon in the navbar,
   *  searches for element (elementName) in the element list,
   *  clicks on it.
   *  Checks if Edit Form is opened by looking for element title.
   *
   * @param elementName [string]
   */
  Cypress.Commands.add('addElement', (elementName, isInitial = false) => {
    if (!isInitial) {
      cy.get('.vcv-ui-navbar-control[data-vcv-guide-helper="plus-control"').click()
    }
    cy.get(`.vcv-ui-item-element-image[alt="${elementName}"]`)
      .first()
      .closest('.vcv-ui-item-element').click({ force: true })
    cy.wait(300)
    cy.get('.vcv-ui-edit-form-header-title').contains(elementName)
  })
  
  /** Save page
   * Clicks on the Save Page icon in the navbar.
   *
   * @param none
   */
  Cypress.Commands.add('savePage', () => {
    cy.window().then((win) => {
      cy.route('POST', win.vcvAdminAjaxUrl).as('saveRequest')
    })
    cy.contains('[data-vcv-guide-helper="save-control"] .vcv-ui-navbar-dropdown-content .vcv-ui-navbar-control-content', 'Publish')
      .parent()
      .click({ force: true })
  
    cy.wait('@saveRequest')
  })
  
  /** View page
   * Opens View Page by visiting page url located in window.vcvPostData.permalink.
   *
   * @param none
   */
  Cypress.Commands.add('viewPage', () => {
    cy.window().then((win) => {
      cy.visit(win.vcvPostData.permalink)
    })
  })
  
  /** Set Design Options
   * Fills out fields under Design Option section of Edit Form.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('setDO', (settings) => {
    cy.get('.advanced-design-options .vcv-ui-form-switch-trigger-label')
      .contains('Simple controls')
      .then(($field) => {
        cy.wrap($field)
          .click()
      })
  
    cy.setDoInput('Padding', settings.padding)
    cy.setDoInput('Border', settings.borderWidth)
    cy.setDoInput('Radius', settings.borderRadius)
    cy.setDoInput('Margin', settings.margin)
  
    cy.setDoColor('Background color', {
      color: settings.backgroundColor,
      initialColor: '000000'
    })
  
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains('Border style')
      .then(($field) => {
        if (settings.borderStyle) {
          cy.wrap($field)
            .next()
            .select(settings.borderStyle)
        }
      })
  
    cy.setDoColor('Border color', {
      color: settings.borderColor,
      initialColor: '000000'
    })
  
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains('Animate')
      .then(($field) => {
        if (settings.animation) {
          cy.wrap($field)
            .next()
            .select(settings.animation)
        }
      })
  })
  
  /** Set Design Options Advanced
   * Fills out fields under Design Option section of Edit Form.
   * Used for container elements like Section, Row, Column.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('setDOA', (settings) => {
    cy.get('.advanced-design-options .vcv-ui-form-switch-trigger-label')
      .contains('Use gradient overlay')
      .then(($field) => {
        cy.wrap($field)
          .click()
      })
  
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains('Gradient type')
      .then(($field) => {
        if (settings.gradientType) {
          cy.wrap($field)
            .next()
            .select(settings.gradientType)
        }
      })
  
    cy.setDoColor('Start color', {
      color: settings.gradientStartColor,
      initialColor: 'E28787'
    })
  
    cy.setDoColor('End color', {
      color: settings.gradientStartColor,
      initialColor: '5D37D8'
    })
  
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains('Gradient angle')
      .then(($field) => {
        if (settings.gradientAngle) {
          cy.wrap($field)
            .next()
            .find('.vcv-ui-form-range-input')
            .clear()
            .type(settings.gradientAngle)
        }
      })
  })
  
  /** Set custom class name and custom ID
   * Sets value for Element ID and Extra class name input fields in the Edit Form.
   *
   * @param id [string]
   * @param className [string]
   */
  Cypress.Commands.add('setClassAndId', (id, className) => {
    cy.setInput('Element ID', id)
    cy.setInput('Extra class name', className)
  })
  
  /** Set input attribute value
   * Sets value for input attribute field in the Edit Form.
   *
   * @param title [string]
   * @param value [string]
   */
  Cypress.Commands.add('setInput', (title, value) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .parent()
          .find('.vcv-ui-form-input')
          .clear()
          .type(value)
      })
  })
  
  /** Set datepicker attribute value
   * Sets value for datepicker attribute field via input element in the Edit Form.
   *
   * @param title [string]
   * @param value [string]
   */
  Cypress.Commands.add('setDate', (title, value) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next()
          .find('.vcv-ui-form-input')
          .clear()
          .type(value)
      })
    // Click on a title to close datepicker which may cover next attribute field
    cy.get('.vcv-ui-form-group-heading')
      .contains(titleRegex)
      .click()
  })
  
  /** Set Design Options input field value
   * Sets value for input field inside Design Options section in the Edit Form.
   *
   * @param title [string]
   * @param value [string]
   */
  Cypress.Commands.add('setDoInput', (title, value) => {
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains(title)
      .then(($field) => {
        if (value) {
          cy.wrap($field)
            .next()
            .type(value)
        }
      })
  })
  
  /** Set toggle attribute value
   * Clicks on a toggle control in the Edit Form.
   *
   *
   * @param title [string]
   */
  Cypress.Commands.add('setSwitch', (title) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next('.vcv-ui-form-switch-container')
          .find('.vcv-ui-form-switch')
          .click()
      })
  })
  
  /** Set dropdown attribute value
   * Chooses a value from a select attribute field in the Edit Form.
   *
   * @param title [string]
   * @param value [string]
   */
  Cypress.Commands.add('setSelect', (title, value) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .parent()
      .then(($field) => {
        cy.wrap($field)
          .find('select')
          .select(value)
      })
  })
  
  /** Set button group attribute value
   * Clicks on a button within a button group attribute field in the Edit Form.
   *
   * @param title [string]
   * @param value [string]
   */
  Cypress.Commands.add('setButtonGroup', (title, value) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next()
          .find(`.vcv-ui-form-button[data-value="${value}"]`)
          .click()
      })
  })
  
  /** Set color picker attribute value
   * Clicks on the color picker attribute field in the Edit Form,
   * clears existing HEX value input,
   * sets new HEX value.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('setColor', (settings) => {
    const titleRegex = new RegExp(`^${settings.title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next('div')
          .find('.vcv-ui-color-picker-dropdown')
          .click()
        cy.get(`.vcv-ui-color-picker-custom-color input[value="${settings.initialValue}"]`)
          .clear()
          .type(settings.value)
        cy.wrap($field)
          .next('div')
          .find('.vcv-ui-color-picker-dropdown')
          .click()
      })
  })
  
  /** Set Design Options color picker attribute value
   * Clicks on the color picker attribute field in Design Options section of the Edit Form,
   * clears existing HEX value input,
   * sets new HEX value.
   *
   * @param title [string]
   * @param settings [object]
   */
  Cypress.Commands.add('setDoColor', (title, settings) => {
    cy.get('.advanced-design-options .vcv-ui-form-group-heading')
      .contains(title)
      .then(($field) => {
        if (settings.color && settings.color.hex) {
          cy.wrap($field)
            .next('div')
            .find('.vcv-ui-color-picker-dropdown')
            .click()
          cy.get(`.vcv-ui-color-picker-custom-color input[value="${settings.initialColor}"]`)
            .clear()
            .type(settings.color.hex)
          cy.wrap($field)
            .next('div')
            .find('.vcv-ui-color-picker-dropdown')
            .click()
        }
      })
  })
  
  /** Set link selector attribute value
   * Clicks on the link selector attribute field in the Edit Form,
   * sets value for url input in the popup,
   * click on save button.
   *
   * @param title [string]
   * @param settings [object]
   */
  Cypress.Commands.add('setURL', (title, settings) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next('div')
          .find('.vcv-ui-form-link-button')
          .click()
      })
  
    cy.get('.vcv-ui-modal .vcv-ui-form-group-heading')
      .contains('URL')
      .then(($field) => {
        cy.wrap($field)
          .next('.vcv-ui-editor-dropdown-input-container')
          .find('input')
          .type(settings.url)
      })
  
    cy.get('.vcv-ui-modal label[for="targetBlank-0-1"]').click()
    cy.get('.vcv-ui-modal .vcv-ui-modal-action').click()
  })
  
  /** Set icon picker attribute value
   * Clicks on the icon picker attribute field in the Edit Form,
   * selects value in the icon family dropdown,
   * sets value for the icon name input,
   * clicks on the icon.
   *
   * @param title [string]
   * @param settings [object]
   */
  Cypress.Commands.add('setIcon', (title, settings) => {
    const titleRegex = new RegExp(`^${title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading')
      .contains(titleRegex)
      .parent()
      .then(($field) => {
        cy.wrap($field)
          .next('div')
          .find('.vcv-ui-form-dropdown')
          .click()
      })
  
    cy.get('.vcv-ui-form-iconpicker-content-heading .vcv-ui-form-dropdown:first-of-type')
      .select(settings.iconFamily)
  
    cy.get('.vcv-ui-form-iconpicker-content-heading .vcv-ui-form-input')
      .type(settings.iconName)
  
    cy.get(`.vcv-ui-form-iconpicker-option[title="${settings.iconTitle}"]`)
      .click()
  })
  
  /** Set htmleditor (TinyMce editor) attribute value
   * Sets value for the content area of the TinyMCE editor,
   * selects element type in the TinyMCE editor,
   * clicks on alignment button the TinyMCE editor.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('setTinyMce', (settings) => {
    const titleRegex = new RegExp(`^${settings.title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .next()
          .find('.vcv-ui-form-wp-tinymce-inner iframe').then(($iframe) => {
          // get body within TinyMCE's iframe content
          const document = $iframe.contents()
          const body = document.find('body')
  
          cy.wrap(body).focus().clear().type(settings.text)
        })
  
        // Select which HTML tag will be used from the TinyMCE tag dropdown list
        if (settings.elementType && settings.elementType.name) {
          // The dropdown might contain Heading or Paragraph word when clearing the area.
          const inputValue = /\b(?:Heading|Paragraph)\b/g
          cy.wrap($field)
            .next()
            .find('.mce-stack-layout-item.mce-first .mce-btn .mce-txt')
            .then(($activeHeading) => {
              cy.wrap($activeHeading)
              // Check is elementType.name already active
              if ($activeHeading[0].innerText !== settings.elementType.name) {
                cy.wrap($activeHeading)
                  .contains(inputValue)
                  .closest('button')
                  .click()
  
  
                cy.get('.mce-menu-item .mce-text')
                  .contains(settings.elementType.name)
                  .parent()
                  .click()
              }
            })
        }
  
        // Click on TinyMCE alignment control
        if (settings.alignment && settings.alignment.name) {
          cy.wrap($field)
            .next()
            .find(`.mce-btn[aria-label*="${settings.alignment.name}"] button`)
            .click()
        }
      })
  })
  
  /** Set rawCode (Code Mirror editor) attribute value
   * Sets value for the code attribute field in the Edit Form.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('setCodeMirror', (settings) => {
    const titleRegex = new RegExp(`^${settings.title}$`, 'gi')
    cy.get('.vcv-ui-form-group-heading-wrapper')
      .contains(titleRegex)
      .then(($field) => {
        cy.wrap($field)
          .siblings('.CodeMirror-wrap')
          .then(($cm) => {
            const cm = $cm.get(0).CodeMirror
            cm.setValue('')
            cm.clearHistory()
            cy.wrap($cm)
              .find('.CodeMirror-code')
              .type(settings.code, {parseSpecialCharSequences: false})
          })
      })
  })
  
  /** Click on the Replace button within a section
   *
   * @param settings [object]
   */
  Cypress.Commands.add('replaceElement', (settings) => {
    cy.get('.vcv-ui-edit-form-section-header')
      .contains(settings.sectionName)
      .next()
      .click()
  
    cy.get('.vcv-ui-replace-element-block .vcv-ui-item-list-item')
      .contains(settings.elementName)
      .click()

    cy.get('.vcv-ui-edit-form-section-header')
      .contains(settings.sectionName)
      .next()
      .click()
  })
  
  /** Creates a new post in WordPress admin dashboard.
   * Callback may execute additional actions, e.g. setting ACF fields.
   * Post id need to be passed to callback function in order to retrieve it inside a test file.
   * All actions are forced { force: true } due to unpredictable WordPress environment.
   *
   * @param settings [object]
   * @param callback [function]
   * @returns postId [string]
   */
  Cypress.Commands.add('createWpPost', (settings, callback) => {
    cy.visit('/wp-admin/post-new.php')
    cy.wait(1000)
    cy.window().then(async (window) => {
      await window.wp.data.dispatch("core/editor").editPost({ title: settings.postTitle })
      await window.wp.data.dispatch("core/editor").editPost({ content: settings.postContent })
      if (settings.postExcerpt) {
        await window.wp.data.dispatch("core/editor").editPost({ excerpt: settings.postExcerpt })
      }
      await window.wp.data.dispatch('core/editor').resetBlocks(window.wp.blocks.parse(settings.postContent));
      await window.wp.data.dispatch('core/editor').savePost().then(() => {
          const currentPost = window.wp.data.select('core/editor').getCurrentPost()
          callback(currentPost.id + '', currentPost)
        }
      )
    })
  })
  
  /** Creates a new menu in WordPress admin dashboard,
   *  Menu is created using menu items array,
   *  if there's no array or it is blank, the default one is used.
   *
   * @param settings [object]
   */
  Cypress.Commands.add('createWpMenu', (settings) => {
    const menuItems = settings && settings.menuItems ? settings.menuItems : [
      {
        url: Cypress.env('baseUrl'),
        title: 'Home'
      },
      {
        url: '#',
        title: 'About'
      },
      {
        url: '#',
        title: 'Products'
      },
      {
        url: '#',
        title: 'Contacts'
      }
    ]
    const addMenuItem = (url, title) => {
      cy.get('#custom-menu-item-url')
        .clear()
        .type(url)
  
      cy.get('#custom-menu-item-name')
        .clear()
        .type(title)
  
      cy.get('#submit-customlinkdiv')
        .click()
  
      cy.wait('@adminAjax')
    }
  
    cy.visit('/wp-admin/nav-menus.php?action=edit&menu=0')
  
    cy.get('#menu-name')
      .clear()
      .type(settings.menuName)
  
    cy.get('#save_menu_footer')
      .click()
  
    cy.route('POST', `${Cypress.env('baseUrl')}wp-admin/admin-ajax.php`).as('adminAjax')
  
    cy.contains('.accordion-section-title', 'Custom Links')
      .click()
  
    menuItems.forEach((item) => {
      addMenuItem(item.url, item.title)
    })
  
    cy.get('#save_menu_footer')
      .click()
  })
  
  /** Access iframe element
   *
   * @param iframe [string]
   */
  
  Cypress.Commands.add('getIframe', (iframe) => {
    return cy.get(iframe)
        .its('0.contentDocument.body')
        .should('be.visible')
        .then(cy.wrap);
  })

    /** Set value for rank input
   *
   * @param title [string]
   * @param value [integer]
   */
  
     Cypress.Commands.add('setRank', (title, value) => {
      return cy.get('.vcv-ui-form-group-heading')
        .contains(title)
        .parent()
        .parent()
        .then(($field) => {
          cy.wrap($field)
            .find('.vcv-ui-form-range-input')
            .clear()
            .type(value)
        })
    })
  