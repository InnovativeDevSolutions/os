/**
 * MarkdownParser - Markdown to HTML Converter
 * 
 * Simple markdown parser for converting markdown syntax to HTML.
 * Supports common markdown features:
 * - Headers (h1, h2, h3)
 * - Bold and italic text
 * - Unordered lists
 * - Code blocks
 * - Paragraphs
 * 
 * Used by SNet and other applications to display markdown documents.
 */
class MarkdownParser {
    /**
     * Parse markdown text to HTML
     * @param {string} text - Markdown text to parse
     * @returns {string} HTML string
     */
    static parse(text) {
        // Handle headers
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Handle bold and italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Handle lists
        text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

        // Handle code blocks
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Handle paragraphs
        text = text.replace(/\n\n([^<].*)/g, '<p>$1</p>');

        return text;
    }
}

// Register globally for use by applications
window.MarkdownParser = MarkdownParser;
