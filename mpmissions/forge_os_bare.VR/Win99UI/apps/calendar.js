/**
 * Calendar Application
 * 
 * A comprehensive calendar and event management system providing:
 * - Monthly calendar view with navigation
 * - Event creation, viewing, and deletion
 * - Event list panel with descriptions
 * - Status bar showing next event and event count
 * - Persistent storage via profile namespace
 * - Color-coded event display on calendar days
 * 
 * Events are synchronized with Arma 3 backend for persistent storage
 * and can be shared across sessions.
 */

/**
 * CalendarComponents - UI component templates
 * Contains HTML template functions for calendar UI elements
 */
const CalendarComponents = {
    /**
     * Create calendar header with month navigation
     * @param {Date} currentDate - Current date being displayed
     * @returns {string} HTML string for calendar header
     */
    createHeader: (currentDate) => `
        <div class="calendar-header">
            <button class="prev-month" aria-label="previous">3</button>
            <h2 class="current-month">${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}</h2>
            <button class="next-month" aria-label="next">4</button>
        </div>
    `,

    /**
     * Create calendar grid structure
     * @returns {string} HTML string for calendar grid container
     */
    createGrid: () => `
        <div class="calendar-grid">
            <div class="weekdays"></div>
            <div class="days"></div>
        </div>
    `,

    /**
     * Create event list container
     * @returns {string} HTML string for event list panel
     */
    createEventList: () => `
        <div class="event-list"></div>
    `,

    /**
     * Create event creation dialog form
     * @returns {string} HTML string for event form
     */
    createEventDialog: () => `
        <div class="event-form">
            <label>Title: <input type="text" class="event-title"></label>
            <label>Time: <input type="time" class="event-time"></label>
            <label>Description: <textarea class="event-desc"></textarea></label>
        </div>
    `
};

/**
 * EventManager - Static utility class for event operations
 * Provides helper methods for event formatting, sorting, and display
 */
class EventManager {
    /**
     * Get formatted text for next upcoming event
     * @param {Array<Object>} events - Array of event objects
     * @returns {string} Formatted text showing next event or "None"
     */
    static getNextEventText(events) {
        if (!events.length) return 'Next Event: None';

        const sortedEvents = [...events].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        const now = new Date();
        const nextEvent = sortedEvents.find(event => {
            const eventDate = new Date(`${event.date} ${event.time}`);
            return eventDate > now;
        });

        return nextEvent ?
            `Next Event: "${nextEvent.title}" ${nextEvent.date} ${nextEvent.time}` :
            'Next Event: None';
    }

    /**
     * Get formatted text for event count
     * @param {Array<Object>} events - Array of event objects
     * @returns {string} Formatted event count text
     */
    static getEventCountText(events) {
        const count = events.length;
        return `${count} event${count !== 1 ? 's' : ''}, ${count} in list`;
    }

    /**
     * Format event as list item HTML
     * @param {Object} event - Event object
     * @param {string} event.id - Event unique identifier
     * @param {string} event.date - Event date
     * @param {string} event.time - Event time
     * @param {string} event.title - Event title
     * @param {string} event.description - Event description
     * @returns {string} HTML string for event list item
     */
    static formatEventItem(event) {
        return `
            <div class="event-item">
                <div class="event-header">
                    <strong>${event.date}</strong>: ${event.time} - ${event.title}
                    <button class="delete-event" data-id="${event.id}">Delete</button>
                </div>
                <div class="event-description">
                    ${event.description || 'No description provided'}
                </div>
            </div>
        `;
    }
}

/**
 * Calendar - Main calendar application class
 * Extends Window base class to provide calendar functionality
 */
class Calendar extends Window {
    /**
     * Create a new Calendar instance
     * Initializes calendar with current date and empty events array
     */
    constructor() {
        super({
            title: 'Calendar',
            icon: 'FORGE_FX_Desktop_Ico_MyEvents01_CA',
            width: 800,
            height: 600
        });

        this.element.classList.add('calendar-window');
        this.currentDate = new Date();
        this.events = [];
        this.initCalendar();
    }

    /**
     * Initialize calendar layout and components
     */
    initCalendar() {
        const windowBody = this.element.querySelector('.window-body');
        windowBody.innerHTML = `
            ${CalendarComponents.createHeader(this.currentDate)}
            ${CalendarComponents.createGrid()}
            ${CalendarComponents.createEventList()}
        `;

        this.renderCalendar();
        this.initEventHandlers();
        this.loadEvents();
        this.setupStatusBar();
    }

    /**
     * Set up status bar with event information
     */
    setupStatusBar() {
        const statusBar = this.element.querySelector('.status-bar');
        statusBar.innerHTML = `
            <div class='status-bar-field' style='max-width: 300px'>&nbsp;</div>
            <div class='status-bar-field' style='flex: 1'>${EventManager.getNextEventText(this.events)}</div>
            <div class='status-bar-field' style='max-width: 100px'>${EventManager.getEventCountText(this.events)}</div>
        `;
    }

