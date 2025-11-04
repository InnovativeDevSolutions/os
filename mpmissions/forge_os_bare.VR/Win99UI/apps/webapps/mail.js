/**
 * Mail Web Application
 * 
 * A military email client providing:
 * - Inbox, Sent, and Drafts folder management
 * - Email viewing with preview pane
 * - Message composition (New, Reply, Forward)
 * - Read/unread status tracking
 * - Email actions (Delete)
 * 
 * This web app is loaded within the Internet Explorer application and provides
 * secure email communication for military operations and command coordination.
 */

/**
 * MailApp - Military Email Application
 * Handles secure email management, viewing, and composition within the FORGE system
 */
class MailApp {
    /**
     * Initialize mail application with default state and data
     * @param {HTMLElement} container - Container element for the mail app
     */
    constructor(container) {
        // Core properties
        this.container = container;
        this.currentFolder = 'inbox';

        // Initialize demo email data
        this.initializeEmailData();

        // Render initial view
        this.render();
        this.initializeEventListeners();
    }

    /**
     * Set up initial email data structure
     * @private
     */
    initializeEmailData() {
        this.emails = {
            inbox: [
                {
                    id: 1,
                    from: 'Col. Anderson',
                    subject: 'Mission Brief: Operation Blackout',
                    date: '2024-01-20 09:30',
                    content: 'Details for upcoming operation attached. Review ASAP.',
                    read: false
                },
                {
                    id: 2,
                    from: 'Intelligence Division',
                    subject: 'Weekly Intelligence Report',
                    date: '2024-01-19 15:45',
                    content: 'Summary of key intelligence findings attached.',
                    read: true
                }
            ],
            sent: [
                {
                    id: 3,
                    to: 'Maj. Martinez',
                    subject: 'Re: Equipment Requisition',
                    date: '2024-01-18 14:20',
                    content: 'Approved. Proceed with procurement.',
                    read: true
                }
            ],
            drafts: [
                {
                    id: 4,
                    to: 'Command Staff',
                    subject: 'Training Schedule Update',
                    date: '2024-01-17 11:15',
                    content: 'Draft of revised training schedule...',
                    read: true
                }
            ]
        };
    }

