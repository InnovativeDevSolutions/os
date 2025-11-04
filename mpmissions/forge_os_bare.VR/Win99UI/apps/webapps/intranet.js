/**
 * Intranet Web Application
 * 
 * A military/organizational intranet portal providing access to:
 * - Dashboard with notifications and news
 * - Classified document repository
 * - Personnel directory
 * - Training and equipment resources
 * 
 * This web app is loaded within the Internet Explorer application and provides
 * a secure internal portal for mission-related information access.
 */

/**
 * IntranetComponents - Reusable UI component templates
 * Contains HTML template functions for all intranet UI elements
 */
const IntranetComponents = {
    /**
     * Notification card component
     * @param {Object} notification - Notification data
     * @param {string} notification.title - Notification title
     * @param {string} notification.content - Notification content
     * @param {string} notification.date - Notification date
     * @returns {string} HTML string for notification card
     */
    NotificationCard: (notification) => `
        <div class="notification">
            <div class="note-title">${notification.title}</div>
            <div class="note-content">${notification.content}</div>
            <div class="note-date">${notification.date}</div>
        </div>
    `,

    /**
     * News card component
     * @param {Object} newsItem - News item data
     * @param {string} newsItem.title - News title
     * @param {string} newsItem.content - News content
     * @param {string} newsItem.date - News date
     * @returns {string} HTML string for news card
     */
    NewsCard: (newsItem) => `
        <div class="news-item">
            <div class="news-title">${newsItem.title}</div>
            <div class="news-content">${newsItem.content}</div>
            <div class="news-date">${newsItem.date}</div>
        </div>
    `,

    /**
     * Document item component
     * @param {Object} doc - Document data
     * @param {string} doc.title - Document title
     * @param {string} doc.classification - Classification level (e.g., 'secret', 'top-secret')
     * @returns {string} HTML string for document item
     */
    DocumentItem: (doc) => `
        <div class="document-item ${doc.classification}">
            ${doc.title}
        </div>
    `,

    /**
     * Personnel card component
     * @param {Object} person - Personnel data
     * @param {string} person.rank - Military rank
     * @param {string} person.name - Person's name
     * @param {string} person.division - Division/unit assignment
     * @returns {string} HTML string for personnel card
     */
    PersonnelCard: (person) => `
        <div class="personnel-item">
            <span class="rank">${person.rank}</span>
            <span class="name">${person.name}</span>
            <span class="division">${person.division}</span>
        </div>
    `,

    /**
     * Resource card component
     * @param {Object} resource - Resource data
     * @param {string} resource.title - Resource category title
     * @param {Array<string>} resource.items - List of resource items
     * @returns {string} HTML string for resource card
     */
    ResourceCard: (resource) => `
        <div class="resource-card">
            <h4>${resource.title}</h4>
            <ul>
                ${resource.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `,

    /**
     * Header component
     * @param {Object} config - Header configuration
     * @param {string} config.logo - Logo text
     * @param {string} config.playerName - Current player name
     * @param {string} config.securityLevel - Security clearance level
     * @returns {string} HTML string for header
     */
    Header: ({ logo, playerName, securityLevel }) => `
        <div class="logo">${logo}</div>
        <div class="user-info">
            <span>Welcome, ${playerName}</span>
            <span class="security-level">Security Level: ${securityLevel}</span>
        </div>
    `,

    /**
     * Navigation button component
     * @param {Object} config - Button configuration
     * @param {string} config.section - Section identifier
     * @param {boolean} config.isActive - Whether button is currently active
     * @returns {string} HTML string for navigation button
     */
    NavButton: ({ section, isActive }) => `
        <button class="nav-btn ${isActive ? 'active' : ''}" 
                data-section="${section}">
            ${section.charAt(0).toUpperCase() + section.slice(1)}
        </button>
    `,

    /**
     * Quick links sidebar component
     * @param {Object} config - Quick links configuration
     * @param {Array<Object>} config.links - Array of link objects
     * @param {string} config.links[].text - Link display text
     * @param {string} [config.links[].url] - Optional link URL
     * @returns {string} HTML string for quick links panel
     */
    QuickLinks: ({ links }) => `
        <div class="quick-links">
            <h3>Quick Links</h3>
            ${links.map(link => `
                <button class="quick-link-btn" ${link.url ? `data-url="${link.url}"` : ''}>
                    ${link.text}
                </button>
            `).join('')}
        </div>
    `,

    /**
     * Footer component
     * @param {Object} config - Footer configuration
     * @param {string} config.classification - Classification marking
     * @param {string} config.systemStatus - Current system status
     * @returns {string} HTML string for footer
     */
    Footer: ({ classification, systemStatus }) => `
        <div class="classification">${classification}</div>
        <div class="system-status">System Status: ${systemStatus}</div>
    `,

    /**
     * Section header component
     * @param {Object} config - Header configuration
     * @param {string} config.title - Section title
     * @param {string} config.type - Section type (e.g., 'documents', 'personnel')
     * @returns {string} HTML string for section header
     */
    SectionHeader: ({ title, type }) => `
        <div class="section-header ${type}-header">
            <h2>${title}</h2>
            ${type === 'documents' ? '<span class="classification-indicator">CLASSIFIED</span>' : ''}
        </div>
    `,

    /**
     * Search bar component
     * @param {Object} config - Search bar configuration
     * @param {string} config.placeholder - Input placeholder text
     * @param {string} config.section - Section identifier for search context
     * @returns {string} HTML string for search bar
     */
    SearchBar: ({ placeholder, section }) => `
        <div class="search-container">
            <input type="text" 
                   class="search-input" 
                   placeholder="${placeholder}"
                   data-section="${section}">
            <button class="search-btn">Search</button>
        </div>
    `
}

