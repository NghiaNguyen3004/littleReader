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
 * Preprocess text to improve pronunciation accuracy
 * This function normalizes text before sending it to TTS
 * @param {string} text - The raw text to preprocess
 * @returns {string} - Cleaned and normalized text
 */
function preprocessText(text) {
    let processed = text;

    // 1. Expand common abbreviations
    const abbreviations = {
        'Dr.': 'Doctor',
        'Mr.': 'Mister',
        'Mrs.': 'Missus',
        'Ms.': 'Miss',
        'Prof.': 'Professor',
        'Sr.': 'Senior',
        'Jr.': 'Junior',
        'St.': 'Street',
        'Ave.': 'Avenue',
        'Blvd.': 'Boulevard',
        'Rd.': 'Road',
        'Apt.': 'Apartment',
        'etc.': 'et cetera',
        'vs.': 'versus',
        'e.g.': 'for example',
        'i.e.': 'that is',
        'Inc.': 'Incorporated',
        'Corp.': 'Corporation',
        'Ltd.': 'Limited',
        'Co.': 'Company'
    };

    for (const [abbrev, expansion] of Object.entries(abbreviations)) {
        const regex = new RegExp('\\b' + abbrev.replace('.', '\\.'), 'g');
        processed = processed.replace(regex, expansion);
    }

    // 2. Convert numbers to words (basic implementation)
    // Handle ordinal numbers (1st, 2nd, 3rd, etc.)
    processed = processed.replace(/\b(\d+)(st|nd|rd|th)\b/g, (match, num, suffix) => {
        const ordinals = {
            '1': 'first', '2': 'second', '3': 'third', '4': 'fourth', '5': 'fifth',
            '6': 'sixth', '7': 'seventh', '8': 'eighth', '9': 'ninth', '10': 'tenth',
            '11': 'eleventh', '12': 'twelfth', '13': 'thirteenth', '14': 'fourteenth',
            '15': 'fifteenth', '16': 'sixteenth', '17': 'seventeenth', '18': 'eighteenth',
            '19': 'nineteenth', '20': 'twentieth', '21': 'twenty-first', '22': 'twenty-second',
            '23': 'twenty-third', '24': 'twenty-fourth', '25': 'twenty-fifth',
            '30': 'thirtieth', '31': 'thirty-first'
        };
        return ordinals[num] || match;
    });

    // Handle currency
    processed = processed.replace(/\$(\d+)/g, '$1 dollars');
    processed = processed.replace(/\£(\d+)/g, '$1 pounds');
    processed = processed.replace(/\€(\d+)/g, '$1 euros');

    // 3. Spell out common acronyms (you can expand this list)
    const acronyms = {
        'PDF': 'P D F',
        'HTML': 'H T M L',
        'CSS': 'C S S',
        'API': 'A P I',
        'URL': 'U R L',
        'HTTP': 'H T T P',
        'HTTPS': 'H T T P S',
        'FAQ': 'F A Q',
        'CEO': 'C E O',
        'CFO': 'C F O',
        'CTO': 'C T O',
        'USA': 'U S A',
        'UK': 'U K',
        'EU': 'E U',
        'NASA': 'N A S A',
        'FBI': 'F B I',
        'CIA': 'C I A'
    };

    for (const [acronym, spelled] of Object.entries(acronyms)) {
        const regex = new RegExp('\\b' + acronym + '\\b', 'g');
        processed = processed.replace(regex, spelled);
    }

    // 4. Clean up special characters that confuse TTS
    processed = processed.replace(/[~^]/g, ''); // Remove tildes and carets
    processed = processed.replace(/\.{4,}/g, '...'); // Normalize excessive periods
    processed = processed.replace(/!{2,}/g, '!'); // Normalize excessive exclamation marks
    processed = processed.replace(/\?{2,}/g, '?'); // Normalize excessive question marks
    processed = processed.replace(/_/g, ' '); // Replace underscores with spaces

    // 5. Normalize whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    console.log('✨ Text preprocessed for better pronunciation');
    return processed;
}

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

    // Preprocess text to improve pronunciation
    const processedText = preprocessText(text);

    // Default options
    const defaultOptions = {
        voice: null,        // Will use default voice if not specified
        rate: 1,            // Speed (0.1 to 10)
        pitch: 1,           // Pitch (0 to 2)
        volume: 1           // Volume (0 to 1)
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Split long text into sentence-based chunks (Web Speech API works better with complete sentences)
    textChunks = splitTextIntoChunks(processedText, 3); // 3 sentences per chunk
    currentChunkIndex = 0;

    console.log(`📝 Split text into ${textChunks.length} chunks for better speech quality`);

    // Start speaking the first chunk
    return speakNextChunk(finalOptions);
}

/**
 * Add natural pauses with punctuation for better speech flow
 * @param {string} text - The text to enhance with pauses
 * @returns {string} - Text with enhanced punctuation for natural pauses
 */
function addNaturalPauses(text) {
    let enhanced = text;

    // Add commas after common transitional phrases for natural pauses
    const transitions = [
        'However', 'Therefore', 'Furthermore', 'Moreover', 'Nevertheless',
        'Additionally', 'Consequently', 'Subsequently', 'Meanwhile',
        'In addition', 'For example', 'For instance', 'In fact', 'In contrast',
        'On the other hand', 'As a result', 'In conclusion', 'Finally'
    ];

    transitions.forEach(transition => {
        // Add comma after transition if not already present
        const regex = new RegExp(`\\b${transition}\\b(?!,)`, 'gi');
        enhanced = enhanced.replace(regex, `${transition},`);
    });

    // Ensure proper spacing after punctuation
    enhanced = enhanced.replace(/([.!?])\s*/g, '$1 '); // Space after sentence endings
    enhanced = enhanced.replace(/,\s*/g, ', '); // Space after commas
    enhanced = enhanced.replace(/:\s*/g, ': '); // Space after colons
    enhanced = enhanced.replace(/;\s*/g, '; '); // Space after semicolons

    // Normalize excessive spaces
    enhanced = enhanced.replace(/\s+/g, ' ').trim();

    return enhanced;
}

/**
 * Split text into sentence-based chunks for better speech synthesis
 * This ensures we never break in the middle of a sentence
 * @param {string} text - The text to split
 * @param {number} maxSentencesPerChunk - Maximum sentences per chunk (default: 3)
 * @returns {Array<string>} - Array of text chunks
 */
function splitTextIntoChunks(text, maxSentencesPerChunk = 3) {
    // Add natural pauses first
    const enhancedText = addNaturalPauses(text);

    // Split into sentences using multiple delimiters (. ! ?)
    // This regex captures the punctuation with the sentence
    const sentencePattern = /[^.!?]+[.!?]+/g;
    const sentences = enhancedText.match(sentencePattern);

    // If no sentences found (text without punctuation), return as single chunk
    if (!sentences || sentences.length === 0) {
        return [enhancedText];
    }

    const chunks = [];
    let currentChunk = [];

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        currentChunk.push(sentence);

        // Create chunk when we reach max sentences or end of text
        if (currentChunk.length >= maxSentencesPerChunk || i === sentences.length - 1) {
            const chunk = currentChunk.join(' ').trim();
            if (chunk) {
                chunks.push(chunk);
            }
            currentChunk = [];
        }
    }

    console.log(`✂️ Split into ${chunks.length} sentence-based chunks (${maxSentencesPerChunk} sentences per chunk)`);
    return chunks.length > 0 ? chunks : [enhancedText];
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