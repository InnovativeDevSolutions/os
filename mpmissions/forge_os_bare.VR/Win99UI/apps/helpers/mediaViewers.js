/**
 * Media Viewer Utilities
 * 
 * Helper functions for creating media viewer windows (video, audio, image, markdown).
 * Used by SNet and other applications to display media content in dedicated windows.
 */

const MediaViewers = {
    /**
     * Display video in dedicated viewer window
     * @param {string} relativePath - Path to video file
     * @param {HTMLElement} parentWindow - Parent window element for z-index stacking
     */
    async displayVideo(relativePath, parentWindow) {
        const videoWindow = new Window({
            title: 'Video Player',
            icon: 'FORGE_FX_File_Ico_Media_CA',
            width: 800,
            height: 600
        });

        videoWindow.element.style.zIndex = parseInt(parentWindow.style.zIndex || 1000) + 1;

        const content = videoWindow.element.querySelector('.content');
        content.style.padding = '0';
        content.innerHTML = `
            <div class="video-viewer">
                <div class="loading-indicator">Loading video...</div>
                <video controls style="display:none">
                    <source type="video/webm">
                </video>
            </div>
        `;

        const base64Content = await A3Bridge.loadFile(relativePath);
        const videoElement = content.querySelector('video');
        const loadingIndicator = content.querySelector('.loading-indicator');

        const videoDataUrl = `data:video/webm;base64,${base64Content}`;
        videoElement.querySelector('source').src = videoDataUrl;

        videoElement.addEventListener('loadeddata', () => {
            loadingIndicator.style.display = 'none';
            videoElement.style.display = 'block';
            videoWindow.element.querySelector('.status-bar').textContent = 'Video ready';
        });

        videoElement.addEventListener('error', (e) => {
            videoWindow.element.querySelector('.status-bar').textContent = 'Error loading video';
            console.error('Video loading error:', e.target.error);
        });

        videoElement.load();
    },

    /**
     * Display image in dedicated viewer window
     * @param {string} relativePath - Path to image file
     * @param {HTMLElement} parentWindow - Parent window element for z-index stacking
     */
    async displayImage(relativePath, parentWindow) {
        const imageWindow = new Window({
            title: 'Image Viewer',
            icon: 'FORGE_FX_File_Ico_Media_CA',
            width: 800,
            height: 600
        });

        imageWindow.element.style.zIndex = parseInt(parentWindow.style.zIndex || 1000) + 1;

        const content = imageWindow.element.querySelector('.content');
        content.innerHTML = `
            <div class="image-viewer">
                <div class="loading-indicator">Loading image...</div>
                <img style="display:none; max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
        `;

        const base64Content = await A3Bridge.loadFile(relativePath);
        const imgElement = content.querySelector('img');
        const loadingIndicator = content.querySelector('.loading-indicator');

        imgElement.src = `data:image/png;base64,${base64Content}`;
        imgElement.onload = () => {
            loadingIndicator.style.display = 'none';
            imgElement.style.display = 'block';
            imageWindow.element.querySelector('.status-bar').textContent = 'Image loaded';
        };
    },

    /**
     * Display audio in dedicated player window
     * @param {string} relativePath - Path to audio file
     * @param {HTMLElement} parentWindow - Parent window element for z-index stacking
     */
    async displayAudio(relativePath, parentWindow) {
        const audioWindow = new Window({
            title: 'Audio Player',
            icon: 'FORGE_FX_File_Ico_Media_CA',
            width: 400,
            height: 200
        });

        audioWindow.element.style.zIndex = parseInt(parentWindow.style.zIndex || 1000) + 1;

        const content = audioWindow.element.querySelector('.content');
        content.innerHTML = `
            <div class="audio-viewer">
                <div class="loading-indicator">Loading audio...</div>
                <audio controls style="display:none; width: 100%">
                    <source type="audio/mp3">
                </audio>
            </div>
        `;

        const base64Content = await A3Bridge.loadFile(relativePath);
        const audioElement = content.querySelector('audio');
        const loadingIndicator = content.querySelector('.loading-indicator');

        audioElement.querySelector('source').src = `data:audio/mp3;base64,${base64Content}`;
        audioElement.load();
        audioElement.onloadeddata = () => {
            loadingIndicator.style.display = 'none';
            audioElement.style.display = 'block';
            audioWindow.element.querySelector('.status-bar').textContent = 'Audio ready';
        };
    },

    /**
     * Display markdown in dedicated viewer window
     * @param {string} relativePath - Path to markdown file
     * @param {HTMLElement} parentWindow - Parent window element for z-index stacking
     * @param {Object} MarkdownParser - Markdown parser class with parse() method
     */
    async displayMarkdown(relativePath, parentWindow, MarkdownParser) {
        const mdWindow = new Window({
            title: 'Markdown Viewer',
            icon: 'FORGE_FX_File_Ico_Media_CA',
            width: 800,
            height: 600
        });

        mdWindow.element.style.zIndex = parseInt(parentWindow.style.zIndex || 1000) + 1;

        const content = mdWindow.element.querySelector('.content');
        content.innerHTML = `
            <div class="markdown-viewer">
                <div class="loading-indicator">Loading Markdown...</div>
                <div class="markdown-content" style="display:none"></div>
            </div>
        `;

        const base64Content = await A3Bridge.loadFile(relativePath);
        const decodedContent = atob(base64Content);
        const parsedContent = MarkdownParser.parse(decodedContent);

        const loadingIndicator = content.querySelector('.loading-indicator');
        const markdownContent = content.querySelector('.markdown-content');

        loadingIndicator.style.display = 'none';
        markdownContent.style.display = 'block';
        markdownContent.innerHTML = parsedContent;

        mdWindow.element.querySelector('.status-bar').textContent = 'Markdown document loaded';
    }
};

// Register globally for use by applications
window.MediaViewers = MediaViewers;
