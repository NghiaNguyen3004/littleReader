/**
 * API CLIENT
 * ==========
 * This file manages communication with external APIs.
 * 
 * What does it do?
 * - Provides a centralized place for all API calls
 * - Handles errors from API requests
 * - Makes it easy to switch APIs in the future
 * 
 * Currently using:
 * - Puter.js for Text-to-Speech (FREE, no API key needed!)
 * 
 * Why Puter.js?
 * - 100% FREE with unlimited usage
 * - No sign-up or API keys required
 * - High-quality voices with multiple engines
 * - Simply include their script tag and start using
 */

/**
 * Fetch audio from Puter.js Text-to-Speech API
 * @param {string} text - The text to convert to speech
 * @param {object} options - Voice settings (voice, engine, language)
 * @returns {Promise<Audio>} - Audio object from Puter.js
 */
const fetchTTS = async (text, options = {}) => {
    try {
        // Validate that Puter.js is loaded
        if (typeof puter === 'undefined') {
            throw new Error('Puter.js is not loaded. Please check your internet connection.');
        }

        // Default options
        const defaultOptions = {
            voice: "Joanna",
            engine: "neural",
            language: "en-US"
        };

        // Merge options
        const finalOptions = { ...defaultOptions, ...options };

        // Call Puter.js TTS API
        const audio = await puter.ai.txt2speech(text, finalOptions);
        
        return audio;
    } catch (error) {
        console.error('Error fetching TTS:', error);
        throw new Error(`Failed to fetch audio: ${error.message}`);
    }
};

/**
 * Check if Puter.js is available
 * @returns {boolean} - True if Puter.js is loaded and ready
 */
const isPuterAvailable = () => {
    return typeof puter !== 'undefined' && typeof puter.ai !== 'undefined';
};

/**
 * Get information about available TTS engines
 * @returns {Array} - List of available engines with descriptions
 */
const getAvailableEngines = () => {
    return [
        {
            name: 'standard',
            description: 'Default engine with good quality',
            quality: 'Good'
        },
        {
            name: 'neural',
            description: 'Higher quality, more natural-sounding speech',
            quality: 'Better'
        },
        {
            name: 'generative',
            description: 'Most human-like speech using advanced AI',
            quality: 'Best'
        }
    ];
};