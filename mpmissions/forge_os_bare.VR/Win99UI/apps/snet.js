/**
 * SNet - Strategic Network Application
 * 
 * Virtual file browser and media viewer for military intelligence operations.
 * Features:
 * - Hierarchical file system navigation
 * - Media preview (images, videos, audio, markdown)
 * - Browser-style navigation (back, forward, up)
 * - Quick access shortcuts
 * - File type icons and metadata display
 * 
 * Dependencies:
 * - MarkdownParser: Loaded from helpers/markdownParser.js
 * - MediaViewers: Loaded from helpers/mediaViewers.js
 * - WIN99_CONFIG.snetFilesystem: Filesystem configuration from config.js
 */

/**
 * File type constants
 * @const {Object}
 */
const FILE_TYPES = {
    DIRECTORY: 'directory',
    MEDIA: 'media',
    DOCUMENT: 'document'
};

/**
 * Document type constants
 * @const {Object}
 */
const DOCUMENT_TYPES = {
    BRIEFING: 'briefing',
    MARKDOWN: 'markdown',
    TEXT: 'text'
};

/**
 * Icon mapping for file types
 * @const {Object}
 */
const ICONS = {
    DIRECTORY: 'FORGE_FX_File_Ico_Directory_CA',
    MEDIA: 'FORGE_FX_File_Ico_Media_CA',
    DOCUMENT: 'FORGE_FX_File_Ico_Directory_CA'
};

/**
 * UI Component Templates
 */

/**
 * Create navigation toolbar with back/forward/up buttons
 * Uses Marlett font for arrow icons
 * @returns {string} HTML string for toolbar
 */
const createToolbar = () => `
    <div class="toolbar">
        <div class="title-bar-controls">
            <button aria-label="Back" style="font-family: Marlett;">3</button>
            <button aria-label="Forward" style="font-family: Marlett;">4</button>
            <button aria-label="Up" style="font-family: Marlett;">5</button>
        </div>
        <div class="title-bar-controls">
            <button aria-label="List" style="font-family: Marlett;">7</button>
            <button aria-label="Grid" style="font-family: Marlett;">8</button>
        </div>
    </div>
`;

/**
 * Create sidebar with quick access links to main directories
 * @returns {string} HTML string for sidebar
 */
const createSidebar = () => `
    <div class="sidebar">
        <div class="quick-access">
            <h3>Quick Access</h3>
            <div class="nav-item" data-path="/intel">Intelligence</div>
            <div class="nav-item" data-path="/ops">Operations</div>
            <div class="nav-item" data-path="/surveillance">Surveillance</div>
        </div>
    </div>
`;

/**
 * SNet - Strategic Network File Browser
 * 
 * Main application class for browsing and viewing military intelligence files.
 * Extends Window base class to provide a file explorer interface with:
 * - Directory tree navigation
 * - File preview panel
 * - Media viewer integration
 * - Browser-style history navigation
 */
class SNet extends Window {
    /**
     * Create SNet application instance
     * Initializes filesystem, navigation state, and UI components
     */
    constructor() {
        super({
            title: 'Strategic Network (SNET)',
            icon: 'FORGE_FX_Desktop_Ico_MyIntel01_CA',
            width: 1024,
            height: 768
        });

        // Load virtual file system from config
        this.fileSystem = WIN99_CONFIG.snetFilesystem;

        this.element.classList.add('snet-window');
        this.currentPath = '/';
        this.selectedFile = null;
        this.viewMode = 'grid';
        this.navigationHistory = [];
        this.currentHistoryIndex = -1;

        this.initializeComponents();
    }

    /**
     * Initialize UI components and event handlers
     * 
     * Sets up the main layout, UI references, event listeners,
     * and loads the initial directory view
     */
    initializeComponents() {
        const content = this.element.querySelector('.content');
        content.innerHTML = this.renderMainLayout();

        this.initializeUI();
        this.initializeEventListeners();
        this.loadCurrentDirectory();
    }

