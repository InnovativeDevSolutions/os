/**
 * Taskbar - Windows 98-Style Taskbar Component
 * 
 * Manages the bottom taskbar with:
 * - Start button with Windows logo
 * - Running application tabs (one per window)
 * - System tray with clock
 * - Tab highlighting for active windows
 * - Click-to-activate/minimize behavior
 * 
 * Features:
 * - Real-time clock (updates every second)
 * - Dynamic tab creation/removal as windows open/close
 * - Active state synchronization with windows
 * - Minimize/restore via tab click
 * - Icon loading from Arma 3 resources
 * 
 * Integration:
 * - Window instances register themselves via addTab()
 * - Window state changes trigger updateTabs()
 * - Start button toggles Start menu visibility
 */
class Taskbar {
    /**
     * Initialize taskbar system
     * 
     * Sets up taskbar elements, initializes clock and Start button,
     * and prepares tab container for running applications.
     */
    constructor() {
        this.element = document.querySelector('.taskbar');
        this.clock = this.element.querySelector('.clock');
        this.startButton = this.element.querySelector('.start-button');
        this.runningApps = this.element.querySelector('.taskbar-tabs');
        this.tabs = [];

        this.initializeTaskbar();
    }

    /**
     * Initialize all taskbar components
     * 
     * Performs taskbar setup:
     * 1. Initializes clock with 1-second update interval
     * 2. Loads Start button icon and attaches click handler
     */
    initializeTaskbar() {
        this.initClock();
        this.initStartButton();
    }

    // CLOCK MANAGEMENT

    /**
     * Initialize system clock
     * 
     * Sets up real-time clock display that updates every second.
     * Clock shows current time in 12-hour format with AM/PM.
     * 
     * Immediately displays current time, then updates via setInterval.
     */
    initClock() {
        if (!this.clock) {
            this.clock = this.element.querySelector('.clock');
        }
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    /**
     * Update clock display with current time
     * 
     * Formats current time as 12-hour with AM/PM (e.g., "3:45 PM").
     * Called every second by setInterval.
     * 
     * Format:
     * - hour: numeric (1-12)
     * - minute: 2-digit (00-59)
     * - hour12: true (AM/PM)
     */
    updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        this.clock.textContent = time;
    }

    // START BUTTON MANAGEMENT

    /**
     * Initialize start button
     * 
     * Loads Windows logo icon from Arma 3 resources and attaches
     * click handler to toggle Start menu visibility.
     * 
     * Click behavior:
     * - Toggles 'active' class on both button and menu
     * - Shows/hides Start menu with CSS transitions
     * - Provides visual feedback (pressed button state)
     */
    async initStartButton() {
        const startIcon = this.startButton.querySelector('img');
        const iconSrc = await A3Bridge.loadIcon('FORGE_FX_TaskBar_Ico_Start_CA');
        startIcon.src = iconSrc;

        this.startButton.addEventListener('click', () => {
            const startButton = document.querySelector('.start-button');
            const startMenu = document.querySelector('.start-menu');
            startButton.classList.toggle('active');
            startMenu.classList.toggle('active');
        });
    }

    // TAB MANAGEMENT

    /**
     * Add new application tab to taskbar
     * 
     * Creates a taskbar tab for a window with:
     * - Window icon (loaded from Arma 3 resources)
     * - Window title text
     * - Click handler for activate/minimize toggle
     * 
     * Tab click behavior:
     * - If window is minimized: restore it
     * - Always: bring window to front (setActive)
     * 
     * Tab is automatically added to internal tabs array for state tracking.
     * 
     * @param {Window} window - Window instance to create tab for
     */
    async addTab(window) {
        const tab = document.createElement('div');
        tab.className = 'taskbar-tab';

        const iconSrc = await A3Bridge.loadIcon(window.icon);
        tab.innerHTML = `
            <img src="${iconSrc}" alt="${window.title}">
            <span>${window.title}</span>
        `;

        tab.addEventListener('click', () => {
            if (window.isMinimized) {
                window.minimize();
            }
            window.setActive();
        });

        this.runningApps.appendChild(tab);
        this.tabs.push({ element: tab, window });
        this.updateTabs();
    }

    /**
     * Update visual state of all tabs
     * 
     * Synchronizes tab highlighting with window states.
     * A tab is highlighted (active class) only if its window is:
     * - Currently active (focused)
     * - AND not minimized
     * 
     * Called by windows when state changes (focus, minimize, restore).
     */
    updateTabs() {
        this.tabs.forEach(tab => {
            const isActive = tab.window.isActive && !tab.window.isMinimized;
            tab.element.classList.toggle('active', isActive);
        });
    }

    /**
     * Remove application tab from taskbar
     * 
     * Removes tab element from DOM and internal tracking array.
     * Called when a window is closed.
     * 
     * Performs cleanup:
     * - Removes tab from DOM
     * - Filters window from tabs array
     * 
     * @param {Window} window - Window instance to remove tab for
     */
    removeTab(window) {
        const tab = this.tabs.find(t => t.window === window);
        if (tab) {
            tab.element.remove();
            this.tabs = this.tabs.filter(t => t.window !== window);
        }
    }
}