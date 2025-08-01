# ElevenLabs Text-to-Speech API Integration Guide

## Overview

ElevenLabs offers a powerful Text-to-Speech (TTS) API that can convert text into lifelike spoken audio with
nuanced intonation and emotion. In our project, we’ll use this API to give voice to our AI agents’
conversation – streaming the AI’s text responses as audio to the frontend in real time. This means as soon
as the AI generates text, we can begin playing the spoken version on the user’s browser without waiting for
the entire audio to finish generating. The result is a more interactive, human-like experience where
multiple AI agents can each have distinct voices conversing audibly.

## Authentication and API Key Setup

To use ElevenLabs APIs, you need an API key from your ElevenLabs account. You can create and find this key
on the ElevenLabs website (under _Profile → API Keys_ ). Treat this key as a secret – **never expose it in client-
side code** or public repos. We’ll include it in the HTTP headers of our requests. Specifically, every API call
must send:

```
xi-api-key: <YOUR_ELEVENLABS_API_KEY>
```
in the request header. In a Next.js app, the key should be stored in an environment variable (e.g.
ELEVENLABS_API_KEY in a .env.local file) and **only used server-side** (for instance, in our
route.ts API route). This way, the key isn’t exposed to the browser.

```
Tip: ElevenLabs provides official SDK libraries that simplify auth. For example, using the Node
SDK you can initialize a client with your API key in one line. But even with the SDK, the key
should reside in server code/config.
```
## Text-to-Speech Endpoints

ElevenLabs’ API provides two ways to synthesize speech from text: a **standard endpoint** that returns the
full audio file after generation, and a **streaming endpoint** that returns audio in real-time chunks. We will
focus on the streaming approach (ideal for low-latency playback in our app), but we’ll briefly note both for
completeness.

```
Standard TTS (Complete Audio): POST /v1/text-to-speech/{voice_id} – Converts given text
to speech using the specified voice and returns the entire audio file once generation is complete.
This is useful if you need the full audio file (e.g. for download or if immediate playback isn’t required).
However, it introduces a delay equal to the synthesis time before playback can start. A sample
request looks like:
```

