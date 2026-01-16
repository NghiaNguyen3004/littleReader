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
let readFootnotes = false; // Toggle for reading footnotes
let footnoteMap = new Map(); // Store footnote markers and their content

/**
 * Detect and extract footnotes from text
 * Recognizes patterns: [1], (1), ¹, ², *, †, ‡, §
 * @param {string} text - The text to process
 * @returns {object} - Object with cleanText and footnotes map
 */
function detectFootnotes(text) {
    const footnotes = new Map();
    let processedText = text;

    // Superscript number to regular number mapping
    const superscriptMap = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
    };

    // Pattern to match footnote markers in text
    // Matches: [1], (1), ¹, *, †, ‡, §, [*], etc.
    const markerPattern = /\[(\d+|\*|†|‡|§)\]|\((\d+|\*|†|‡|§)\)|([¹²³⁴⁵⁶⁷⁸⁹⁰]+)|([\*†‡§])(?!\w)/g;
    
    // Pattern to match footnote content at bottom of text
    // Matches: "1. Some footnote text" or "* Some footnote text"
    const footnoteContentPattern = /(?:^|\n)\s*(\d+|\*|†|‡|§)\.\s+([^\n]+(?:\n(?!\d+\.|\*\.|†\.|‡\.|§\.).+)*)/gm;

    // Extract footnote content first
    let match;
    let mainTextEnd = text.length;
    const footnoteContents = [];
    
    while ((match = footnoteContentPattern.exec(text)) !== null) {
        const marker = match[1];
        const content = match[2].trim();
        footnoteContents.push({ marker, content, index: match.index });
    }

    // If footnotes found at the end, separate main text from footnotes
    if (footnoteContents.length > 0) {
        // Find where footnotes section starts (usually last third of document)
        const firstFootnoteIndex = footnoteContents[0].index;
        const textLength = text.length;
        
        // If footnotes are in the last 40% of text, treat them as separate section
        if (firstFootnoteIndex > textLength * 0.6) {
            mainTextEnd = firstFootnoteIndex;
            
            // Store footnote content
            footnoteContents.forEach(({ marker, content }) => {
                footnotes.set(marker, content);
                console.log(`📝 Detected footnote ${marker}: ${content.substring(0, 50)}...`);
            });
        }
    }

    // Process main text only
    const mainText = text.substring(0, mainTextEnd);

    console.log(`📋 Found ${footnotes.size} footnotes in document`);
    return { cleanText: mainText, footnotes };
}

/**
 * Insert footnote readings into text at appropriate markers
 * @param {string} text - The text with footnote markers
 * @param {Map} footnotes - Map of footnote markers to content
 * @returns {string} - Text with footnotes inserted
 */
function insertFootnoteReadings(text, footnotes) {
    if (footnotes.size === 0) return text;

    let processedText = text;
    const superscriptMap = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
    };

    // Replace markers with marker + footnote content
    const markerPattern = /\[(\d+|\*|†|‡|§)\]|\((\d+|\*|†|‡|§)\)|([¹²³⁴⁵⁶⁷⁸⁹⁰]+)|([\*†‡§])(?!\w)/g;
    
    processedText = processedText.replace(markerPattern, (match, bracket, paren, superscript, symbol) => {
        let marker = bracket || paren || symbol;
        
        // Convert superscript to regular number
        if (superscript) {
            marker = '';
            for (let char of superscript) {
                marker += superscriptMap[char] || char;
            }
        }

        // Check if we have this footnote
        if (footnotes.has(marker)) {
            const footnoteContent = footnotes.get(marker);
            return `. Footnote ${marker}: ${footnoteContent}. `;
        }
        
        return match; // Keep original if no footnote found
    });

    return processedText;
}

/**
 * Set whether to read footnotes or not
 * @param {boolean} enabled - True to read footnotes, false to skip
 */