/**
 * IntranetApp - Military/organizational intranet web application
 * Provides access to notifications, news, documents, personnel directory, and resources
 */
class IntranetApp {
    /**
     * Create a new intranet application instance
     * @param {HTMLElement} container - Container element for the app
     */
    constructor(container) {
        this.container = container;
        this.state = {
            currentSection: 'dashboard',
            playerName: 'Unknown User',
            notifications: [],
            news: [],
            documents: [],
            personnel: []
        };

        this.initialize();
    }

    /**
     * Initialize the intranet application
     * Loads initial data, renders UI, and binds event handlers
     */
    initialize() {
        this.loadInitialData();
        this.render();
        this.bindEvents();
    }

    /**
     * Load initial data for the application
     * Populates notifications, news, and requests player info from Arma
     */
    loadInitialData() {
        this.state.notifications = [
            {
                id: 1,
                title: 'System Maintenance',
                content: 'Scheduled downtime on Saturday 0200-0400',
                date: '2024-01-20',
                priority: 'high'
            },
            {
                id: 2,
                title: 'New Security Protocol',
                content: 'Updated clearance procedures now in effect',
                date: '2024-01-19',
                priority: 'medium'
            }
        ];

        this.state.news = [
            {
                id: 1,
                title: 'Joint Training Exercise',
                content: 'Upcoming combined forces training in March',
                date: '2024-01-18'
            },
            {
                id: 2,
                title: 'Technology Update',
                content: 'New communication systems deployment',
                date: '2024-01-17'
            }
        ];

        // Request player data
        A3Bridge.sendAlert(JSON.stringify({
            command: 'REQUEST_PLAYER_INFO'
        }));
    }

    /**
     * Render the complete intranet application UI
     * Generates and inserts HTML for header, navigation, content, and footer
     */
    render() {
        this.container.innerHTML = `
            <div class="intranet-app">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                ${this.renderContent()}
                ${this.renderFooter()}
            </div>
        `;
    }

    /**
     * Render the application header
     * @returns {string} HTML string for header section
     */
    renderHeader() {
        return `
            <header class="intranet-header">
                ${IntranetComponents.Header({
            logo: 'FORGE INTRANET',
            playerName: this.state.playerName,
            securityLevel: 'TOP SECRET'
        })}
            </header>
        `;
    }

    /**
     * Render the navigation bar
     * @returns {string} HTML string for navigation section
     */
    renderNavigation() {
        const sections = ['dashboard', 'documents', 'personnel', 'resources'];
        return `
            <nav class="intranet-nav">
                ${sections.map(section =>
            IntranetComponents.NavButton({
                section,
                isActive: this.state.currentSection === section
            })
        ).join('')}
            </nav>
        `;
    }

    /**
     * Render the main content area
     * @returns {string} HTML string for content section
     */
    renderContent() {
        return `
            <main class="intranet-content">
                ${this.renderSection(this.state.currentSection)}
            </main>
        `;
    }

    /**
     * Render a specific section based on current navigation
     * @param {string} section - Section identifier ('dashboard', 'documents', 'personnel', 'resources')
     * @returns {string} HTML string for the requested section
     */
    renderSection(section) {
        const sectionRenderers = {
            dashboard: () => this.renderDashboard(),
            documents: () => this.renderDocuments(),
            personnel: () => this.renderPersonnel(),
            resources: () => this.renderResources()
        };
        return sectionRenderers[section]();
    }

