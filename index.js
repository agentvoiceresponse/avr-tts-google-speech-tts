/**
 * index.js
 * This file is the main entrypoint for the application.
 * @author  Agente Voice Response <info@agentvoiceresponse.com>
 * @see https://www.agentvoiceresponse.com
 */
const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
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

/**
 * Convert audio buffer using FFmpeg to ensure compatibility with AudioSocket
 * @param {Buffer} audioBuffer - The audio buffer to convert
 * @returns {Promise<Buffer>} - The converted audio buffer
 */
const convertAudioWithFFmpeg = (audioBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const inputStream = new PassThrough();
      const outputChunks = [];

      ffmpeg(inputStream)
        .inputFormat('wav')
        .audioCodec('pcm_s16le')
        .audioFrequency(8000)
        .audioChannels(1)
        .format('s16le') // Output raw PCM
        .on('start', (cmdLine) => {
          console.log('FFmpeg conversion started:', cmdLine);
        })
        .on('error', (err) => {
          console.error('FFmpeg conversion error:', err.message);
          reject(err);
        })
        .on('end', () => {
          console.log('FFmpeg conversion completed');
          const convertedBuffer = Buffer.concat(outputChunks);
          resolve(convertedBuffer);
        })
        .pipe(new PassThrough())
        .on('data', (chunk) => {
          outputChunks.push(chunk);
        });

      // Write the audio buffer to ffmpeg input stream
      inputStream.write(audioBuffer);
      inputStream.end();

    } catch (error) {
      reject(error);
    }
  });
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

  console.log("Text to Speech Request", text);

  requestConfig.input = { text };

  console.log(requestConfig);

  res.setHeader('Content-Type', 'audio/l16');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const [response] = await textToSpeechClient.synthesizeSpeech(requestConfig);
    const audioContent = response.audioContent;
    console.log("Audio Content received, size:", audioContent.length, "bytes");

    // Convert audio content with FFmpeg before sending
    const convertedAudio = await convertAudioWithFFmpeg(audioContent);
    console.log("Converted audio size:", convertedAudio.length, "bytes");
    
    res.write(convertedAudio);
    res.end();
  } catch (error) {
    console.error('Error calling Google TTS API:', error.message);
    res.status(500).json({ message: 'Error communicating with Google TTS' });
  }
}

app.post('/text-to-speech-stream', handleTextToSpeech);

const port = process.env.PORT || 6003;
app.listen(port, () => {
  console.log(`Google Text to Speech listening on port ${port}`);
});
