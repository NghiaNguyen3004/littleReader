/**
 * MAIN APPLICATION FILE (app.js)
 * ==============================
 * This is the "brain" of our audiobook player!
 * 
 * What does this file do?
 * - Waits for the page to load completely
 * - Sets up button clicks and file uploads
 * - Connects all the other files together
 * - Controls the flow: Upload PDF → Extract Text → Convert to Speech → Play Audio
 * 
 * Now using: Web Speech API (Built into browsers - 100% free!)
 */

// Wait for the webpage to fully load before running our code
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎵 Audiobook Player loaded successfully!');

    // Check if browser supports Web Speech API
    if (!('speechSynthesis' in window)) {
        alert('❌ Your browser does not support the Web Speech API. Please use Chrome, Edge, Safari, or Firefox.');
        return;
    }

    // Get references to HTML elements
    const pdfUpload = document.getElementById('pdfUpload');
    const convertButton = document.getElementById('convertButton');
    const statusDiv = document.getElementById('status');
    const voiceSelect = document.getElementById('voiceSelect');
    const rateSelect = document.getElementById('rateSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    const playbackControls = document.getElementById('playbackControls');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const progressInfo = document.getElementById('progressInfo');
    const currentTextSpan = document.getElementById('currentText');
    const progressPercent = document.getElementById('progressPercent');

    // Variable to store the extracted text from PDF
    let extractedText = '';

    // Load available voices
    await loadVoices();

    /**
     * Load and populate voice options
     */
    async function loadVoices() {
        const voices = await getAvailableVoices();
        
        if (voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices available</option>';
            return;
        }

        // Clear loading message
        voiceSelect.innerHTML = '';

        // Group voices by language
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const otherVoices = voices.filter(v => !v.lang.startsWith('en'));

        // Add English voices first
        if (englishVoices.length > 0) {
            const englishGroup = document.createElement('optgroup');
            englishGroup.label = 'English Voices';
            englishVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.default) option.selected = true;
                englishGroup.appendChild(option);
            });
            voiceSelect.appendChild(englishGroup);
        }

        // Add other language voices
        if (otherVoices.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = 'Other Languages';
            otherVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                otherGroup.appendChild(option);
            });
            voiceSelect.appendChild(otherGroup);
        }

        console.log(`✅ Loaded ${voices.length} voices`);
    }

    /**
     * STEP 1: Handle PDF file upload
     */
    pdfUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showStatus('❌ Please upload a PDF file!', 'error');
            return;
        }

        showStatus('📖 Reading PDF file...', 'loading');

        try {
            extractedText = await handlePDFUpload(file);
            
            if (extractedText && extractedText.length > 0) {
                showStatus(`✅ PDF loaded! Found ${extractedText.length} characters. Click "Convert to Audiobook" to continue.`, 'success');
                convertButton.disabled = false;
            } else {
                showStatus('⚠️ No text found in PDF. Make sure the PDF contains readable text.', 'error');
            }
        } catch (error) {
            console.error('Error reading PDF:', error);
            showStatus(`❌ Error reading PDF: ${error.message}`, 'error');
        }
    });

    /**
     * STEP 2: Convert text to speech
     */
    convertButton.addEventListener('click', async () => {
        if (!extractedText) {
            showStatus('⚠️ Please upload a PDF file first!', 'error');
            return;
        }

        // Stop any currently playing speech
        stopSpeech();

        // Get selected options
        const selectedVoiceName = voiceSelect.value;
        const rate = parseFloat(rateSelect.value);
        const pitch = parseFloat(pitchSelect.value);

        showStatus('🎙️ Converting to speech...', 'loading');
        convertButton.disabled = true;

        try {
            // Find the selected voice object
            const voices = await getAvailableVoices();
            const selectedVoice = voices.find(v => v.name === selectedVoiceName);

            const options = {
                voice: selectedVoice,
                rate: rate,
                pitch: pitch,
                volume: 1.0
            };

            // Convert and start speaking
            await convertTextToSpeech(extractedText, options);
            
            showStatus('🎵 Speaking! Use the controls below to pause/resume/stop.', 'success');
            playbackControls.style.display = 'flex';
            progressInfo.style.display = 'block';
            
            // Update progress display
            currentTextSpan.textContent = extractedText.substring(0, 100) + '...';
            
        } catch (error) {
            console.error('Error converting to speech:', error);
            showStatus(`❌ Error: ${error.message}`, 'error');
        } finally {
            convertButton.disabled = false;
        }
    });

    /**
     * Pause button handler
     */
    pauseBtn.addEventListener('click', () => {
        pauseSpeech();
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        showStatus('⏸️ Paused', 'loading');
    });

    /**
     * Resume button handler
     */
    resumeBtn.addEventListener('click', () => {
        resumeSpeech();
        resumeBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        showStatus('▶️ Speaking...', 'success');
    });

    /**
     * Stop button handler
     */
    stopBtn.addEventListener('click', () => {
        stopSpeech();
        playbackControls.style.display = 'none';
        progressInfo.style.display = 'none';
        resumeBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        showStatus('⏹️ Stopped', 'loading');
    });

    /**
     * Helper function to show status messages
     */
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    // Initially disable the convert button
    convertButton.disabled = true;

    // Reload voices when they change (some browsers load them asynchronously)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
});