function setReadFootnotes(enabled) {
    readFootnotes = enabled;
    console.log(`📖 Footnote reading ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Get current footnote reading state
 * @returns {boolean} - Current state
 */
function getReadFootnotes() {
    return readFootnotes;
}

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
    processed = processed.replace(/£(\d+)/g, '$1 pounds');
    processed = processed.replace(/€(\d+)/g, '$1 euros');

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

    // Detect and extract footnotes
    const { cleanText, footnotes } = detectFootnotes(text);
    footnoteMap = footnotes;

    // If footnote reading is enabled, insert footnote content at markers
    let textToProcess = cleanText;
    if (readFootnotes && footnotes.size > 0) {
        textToProcess = insertFootnoteReadings(cleanText, footnotes);
        console.log(`📖 Footnote reading enabled - inserted ${footnotes.size} footnotes`);
    } else if (footnotes.size > 0) {
        console.log(`⏭️ Footnote reading disabled - skipping ${footnotes.size} footnotes`);
    }

    // Preprocess text to improve pronunciation
    const processedText = preprocessText(textToProcess);

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
function splitTextIntoChunks(text, maxSentencesPerChunk = 1) {
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
 * Cancel current speech synthesis without clearing text data
 * Used for seeking to preserve textChunks array
 */
function cancelSpeech() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
        isPaused = false;
        console.log('🔇 Speech cancelled (preserving text)');
    }
}

/**
 * Stop the current speech and clear all data
 * Used when user clicks Stop button
 */
function stopSpeech() {
    cancelSpeech();
    currentChunkIndex = 0;
    textChunks = [];
    console.log('⏹️ Speech stopped and cleared');
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

/**
 * Get current playback percentage
 * @returns {number} Current percentage (0-100)
 */
function getCurrentPercentage() {
    if (textChunks.length === 0) return 0;
    return Math.floor((currentChunkIndex / textChunks.length) * 100);
}

/**
 * Get current position information
 * @returns {object} Current position info
 */
function getCurrentPosition() {
    return {
        currentChunk: currentChunkIndex,
        totalChunks: textChunks.length,
        percentage: getCurrentPercentage(),
        remainingChunks: textChunks.length - currentChunkIndex
    };
}

/**
 * Seek to a specific percentage position (0-100)
 * @param {number} percentage - Percentage to seek to (0-100)
 * @param {object} options - Voice options
 */
function seekToPercentage(percentage, options) {
    if (percentage < 0 || percentage > 100) {
        console.error('Percentage must be between 0 and 100');
        return;
    }
    
    if (textChunks.length === 0) {
        console.error('No text loaded to seek');
        return;
    }
    
    // Calculate target chunk based on percentage
    const targetChunk = Math.floor((percentage / 100) * textChunks.length);
    
    // Cancel current speech (without clearing textChunks)
    cancelSpeech();
    
    // Jump to calculated chunk
    currentChunkIndex = Math.min(targetChunk, textChunks.length - 1);
    speakNextChunk(options);
    
    console.log(`⏩ Seeking to ${percentage}% (chunk ${currentChunkIndex + 1}/${textChunks.length})`);
}

/**
 * Jump to next chunk
 * @param {object} options - Voice options
 */
function seekNextChunk(options) {
    if (textChunks.length === 0) {
        console.error('No text loaded');
        return;
    }
    
    if (currentChunkIndex >= textChunks.length - 1) {
        console.log('Already at the last chunk');
        return;
    }
    
    // Cancel current speech (without clearing textChunks)
    cancelSpeech();
    
    // Move to next chunk
    currentChunkIndex++;
    speakNextChunk(options);
    
    console.log(`⏭️ Next chunk: ${currentChunkIndex + 1}/${textChunks.length}`);
}

/**
 * Jump to previous chunk
 * @param {object} options - Voice options
 */
function seekPreviousChunk(options) {
    if (textChunks.length === 0) {
        console.error('No text loaded');
        return;
    }
    
    if (currentChunkIndex <= 0) {
        console.log('Already at the first chunk');
        return;
    }
    
    // Cancel current speech (without clearing textChunks)
    cancelSpeech();
    
    // Move to previous chunk
    currentChunkIndex--;
    speakNextChunk(options);
    
    console.log(`⏮️ Previous chunk: ${currentChunkIndex + 1}/${textChunks.length}`);
}

/**
 * Jump forward by a percentage amount
 * @param {number} percentageAmount - Amount to jump forward (e.g., 10 for 10%)
 * @param {object} options - Voice options
 */
function seekForward(percentageAmount, options) {
    const currentPercentage = getCurrentPercentage();
    const newPercentage = Math.min(100, currentPercentage + percentageAmount);
    seekToPercentage(newPercentage, options);
}

/**
 * Jump backward by a percentage amount
 * @param {number} percentageAmount - Amount to jump backward (e.g., 10 for 10%)
 * @param {object} options - Voice options
 */
function seekBackward(percentageAmount, options) {
    const currentPercentage = getCurrentPercentage();
    const newPercentage = Math.max(0, currentPercentage - percentageAmount);
    seekToPercentage(newPercentage, options);
}