    /**
     * Render main application layout
     * 
     * Creates the complete SNet interface structure:
     * - Toolbar with navigation buttons
     * - Address bar showing current path
     * - Three-column layout (sidebar, file grid, preview panel)
     * - Status bar with item counts
     * 
     * @returns {string} HTML string for main layout
     */
    renderMainLayout() {
        return `
            <div class="snet-layout">
                ${createToolbar()}
                <div class="address-bar">
                    <span>Location:</span>
                    <div class="path-segments"></div>
                </div>
                <div class="content-area">
                    ${createSidebar()}
                    <div class="file-browser">
                        <div class="file-grid"></div>
                    </div>
                    <div class="preview-panel"></div>
                </div>
                <div class="status-bar">
                    <span class="status-text">Ready</span>
                    <span class="item-count"></span>
                </div>
            </div>
        `;
    }

    /**
     * Initialize UI element references
     * 
     * Caches DOM element references for performance
     * and easier access throughout the class
     */
    initializeUI() {
        this.pathBar = this.element.querySelector('.path-segments');
        this.fileGrid = this.element.querySelector('.file-grid');
        this.previewPanel = this.element.querySelector('.preview-panel');
        this.statusText = this.element.querySelector('.status-text');
        this.itemCount = this.element.querySelector('.item-count');
        this.viewerContainer = this.element.querySelector('.preview-panel');
    }

    /**
     * Initialize all event listeners
     * 
     * Sets up handlers for:
     * - Navigation buttons (back, forward, up)
     * - Quick access sidebar clicks
     * - File grid selection and double-click
     * - Path breadcrumb navigation
     */
    initializeEventListeners() {
        // Navigation buttons
        this.element.querySelector('button[aria-label="Back"]').addEventListener('click', () => {
            if (this.currentHistoryIndex > 0) {
                this.currentHistoryIndex--;
                this.currentPath = this.navigationHistory[this.currentHistoryIndex];
                this.loadCurrentDirectory();
                this.updateNavigationButtons();
            }
        });

        this.element.querySelector('button[aria-label="Forward"]').addEventListener('click', () => {
            if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                this.currentHistoryIndex++;
                this.currentPath = this.navigationHistory[this.currentHistoryIndex];
                this.loadCurrentDirectory();
                this.updateNavigationButtons();
            }
        });

        this.element.querySelector('button[aria-label="Up"]').addEventListener('click', () => {
            if (this.currentPath !== '/') {
                const parentPath = this.currentPath.split('/').slice(0, -1).join('/') || '/';
                this.navigateTo(parentPath);
            }
        });

