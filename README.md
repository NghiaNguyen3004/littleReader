# 📚 Audiobook Player

A beginner-friendly web application that converts PDF files into audiobooks using **free** text-to-speech technology!

## 🌟 Features

- **PDF to Audiobook Conversion**: Upload any PDF and convert it to speech
- **Multiple Voices**: Choose from different voice options (male/female)
- **Quality Settings**: Select from Standard, Neural, or Generative engines
- **100% FREE**: Uses Puter.js - no API keys or sign-ups required!
- **No Installation**: Runs entirely in your web browser

## 🚀 Quick Start

### Option 1: Open Directly
1. Navigate to the `src` folder
2. Open `index.html` in your web browser
3. Start uploading PDFs!

### Option 2: Use Development Server (Recommended)
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

Your browser will automatically open to `http://localhost:8080`

## 📖 How to Use

1. **Upload a PDF**: Click the file upload button and select a PDF from your computer
2. **Choose Settings**: Select your preferred voice and quality engine
3. **Convert**: Click "Convert to Audiobook"
4. **Listen**: Use the audio player controls to play, pause, or skip through your audiobook

## 🎯 How the Files Work Together

This application is built with a modular architecture where each file has a specific job:

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html                              │
│  (The Main Page - Links everything together)                 │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │ styles   │    │  Puter.js│   │  PDF.js  │
    │   .css   │    │  (TTS)   │   │(Reading) │
    └──────────┘    └──────────┘   └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │  app.js  │ ◄── The Brain (Coordinates everything)
                    └──────────┘
                           │
           ┌───────────────┼───────────────┬──────────────┐
           │               │               │              │
           ▼               ▼               ▼              ▼
    ┌────────────┐  ┌────────────┐ ┌────────────┐ ┌────────────┐
    │ pdfHandler │  │ttsConverter│ │audioPlayer │ │ apiClient  │
    │    .js     │  │    .js     │ │    .js     │ │    .js     │
    └────────────┘  └────────────┘ └────────────┘ └────────────┘
     Reads PDFs      Converts       Controls        Talks to
                    text to speech   playback       Puter API
```

### The Flow of Data

1. **User uploads PDF** → `pdfHandler.js` reads it and extracts text
2. **Extracted text** → `ttsConverter.js` sends it to Puter.js API
3. **Puter.js returns audio** → `audioPlayer.js` plays it
4. **`app.js` coordinates** all these steps

### The Flow of Data

1. **User uploads PDF** → `pdfHandler.js` reads it and extracts text
2. **Extracted text** → `ttsConverter.js` sends it to Puter.js API
3. **Puter.js returns audio** → `audioPlayer.js` plays it
4. **`app.js` coordinates** all these steps

## 📁 File Descriptions

### HTML
- **`index.html`**: The main page that users see. Contains the layout and links to all other files.

### CSS
- **`styles.css`**: Makes everything look beautiful. Controls colors, spacing, and layout.

### JavaScript Files
- **`app.js`**: The brain of the application. Coordinates all other files and handles user interactions.
- **`pdfHandler.js`**: Reads PDF files and extracts text using PDF.js library.
- **`ttsConverter.js`**: Converts text to speech using Puter.js API.
- **`audioPlayer.js`**: Controls audio playback (play, pause, volume, etc.).
- **`apiClient.js`**: Communicates with the Puter.js API for text-to-speech conversion.

### Documentation Files
- **`README.md`**: This file! Overview and setup instructions.
- **`docs/getting-started.md`**: Beginner's guide to using the app.
- **`docs/file-interactions.md`**: Detailed explanation of how files work together.
- **`docs/api-setup.md`**: Information about Puter.js and how to use it.

## 🛠️ Technologies Used

### Libraries
- **[Puter.js](https://developer.puter.com/)**: Free, unlimited text-to-speech API
- **[PDF.js](https://mozilla.github.io/pdf.js/)**: PDF reading and text extraction (by Mozilla)

### Why Puter.js?
- ✅ **100% FREE** with unlimited usage
- ✅ **No API keys** or sign-ups needed
- ✅ **High-quality voices** with multiple engines
- ✅ **Multiple languages** supported
- ✅ **Simple integration** - just one script tag!

## 🎨 Customization

### Change Voices
Edit the voice options in `index.html`:
```html
<select id="voiceSelect">
    <option value="Joanna">Joanna (Female)</option>
    <option value="Matthew">Matthew (Male)</option>
    <!-- Add more voices here -->
</select>
```

### Adjust Colors
Modify the color scheme in `styles.css`:
```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 📚 Learn More

- Read the [Getting Started Guide](docs/getting-started.md) for beginners
- Understand [How Files Interact](docs/file-interactions.md)
- Learn about [API Setup](docs/api-setup.md)

## 🐛 Troubleshooting

### PDF Not Loading?
- Make sure the PDF contains actual text (not just scanned images)
- Try a smaller PDF file first

### No Audio Playing?
- Check your browser's audio permissions
- Make sure you have an internet connection (Puter.js requires internet)
- Try refreshing the page

### Errors in Console?
- Open browser DevTools (F12) to see error messages
- Make sure all CDN libraries are loading correctly

## 🤝 Contributing

Feel free to:
- Add new features
- Improve the documentation
- Report bugs or issues
- Suggest improvements

## 📄 License

MIT License - Feel free to use this project for learning or personal use!

## 🙏 Credits

- **Puter.js** - Free TTS API
- **Mozilla PDF.js** - PDF reading library
- Built for beginners learning web development!

---

**Happy Listening!** 🎧