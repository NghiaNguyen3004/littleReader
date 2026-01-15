#  API Setup - Using Puter.js for Text-to-Speech

This document explains how to use Puter.js, the FREE text-to-speech API that powers our audiobook player.

##  Why Puter.js?

### The Amazing Benefits:
-  **100% FREE** - No costs, ever!
-  **No API Keys** - Zero sign-up required
-  **Unlimited Usage** - Convert as much as you want
-  **High Quality** - Multiple voice engines
-  **Multiple Voices** - Male and female options
-  **Simple Setup** - Just include one script tag!

### Comparison with Other APIs:

| Feature | Puter.js | Google TTS | Amazon Polly |
|---------|----------|------------|--------------|
| Cost | FREE | Pay per use | Pay per use |
| API Key | Not needed | Required | Required |
| Sign-up | No | Yes | Yes |
| Quality | Excellent | Excellent | Excellent |
| Ease of Use | Very Easy | Moderate | Moderate |

##  How It Works

### Step 1: Include the Script (Already Done!)

In our `index.html`, we have:
```html
<script src="https://js.puter.com/v2/"></script>
```

That's it! Puter.js is now available in your app.

### Step 2: Use the API (Already Implemented!)

The basic syntax is:
```javascript
puter.ai.txt2speech(text, options)
    .then(audio => {
        audio.play();
    });
```

### What Happens Behind the Scenes:

1. Your browser sends text to Puter.js servers
2. Puter.js processes it with AI voice synthesis
3. Puter.js returns an Audio object
4. Your app plays the audio

##  Available Options

### Voices

Our app supports these voices (but Puter.js has more!):

```javascript
const voices = [
    "Joanna",   // Female, clear and professional
    "Matthew",  // Male, deep and authoritative
    "Salli",    // Female, friendly and warm
    "Joey"      // Male, casual and energetic
];
```

### Engines

Three quality levels available:

1. **Standard**
   - Good quality
   - Fastest processing
   - Best for: Testing, quick conversions

2. **Neural** (Default)
   - Better quality
   - More natural sounding
   - Best for: Most use cases

3. **Generative**
   - Best quality
   - Most human-like
   - Best for: Final production, best listening experience

### Languages

Default is English (en-US), but Puter.js supports:
- French (fr-FR)
- German (de-DE)
- Spanish (es-ES)
- Italian (it-IT)
- And many more!

##  How Our App Uses It

### In apiClient.js:

```javascript
const fetchTTS = async (text, options = {}) => {
    const defaultOptions = {
        voice: "Joanna",
        engine: "neural",
        language: "en-US"
    };

    const finalOptions = { ...defaultOptions, ...options };
    const audio = await puter.ai.txt2speech(text, finalOptions);
    return audio;
};
```

### In ttsConverter.js:

```javascript
async function convertTextToSpeech(text, options = {}) {
    // Check if text is too long (max 3000 characters)
    if (text.length > 3000) {
        return await convertLongText(text, options);
    }

    // Convert using Puter.js
    const audio = await puter.ai.txt2speech(text, options);
    return audio;
}
```

### In app.js:

```javascript
// Get user's selected options
const options = {
    voice: voiceSelect.value,
    engine: engineSelect.value,
    language: 'en-US'
};

// Convert text to speech
const audio = await convertTextToSpeech(extractedText, options);

// Play the audio
audioPlayer.src = audio.src;
audioPlayer.play();
```

##  Limitations and Workarounds

### Character Limit: 3000 characters per request

**The Limit:**
Puter.js can process up to 3000 characters at once.

**Our Solution:**
We automatically split long text into chunks:

```javascript
function convertLongText(text, options) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > 3000) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    
    // Convert each chunk
    return Promise.all(
        chunks.map(chunk => puter.ai.txt2speech(chunk, options))
    );
}
```

### Internet Required

**The Requirement:**
Puter.js is a cloud service - you need internet!

**Why:**
- Voice synthesis happens on Puter's servers
- No heavy processing on your device
- Always get the latest voice models

##  Customization Examples

### Change the Default Voice

