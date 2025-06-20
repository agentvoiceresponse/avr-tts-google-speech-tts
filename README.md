# Agent Voice Response - Google Cloud Text-to-Speech Integration

[![Discord](https://img.shields.io/discord/1347239846632226998?label=Discord&logo=discord)](https://discord.gg/DFTU69Hg74)
[![GitHub Repo stars](https://img.shields.io/github/stars/agentvoiceresponse/avr-llm-openai?style=social)](https://github.com/agentvoiceresponse/avr-llm-openai)
[![Docker Pulls](https://img.shields.io/docker/pulls/agentvoiceresponse/avr-llm-openai?label=Docker%20Pulls&logo=docker)](https://hub.docker.com/r/agentvoiceresponse/avr-llm-openai)
[![Ko-fi](https://img.shields.io/badge/Support%20us%20on-Ko--fi-ff5e5b.svg)](https://ko-fi.com/agentvoiceresponse)

This project demonstrates the integration of **Agent Voice Response** with **Google Cloud Text-to-Speech (TTS)**. The application sets up an Express.js server that accepts a text string from a client via HTTP POST requests, converts the text into speech using Google Cloud TTS, and streams the audio back to the client in real-time.

## Prerequisites

To run this project, you will need:

1. **Node.js** and **npm** installed.
2. A **Google Cloud account** with the **Text-to-Speech API** enabled.
3. A **Service Account Key** from Google Cloud with the necessary permissions for Text-to-Speech API.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/agentvoiceresponse/avr-tts-google-cloud-tts
cd avr-tts-google-cloud-tts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google Cloud Credentials

Create a `keyfile.json` by downloading your service account key from Google Cloud. Set the environment variable to use this key in your Node.js application:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/keyfile.json"
```

Alternatively, use a `.env` file to load environment variables:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/keyfile.json
TEXT_TO_SPEECH_LANGUAGE=en-AU
TEXT_TO_SPEECH_GENDER=FEMALE
TEXT_TO_SPEECH_NAME=en-AU-Neural2-C
TEXT_TO_SPEECH_SPEAKING_RATE=1
PORT=6003
```

### 4. Configure Environment Variables

Make sure you have the following environment variables set in a `.env` file for flexible configuration:

```bash
TEXT_TO_SPEECH_LANGUAGE=en-AU
TEXT_TO_SPEECH_GENDER=FEMALE
TEXT_TO_SPEECH_NAME=en-AU-Neural2-C
TEXT_TO_SPEECH_SPEAKING_RATE=1
PORT=6003
```

You can modify the language code, gender, and voice model based on your requirements.

## How It Works

The application accepts a text input from the client via an HTTP POST request to the `/text-to-speech-stream` route, converts the text into speech using **Google Cloud Text-to-Speech**, and streams the resulting audio back in `LINEAR16` encoding, suitable for integration with **Asterisk Audio Socket**.

### Key Components

- **Express.js Server**: Handles incoming HTTP POST requests with the text body and streams the audio back to the client.
- **Google Cloud Text-to-Speech Client**: Converts text into speech using the TTS API.
- **Audio Streaming**: The audio data is streamed back to the client in chunks for real-time playback.

### Example Code Overview

- **Google Cloud TTS Request Configuration**: Set up voice settings like language, gender, and audio encoding.
- **Audio Streaming**: The application splits the audio content into chunks and streams it back to the client using the `res.write()` method.

## Running the Application

To start the application:

```bash
node index.js
```

The server will start and listen on the port defined in the environment variable or default to `6003`.

### Sending a Text Request

You can use `curl` to send a POST request to the server with a JSON body containing a `text` field:

```bash
curl -X POST http://localhost:6003/text-to-speech-stream \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello, welcome to Agent Voice Response!"}' --output response.wav
```

The audio response will be saved in `response.wav` in the specified format.

## Support & Community

*   **GitHub:** [https://github.com/agentvoiceresponse](https://github.com/agentvoiceresponse) - Report issues, contribute code.
*   **Discord:** [https://discord.gg/DFTU69Hg74](https://discord.gg/DFTU69Hg74) - Join the community discussion.
*   **Docker Hub:** [https://hub.docker.com/u/agentvoiceresponse](https://hub.docker.com/u/agentvoiceresponse) - Find Docker images.
*   **Wiki:** [https://wiki.agentvoiceresponse.com/en/home](https://wiki.agentvoiceresponse.com/en/home) - Project documentation and guides.

## Support AVR

AVR is free and open-source. If you find it valuable, consider supporting its development:

<a href="https://ko-fi.com/agentvoiceresponse" target="_blank"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support us on Ko-fi"></a>

## License

MIT License - see the [LICENSE](LICENSE.md) file for details.