    /**
     * Render the dashboard section
     * Displays notifications, news, and quick links
     * @returns {string} HTML string for dashboard
     */
    renderDashboard() {
        return `
            <div class="dashboard">
                <section class="notifications-panel">
                    <h3>Notifications</h3>
                    ${this.state.notifications.map(notification =>
            IntranetComponents.NotificationCard(notification)
        ).join('')}
                </section>

                <section class="news-panel">
                    <h3>Latest News</h3>
                    ${this.state.news.map(newsItem =>
            IntranetComponents.NewsCard(newsItem)
        ).join('')}
                </section>

                ${IntranetComponents.QuickLinks({
            links: [
                { url: 'https://forge.mil/mail', text: 'Mail Portal' },
                { text: 'Training Portal' },
                { text: 'Security Guidelines' },
                { text: 'Equipment Requisition' },
                { text: 'Mission Reports' }
            ]
        })}
            </div>
        `;
    }

    /**
     * Render the documents section
     * Displays classified document repository with search
     * @returns {string} HTML string for documents section
     */
    renderDocuments() {
        return `
            <div class="documents">
                ${IntranetComponents.SectionHeader({
            title: 'Classified Documents Repository',
            type: 'documents'
        })}
                
                ${IntranetComponents.SearchBar({
            placeholder: 'Search documents...',
            section: 'documents'
        })}

                <div class="document-list">
                    ${this.state.documents.map(doc =>
            IntranetComponents.DocumentItem({
                title: doc.title,
                classification: doc.classification,
                id: doc.id
            })
        ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render the personnel section
     * Displays personnel directory with search
     * @returns {string} HTML string for personnel section
     */
    renderPersonnel() {
        return `
            <div class="personnel">
                ${IntranetComponents.SectionHeader({
            title: 'Personnel Directory',
            type: 'personnel'
        })}

                ${IntranetComponents.SearchBar({
            placeholder: 'Search personnel...',
            section: 'personnel'
        })}

                <div class="personnel-list">
                    ${this.state.personnel.map(person =>
            IntranetComponents.PersonnelCard({
                rank: person.rank,
                name: person.name,
                division: person.division,
                id: person.id
            })
        ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render the resources section
     * Displays training materials and equipment resources
     * @returns {string} HTML string for resources section
     */
    renderResources() {
        const resourceData = {
            training: {
                title: 'Training Materials',
                items: [
                    'Field Operations',
                    'Cyber Security',
                    'Protocol Updates'
                ]
            },
            equipment: {
                title: 'Equipment',
                items: [
                    'Request Forms',
                    'Maintenance Schedules',
                    'Technical Specs'
                ]
            }
        };

        return `
            <div class="resources">
                ${IntranetComponents.SectionHeader({
            title: 'Resource Center',
            type: 'resources'
        })}
                
                <div class="resource-grid">
                    ${Object.values(resourceData).map(resource =>
            IntranetComponents.ResourceCard(resource)
        ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render the application footer
     * @returns {string} HTML string for footer section
     */
    renderFooter() {
        return `
            <footer class="intranet-footer">
                ${IntranetComponents.Footer({
            classification: 'TOP SECRET // NOFORN',
            systemStatus: 'OPERATIONAL'
        })}
            </footer>
        `;
    }

    /**
     * Bind event handlers for user interactions
     * Handles navigation, quick links, and search functionality
     */
    bindEvents() {
        // Navigation handling
        this.container.addEventListener('click', (e) => {
            const navButton = e.target.closest('.nav-btn');
            if (navButton) {
                this.setState({ currentSection: navButton.dataset.section });
            }

            // Quick link handling
            const quickLink = e.target.closest('.quick-link-btn');
            if (quickLink) {
                this.handleQuickLink(quickLink.dataset.url);
            }
        });

        // Search handling
        this.container.addEventListener('input', (e) => {
            const searchInput = e.target.closest('.search-input');
            if (searchInput) {
                this.handleSearch(searchInput.value, searchInput.dataset.section);
            }
        });
    }

    /**
     * Update application state and trigger re-render
     * @param {Object} newState - Partial state object to merge with current state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    /**
     * Handle quick link button clicks
     * Navigates to URL in Internet Explorer if URL is provided
     * @param {string} url - Target URL to navigate to
     */
    handleQuickLink(url) {
        if (url) {
            const addressBar = document.querySelector('.ie-address-bar input');
            if (addressBar) {
                addressBar.value = url;
                addressBar.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));
            }
        }
    }

    /**
     * Handle search input
     * Routes search queries to appropriate section-specific handlers
     * @param {string} query - Search query string
     * @param {string} section - Section context for search ('documents', 'personnel')
     */
    handleSearch(query, section) {
        // Implement search logic based on section
        const searchMap = {
            documents: () => this.searchDocuments(query),
            personnel: () => this.searchPersonnel(query)
        };

        if (searchMap[section]) {
            searchMap[section]();
        }
    }
}

// Register IntranetApp globally
window.IntranetApp = IntranetApp;