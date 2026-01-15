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
 * Think of it as the conductor of an orchestra, telling each musician (file) when to play!
 */

// Wait for the webpage to fully load before running our code
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Audiobook Player loaded successfully!');

    // Get references to HTML elements (like buttons and inputs)
    const pdfUpload = document.getElementById('pdfUpload');        // The file upload button
    const convertButton = document.getElementById('convertButton'); // The "Convert" button
    const audioPlayer = document.getElementById('audioPlayer');     // The audio player
    const statusDiv = document.getElementById('status');            // Status message area
    const voiceSelect = document.getElementById('voiceSelect');     // Voice dropdown
    const engineSelect = document.getElementById('engineSelect');   // Engine dropdown

    // Variable to store the extracted text from PDF
    let extractedText = '';

    /**
     * STEP 1: Handle PDF file upload
     * When user selects a PDF file, this code runs
     */
    pdfUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0]; // Get the selected file
        
        if (!file) {
            return; // Exit if no file was selected
        }

        // Check if it's actually a PDF file
        if (file.type !== 'application/pdf') {
            showStatus('❌ Please upload a PDF file!', 'error');
            return;
        }

        showStatus('📖 Reading PDF file...', 'loading');

        try {
            // Extract text from the PDF using our pdfHandler.js
            extractedText = await handlePDFUpload(file);
            
            if (extractedText && extractedText.length > 0) {
                showStatus(`✅ PDF loaded! Found ${extractedText.length} characters. Click "Convert to Audiobook" to continue.`, 'success');
                convertButton.disabled = false; // Enable the convert button
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
     * When user clicks "Convert to Audiobook", this code runs
     */
    convertButton.addEventListener('click', async () => {
        if (!extractedText) {
            showStatus('⚠️ Please upload a PDF file first!', 'error');
            return;
        }

        // Get selected voice and engine options
        const voice = voiceSelect.value;
        const engine = engineSelect.value;

        showStatus(`🎙️ Converting to speech using ${engine} engine...`, 'loading');
        convertButton.disabled = true; // Disable button during conversion

        try {
            // Get voice options
            const options = {
                voice: voice,
                engine: engine,
                language: 'en-US'
            };

            // Convert text to speech using Puter.js
            const audio = await convertTextToSpeech(extractedText, options);
            
            // Set the audio source to our player
            audioPlayer.src = audio.src;
            audioPlayer.style.display = 'block'; // Show the audio player
            
            showStatus('🎵 Audiobook ready! Press play to listen.', 'success');
            
            // Auto-play the audio
            audioPlayer.play();
            
        } catch (error) {
            console.error('Error converting to speech:', error);
            showStatus(`❌ Error: ${error.message}`, 'error');
        } finally {
            convertButton.disabled = false; // Re-enable the button
        }
    });

    /**
     * Helper function to show status messages
     * @param {string} message - The message to display
     * @param {string} type - Type of message: 'loading', 'success', or 'error'
     */
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    // Initially disable the convert button until a PDF is loaded
    convertButton.disabled = true;
});