/**
 * TEXT-TO-SPEECH CONVERTER
 * ========================
 * This file handles converting text into speech using the Web Speech API.
 * 
 * What is the Web Speech API?
 * - A BUILT-IN browser API (no external libraries needed!)
 * - 100% FREE and truly UNLIMITED
 * - Works OFFLINE
 * - Available in Chrome, Edge, Safari, and Firefox
 * 
 * How it works:
 * 1. Uses the browser's built-in speech synthesis engine
 * 2. Creates "utterances" (chunks of text to speak)
 * 3. Uses the SpeechSynthesis API to speak them
 * 
 * Documentation: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */

// Store the current speech synthesis instance
let currentUtterance = null;
let isPaused = false;
let textChunks = [];
let currentChunkIndex = 0;

/**
 * Convert text to speech using Web Speech API
 * @param {string} text - The text to convert to speech
 * @param {object} options - Voice options (voice, rate, pitch)
 * @returns {Promise<void>} - Returns a promise that resolves when speech starts
 */
async function convertTextToSpeech(text, options = {}) {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
        throw new Error('Your browser does not support the Web Speech API. Please use Chrome, Edge, Safari, or Firefox.');
    }

    // Stop any currently playing speech
    stopSpeech();

    // Default options
    const defaultOptions = {
        voice: null,        // Will use default voice if not specified
        rate: 1,            // Speed (0.1 to 10)
        pitch: 1,           // Pitch (0 to 2)
        volume: 1           // Volume (0 to 1)
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Split long text into smaller chunks (Web Speech API works better with chunks)
    textChunks = splitTextIntoChunks(text, 200); // 200 characters per chunk
    currentChunkIndex = 0;

    console.log(`📝 Split text into ${textChunks.length} chunks for better speech quality`);

    // Start speaking the first chunk
    return speakNextChunk(finalOptions);
}

/**
 * Split text into smaller chunks for better speech synthesis
 * @param {string} text - The text to split
 * @param {number} maxLength - Maximum characters per chunk
 * @returns {Array<string>} - Array of text chunks
 */
function splitTextIntoChunks(text, maxLength = 200) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
}

/**
 * Speak the next chunk of text
 * @param {object} options - Voice options
 * @returns {Promise<void>}
 */
function speakNextChunk(options) {
    return new Promise((resolve, reject) => {
        if (currentChunkIndex >= textChunks.length) {
            console.log('✅ Finished speaking all chunks');
            resolve();
            return;
        }

        const textToSpeak = textChunks[currentChunkIndex];
        console.log(`🎤 Speaking chunk ${currentChunkIndex + 1}/${textChunks.length}`);

        // Create a new speech synthesis utterance
        currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

        // Set voice options
        if (options.voice) {
            currentUtterance.voice = options.voice;
        }
        currentUtterance.rate = options.rate || 1;
        currentUtterance.pitch = options.pitch || 1;
        currentUtterance.volume = options.volume || 1;

        // Event handlers
        currentUtterance.onstart = () => {
            console.log('▶️ Started speaking');
            isPaused = false;
        };

        currentUtterance.onend = () => {
            console.log(`✅ Finished chunk ${currentChunkIndex + 1}`);
            currentChunkIndex++;
            
            // Speak next chunk
            if (currentChunkIndex < textChunks.length) {
                setTimeout(() => speakNextChunk(options), 100); // Small delay between chunks
            } else {
                resolve();
            }
        };

        currentUtterance.onerror = (event) => {
            console.error('❌ Speech synthesis error:', event);
            reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        // Start speaking
        window.speechSynthesis.speak(currentUtterance);
        resolve();
    });
}

/**
 * Pause the current speech
 */
function pauseSpeech() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        isPaused = true;
        console.log('⏸️ Speech paused');
    }
}

/**
 * Resume the paused speech
 */
function resumeSpeech() {
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        isPaused = false;
        console.log('▶️ Speech resumed');
    }
}

/**
 * Stop the current speech
 */
function stopSpeech() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
        currentChunkIndex = 0;
        textChunks = [];
        isPaused = false;
        console.log('⏹️ Speech stopped');
    }
}

/**
 * Get available voices from the browser
 * @returns {Array} - List of available voices
 */
function getAvailableVoices() {
    return window.speechSynthesis.getVoices();
}

/**
 * Check if speech is currently playing
 * @returns {boolean}
 */
function isSpeaking() {
    return window.speechSynthesis.speaking;
}

/**
 * Check if speech is paused
 * @returns {boolean}
 */
function isSpeechPaused() {
    return isPaused;
}