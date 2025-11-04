/**
 * Notepad Application
 * 
 * A Windows 98-style text editor providing:
 * - Multi-line text editing with monospace font
 * - File operations (New, Open, Save, Save As)
 * - Menu bar with File, Edit, Format, View, Help
 * - Status bar showing cursor position (line, column)
 * - Persistent file storage via profile namespace
 * - File list dialog for opening saved notes
 * 
 * Files are saved to Arma 3 profile namespace and persist across game sessions.
 * Supports standard text file operations with .txt extension.
 */

/**
 * NotepadComponents - UI component templates
 * Contains HTML template functions for notepad interface elements
 */
const NotepadComponents = {
    /**
     * Create main text editor textarea
     * @returns {string} HTML string for editor
     */
    createEditor: () => `
        <textarea 
            style="
                width: 100%;
                height: 100%;
                resize: none;
                border: 1px solid;
                border-color: #808080 #ffffff #ffffff #808080;
                padding: 2px;
                font-family: 'Lucida Console', monospace;
            "
        ></textarea>
    `,

    /**
     * Create menu bar with File operations menu
     * @returns {string} HTML string for menu bar
     */
    createMenuBar: () => `
        <div class="menu-item">
            File
            <div class="submenu">
                <div class="menu-item">New</div>
                <div class="menu-item">Open...</div>
                <div class="menu-item">Save</div>
                <div class="menu-item">Save As...</div>
                <div class="menu-separator"></div>
                <div class="menu-item">Exit</div>
            </div>
        </div>
        <div class="menu-item">Edit</div>
        <div class="menu-item">Format</div>
        <div class="menu-item">View</div>
        <div class="menu-item">Help</div>
    `
};

/**
 * DialogComponents - Dialog templates for file operations
 * Contains templates for Save and Open file dialogs
 */
const DialogComponents = {
    /**
     * Create Save As dialog with filename input
     * @returns {string} HTML string for save dialog
     */
    createSaveDialog: () => `
        <label>File name:</label>
        <input type="text" id="saveFileName" value="Untitled.txt">
    `,

    /**
     * Create Open dialog with file list
     * @returns {string} HTML string for open dialog
     */
    createOpenDialog: () => `
        <label>Select a file:</label>
        <div class="file-list" id="notepadFileList"></div>
    `
};

/**
 * Notepad - Main text editor application class
 * Extends Window base class to provide text editing functionality
 */
class Notepad extends Window {
    /**
     * Create a new Notepad instance
     * Initializes with blank document and default window properties
     */
    constructor() {
        super({
            title: 'Untitled - Notepad',
            icon: 'FORGE_FX_Desktop_Ico_Notepad01_CA',
            width: 800,
            height: 600
        });

        this.element.classList.add('notepad-window');
        this.cursorPosition = { line: 1, col: 1 };
        this.initComponents();
    }

    /**
     * Initialize all UI components
     */
    initComponents() {
        this.initNotepad();
        this.initMenuBar();
        this.initMenuBarEvents();
        this.initStatusBar();
        this.initDialogs();
    }

    /**
     * Initialize the main textarea component
     */
    initNotepad() {
        const content = this.element.querySelector('.content');
        content.innerHTML = NotepadComponents.createEditor();

        const textarea = content.querySelector('textarea');
        textarea.addEventListener('click', this.handleTextareaSelect.bind(this));
        textarea.addEventListener('keyup', this.handleTextareaSelect.bind(this));
    }

    /**
     * Initialize the menu bar structure
     */
    initMenuBar() {
        const menuBar = this.element.querySelector('.menu-bar');
        menuBar.innerHTML = NotepadComponents.createMenuBar();
    }

    /**
     * Initialize file operation dialogs
     */
    initDialogs() {
        this.saveDialog = new Dialog({
            title: 'Save As',
            content: DialogComponents.createSaveDialog(),
            buttons: [
                {
                    text: 'Save',
                    onClick: () => this.confirmSave()
                },
                {
                    text: 'Cancel',
                    onClick: () => this.closeSaveDialog()
                }
            ]
        });

        this.openDialog = new Dialog({
            title: 'Open',
            content: DialogComponents.createOpenDialog(),
            buttons: [
                {
                    text: 'Open',
                    onClick: () => this.openSelectedFile()
                },
                {
                    text: 'Cancel',
                    onClick: () => this.closeOpenDialog()
                }
            ]
        });

        this.saveDialog.mount(this.element);
        this.openDialog.mount(this.element);
    }

