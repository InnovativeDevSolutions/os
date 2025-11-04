/**
 * ComponentLoader - Dynamic Component Loading System
 * 
 * Handles asynchronous loading and initialization of Win99UI components.
 * Supports multiple file types per component:
 * - JavaScript (.js): Component logic and classes
 * - CSS (.css.b64): Compressed stylesheets (zlib deflate)
 * - HTML (.html): Component markup templates
 * 
 * Components are loaded via A3Bridge from Arma 3 file system and injected
 * into the DOM. CSS files are decompressed from base64-encoded zlib format
 * to reduce file size and improve loading performance.
 * 
 * Usage:
 * await ComponentLoader.loadComponent('taskbar');
 */
class ComponentLoader {
    /**
     * Component type definitions mapping
     * 
     * Defines which file types each component requires.
     * Components without entries default to ['js', 'css', 'html'].
     * 
     * File types:
     * - 'js': JavaScript module (loaded as inline script)
     * - 'css': Stylesheet (loaded as compressed .css.b64)
     * - 'html': Markup template (returned as string)
     * 
     * @type {Object<string, string[]>}
     */
    static componentTypes = {
        'overlay': ['js'],
        'wallpaper': ['js'],
        'dialog': ['js'],
        'desktop': ['js', 'css'],
        'window': ['js', 'css'],
        'taskbar': ['js', 'css', 'html'],
        'startmenu': ['js', 'css', 'html']
    };

    /**
     * Decompress zlib-compressed base64 data to blob URL
     * 
     * CSS files are stored as base64-encoded zlib deflate streams to reduce
     * file size. This method decodes and decompresses the data, then creates
     * a blob URL suitable for use in <link> href attributes.
     * 
     * Process:
     * 1. Decode base64 string to Uint8Array
     * 2. Decompress using DecompressionStream (deflate algorithm)
     * 3. Convert to ArrayBuffer via Response API
     * 4. Create and return blob URL
     * 
     * @param {string} base64string - Base64-encoded zlib compressed data
     * @returns {Promise<string>} Blob URL pointing to decompressed data
     */
    static async decompressZlibToDataURL(base64string) {
        const bytes = Uint8Array.from(atob(base64string), c => c.charCodeAt(0));
        const cs = new DecompressionStream('deflate');
        const writer = cs.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const arrayBuffer = await new Response(cs.readable).arrayBuffer();
        return URL.createObjectURL(new Blob([arrayBuffer]));
    }

    /**
     * Load a component and its required files
     * 
     * Main entry point for component loading. Loads all required files
     * based on componentTypes mapping, then applies them to the document:
     * - CSS: Injected as <link> element in <head>
     * - JS: Injected as <script> element in <body>
     * - HTML: Returned as string for caller to handle
     * 
     * Files are loaded from: Win99UI\components\{name}\{name}.{ext}
     * CSS files use special .css.b64 extension for compressed format.
     * 
     * @param {string} name - Component name (e.g., 'taskbar', 'window')
     * @returns {Promise<string>} HTML content if component has HTML file, empty string otherwise
     * @example
     * const html = await ComponentLoader.loadComponent('startmenu');
     * document.body.insertAdjacentHTML('beforeend', html);
     */
    static async loadComponent(name) {
        const requiredFiles = this.componentTypes[name] || ['js', 'css', 'html'];
        const files = {};

        // Load all required files for the component
        for (const fileType of requiredFiles) {
            if (fileType === 'css') {
                // Load compressed CSS file
                const compressedCss = await A3Bridge.loadFile(`Win99UI\\components\\${name}\\${name}.css.b64`);
                files[fileType] = await this.decompressZlibToDataURL(compressedCss);
            } else {
                files[fileType] = await A3Bridge.loadFile(`Win99UI\\components\\${name}\\${name}.${fileType}`);
            }
        }

        // Apply CSS if present
        if (files.css) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = files.css;
            document.head.appendChild(link);
        }

        // Apply JavaScript if present
        if (files.js) {
            this.injectJavaScript(files.js);
        }

        return files.html || '';
    }

    /**
     * Inject JavaScript code into document body
     * 
     * Creates a <script> element with the provided content and appends
     * it to document.body. Script executes immediately upon injection.
     * 
     * Used to load component classes and initialization code.
     * 
     * @param {string} jsContent - JavaScript code to execute
     */
    static injectJavaScript(jsContent) {
        const script = document.createElement('script');
        script.textContent = jsContent;
        document.body.appendChild(script);
    }
}