    // EVENT HANDLERS
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        this.initializeFolderListeners();
        this.initializeEmailListeners();
        this.initializeComposeListener();
    }

    /**
     * Initialize folder selection listeners
     * @private
     */
    initializeFolderListeners() {
        this.container.querySelectorAll('.folder').forEach(folder => {
            folder.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentFolder = folder.dataset.folder;
                this.render();
            });
        });
    }

    /**
     * Initialize email selection listeners
     * @private
     */
    initializeEmailListeners() {
        this.container.querySelectorAll('.email-item').forEach(email => {
            email.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEmail(email.dataset.id);
            });
        });
    }

    /**
     * Initialize compose button listener
     * @private
     */
    initializeComposeListener() {
        const composeBtn = this.container.querySelector('.compose-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.renderComposeEmail();
            });
        }
    }

    // EMAIL MANAGEMENT
    /**
     * Display selected email in preview pane
     * @param {string} id - Email ID
     */
    showEmail(id) {
        const email = this.findEmail(id);
        if (!email) return;

        const preview = this.container.querySelector('.mail-preview');
        preview.innerHTML = this.generateEmailPreview(email);
        email.read = true;

        const emailList = this.container.querySelector('.mail-list');
        emailList.innerHTML = this.renderEmailList();
        this.initializeEmailListeners();
    }

    /**
     * Find email by ID across all folders
     * @param {string} id - Email ID to find
     * @returns {Object|null} Found email or null
     * @private
     */
    findEmail(id) {
        id = parseInt(id);
        for (let folder in this.emails) {
            const email = this.emails[folder].find(e => e.id === id);
            if (email) return email;
        }
        return null;
    }

    // RENDERING METHODS
    /**
     * Render main application layout
     */
    render() {
        this.container.innerHTML = this.generateMainLayout();
        this.initializeEventListeners();
    }

    /**
     * Generate main application HTML structure
     * @returns {string} Complete HTML layout
     * @private
     */
    generateMainLayout() {
        return `
            <div class="mail-app">
                ${this.generateToolbar()}
                <div class="mail-content">
                    <div class="mail-sidebar">
                        ${this.renderFolders()}
                    </div>
                    <div class="mail-list">
                        ${this.renderEmailList()}
                    </div>
                    <div class="mail-preview">
                        ${this.renderEmailPreview()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate toolbar HTML
     * @returns {string} Toolbar HTML
     * @private
     */
    generateToolbar() {
        return `
            <div class="mail-toolbar">
                <button class="compose-btn">New Message</button>
                <div class="mail-actions">
                    <button>Reply</button>
                    <button>Forward</button>
                    <button>Delete</button>
                </div>
            </div>
        `;
    }

    /**
     * Render folder list
     * @returns {string} Folders HTML
     */
    renderFolders() {
        const folders = [
            { id: 'inbox', name: 'Inbox', count: this.emails.inbox.length },
            { id: 'sent', name: 'Sent', count: this.emails.sent.length },
            { id: 'drafts', name: 'Drafts', count: this.emails.drafts.length }
        ];

        return `
            <div class="folders">
                ${folders.map(folder => this.generateFolderItem(folder)).join('')}
            </div>
        `;
    }

    /**
     * Generate individual folder item HTML
     * @param {Object} folder - Folder data
     * @returns {string} Folder item HTML
     * @private
     */
    generateFolderItem(folder) {
        return `
            <div class="folder ${this.currentFolder === folder.id ? 'active' : ''}" 
                 data-folder="${folder.id}">
                <span class="folder-name">${folder.name}</span>
                <span class="folder-count">${folder.count}</span>
            </div>
        `;
    }

    /**
     * Render email list for current folder
     * @returns {string} Email list HTML
     */
    renderEmailList() {
        const emails = this.emails[this.currentFolder];
        return `
            <div class="email-list">
                ${emails.map(email => this.generateEmailListItem(email)).join('')}
            </div>
        `;
    }

    /**
     * Generate individual email list item HTML
     * @param {Object} email - Email data
     * @returns {string} Email item HTML
     * @private
     */
    generateEmailListItem(email) {
        return `
            <div class="email-item ${!email.read ? 'unread' : ''}" data-id="${email.id}">
                <div class="email-sender">${email.from || email.to}</div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-date">${this.formatDate(email.date)}</div>
            </div>
        `;
    }

    /**
     * Render email preview
     * @returns {string} Email preview HTML
     */
    renderEmailPreview() {
        return `
            <div class="email-preview-content">
                <div class="preview-header">
                    <div class="preview-subject">Select an email to view</div>
                    <div class="preview-details"></div>
                </div>
                <div class="preview-body"></div>
            </div>
        `;
    }

    /**
     * Generate email preview HTML
     * @param {Object} email - Email data
     * @returns {string} Email preview HTML
     * @private
     */
    generateEmailPreview(email) {
        return `
            <div class="email-preview-content">
                <div class="preview-header">
                    <div class="preview-subject">${email.subject}</div>
                    <div class="preview-details">
                        <div>From: ${email.from || 'Draft'}</div>
                        <div>To: ${email.to || 'Not specified'}</div>
                        <div>Date: ${this.formatDate(email.date)}</div>
                    </div>
                </div>
                <div class="preview-body">${email.content}</div>
            </div>
        `;
    }

    /**
     * Format date string for display
     * @param {string} dateString - Input date string
     * @returns {string} Formatted date string
     * @private
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Render email composition interface
     * Shows form for creating new email with To, Subject, and Body fields
     * @private
     */
    renderComposeEmail() {
        const preview = this.container.querySelector('.mail-preview');
        preview.innerHTML = `
            <div class="compose-email">
                <div class="compose-header">
                    <h3>New Message</h3>
                </div>
                <div class="compose-form">
                    <div class="compose-field">
                        <label>To:</label>
                        <input type="text" class="compose-to" placeholder="Recipient">
                    </div>
                    <div class="compose-field">
                        <label>Subject:</label>
                        <input type="text" class="compose-subject" placeholder="Subject">
                    </div>
                    <div class="compose-field">
                        <label>Message:</label>
                        <textarea class="compose-body" rows="15" placeholder="Type your message here..."></textarea>
                    </div>
                    <div class="compose-actions">
                        <button class="send-btn">Send</button>
                        <button class="save-draft-btn">Save Draft</button>
                        <button class="discard-btn">Discard</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for compose actions
        this.initializeComposeActions();
    }

    /**
     * Initialize event listeners for email composition actions
     * Handles Send, Save Draft, and Discard buttons
     * @private
     */
    initializeComposeActions() {
        const sendBtn = this.container.querySelector('.send-btn');
        const saveDraftBtn = this.container.querySelector('.save-draft-btn');
        const discardBtn = this.container.querySelector('.discard-btn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendEmail());
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        if (discardBtn) {
            discardBtn.addEventListener('click', () => this.render());
        }
    }

    /**
     * Send the composed email
     * Validates fields and moves email to sent folder
     * @private
     */
    sendEmail() {
        const to = this.container.querySelector('.compose-to').value;
        const subject = this.container.querySelector('.compose-subject').value;
        const body = this.container.querySelector('.compose-body').value;

        if (!to || !subject) {
            alert('Please fill in recipient and subject fields');
            return;
        }

        const newEmail = {
            id: Date.now(),
            to: to,
            subject: subject,
            date: new Date().toISOString(),
            content: body,
            read: true
        };

        this.emails.sent.unshift(newEmail);
        this.currentFolder = 'sent';
        this.render();
    }

    /**
     * Save the composed email as draft
     * Saves email to drafts folder for later editing
     * @private
     */
    saveDraft() {
        const to = this.container.querySelector('.compose-to').value;
        const subject = this.container.querySelector('.compose-subject').value;
        const body = this.container.querySelector('.compose-body').value;

        const draft = {
            id: Date.now(),
            to: to || 'Not specified',
            subject: subject || 'No subject',
            date: new Date().toISOString(),
            content: body,
            read: true
        };

        this.emails.drafts.unshift(draft);
        this.currentFolder = 'drafts';
        this.render();
    }
}

/**
 * Register MailApp globally for use by Internet Explorer webapp loader
 */
window.MailApp = MailApp;
