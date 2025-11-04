/**
 * WIN99_CONFIG - Core Configuration Object
 * 
 * Central configuration for the entire Win99 OS interface.
 * Defines:
 * - Start menu structure and program shortcuts
 * - Desktop icon layout and behavior
 * - Application registry with file paths and class names
 * - Web application configurations
 * 
 * This configuration is loaded early in the initialization sequence
 * and referenced throughout the OS lifecycle by StartMenu, Desktop,
 * and Win99OS classes.
 * 
 * @type {Object}
 * @property {Object} startMenu - Start menu configuration
 * @property {Object} desktop - Desktop shortcut configuration
 * @property {Object} applications - Application registry (system and web apps)
 */
const WIN99_CONFIG = {
    /**
     * Start Menu Configuration
     * 
     * Defines the hierarchical structure of the Windows 98-style Start menu.
     * Each program entry can have:
     * - Direct actions (e.g., shutdown, logoff)
     * - Application launchers (app: 'notepad')
     * - Submenus with nested items
     * 
     * Icons reference Arma 3 texture paths (PAA files).
     */
    startMenu: {
        /**
         * Programs array - Start menu items
         * 
         * Each program entry structure:
         * @typedef {Object} ProgramEntry
         * @property {string} id - Unique identifier for menu item
         * @property {string} title - Display text in menu
         * @property {string} icon - Arma 3 texture path for icon
         * @property {string} [app] - Application name to launch (from applications.system)
         * @property {string} [action] - System action to trigger (shutdown, logoff)
         * @property {Array<ProgramEntry>} [submenu] - Nested submenu items
         * 
         * @type {Array<ProgramEntry>}
         */
        programs: [
            {
                id: 'systemAccount',
                title: 'System Account',
                icon: 'FORGE_FX_TaskBar_Ico_Start_SystemAccount_CA'
            },
            {
                id: 'programs',
                title: 'Programs',
                icon: 'FORGE_FX_TaskBar_Ico_Start_Programs_CA',
                submenu: [
                    {
                        id: 'notepad',
                        title: 'Notepad',
                        icon: 'FORGE_FX_Desktop_Ico_Notepad01_CA',
                        app: 'notepad'
                    },
                    {
                        id: 'forge',
                        title: 'Web Browser',
                        icon: 'FORGE_FX_Desktop_Ico_MyBrowser01_CA',
                        app: 'internetexplorer'
                    }
                ]
            },
            // System menu items
            {
                id: 'settings',
                title: 'Settings',
                icon: 'FORGE_FX_TaskBar_Ico_Start_Settings_CA'
            },
            {
                id: 'server',
                title: 'Server',
                icon: 'FORGE_FX_TaskBar_Ico_Start_FindServer_CA'
            },
            {
                id: 'help',
                title: 'Help',
                icon: 'FORGE_FX_TaskBar_Ico_Start_Help_CA'
            },
            // System actions
            {
                id: 'logoff',
                title: 'Log Off',
                icon: 'FORGE_FX_TaskBar_Ico_Start_LogOff_CA',
                action: 'logoff'
            },
            {
                id: 'shutdown',
                title: 'Shutdown',
                icon: 'FORGE_FX_TaskBar_Ico_Start_Shutdown_CA',
                action: 'shutdown'
            }
        ]
    },

    /**
     * Desktop Configuration
     * 
     * Defines desktop icon shortcuts with:
     * - Icon states (default and selected)
     * - Positioning (left or right side of desktop)
     * - Double-click handlers
     * 
     * Icons use Arma 3 texture paths with separate textures for
     * default and selected states to provide visual feedback.
     */
    desktop: {
        /**
         * Shortcuts array - Desktop icon definitions
         * 
         * Each shortcut entry structure:
         * @typedef {Object} ShortcutEntry
         * @property {string} id - Unique identifier for shortcut
         * @property {string} title - Display text below icon
         * @property {Object} icon - Icon texture paths
         * @property {string} icon.default - Default state texture (Arma 3 PAA path)
         * @property {string} icon.selected - Selected/highlighted state texture
         * @property {string} position - Layout position ('left' or 'right' side of desktop)
         * @property {Function} onDoubleClick - Handler function executed on double-click
         * 
         * @type {Array<ShortcutEntry>}
         */
        shortcuts: [
            {
                id: 'myComputerWindow',
                title: 'My Computer',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyComputer01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyComputer02_CA',
                },
                position: 'left',
                onDoubleClick: () => console.log('My Computer clicked'),
            },
            // System shortcuts
            {
                id: 'myInboxWindow',
                title: 'My Inbox',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyInbox01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyInbox02_CA',
                },
                position: 'left',
                onDoubleClick: () => console.log('My Inbox clicked'),
            },
            {
                id: 'myMessengerWindow',
                title: 'My Messenger',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyMessenger01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyMessenger02_CA',
                },
                position: 'left',
                onDoubleClick: () => window.os.openApp('messenger')
            },
            {
                id: 'ieWindow',
                title: 'Internet Explorer',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyBrowser01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyBrowser02_CA',
                },
                position: 'left',
                onDoubleClick: () => window.os.openApp('internetexplorer')
            },
            {
                id: 'intelWindow',
                title: 'Intelligence Center',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyIntel01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyIntel02_CA',
                },
                position: 'left',
                onDoubleClick: () => window.os.openApp('snet')
            },
            // Utility shortcuts
            {
                id: 'myRecycleBinWindow',
                title: 'Recycle Bin',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyBin01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyBin02_CA',
                },
                position: 'right',
                onDoubleClick: () => console.log('Recycle Bin clicked')
            },
            {
                id: 'myEventsCalendarWindow',
                title: 'Events Calendar',
                icon: {
                    default: 'FORGE_FX_Desktop_Ico_MyEvents01_CA',
                    selected: 'FORGE_FX_Desktop_Ico_MyEvents02_CA',
                },
                position: 'right',
                onDoubleClick: () => window.os.openApp('calendar')
            },
        ]
    },

    /**
     * Applications Configuration
     * 
     * Registry of all available applications with their file paths
     * and class names. Used by Win99OS during initialization to load
     * and register applications.
     * 
     * Two categories:
     * - system: Native OS applications (Notepad, Calendar, etc.)
     * - web: Web-based applications loaded inside Internet Explorer
     * 
     * @namespace WIN99_CONFIG.applications
     */
    applications: {
        /**
         * System Applications
         * 
         * Native OS applications that run as standalone windows.
         * Each entry defines:
         * - files: Array of JavaScript files to load (relative to Win99UI/)
         * - class: Name of the JavaScript class to instantiate
         * 
         * Classes must extend Window base class and register themselves
         * globally (e.g., window.Notepad = Notepad).
         * 
         * @type {Object<string, {files: string[], class: string}>}
         */
        system: {
            notepad: {
                files: ['apps\\notepad.js'],
                class: 'Notepad'
            },
            internetexplorer: {
                files: ['apps\\internetexplorer.js'],
                class: 'InternetExplorer'
            },
            messenger: {
                files: ['apps\\messenger.js'],
                class: 'Messenger'
            },
            calendar: {
                files: ['apps\\calendar.js'],
                class: 'Calendar'
            },
            snet: {
                files: [
                    'apps\\helpers\\markdownParser.js',
                    'apps\\helpers\\mediaViewers.js',
                    'apps\\snet.js'
                ],
                class: 'SNet'
            }
        },
        /**
         * Web Applications
         * 
         * Browser-based applications loaded inside InternetExplorer windows.
         * Each entry defines:
         * - files: Object with 'js' and 'css' file paths
         * - class: Name of the web app class to instantiate
         * 
         * Web apps are rendered inside the browser's content area and
         * can communicate with the backend via A3Bridge.
         * 
         * @type {Object<string, {files: {js: string, css: string}, class: string}>}
         */
        web: {
            mail: {
                files: {
                    js: 'apps\\webapps\\mail.js',
                    css: 'apps\\webapps\\mail.css'
                },
                class: 'MailApp'
            },
            intranet: {
                files: {
                    js: 'apps\\webapps\\intranet.js',
                    css: 'apps\\webapps\\intranet.css'
                },
                class: 'IntranetApp'
            }
        }
    },

    /**
     * SNet Filesystem Configuration
     * 
     * Virtual file system structure for the Strategic Network (SNet) application.
     * Maps virtual paths to actual file resources in a hierarchical structure.
     * 
     * Directory Structure:
     * - /intel: Intelligence Division (reports, analysis, archives)
     * - /ops: Operations Center (briefings, media, mission plans)
     * - /surveillance: Surveillance Hub (analytics, feeds, recordings)
     * - /documents: User documents
     * 
     * File Types:
     * - directory: Folders containing other files
     * - media: Binary content (images, videos, audio)
     * - document: Text-based content (markdown, plain text)
     * 
     * @type {Object<string, Array>}
     */
    snetFilesystem: {
        /**
         * Root directory - Top-level folders
         */
        '/': [
            {
                name: 'Intelligence Division',
                type: 'directory',
                fileType: 'folder',
                path: '/intel',
                icon: 'FORGE_FX_File_Ico_directory_CA',
                description: 'Classified intelligence reports and analysis'
            },
            {
                name: 'Operations Center',
                type: 'directory',
                fileType: 'folder',
                path: '/ops',
                icon: 'FORGE_FX_File_Ico_directory_CA',
                description: 'Mission planning and operational documents'
            },
            {
                name: 'Surveillance Hub',
                type: 'directory',
                fileType: 'folder',
                path: '/surveillance',
                icon: 'FORGE_FX_File_Ico_directory_CA',
                description: 'Real-time surveillance and reconnaissance data'
            },
            {
                name: 'Documents',
                type: 'directory',
                fileType: 'folder',
                path: '/documents',
                icon: 'FORGE_FX_File_Ico_directory_CA',
                description: 'Create and edit documents'
            }
        ],

        /**
         * Documents directory - User-created documents
         */
        '/documents': [],

        /**
         * Intelligence Division - Intelligence reports and analysis
         */
        '/intel': [
            { name: 'Analysis', type: 'directory', path: '/intel/analysis' },
            { name: 'Archives', type: 'directory', path: '/intel/archives' },
            { name: 'Reports', type: 'directory', path: '/intel/reports' }
        ],

        /**
         * Operations Center - Mission planning and operational content
         */
        '/ops': [
            { name: 'Audio', type: 'directory', path: '/ops/audio' },
            { name: 'Briefings', type: 'directory', path: '/ops/briefings' },
            { name: 'Images', type: 'directory', path: '/ops/images' },
            { name: 'Mission Plans', type: 'directory', path: '/ops/plans' },
            { name: 'Training', type: 'directory', path: '/ops/training' },
            { name: 'Videos', type: 'directory', path: '/ops/videos' }
        ],

        /**
         * Operations - Videos directory
         */
        '/ops/videos': [
            {
                name: 'promo.webm',
                type: 'media',
                fileType: 'video/webm',
                path: '/ops/videos/promo.webm',
                relativePath: 'snet\\ops\\videos\\promo.webm.b64'
            }
        ],

        /**
         * Operations - Images directory
         */
        '/ops/images': [
            {
                name: 'promo.jpg',
                type: 'media',
                fileType: 'image/jpeg',
                path: '/ops/images/promo.jpg',
                relativePath: 'snet\\ops\\images\\promo.jpg.b64'
            }
        ],

        /**
         * Operations - Audio directory
         */
        '/ops/audio': [
            {
                name: 'promo.mp3',
                type: 'media',
                fileType: 'audio/mp3',
                path: '/ops/audio/promo.mp3',
                relativePath: 'snet\\ops\\audio\\promo.mp3.b64'
            }
        ],

        /**
         * Operations - Briefings directory
         */
        '/ops/briefings': [
            {
                name: 'promo.md',
                type: 'media',
                fileType: 'text/markdown',
                path: '/ops/briefings/promo.md',
                relativePath: 'snet\\ops\\briefings\\promo.md.b64'
            }
        ],

        /**
         * Surveillance Hub - Surveillance and reconnaissance
         */
        '/surveillance': [
            { name: 'Analytics', type: 'directory', path: '/surveillance/analytics' },
            { name: 'Live Feeds', type: 'directory', path: '/surveillance/live' },
            { name: 'Recordings', type: 'directory', path: '/surveillance/recordings' }
        ]
    }
};
