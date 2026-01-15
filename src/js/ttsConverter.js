/**
 * TEXT-TO-SPEECH CONVERTER
 * ========================
 * This file handles converting text into speech using Puter.js API.
 * 
 * What is Puter.js?
 * - A FREE text-to-speech API (no API keys needed!)
 * - Unlimited usage
 * - Multiple voices and languages
 * - Three quality engines: standard, neural, and generative
 * 
 * How it works:
 * 1. Takes text from the PDF
 * 2. Sends it to Puter.js using puter.ai.txt2speech()
 * 3. Returns an audio object that can be played
 */

/**
 * Convert text to speech using Puter.js
 * @param {string} text - The text to convert to speech
 * @param {object} options - Voice options (voice, engine, language)
 * @returns {Promise<Audio>} - Returns an Audio object that can be played
 */
async function convertTextToSpeech(text, options = {}) {
    // Default options for voice conversion
    const defaultOptions = {
        voice: "Joanna",      // Default female voice
        engine: "neural",     // Neural engine for better quality
        language: "en-US"     // English (US)
    };

    // Merge user options with defaults
    const finalOptions = { ...defaultOptions, ...options };

    try {
        // Check if text is too long (Puter.js has a 3000 character limit)
        if (text.length > 3000) {
            console.warn('Text is too long, splitting into chunks...');
            return await convertLongText(text, finalOptions);
        }

        // Use Puter.js to convert text to speech
        // This returns an Audio object directly
        const audio = await puter.ai.txt2speech(text, finalOptions);
        
        return audio;
    } catch (error) {
        console.error('Error converting text to speech:', error);
        throw new Error(`TTS conversion failed: ${error.message}`);
    }
}

/**
 * Convert long text by splitting it into chunks
 * @param {string} text - The long text to convert
 * @param {object} options - Voice options
 * @returns {Promise<Array>} - Array of audio objects
 */
async function convertLongText(text, options) {
    const maxLength = 3000;
    const chunks = [];
    
    // Split text into sentences to avoid cutting words
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = sentence;
            } else {
                // If a single sentence is too long, force split it
                chunks.push(sentence.substring(0, maxLength));
                currentChunk = sentence.substring(maxLength);
            }
        } else {
            currentChunk += sentence;
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    // Convert each chunk to audio
    const audioPromises = chunks.map(chunk => puter.ai.txt2speech(chunk, options));
    return await Promise.all(audioPromises);
}

/**
 * Get available voices
 * @returns {Array} - List of available voices
 */
function getAvailableVoices() {
    return [
        { name: "Joanna", gender: "Female", language: "en-US" },
        { name: "Matthew", gender: "Male", language: "en-US" },
        { name: "Salli", gender: "Female", language: "en-US" },
        { name: "Joey", gender: "Male", language: "en-US" },
        { name: "Amy", gender: "Female", language: "en-GB" },
        { name: "Brian", gender: "Male", language: "en-GB" }
    ];
}