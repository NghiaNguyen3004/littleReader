/**
 * API CLIENT
 * ==========
 * This file manages communication with the Web Speech API.
 * 
 * What does it do?
 * - Provides helper functions for the Speech Synthesis API
 * - Handles voice selection and management
 * - Provides utility functions for speech control
 * 
 * Currently using:
 * - Web Speech API (SpeechSynthesis) - Built into browsers!
 * 
 * Why Web Speech API?
 * - 100% FREE with truly unlimited usage
 * - No sign-up, no API keys, no external servers
 * - Works OFFLINE
 * - Built into modern browsers (Chrome, Edge, Safari, Firefox)
 * - Multiple voices available
 */

/**
 * Get all available voices from the browser
 * Note: Voices load asynchronously, so we need to wait for them
 * @returns {Promise<Array>} - Array of available voice objects
 */
const getAvailableVoices = () => {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            resolve(voices);
            return;
        }

        // Voices might not be loaded yet, wait for them
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        };
        
        // Fallback timeout
        setTimeout(() => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        }, 100);
    });
};

/**
 * Get voices filtered by language
 * @param {string} language - Language code (e.g., 'en-US', 'en-GB')
 * @returns {Promise<Array>} - Array of voices for that language
 */
const getVoicesByLanguage = async (language = 'en') => {
    const allVoices = await getAvailableVoices();
    return allVoices.filter(voice => voice.lang.startsWith(language));
};

/**
 * Find a specific voice by name
 * @param {string} voiceName - Name of the voice to find
 * @returns {Promise<Object|null>} - Voice object or null if not found
 */
const findVoiceByName = async (voiceName) => {
    const allVoices = await getAvailableVoices();
    return allVoices.find(voice => voice.name === voiceName) || null;
};

/**
 * Get default voice for a language
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Object|null>} - Default voice object
 */
const getDefaultVoice = async (language = 'en') => {
    const voices = await getVoicesByLanguage(language);
    
    // Try to find a default voice
    const defaultVoice = voices.find(voice => voice.default);
    if (defaultVoice) return defaultVoice;
    
    // Return first available voice for that language
    return voices[0] || null;
};

/**
 * Check if Web Speech API is available
 * @returns {boolean} - True if available, false otherwise
 */
const isSpeechSynthesisAvailable = () => {
    return 'speechSynthesis' in window;
};

/**
 * Get speech synthesis status
 * @returns {Object} - Object with status information
 */
const getSpeechStatus = () => {
    if (!isSpeechSynthesisAvailable()) {
        return {
            available: false,
            speaking: false,
            paused: false,
            pending: false
        };
    }

    return {
        available: true,
        speaking: window.speechSynthesis.speaking,
        paused: window.speechSynthesis.paused,
        pending: window.speechSynthesis.pending
    };
};

/**
 * Format voice information for display
 * @param {Object} voice - Voice object from Speech Synthesis API
 * @returns {string} - Formatted voice name
 */
const formatVoiceName = (voice) => {
    if (!voice) return 'Unknown Voice';
    
    // Extract useful info
    const name = voice.name;
    const lang = voice.lang;
    const local = voice.localService ? '(Local)' : '(Online)';
    
    return `${name} [${lang}] ${local}`;
};