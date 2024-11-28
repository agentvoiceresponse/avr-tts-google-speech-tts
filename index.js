/**
 * index.js
 * This file is the main entrypoint for the application.
 * @author  Giuseppe Careri
 * @see https://www.gcareri.com
 */
const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();

const textToSpeechClient = new TextToSpeechClient();

// Configure the Google Cloud Text-to-Speech API request
const requestConfig = {
  voice: {
    languageCode: process.env.TEXT_TO_SPEECH_LANGUAGE || 'en-AU',
    ssmlGender: process.env.TEXT_TO_SPEECH_GENDER || 'FEMALE',
    name: process.env.TEXT_TO_SPEECH_NAME || 'en-AU-Neural2-C',
  },
  audioConfig: {
    audioEncoding: 'LINEAR16', // Asterisk Audio Socket Encoding
    sampleRateHertz: 8000, // Asterisk Audio Socket Sample Rate Hertz
    speakingRate: +process.env.TEXT_TO_SPEECH_SPEAKING_RATE || 1,
  },
};

console.log("Google Text To Speech Configuration", requestConfig)

app.use(express.json());

const audioCacheDir = path.join(__dirname, 'audio-cache');

// Ensure the audio cache directory exists
if (!fs.existsSync(audioCacheDir)) {
  fs.mkdirSync(audioCacheDir);
}

const getAudioFilePath = (text) => {
  const sanitizedText = text.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return path.join(audioCacheDir, `${sanitizedText}.wav`);
};

/**
 * Handle incoming HTTP POST request with JSON body containing a text string,
 * and streams the text-to-speech audio response back to the client.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
const handleTextToSpeech = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const audioFilePath = getAudioFilePath(text);

  if (fs.existsSync(audioFilePath)) {
    // If the audio file exists, stream it to the client
    console.log('Streaming cached audio file');
    res.setHeader('Content-Type', 'audio/wav');
    const readStream = fs.createReadStream(audioFilePath);
    readStream.pipe(res);
  } else {
    // If the audio file does not exist, generate it using Google TTS
    console.log('Generating audio file');
    requestConfig.input = { text };

    try {
      const [response] = await textToSpeechClient.synthesizeSpeech(requestConfig);
      const audioContent = response.audioContent;

      // Save the audio content to a file
      fs.writeFileSync(audioFilePath, audioContent, 'binary');

      // Stream the audio content to the client
      res.setHeader('Content-Type', 'audio/wav');
      res.write(audioContent, 'binary');
      res.end();
    } catch (error) {
      console.error('Error calling Google TTS API:', error.message);
      res.status(500).json({ message: 'Error communicating with Google TTS' });
    }
  }
};

app.post('/text-to-speech-stream', handleTextToSpeech);

const port = process.env.PORT || 6003;
app.listen(port, () => {
  console.log(`Google Text to Speech listening on port ${port}`);
});
