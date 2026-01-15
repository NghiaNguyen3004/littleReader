# API Setup Instructions for Audiobook Player

## Overview
This document provides instructions on how to set up and configure the text-to-speech (TTS) API that the audiobook player application uses to convert text extracted from PDF files into audio format.

## Step 1: Choose a Text-to-Speech API
Select a free text-to-speech API that suits your needs. Some popular options include:
- Google Text-to-Speech
- IBM Watson Text to Speech
- Microsoft Azure Text to Speech

## Step 2: Create an Account
Sign up for an account with the chosen TTS API provider. Follow their registration process to create your account.

## Step 3: Obtain API Keys
Once you have created your account, navigate to the API section of the provider's dashboard to generate your API keys. These keys are essential for authenticating your requests to the TTS service.

## Step 4: Configure API Client
In the `src/js/apiClient.js` file, you will need to insert your API key and configure the API endpoint. Look for the following section in the code:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.example.com/tts'; // Replace with the actual API endpoint
```

Replace `'YOUR_API_KEY_HERE'` with the API key you obtained in Step 3 and update the `API_URL` with the correct endpoint provided by your TTS service.

## Step 5: Test the API Connection
To ensure that your API setup is correct, you can run a test request using the functions defined in `src/js/apiClient.js`. Make sure to handle any errors that may arise during the API call.

## Step 6: Review API Documentation
Familiarize yourself with the API documentation provided by your TTS service. Understanding the available endpoints, request formats, and response structures will help you effectively use the API in your application.

## Conclusion
After completing these steps, your audiobook player should be configured to interact with the selected text-to-speech API. You can now proceed to upload PDF files and convert them into audiobooks. If you encounter any issues, refer to the API documentation or the project's `docs/file-interactions.md` for further assistance.