/**
 * PDF HANDLER
 * ===========
 * This file handles PDF files and extracts text from them.
 * 
 * What does it do?
 * - Reads PDF files that users upload
 * - Extracts all the text from every page
 * - Returns the text so we can convert it to speech
 * 
 * How does it work?
 * - Uses the FileReader API to read the PDF file
 * - Uses PDF.js library (from Mozilla) to parse PDF structure
 * - Goes through each page and collects all text
 * 
 * Think of it as a "PDF reader" that can see and copy text from PDFs!
 */

/**
 * Handle PDF file upload and extract text
 * @param {File} file - The PDF file uploaded by the user
 * @returns {Promise<string>} - A promise that resolves with the extracted text
 */
function handlePDFUpload(file) {
    return new Promise((resolve, reject) => {
        // FileReader is a built-in browser tool that can read files
        const reader = new FileReader();
        
        // This function runs when the file is successfully read
        reader.onload = function(event) {
            console.log('📄 PDF file loaded, extracting text...');
            const pdfData = event.target.result; // The raw PDF data
            
            // Now extract the text from the PDF
            extractTextFromPDF(pdfData)
                .then(text => {
                    console.log(`✅ Extracted ${text.length} characters from PDF`);
                    resolve(text); // Success! Return the text
                })
                .catch(err => reject(err)); // Handle errors
        };

        // This function runs if there's an error reading the file
        reader.onerror = function(event) {
            reject(new Error("Error reading PDF file"));
        };

        // Start reading the file as an ArrayBuffer (raw binary data)
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Extract text from PDF data
 * @param {ArrayBuffer} pdfData - The raw PDF data
 * @returns {Promise<string>} - A promise that resolves with the extracted text
 */
function extractTextFromPDF(pdfData) {
    return new Promise((resolve, reject) => {
        // Note: This requires PDF.js library to be loaded
        // PDF.js is a library created by Mozilla to read PDFs in browsers
        
        if (typeof pdfjsLib === 'undefined') {
            reject(new Error('PDF.js library not loaded. Please include the PDF.js script.'));
            return;
        }

        // Tell PDF.js to load and parse the PDF
        const loadingTask = pdfjsLib.getDocument({data: pdfData});
        
        loadingTask.promise.then(pdf => {
            console.log(`📚 PDF has ${pdf.numPages} pages`);
            
            let textContent = ''; // This will store all the text
            const numPages = pdf.numPages;

            // Create an array of promises to read each page
            const pagePromises = [];
            
            // Loop through each page
            for (let i = 1; i <= numPages; i++) {
                // Get each page and extract its text
                pagePromises.push(
                    pdf.getPage(i).then(page => {
                        return page.getTextContent().then(content => {
                            // Each page has "items" which are pieces of text
                            // Join them together with spaces
                            const pageText = content.items.map(item => item.str).join(' ');
                            textContent += pageText + ' ';
                            console.log(`  Page ${i}/${numPages} processed`);
                        });
                    })
                );
            }

            // Wait for all pages to be processed
            Promise.all(pagePromises).then(() => {
                // Remove extra whitespace and return the text
                resolve(textContent.trim());
            }).catch(err => {
                reject(new Error(`Error extracting text: ${err.message}`));
            });
        }).catch(err => {
            reject(new Error(`Error loading PDF: ${err.message}`));
        });
    });
}