    /**
     * Initialize menu bar event listeners
     */
    initMenuBarEvents() {
        const menuBar = this.element.querySelector('.menu-bar');

        // New file
        menuBar.querySelector('.submenu .menu-item:nth-child(1)').addEventListener('click', () => {
            this.element.querySelector('textarea').value = '';
            this.element.querySelector('.title-bar-text').textContent = 'Untitled - Notepad';
        });

        // Open file
        menuBar.querySelector('.submenu .menu-item:nth-child(2)').addEventListener('click', () => {
            this.sendAlert(JSON.stringify({
                command: 'NOTEPAD_LIST_FILES'
            }));
            this.openDialog.show();
        });

        // Save file
        menuBar.querySelector('.submenu .menu-item:nth-child(3)').addEventListener('click', () => {
            const currentTitle = this.element.querySelector('.title-bar-text').textContent;
            const content = this.element.querySelector('textarea').value;

            if (currentTitle !== 'Untitled - Notepad' && content.trim() !== '') {
                const filename = currentTitle.replace(' - Notepad', '');
                this.sendAlert(JSON.stringify({
                    command: 'SAVE_NOTEPAD',
                    data: {
                        filename: filename,
                        content: content
                    }
                }));
            } else {
                this.saveDialog.show();
            }
        });

        // Save As
        menuBar.querySelector('.submenu .menu-item:nth-child(4)').addEventListener('click', () => {
            this.saveDialog.show();
        });

        // Exit
        menuBar.querySelector('.submenu .menu-item:last-child').addEventListener('click', () => {
            window.os.taskbar.removeTab(this);
            this.close();
        });
    }

    /**
     * Handle textarea selection and cursor position
     * Calculates and updates line and column numbers for status bar
     * @param {Event} e - Click or keyup event from textarea
     */
    handleTextareaSelect(e) {
        const textarea = e.currentTarget;
        const text = textarea.value;
        const cursorIndex = textarea.selectionStart;
        const lineNumber = text.substr(0, cursorIndex).split('\n').length;
        const lastNewLine = text.lastIndexOf('\n', cursorIndex - 1) + 1;
        const columnNumber = cursorIndex - lastNewLine + 1;

        this.cursorPosition = { line: lineNumber, col: columnNumber };
        this.updateStatusBar();
    }

    /**
     * Save the current file
     * Sends save command to backend with filename and content
     * Updates window title to reflect saved filename
     */
    confirmSave() {
        const filename = this.element.querySelector('#saveFileName').value;
        const content = this.element.querySelector('textarea').value;

        if (filename) {
            this.sendAlert(JSON.stringify({
                command: 'SAVE_NOTEPAD',
                data: {
                    filename: filename,
                    content: content
                }
            }));
            this.element.querySelector('.title-bar-text').textContent = `${filename} - Notepad`;
            this.saveDialog.hide();
        }
    }

    /**
     * Open a selected file from the file list
     * Sends open command to backend to load file content
     */
    openSelectedFile() {
        const selectedFile = this.openDialog.element.querySelector('.file-item.selected');
        if (selectedFile) {
            this.sendAlert(JSON.stringify({
                command: 'NOTEPAD_OPEN',
                data: {
                    filename: selectedFile.textContent
                }
            }));
            this.closeOpenDialog();
        }
    }

    /**
     * Load content into the notepad
     * Called by backend when file is successfully loaded
     * @param {string} filename - Name of the file
     * @param {string} content - File content to display
     */
    loadNotepadContent(filename, content) {
        this.element.querySelector('textarea').value = content;
        this.element.querySelector('.title-bar-text').textContent = `${filename} - Notepad`;
    }

    /**
     * Update the file list in the open dialog
     * Populates file list with saved files from backend
     * Adds click handlers for file selection
     * @param {Array<string>} files - Array of filenames
     */
    updateFileList(files) {
        const fileList = this.openDialog.element.querySelector('#notepadFileList');
        fileList.innerHTML = files.map(file => `<div class="file-item">${file}</div>`).join('');

        fileList.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                fileList.querySelectorAll('.file-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    /**
     * Initialize status bar with default cursor position
     * Shows line and column numbers (Ln 1, Col 1)
     */
    initStatusBar() {
        const statusBar = this.element.querySelector('.status-bar');
        statusBar.innerHTML = `
            <p class="status-bar-field">
                Ln ${this.cursorPosition.line}, Col ${this.cursorPosition.col}
            </p>
        `;
    }

    /**
     * Update the status bar with current cursor position
     */
    updateStatusBar() {
        const statusField = this.element.querySelector('.status-bar-field');
        statusField.textContent = `Ln ${this.cursorPosition.line}, Col ${this.cursorPosition.col}`;
    }

    /**
     * Dialog Management Methods
     */

    /**
     * Close the Save As dialog
     */
    closeSaveDialog() {
        this.saveDialog.hide();
    }

    /**
     * Close the Open dialog
     */
    closeOpenDialog() {
        this.openDialog.hide();
    }
}

/**
 * Register Notepad application globally for OS launcher
 */
window.Notepad = Notepad;
