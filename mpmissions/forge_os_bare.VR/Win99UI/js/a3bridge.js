/**
 * A3Bridge - Arma 3 Communication Bridge
 * 
 * Provides a JavaScript interface to Arma 3's native APIs for:
 * - Resource loading (textures, files, preprocessed files)
 * - UI interactions (alerts, confirmations)
 * - Bidirectional communication between SQF and JavaScript
 * 
 * This bridge wraps the low-level A3API provided by Arma 3's HTML dialog system,
 * adding error handling, consistent return types, and cleaner async/await patterns.
 * 
 * All methods return Promises to support asynchronous resource loading from the
 * game engine's file system and network resources.
 * 
 * @namespace A3Bridge
 */
const A3Bridge = {
    /**
     * Load texture icon from Arma 3 resources
     * 
     * Loads PAA (PAX image) textures from the FORGE_OS\\data directory
     * and converts them to base64-encoded data URLs for use in HTML/CSS.
     * 
     * The texture is automatically requested at 4096px max resolution
     * and scaled down by the browser as needed.
     * 
     * Used primarily for:
     * - Desktop icons (default and selected states)
     * - Start menu icons
     * - Taskbar icons
     * - Window title bar icons
     * 
     * @param {string} filename - Texture filename without path or extension (e.g., 'FORGE_FX_Desktop_Ico_Notepad01_CA')
     * @returns {Promise<string|null>} Base64 data URL (image/png) or null if loading fails
     * @example
     * const icon = await A3Bridge.loadIcon('FORGE_FX_Desktop_Ico_Notepad01_CA');
     * element.style.backgroundImage = `url(${icon})`;
     */
    loadIcon: async function (filename) {
        try {
            const texture = await A3API.RequestTexture(`FORGE_OS\\data\\${filename}.paa`, 4096);
            return texture || null;
        } catch (error) {
            console.warn(`Texture loading failed for: ${filename}`);
            return null;
        }
    },

    /**
     * Load text file from Arma 3 file system
     * 
     * Loads raw file content as a string from the mission directory.
     * Supports any text-based file format:
     * - JavaScript (.js)
     * - HTML (.html)
     * - CSS (.css)
     * - JSON (.json)
     * - Plain text (.txt)
     * - Base64-encoded binary (.b64)
     * 
     * Path is relative to mission root directory.
     * 
     * Used by:
     * - ComponentLoader for loading UI components
     * - Win99OS for loading application scripts
     * - Applications for loading templates and data
     * 
     * @param {string} path - File path relative to mission root (e.g., 'Win99UI\\components\\taskbar\\taskbar.js')
     * @returns {Promise<string|null>} File content as string, or null if loading fails
     * @example
     * const html = await A3Bridge.loadFile('Win99UI\\components\\taskbar\\taskbar.html');
     */
    loadFile: async function (path) {
        try {
            const content = await A3API.RequestFile(path);
            return content;
        } catch (error) {
            console.log('Error loading file:', error);
            return null;
        }
    },

    /**
     * Load and preprocess file using Arma 3's preprocessor
     * 
     * Similar to loadFile but runs the content through Arma 3's SQF
     * preprocessor first. This enables:
     * - #include directives
     * - #define macros
     * - Conditional compilation (#ifdef, #ifndef)
     * - Macro expansion
     * 
     * Primarily used for SQF scripts but can preprocess any text file.
     * The preprocessor syntax is similar to C preprocessor.
     * 
     * Note: Currently used for loading configuration files with includes.
     * Most Win99UI files use direct loading for simplicity.
     * 
     * @param {string} path - File path relative to mission root
     * @returns {Promise<string|null>} Preprocessed file content, or null if loading fails
     * @example
     * const config = await A3Bridge.loadPreprocessedFile('config.sqf');
     */
    loadPreprocessedFile: async function (path) {
        try {
            const file = await A3API.RequestPreprocessedFile(path);
            return file || null;
        } catch (error) {
            console.warn(`Preprocessed file loading failed for: ${path}`);
            return null;
        }
    },

    /**
     * Send alert message to Arma 3
     * 
     * Displays a message in Arma 3's notification system.
     * The alert appears as an in-game notification and is logged
     * to the game's system chat/RPT log.
     * 
     * Non-blocking - does not wait for user acknowledgment.
     * 
     * @param {string} content - Alert message text
     * @example
     * A3Bridge.sendAlert('File saved successfully');
     */
    sendAlert: function (content) {
        A3API.SendAlert(content);
    },

    /**
     * Send confirmation dialog to Arma 3
     * 
     * Displays a confirmation dialog in Arma 3 and waits for user response.
     * This is a blocking async operation - execution pauses until the
     * user responds.
     * 
     * Used for operations requiring user confirmation:
     * - Closing unsaved documents
     * - Deleting items
     * - Logging off/shutting down
     * 
     * @param {string} content - Confirmation question text
     * @returns {Promise<string|null>} User response ('yes', 'no', etc.) or null if request fails
     * @example
     * const response = await A3Bridge.sendConfirm('Save changes before closing?');
     * if (response === 'yes') { saveFile(); }
     */
    sendConfirm: async function (content) {
        try {
            const response = await A3API.SendConfirm(content);
            return response;
        } catch (error) {
            console.warn(`Confirmation request failed: ${error}`);
            return null;
        }
    }
};