        // Quick access navigation
        this.element.querySelector('.quick-access').addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.navigateTo(navItem.dataset.path);
            }
        });

        // File grid events
        this.fileGrid.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                this.fileGrid.querySelectorAll('.file-item').forEach(item => {
                    item.classList.remove('selected');
                });
                fileItem.classList.add('selected');
                this.selectFile(fileItem.dataset.path);
            }
        });

        this.fileGrid.addEventListener('dblclick', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                const file = this.fileSystem[this.currentPath].find(f => f.path === fileItem.dataset.path);
                if (file.type === 'directory') {
                    this.navigateTo(file.path);
                } else {
                    this.openFile(file);
                }
            }
        });

        // Path navigation
        this.pathBar.addEventListener('click', (e) => {
            const pathSegment = e.target.closest('.path-segment');
            if (pathSegment) {
                this.navigateTo(pathSegment.dataset.path);
            }
        });
    }

    /**
     * Initialize document editor (unused placeholder)
     * 
     * Intended for future document editing functionality.
     * Sets up markdown editor with live preview.
     * 
     * @param {Window} window - Window instance containing editor elements
     */
    initializeDocumentEditor(window) {
        const editor = window.element.querySelector('.doc-content');
        const preview = window.element.querySelector('.preview-pane');
        const previewToggle = window.element.querySelector('.preview-toggle');
        const saveButton = window.element.querySelector('.save-doc');

        previewToggle.addEventListener('click', () => {
            const isPreviewVisible = preview.style.display !== 'none';
            preview.style.display = isPreviewVisible ? 'none' : 'block';
            editor.style.width = isPreviewVisible ? '100%' : '50%';
            if (!isPreviewVisible) {
                preview.innerHTML = MarkdownParser.parse(editor.value);
            }
        });

        saveButton.addEventListener('click', () => {
            // Add save functionality
            window.element.querySelector('.status-bar').textContent = 'Document saved';
        });
    }

    /**
     * Navigate to specified path
     * 
     * Updates current path, navigation history, and loads new directory.
     * Maintains browser-style forward/back navigation.
     * 
     * @param {string} path - Virtual filesystem path to navigate to
     */
    navigateTo(path) {
        if (this.currentHistoryIndex === this.navigationHistory.length - 1) {
            this.navigationHistory.push(this.currentPath);
            this.currentHistoryIndex++;
        }

        this.currentPath = path;
        this.loadCurrentDirectory();
        this.updateNavigationButtons();
        this.clearPreviewPanel();
    }

    /**
     * Clear preview panel
     * 
     * Resets preview panel to default "no file selected" state
     */
    clearPreviewPanel() {
        this.previewPanel.innerHTML = '<div class="preview-header"><h3>No file selected</h3></div>';
    }

    /**
     * Update navigation button states
     * 
     * Enables/disables back, forward, and up buttons based on:
     * - Current position in navigation history
     * - Whether at root directory
     */
    updateNavigationButtons() {
        const backBtn = this.element.querySelector('button[aria-label="Back"]');
        const forwardBtn = this.element.querySelector('button[aria-label="Forward"]');
        const upBtn = this.element.querySelector('button[aria-label="Up"]');

        backBtn.disabled = this.currentHistoryIndex <= 0;
        forwardBtn.disabled = this.currentHistoryIndex >= this.navigationHistory.length - 1;
        upBtn.disabled = this.currentPath === '/';
    }

    /**
     * Update address bar breadcrumb path
     * 
     * Generates clickable breadcrumb segments from current path.
     * Example: Root > ops > videos
     * Each segment is clickable for quick navigation.
     */
    updatePathBar() {
        const paths = this.currentPath.split('/').filter(p => p);
        let html = '<span class="path-segment" data-path="/">Root</span>';
        let currentPath = '';

        paths.forEach(segment => {
            currentPath += '/' + segment;
            html += ` > <span class="path-segment" data-path="${currentPath}">${segment}</span>`;
        });

        this.pathBar.innerHTML = html;
    }

    /**
     * Load and display current directory
     * 
     * Fetches files from virtual filesystem and renders them in the grid.
     * Updates path bar, status text, and item count.
     */
    async loadCurrentDirectory() {
        this.updatePathBar();
        this.statusText.textContent = 'Loading...';

        const files = this.fileSystem[this.currentPath] || [];
        await this.renderFileGrid(files);

        this.statusText.textContent = `${files.length} items`;
        this.itemCount.textContent = `${files.length} item(s)`;
    }

    /**
     * Render file grid
     * 
     * Creates file/folder items with icons and names.
     * Loads icons asynchronously from Arma 3 resources.
     * 
     * @param {Array<Object>} files - Array of file objects to display
     */
    async renderFileGrid(files) {
        const gridHTML = files.map(file => `
            <div class="file-item" data-path="${file.path}" data-type="${file.type}">
                <img src="" alt="${file.type}" data-icon="${file.icon || `FORGE_FX_File_Ico_${file.type}_CA`}">
                <span class="file-name">${file.name}</span>
            </div>
        `).join('');

        this.fileGrid.innerHTML = gridHTML;

        // Load icons for each file
        const fileItems = this.fileGrid.querySelectorAll('.file-item');
        for (const item of fileItems) {
            const iconElement = item.querySelector('img');
            const iconName = iconElement.dataset.icon;
            const iconSrc = await A3Bridge.loadIcon(iconName);
            if (iconSrc) {
                iconElement.src = iconSrc;
            }
        }
    }

    /**
     * Handle file selection
     * 
     * Updates selected file state and triggers preview panel update.
     * Does not handle directory selection.
     * 
     * @param {string} path - Virtual path of selected file
     */
    async selectFile(path) {
        this.selectedFile = path;
        const file = this.fileSystem[this.currentPath].find(f => f.path === path);
        if (file && file.type !== 'directory') {
            this.statusText.textContent = `Selected: ${file.name}`;
            await this.updatePreviewPanel(file);
        }
    }

    /**
     * Update preview panel with file content
     * 
     * Loads file from backend and generates preview based on file type:
     * - Images: Inline <img> preview
     * - Videos: Inline <video> player
     * - Audio: Inline <audio> player
     * - Markdown: Parsed HTML preview
     * - Other: Text preview (first 500 chars)
     * 
     * Adds "Open" button to launch full viewer window.
     * 
     * @param {Object} file - File object to preview
     */
    async updatePreviewPanel(file) {
        const previewPanel = this.element.querySelector('.preview-panel');
        const base64Content = await A3Bridge.loadFile(file.relativePath);

        let previewHTML = `
            <div class="preview-header">
                <h3>${file.name}</h3>
                <div class="file-info">
                    <p>Type: ${file.fileType || file.type}</p>
                    <p>Path: ${file.path}</p>
                </div>
            </div>
            <div class="preview-content">
        `;

        switch (file.fileType) {
            case 'image/jpeg':
            case 'image/png':
                previewHTML += `
                    <div class="preview-image">
                        <img src="data:${file.fileType};base64,${base64Content}" alt="${file.name}">
                    </div>
                `;
                break;
            case 'video/webm':
                previewHTML += `
                    <div class="preview-video">
                        <video controls>
                            <source src="data:video/webm;base64,${base64Content}" type="video/webm">
                        </video>
                    </div>
                `;
                break;
            case 'audio/mp3':
                previewHTML += `
                    <div class="preview-audio">
                        <audio controls>
                            <source src="data:audio/mp3;base64,${base64Content}" type="audio/mp3">
                        </audio>
                    </div>
                `;
                break;
            case 'text/markdown':
                const decodedContent = atob(base64Content);
                const parsedContent = MarkdownParser.parse(decodedContent);
                previewHTML += `
                    <div class="preview-markdown">
                        <div class="markdown-content">
                            ${parsedContent}
                        </div>
                    </div>
                `;
                break;
            default:
                previewHTML += `
                    <div class="preview-text">
                        <pre>${base64Content.substring(0, 500)}...</pre>
                    </div>
                `;
        }

        previewHTML += `
            </div>
            <div class="preview-actions">
                <button class="open-file-btn">Open</button>
            </div>
        `;

        previewPanel.innerHTML = previewHTML;
        previewPanel.querySelector('.open-file-btn').addEventListener('click', () => {
            this.openFile(file);
        });
    }

    /**
     * Open file in appropriate viewer window
     * 
     * Routes file to correct viewer based on file type:
     * - Videos: MediaViewers.displayVideo()
     * - Images: MediaViewers.displayImage()
     * - Audio: MediaViewers.displayAudio()
     * - Markdown: MediaViewers.displayMarkdown()
     * - Other: displayDocument() (inline preview)
     * 
     * Custom handlers can be specified via file.handler property.
     * 
     * @param {Object} file - File object to open
     */
    async openFile(file) {
        if (file.handler) {
            this[file.handler]();
            return;
        }
        switch (file.fileType) {
            case 'video/webm':
                MediaViewers.displayVideo(file.relativePath, this.element);
                break;
            case 'image/jpeg':
            case 'image/png':
                MediaViewers.displayImage(file.relativePath, this.element);
                break;
            case 'audio/mp3':
                MediaViewers.displayAudio(file.relativePath, this.element);
                break;
            case 'text/markdown':
                MediaViewers.displayMarkdown(file.relativePath, this.element, MarkdownParser);
                break;
            default:
                const content = await A3Bridge.loadFile(file.relativePath);
                this.displayDocument(content);
        }
    }


    /**
     * Display generic document content in preview panel
     * 
     * Used for unsupported file types or text documents.
     * Displays raw content in a <pre> element.
     * 
     * @param {string} content - Document content to display
     */
    displayDocument(content) {
        this.viewerContainer.innerHTML = `
            <div class="document-viewer">
                <pre class="document-content">${content}</pre>
            </div>
        `;
    }
}

/**
 * Register SNet application globally
 * Makes SNet class available to OS launcher via window.os.openApp('snet')
 */
window.SNet = SNet;
