/**
 * Dialog - Modal Dialog Window Component
 * 
 * Creates and manages Windows 98-style modal dialog windows for:
 * - User confirmations
 * - Input prompts
 * - Information displays
 * - Custom modal interactions
 * 
 * Features:
 * - Title bar with close button
 * - Customizable content area
 * - Configurable button array
 * - Show/hide state management
 * - DOM mounting and cleanup
 * 
 * Usage:
 * const dialog = new Dialog({
 *     title: 'Confirm Action',
 *     content: '<p>Are you sure?</p>',
 *     buttons: [
 *         { text: 'OK', onClick: () => dialog.hide() },
 *         { text: 'Cancel', onClick: () => dialog.hide() }
 *     ]
 * });
 * dialog.mount(document.body);
 * dialog.show();
 */
class Dialog {
    /**
     * Create a new dialog instance
     * 
     * Constructs dialog element and initializes controls.
     * Dialog starts in hidden state and must be explicitly shown.
     * 
     * @param {Object} options - Dialog configuration options
     * @param {string} options.title - Dialog window title text
     * @param {string} [options.content=''] - Dialog body HTML content
     * @param {Array<Object>} [options.buttons] - Button configuration array
     * @param {string} options.buttons[].text - Button label text
     * @param {Function} options.buttons[].onClick - Button click handler
     */
    constructor(options = {}) {
        this.createDialogElement(options);
        this.initializeControls(options);
    }

    /**
     * Create the dialog DOM element
     * 
     * Builds Windows 98-style dialog structure:
     * - Title bar with text and close button
     * - Window body with content area
     * - Footer section for buttons
     * 
     * Dialog is created hidden (display: none) by default.
     * 
     * @param {Object} options - Dialog configuration options
     */
    createDialogElement(options) {
        this.element = document.createElement('div');
        this.element.className = 'window win99-dialog';
        this.element.style.display = 'none';

        this.element.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">${options.title}</div>
                <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div class="window-body dialog-content">
                <div class="dialog-body">${options.content || ''}</div>
                <div class="dialog-footer"></div>
            </div>
        `;
    }

    /**
     * Initialize dialog controls and buttons
     * 
     * Sets up:
     * - Button creation from configuration
     * - Close button event handler (title bar X)
     * 
     * @param {Object} options - Dialog configuration options
     */
    initializeControls(options) {
        if (options.buttons) {
            this.createButtons(options.buttons);
        }

        this.element.querySelector('.title-bar-controls button').onclick = () => this.hide();
    }

    /**
     * Create dialog buttons from configuration
     * 
     * Generates button elements and attaches click handlers.
     * Buttons are appended to dialog footer in order specified.
     * 
     * @param {Array<Object>} buttons - Button configuration array
     * @param {string} buttons[].text - Button label
     * @param {Function} buttons[].onClick - Click event handler
     */
    createButtons(buttons) {
        const buttonContainer = this.element.querySelector('.dialog-footer');
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'dialog-button';
            button.textContent = btn.text;
            button.onclick = btn.onClick;
            buttonContainer.appendChild(button);
        });
    }

    // DIALOG STATE MANAGEMENT

    /**
     * Show the dialog
     * 
     * Makes dialog visible by setting display to 'block'.
     * Dialog must be mounted to DOM before showing.
     */
    show() {
        this.element.style.display = 'block';
    }

    /**
     * Hide the dialog
     * 
     * Hides dialog by setting display to 'none'.
     * Dialog remains in DOM and can be shown again.
     */
    hide() {
        this.element.style.display = 'none';
    }

    /**
     * Mount dialog to parent element
     * 
     * Appends dialog element to specified parent.
     * Typically mounted to document.body for full-screen overlay.
     * Must be called before show().
     * 
     * @param {HTMLElement} parent - Parent element to append dialog to
     */
    mount(parent) {
        parent.appendChild(this.element);
    }

    /**
     * Remove dialog from DOM and cleanup resources
     * 
     * Performs complete cleanup:
     * 1. Removes event listeners from close button
     * 2. Removes event listeners from dialog buttons
     * 3. Removes dialog element from DOM
     * 4. Clears internal element reference
     * 
     * Call this when dialog is no longer needed to prevent memory leaks.
     */
    remove() {
        // Remove event listeners
        const closeButton = this.element.querySelector('.title-bar-controls button');
        closeButton.removeEventListener('click', this.hide);

        // Remove dialog buttons and their listeners
        const buttons = this.element.querySelectorAll('.dialog-button');
        buttons.forEach(button => {
            button.removeEventListener('click', button.onclick);
        });

        // Remove the dialog element from DOM
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Clear references
        this.element = null;
    }
}