    /**
     * Initialize event handlers for calendar interactions
     * Sets up month navigation and day click handlers
     */
    initEventHandlers() {
        // Month navigation - previous month button
        this.element.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        // Month navigation - next month button
        this.element.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Day selection and event creation
        const daysContainer = this.element.querySelector('.days');
        daysContainer.addEventListener('click', (e) => {
            const dayCell = e.target.closest('.calendar-day');
            if (!dayCell) return;

            const date = dayCell.dataset.date;
            this.showEventDialog(date);
        });
    }

    /**
     * Render calendar grid with days and events
     */
    renderCalendar() {
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();

        // Update month/year display
        const monthDisplay = this.element.querySelector('.current-month');
        monthDisplay.textContent = `${this.currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        // Render weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdaysContainer = this.element.querySelector('.weekdays');
        weekdaysContainer.innerHTML = weekdays.map(day =>
            `<div class="weekday">${day}</div>`
        ).join('');

        // Calculate calendar grid
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Generate calendar days
        const daysContainer = this.element.querySelector('.days');
        let daysHTML = '';

        // Add empty cells for days before start of month
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            daysHTML += `
                <div class="calendar-day" data-date="${year}-${month + 1}-${day}">
                    <div class="day-number">${day}</div>
                    <div class="day-events"></div>
                </div>
            `;
        }

        daysContainer.innerHTML = daysHTML;
        this.renderEvents();
    }

    /**
     * Show dialog for creating new events
     * @param {string} date - Date string for the event (YYYY-MM-DD format)
     */
    showEventDialog(date) {
        const dialog = new Dialog({
            title: 'Add Event',
            content: CalendarComponents.createEventDialog(),
            buttons: [{
                text: 'Save',
                onClick: () => this.saveEvent(date)
            }, {
                text: 'Cancel',
                onClick: () => dialog.hide()
            }]
        });

        dialog.mount(this.element);
        dialog.show();
    }

    /**
     * Save new event to calendar
     * Creates event object, saves to local array, and sends to Arma backend
     * @param {string} date - Date string for the event (YYYY-MM-DD format)
     */
    saveEvent(date) {
        const form = this.element.querySelector('.event-form');
        const title = form.querySelector('.event-title').value;
        const time = form.querySelector('.event-time').value;
        const description = form.querySelector('.event-desc').value;

        const event = {
            id: new Date().toISOString(),
            date: date,
            title: title,
            time: time,
            description: description
        };

        this.events.push(event);
        A3Bridge.sendAlert(JSON.stringify({
            command: "SAVE_CALENDAR_EVENT",
            data: event
        }));
        this.renderEvents();

        const dialog = this.element.querySelector('.win99-dialog');
        if (dialog && dialog.winObj) {
            dialog.winObj.remove();
        } else if (dialog) {
            dialog.remove();
        }

        this.setupStatusBar();
    }

    /**
     * Render events on calendar and in list
     */
    renderEvents() {
        // Render events on calendar days
        const days = this.element.querySelectorAll('.calendar-day');
        days.forEach(day => {
            if (!day.dataset.date) return;

            const dayEvents = this.events.filter(event => event.date === day.dataset.date);
            const eventsContainer = day.querySelector('.day-events');

            eventsContainer.innerHTML = dayEvents.map(event => `
                <div class="event" data-event-id="${event.id}">
                    ${event.time} - ${event.title}
                </div>
            `).join('');
        });

        this.updateEventList();
    }

    /**
     * Update the event list panel
     * Filters events for current month and renders them in the list panel
     * Binds delete handlers to each event's delete button
     */
    updateEventList() {
        const eventList = this.element.querySelector('.event-list');
        const month = this.currentDate.getMonth() + 1;
        const year = this.currentDate.getFullYear();

        const monthEvents = this.events.filter(event => {
            const [eventYear, eventMonth] = event.date.split('-');
            return parseInt(eventMonth) === month && parseInt(eventYear) === year;
        });

        eventList.innerHTML = monthEvents.map(event =>
            EventManager.formatEventItem(event)
        ).join('');

        // Bind delete event handlers
        eventList.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', () => {
                this.deleteEvent(button.dataset.id);
            });
        });
    }

    /**
     * Delete event and update displays
     * Removes event from local array, sends delete command to backend,
     * and refreshes the calendar display
     * @param {string} eventId - Unique identifier of the event to delete
     */
    deleteEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);

        A3Bridge.sendAlert(JSON.stringify({
            command: 'DELETE_CALENDAR_EVENT',
            data: { id: eventId }
        }));

        this.renderEvents();
        this.setupStatusBar();
    }

    /**
     * Load events from storage
     * Sends request to Arma backend to load saved events from profile namespace
     */
    loadEvents() {
        A3Bridge.sendAlert(JSON.stringify({
            command: 'LOAD_CALENDAR_EVENTS'
        }));
    }
}

/**
 * Register Calendar application globally for OS launcher
 */
window.Calendar = Calendar;