In `apiClient.js`, change:
```javascript
const defaultOptions = {
    voice: "Matthew",  // Changed from Joanna
    engine: "neural",
    language: "en-US"
};
```

### Add a New Voice Option

In `index.html`, add:
```html
<select id="voiceSelect">
    <option value="Joanna">Joanna (Female)</option>
    <option value="Matthew">Matthew (Male)</option>
    <option value="Amy">Amy (British Female)</option>  <!-- NEW! -->
</select>
```

### Use a Different Language

Change the language in options:
```javascript
const options = {
    voice: "Mathieu",
    engine: "neural",
    language: "fr-FR"  // French!
};
```

##  Advanced Features

### Check if Puter.js is Loaded

```javascript
function isPuterAvailable() {
    return typeof puter !== 'undefined' && typeof puter.ai !== 'undefined';
}

if (!isPuterAvailable()) {
    console.error('Puter.js not loaded!');
}
```

### Error Handling

```javascript
try {
    const audio = await puter.ai.txt2speech(text, options);
    audio.play();
} catch (error) {
    console.error('TTS Error:', error);
    alert('Failed to convert text to speech. Please try again.');
}
```

### Get Engine Information

```javascript
const engines = [
    {
        name: 'standard',
        description: 'Default engine with good quality',
        speed: 'Fast',
        quality: 'Good'
    },
    {
        name: 'neural',
        description: 'Higher quality, more natural-sounding',
        speed: 'Medium',
        quality: 'Better'
    },
    {
        name: 'generative',
        description: 'Most human-like speech',
        speed: 'Slower',
        quality: 'Best'
    }
];
```

##  Troubleshooting

### Problem: "puter is not defined"

**Cause:** Puter.js script didn't load

**Solutions:**
1. Check internet connection
2. Make sure script tag is in HTML:
   ```html
   <script src="https://js.puter.com/v2/"></script>
   ```
3. Load it before your app.js file
4. Check browser console for errors

### Problem: Audio doesn't play

**Causes & Solutions:**

1. **Browser autoplay policy**
   - Solution: User must interact first (click a button)
   - Our app handles this correctly

2. **Text too long**
   - Solution: Our app automatically splits it

3. **Invalid voice name**
   - Solution: Check spelling, use valid voice names

### Problem: Poor audio quality

**Solutions:**
1. Use "neural" or "generative" engine
2. Check internet speed
3. Try a different voice

### Problem: Slow conversion

**Causes:**
- Large text amount
- Slow internet
- Generative engine (slower but best quality)

**Solutions:**
- Break into smaller PDFs
- Use "standard" or "neural" engine
- Be patient with generative engine

##  API Documentation Links

- Official Puter.js Docs: [docs.puter.com](https://docs.puter.com/)
- TTS API Reference: [docs.puter.com/AI/txt2speech](https://docs.puter.com/AI/txt2speech/)
- Tutorial: [developer.puter.com/tutorials/free-unlimited-text-to-speech-api](https://developer.puter.com/tutorials/free-unlimited-text-to-speech-api/)

##  Learn More

Want to extend the app? Try these:

1. **Add more voices**: Check Puter.js documentation for full voice list
2. **Add playback speed**: Use audio.playbackRate = 1.5 (1.5x speed)
3. **Save audio**: Download the generated audio file
4. **Add subtitles**: Show text as it's being read
5. **Multiple languages**: Add language selector dropdown

##  Other Puter.js Features

Puter.js offers more than just TTS:

- **Speech-to-Text**: Convert audio to text
- **Translation**: Translate text between languages
- **OCR**: Extract text from images
- **Sentiment Analysis**: Analyze text emotion
- **Chat AI**: GPT-like conversations
- **Cloud Storage**: Store files in the cloud

All free and unlimited!

##  Summary

**What you need to know:**

1. **No setup needed** - Just include the script tag
2. **Call the API** - `puter.ai.txt2speech(text, options)`
3. **Get audio back** - Play it immediately
4. **Completely FREE** - No limits, no keys, no sign-up

**That's the beauty of Puter.js!** 

---

**Questions?** Check the [Puter.js documentation](https://docs.puter.com/) or the main [README](../README.md)!