curl-X POST"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?
output_format=mp3_44100_128"\
-H"xi-api-key: <API_KEY>" \
-H"Content-Type: application/json"\
-d'{ "text": "Hello world", "model_id": "eleven_multilingual_v2" }'
```
This would return an audio file (by default, an MP3 at 44.1 kHz, 128 kbps) containing the spoken phrase

. In our use-case (real-time conversation), we prefer not to wait for the whole file, so instead we use
streaming.

```
Streaming TTS (Real-Time Audio): POST /v1/text-to-speech/{voice_id}/stream –
Converts text to speech and streams the audio output over HTTP chunked encoding. This
means the response is sent as a sequence of small audio byte chunks that arrive in real time,
allowing the client to begin playback while later parts are still being generated. In effect, this enables
ultra-low latency voice playback for our AI responses. We will use this endpoint in our Next.js route.
```
**Required parameters:** For both endpoints, you must specify a voice_id (as part of the URL path) and
provide the text to synthesize in the JSON request body. The voice_id determines which voice will speak
the text. You can use any voice available in your ElevenLabs account (including the default premade
voices, voices you cloned/created, or community shared voices). To get a list of your voices with their
voice_id values, you can call the **List Voices** API (GET /v2/voices) with your API key. Each
voice has a unique ID – for example, the ElevenLabs default voice **"Rachel"** , or a custom voice you’ve added,
will have its own ID string. In practice, you might retrieve these IDs once and then configure your
application with the chosen IDs for each AI agent’s persona. (In our project, we might hard-code or
configure something like VOICE_ID_AGENT1 = "voice_id_for_Jessica" and VOICE_ID_AGENT2 =
"voice_id_for_Brandon", etc.).

**Text input:** The text to be spoken is sent in the JSON body as "text": "<your text here>". This
can be a short sentence or a longer paragraph (the API supports up to a certain character limit depending
on the model, e.g. 5,000 or more characters – see model details below). In the context of AI chat, you’ll pass
the agent’s response text here.

**Voice and audio options:** You can optionally customize the generation with additional parameters:

```
model_id: ElevenLabs provides multiple TTS models. By default, if you don’t specify this, it uses the
eleven_multilingual_v2 model , which produces high-quality, expressive speech in many
languages (good general choice for quality). Other models include eleven_turbo_v2.5 and
eleven_flash_v2.5 , which are optimized for speed (lower latency) at some cost of quality.
For real-time conversations, using a faster model can be beneficial. In fact, ElevenLabs notes that
Flash v2.5 can achieve extremely low latency (~75ms) for responsive streaming. The Turbo v2.
model is also low-latency (~250ms) and balances quality and speed. You might experiment with
these: for example, the ElevenLabs Next.js streaming demo used the Turbo v2.5 model for quick
results. To use a model, include "model_id": "eleven_turbo_v2_5" (or another model’s ID)
in your request JSON. If omitted, it defaults to the standard multilingual v2 model.
```

```
output_format: By default the audio comes back as an MP3 (44.1 kHz, 128 kbps). You can
request other formats like WAV/PCM or μ-law if needed by specifying this parameter (e.g.
"output_format": "pcm_44100", or for telephony uses "output_format": "ulaw_8000").
However, note that some higher quality or less-compressed formats require certain subscription
tiers (for example, 192 kbps MP3 or high sample rate PCM are available on paid plans). MP3 at
44.1 kHz is generally fine for browser playback, so we will likely stick with the default or a slightly
lower bitrate to save bandwidth (the demo used mp3_44100_64 for smaller chunks ).
```
```
voice_settings: You can override the voice’s default settings for one request by providing a
voice_settings object. This can control attributes like stability, similarity, style, and speech
speed. For example, a voice’s stability setting controls how consistent vs. varied the intonation is
(lower stability = more expressive variations, higher = more monotonic and stable). The similarity
(often labeled Clarity & Similarity Enhancement ) controls how closely the AI tries to mimic the original
voice’s timbre; high similarity can sometimes introduce artifacts if the source voice had background
noise. In practice, ElevenLabs suggests starting around 50% stability and 75% similarity for
natural results. You can also adjust speed (0.7x to 1.2x normal rate) , and a style_exaggeration
parameter (usually keep at 0 for stability ). In our API calls, we might not need to tweak these
initially – the default voice settings are often fine – but it’s good to know this exists. For example, if
our AI agent is speaking too monotonously, we could lower stability, or if it sounds inconsistent,
increase it. These would be passed like: "voice_settings": { "stability": 0.3,
"similarity_boost": 0.75 } (just as an example).
```
```
language_code: If using a model that supports multiple languages, you can hint a specific
language via an ISO-639-1 code (e.g. "language_code": "en" for English, "es" for Spanish).
This is generally not needed unless the text is ambiguous or you want to force a certain accent; only
some models (Turbo v2.5, Flash v2.5) support this parameter.
```
Other parameters exist (like enabling/disabling the ElevenLabs _history logging_ , controlling text
normalization, etc.), but they are optional and advanced. By default, **enable_logging** is true, meaning
your requests and audio may be stored in your account history. This can be useful for replay or stitching
clips, but if privacy is a concern, enterprise users can disable logging (for typical use, you’ll leave it true).

## Streaming Audio in a Next.js Route

To integrate this into our Next.js React app, we will create a new API route (for example, /api/tts or
similar). The idea is: the frontend will send the agent’s text to this route, and the route will respond with
streaming audio. The front-end can then play that audio stream so the user hears the agent’s response
spoken aloud.

**Key points for the Next.js route:**

- It should be a **server-side route** (Next.js app/api or pages/api endpoint) so it can safely use the API
key and make the external call.
- It will **proxy the ElevenLabs streaming response** back to the client. Essentially, the route handler will call
    https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream with the appropriate
headers/body, and then _stream the response through_ to the client’s browser.
- We must set the correct HTTP headers on the response to ensure the browser knows it’s audio and can


stream it. According to the ElevenLabs example, we should use at least:

- Content-Type: audio/mpeg (assuming MP3)
- Cache-Control: no-cache (prevent caching, since this is dynamic audio)
- Connection: keep-alive (to signal streaming over HTTP/1.1)
These headers were used in the reference implementation. In Next.js, if we use the Web Streams API
(new Response(stream, { headers })), chunked transfer encoding will be handled automatically as
long as we don’t specify a Content-Length.

**Implementing the route (server-side logic):** We have a couple of options:

```
Using fetch to ElevenLabs API: Since Next.js (Node 18+) has a global fetch, we can call the
ElevenLabs endpoint directly. For example, in app/api/tts/route.ts:
```
```
export asyncfunction POST(request: Request) {
const{ text, voice } =await request.json();
// `voice` could be an ID or name -> in practice, map name to ID or send ID
directly.
constvoiceId= voice?? "<DEFAULT_VOICE_ID>";
constapiResponse = awaitfetch(
`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
{
method:'POST',
headers: {
'xi-api-key': process.env.ELEVENLABS_API_KEY!,
'Content-Type':'application/json'
},
body: JSON.stringify({
text,
model_id: 'eleven_multilingual_v2' // or another model as needed
})
}
);
if(!apiResponse.ok) {
// Handle error (e.g., log and return an error response)
const error= awaitapiResponse.text();
return new Response(`ElevenLabs API error: ${error}`, { status: 500 });
}
// Stream the audio bytes directly to the client:
returnnew Response(apiResponse.body, {
headers: {
'Content-Type': 'audio/mpeg',
'Cache-Control': 'no-cache',
'Connection': 'keep-alive'
}
});
}


In this snippet, our route accepts a POST with JSON containing the text (and optionally a voice identifier). We
then call ElevenLabs’ streaming endpoint. The apiResponse.body is a **ReadableStream** of audio bytes
(MP3 data) which we pass directly to the Next.js response. The headers ensure the client treats it as
streaming audio. This effectively pipes ElevenLabs audio to the client.

```
Using the ElevenLabs SDK: Alternatively, we could use ElevenLabs’ official NPM package
@elevenlabs/elevenlabs-js on the server. For example:
```
```
import { ElevenLabsClient} from'@elevenlabs/elevenlabs-js';
constclient = newElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
```
```
// ... inside the route handler:
constaudioStream = awaitclient.textToSpeech.stream(voiceId, { text, modelId:
'eleven_multilingual_v2'});
// `audioStream` is an AsyncIterable<Uint8Array> of audio data chunks.
```
The SDK returns an async iterable stream of bytes. We would then need to convert that to a Node.js
Readable (e.g. Readable.from(audioStream)) and pipe it to the response. The SDK also provides a
utility stream() function to play or handle the audio stream easily , but in our case we want to
forward it to the browser, not play on the server. The advantage of the SDK is convenience (it handles the
HTTP and chunking under the hood), but it adds a dependency. Using fetch as above is straightforward
enough and avoids extra dependencies.

Either approach is valid – the core idea is the same: retrieve a stream of audio and respond with that
stream.

**Ensuring streaming behavior:** One important detail – by default, Next.js (or Node) might buffer the
response if not handled properly. By returning a **Response** with a stream (apiResponse.body in the
example) and not reading it to completion on the server, we ensure the data is sent chunk-by-chunk to the
client as it arrives. The headers (no-cache, keep-alive) further instruct that this is a streaming
response. In testing, using curl or Postman on the /api/tts endpoint should show that it starts
receiving data immediately and can play partial content. In the ElevenLabs Next.js demo, they explicitly
simulated slight delays to emphasize streaming, but in our case ElevenLabs already streams as fast as it
generates, so we typically don’t need artificial delays.

Also, note that the route in the example is a GET endpoint (for easy testing via browser/curl) , but we can
use POST if we want to send JSON. If using GET, we’d have to pass the text in the query string (URL-encoded)
which might be okay for short sentences but not ideal for longer texts. A POST with JSON body is cleaner for
arbitrary text input.

**Example from ElevenLabs streaming demo:** In ElevenLabs’ own Next.js streaming example, their /
stream/tts endpoint is implemented to: _“Utilize the ElevenLabs API to generate TTS audio and stream the
audio data directly to the client.”_ They used the voice “Jessica” with text “This is a... streaming voice”, the
**Turbo v2.5** model, and output format mp3 44.1kHz @ 64kbps. The response headers were Content-
Type: audio/mpeg, Cache-Control: no-cache, Connection: keep-alive. This aligns with


```

our approach. They emphasize that setting the correct Content-Type ensures the client can handle the
stream properly.

## Frontend: Playing the Streaming Audio

On the React frontend, once our route is set up, we need to play the audio stream for the user. There are a
couple of ways to do this:

```
Audio element with streaming source: The simplest method is to use an HTML <audio> element
and point its src to our API route. For example, if we had a route at /api/tts that accepts a GET
with a query param, we could do:
```
```
<audio id="agentVoice"controls autoPlaysrc={`/api/tts?text=$
{encodeURIComponent(agentText)}`} />
```
As soon as this audio element is added to the DOM or its src updated, it will start the request to the
server. Because our server responds with chunked audio, the browser should begin playing the audio as
soon as the first bytes arrive (after a brief buffering). This is essentially how streaming media (like internet
radio) works. Ensure autoPlay is set or play the audio via JS, and note that user interaction (a click) may
be required to start audio due to browser autoplay policies. If you already have a user action (like they
asked a question or clicked something to trigger the agent response), you can call audio.play() in the
event handler after setting the src.

Using the audio element is convenient because the browser handles streaming playback and buffering
internally. The controls attribute is optional (for debugging it’s nice to have pause/play). You might hide
controls in the final UI and just manage playback via code.

```
Manual streaming via fetch: Alternatively, if we needed more control (say we wanted to visualize
the audio waveform or do something fancy), we could use the Fetch API and Web Audio API. For
example, we could fetch('/api/tts', { method: 'POST', body:
JSON.stringify({ text }) }) and then get a ReadableStream from the response. We could
then use a Media Source Extensions (MSE) approach: create a MediaSource object, link it to an
audio element, and feed the stream chunks into it as they arrive. However, this is significantly more
complex than needed for just playback. Unless we have a specific need to process audio chunks on
the client, the direct <audio src> approach is simpler.
```
In summary, when the AI agent produces a text reply, the frontend should invoke the TTS route (either by
setting an audio src or by fetch). The route will yield a stream of audio, and the user will hear the agent
speaking. If we have multiple AI agents speaking, we might either use multiple audio elements or manage a
single audio element by sequentially playing streams. For example, if Agent A and Agent B take turns, you
could use one audio element and change its src to each new stream as needed (ensuring the previous audio
finished or was stopped). Each stream will be a separate HTTP request to the API with the respective voice
ID of that agent.

**Concurrent audio streams:** Note that if two agents “talk over” each other, you’d potentially play two audio
streams at once. Our application design likely avoids that (agents take turns). If overlapping speech were


needed, we could instantiate two audio elements. But typically, turn-based audio is clearer for a
conversation.

**Latency considerations:** The ElevenLabs streaming is quite fast, especially with low-latency models – audio
will begin playing within a second or less of the text being sent, depending on length. The audio generation
happens on ElevenLabs’ servers chunk by chunk. The first chunk usually comes quickly (especially with
flash/turbo models with latency optimizations). For very large texts (several thousand characters),
streaming ensures the user hears the beginning part while the rest is still being synthesized, greatly
improving perceived responsiveness. If using the high-quality model (Multilingual v2), initial response
might be a bit slower but still generally within a second or two for a sentence. You can decide if the quality
trade-off is worth it; for a dynamic conversation, using a faster model may be preferable to keep the
dialogue snappy.

## Additional Tips & Useful Features

```
Voice selection: We should decide which voices to use for our AI agents. ElevenLabs has a default
set of voices, and thousands of community/shared voices in their Voice Library. You can also clone a
custom voice (requires uploading samples) if you want a very specific persona. For quick setup, you
might pick from the default voices (like the female voice “Rachel” or “Bella”, male voice “Antoni” or
“Josh”, etc., or any that fit your characters). In the API, each voice is referenced by its voice_id.
You can obtain these by listing voices via API or by looking at the voice’s detail page on the
ElevenLabs website (the URL or a hidden ID in dev tools). For example, the voice “Jessica” used in the
ElevenLabs demo has an ID that was used in their code (not shown here, but they passed it to the
API). Once you have the IDs, you might store them in your config (for instance, map agent names to
voice IDs). Then your route can choose the appropriate voice_id per request.
```
```
Managing audio playback on the client: Consider how you will queue up and play multiple
responses. A simple approach: after you send text to your backend AI model (e.g. ChatGPT or others)
and get a text reply, immediately fire off the request to ElevenLabs and play it. If the user can ask
something else or if another agent responds before the first audio is done, you might need to
handle interrupting or queueing. It might be wise to prevent new TTS from starting until the current
one finishes, or provide a visual indication if the user tries to skip. These are application-level
decisions, but since streaming TTS is fairly quick, this might not be a big issue.
```
```
Monitoring usage: Each character of text synthesized will consume credits (if on a paid plan) or use
your character quota (if on a free tier). Keep an eye on usage in your ElevenLabs dashboard,
especially if the conversations are long or frequent. You can use the GET /v1/usage endpoint to
programmatically check consumed characters and remaining quota if needed. Also, the
History section in ElevenLabs can show recent generation requests (if logging was enabled) –
useful for debugging what was synthesized if something sounds off.
```
```
Error handling: If the ElevenLabs API is unreachable or returns an error (e.g., 422 Unprocessable if
text is empty or contains disallowed content), your route should handle that gracefully. You might
play a default “error” sound or simply show a message. The API can also return errors if you exceed
rate limits or quota. Design your frontend to handle a lack of audio (e.g., if response.ok is false,
maybe notify the user “Voice generation failed”).
```

```
Advanced Real-time (optional): In scenarios where the AI text is generated word-by-word
(streaming from an LLM), you might consider feeding partial text into ElevenLabs as it’s produced.
ElevenLabs offers a WebSocket API for TTS which supports incremental text input and returns audio
chunks in a continuous stream with even lower latency. This is powerful for truly real-time
applications (and it even provides timing callbacks for word boundaries), but it’s more complex to
implement and generally not necessary if you have the full sentence ready. In fact, ElevenLabs
advises that if you already have the complete text, the standard HTTP streaming is preferred, as the
WebSocket approach can introduce complexity and slight buffering latency. Our use-case will
likely involve getting the full response text from the AI model in one go, so a single streaming POST
is simpler. Nonetheless, it’s good to know that the WebSocket API exists should we ever need to
synthesize audio concurrently with text generation (for example, speaking an ongoing sentence as
the AI forms it). For now, we can stick to the HTTP endpoint which already meets our needs.
```
```
Text formatting for speech: To improve how the AI voice sounds, you can add punctuation and
pauses in the text. The ElevenLabs TTS engine pays attention to punctuation – commas, periods,
ellipses, etc., will affect the cadence. If the AI’s raw text is lacking punctuation or has very dense
content, consider post-processing it (e.g., add a comma where a pause would help, or split run-on
sentences). ElevenLabs also supports limited SSML tags within the text, such as <break
time="1.5s"/> for pauses or phoneme tags for pronunciation. For example, you could
insert <break time="0.5s"/> in the text string to force a half-second pause where appropriate.
Use these sparingly – too many can sometimes cause the voice to behave oddly. But they can be
useful for ensuring the speech sounds natural (imagine an AI agent thinking: “Hmm... <break
time=\"0.8s\"/> I’m not sure about that.” to get a thoughtful pause). We likely don’t need to manually
add these for every message, but keep it in mind if you notice any pacing issues.
```
```
Testing and tuning: It’s a good idea to test the whole pipeline with some sample conversations.
Listen to how the voice sounds and adjust if needed (choose a different voice, or tweak the stability/
similarity settings if the tone isn’t right). Also test the streaming in different network conditions – the
chunked audio should handle slight network slowness by buffering, but a very slow network might
cause gaps. In practice, MP3 at 64-128 kbps is not very heavy, so it should stream fine on most
connections. If needed, you could lower bitrate (e.g., mp3_44100_32 for 32 kbps) to accommodate
very low bandwidth scenarios, at some loss of fidelity.
```
By following this guide, we’ll equip our Next.js app to **generate spoken dialogue on the fly** using
ElevenLabs. The combination of streaming AI text generation (from an LLM) and streaming TTS audio
means our users can have a seamless conversation with AI characters – seeing text and _hearing voices_ in
real time. This deep integration of ElevenLabs API will allow us to deliver a rich, interactive experience with
minimal latency.

## References

```
ElevenLabs API Documentation – Text-to-Speech Overview
ElevenLabs API Documentation – Authentication & API Keys
ElevenLabs API Documentation – Create Speech (POST /v1/text-to-speech)
ElevenLabs API Documentation – Stream Speech (POST /v1/text-to-speech/.../stream)
ElevenLabs API – Parameters and Models
ElevenLabs API – Voice Settings (Stability/Similarity)
```


```
ElevenLabs Next.js Streaming Demo – Implementation details
ElevenLabs Next.js Streaming Demo – Notes on streaming
ElevenLabs Blog – Real-time Audio Streaming Benefits (chunked encoding latency advantages)
ElevenLabs WebSocket API Documentation – Use cases vs. standard API
```
Text to Speech | ElevenLabs Documentation
https://elevenlabs.io/docs/capabilities/text-to-speech

Streaming | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/streaming

Authentication | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/authentication

Create speech | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/text-to-speech/convert

Stream speech | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/text-to-speech/stream

List voices | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/voices/search

GitHub - jtmuller5/elevenlabs-nextjs-stream-example: How to stream audio using
ElevenLabs and NextJS
https://github.com/jtmuller5/elevenlabs-nextjs-stream-example

Text to Speech (product guide) | ElevenLabs Documentation
https://elevenlabs.io/docs/product-guides/playground/text-to-speech

ElevenLabs Streaming API: Fetch Real-Time Audio
https://11labs-ai.com/elevenlabs-streaming-api-fetch-real-time-audio/

WebSocket | ElevenLabs Documentation
https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input

Controls | ElevenLabs Documentation
https://elevenlabs.io/docs/best-practices/prompting/controls


