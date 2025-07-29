<img src="./0bxh0pba.png"
style="width:0.28299in;height:0.28212in" /><img src="./php0kwqc.png"
style="width:0.9878in;height:0.16927in" />

**Implementing** **an** **AI** **Voice** **Appointment** **Scheduling**
**Feature**

In this task, we outline how to enhance the AI voice agent system with
new capabilities for scheduling appointments. We will cover each
requested point in detail, including adding a new route in the
application,
usinglocalstoragefordatapersistence,simulatingstreamingagentresponseswithanimations,integrating
ElevenLabs text-to-speech audio, and automating scheduling based on user
availability. These features will improve the user experience and ensure
the system can fully automate appointment bookings via AI voice calls.

**1.** **Adding** **a** **New** **Route** **for** **Scheduling**

To incorporate the new appointment scheduling workflow, we will
introduce a **new** **route** in the application dedicated to this
feature. This could be a new page or view (e.g. a “Schedule Appointment”
page) where users can manage their appointment requests. Separating this
into its own route keeps the functionality organized and distinct from
existing pages (such as search or provider listing pages). In a Next.js
or React
app,thismeanscreatinganewpagecomponentandupdatingtherouterconfigurationornavigationmenu
so users can access it. For example, in a Next.js app, we might add a
file like pages/schedule.js (or a route in the app directory) which
renders the scheduling interface.

On this **Schedule** page, the user will be guided through selecting a
provider (from their saved or searched providers) and specifying their
availability for an appointment. The page will likely include a form
where the user can choose date and time slots they are available (we
will discuss this in section 5). Once the user
inputstherequiredinformationandsubmitstherequest,thefront-endcantriggertheAIcallworkflow–for
instance, by calling an API endpoint or function that initiates the
voice agent call to the provider.

By creating a separate route, we ensure the scheduling process has a
dedicated UI/UX flow. This also allows
ustoreusedatafromotherpartsoftheapp(likesavedprovidersfromprevioussearches)whilekeepingthe
scheduling logic isolated. Overall, adding a new route for scheduling
makes the application more modular and user-friendly, as users can
clearly navigate to the section where they set up automated calls for
appointments.

**2.** **Persisting** **Data** **with** **Local** **Storage**

We will use **localStorage** in the browser to persist certain data
(like the user’s recently searched or saved
providers)acrosssessions.Theapplicationalreadyuseslocalstorageforsavingrecentsearches,andwewill
continuethisapproachsothatselectedprovidersorotherpreferences“stick”evenifthepageisreloadedor
the browser is closed. Local storage is a simple key-value storage
provided by web browsers that has no expiration time by default – data
stored there will persist indefinitely until explicitly cleared
[1](https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=localStorage%20is%20a%20property%20that,browser%20or%20restarts%20the%20computer)
. This means users won’t lose their saved provider selections or recent
search history between visits, improving convenience.

> 1

Using localStorage is straightforward: we can save data by serializing
it to a string with localStorage.setItem('key', JSON.stringify(data))
and retrieve it with localStorage.getItem('key') (parsing the JSON back
into an object if needed). For example, when a
userselectsproviderstocall,wecanstoretheirIDsornamesinanarrayinlocalstorage.Nexttimetheuser
opens the scheduling page, the app can load that array from local
storage to pre-populate the “saved providers” list. This ensures
persistence without requiring a backend database for this purpose, which
is

suitable for user-specific, non-critical data like recent searches or
preferences.

One important thing to note is that local storage is specific to the
user’s browser (and device). If the user switches devices or browsers,
the locally stored data won’t transfer automatically. However, for our
use case (persisting recent selections on the same device) it is
perfectly adequate. Also, local storage should not be used for sensitive
information since it can be accessed by anyone with access to the device
[2](https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=Put%20simply%2C%20,the%20user%20closes%20the%20browser)
, but storing provider names/IDs or search terms is low-risk. By
leveraging local storage, we keep the implementation simple and fast (no
server calls needed to fetch this info) while providing a smoother
experience with persistent state across sessions.

**3.** **Simulated** **Streaming** **Agent** **Responses** **(with**
**Animation)**

To make the AI agent’s interaction feel more natural and responsive, we
will simulate **streaming** **responses** and agent state changes in the
UI. In practice, when the AI voice agent is “speaking” or formulating a
reply (such as what it will say to the provider on a call), we don’t
want to simply display nothing and then suddenly show the full response.
Instead, we can show a *typing/speaking* *indicator* or gradually reveal
the response text to mimic how a human might speak or how ChatGPT
streams its answers. This improves user engagement by providing visual
feedback that the agent is working on a response
[3](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Image%3A%20A%20conversation%20in%20which,typing%20indicator%20using%20three%20dots)
.

**Typing** **Indicator:** One approach is to show an animated indicator
(for example, three blinking dots or a small animated icon) while the AI
is generating the call script or response. This is similar to how
messaging apps indicate the other party is typing
[3](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Image%3A%20A%20conversation%20in%20which,typing%20indicator%20using%20three%20dots)
. In our context, as the agent “thinks” or loads the next line of
dialogue,wecandisplaya"Agentispreparingtheresponse..."messageorananimation.Thisgivestheuser
a cue that the process is ongoing. Such micro-interactions make the
conversation feel more authentic and human-like
[4](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Typing%20awareness%20indicators%20are%20an,better%2C%20more%20effective%20chat%20experience)
, which is important for user trust.

**Gradual** **Text** **Reveal:** Once the AI’s text for what it will say
is ready, we can display it in a typewriter-style animation rather than
all at once. Technically, this can be done by iterating over the text
string and appending one character at a time with a short delay. For
example, using a JavaScript setTimeout (or setInterval ) loop that
prints each character of the agent’s message with, say, 30-50
millisecond intervals gives the appearance of “streaming” text
[5](https://www.w3schools.com/howto/howto_js_typewriter.asp#:~:text=var%20i%20%3D%200%3B%20var,the%20effect%20in%20milliseconds)
. This technique is illustrated by many typing effect

demos – you start with an empty line and gradually add letters, as shown
in the snippet below:

> let i = 0;
>
> let txt = "Hello, this is the AI agent speaking..."; let speed = 50;
> // milliseconds delay
>
> function typeWriter() { if (i \< txt.length) {
>
> document.getElementById("agentText").innerHTML += txt.charAt(i);
>
> 2
>
> i++;
>
> setTimeout(typeWriter, speed); }
>
> } typeWriter();

In the above pseudo-code, each call to typeWriter() adds one character
to the displayed text and schedules the next character with setTimeout ,
achieving a live typing animation
[5](https://www.w3schools.com/howto/howto_js_typewriter.asp#:~:text=var%20i%20%3D%200%3B%20var,the%20effect%20in%20milliseconds)
. We can use this method to show the agent’s spoken script appearing as
if it’s being “spoken” in real time. Additionally, we might accompany
this with simple CSS animations (like a blinking cursor at the end of
the text or subtle scroll) to enhance the effect.

**Hardcoded** **States** **&** **Transitions:** Since our agent’s flow
(calling, speaking, pausing, etc.) might be predictable, we can hardcode
some state transitions with animations. For example, we could define
states such as *“dialing”*, *“speaking”*, *“listening”*, and *“call*
*completed”*. Each state can trigger a specific animation or UI change –
e.g., during “dialing” we show a ringing phone icon, during “speaking”
we show the typing indicator or the text streaming out, during
“listening” we might show an idle animation, and on “completed” we
display a summary or confirmation. These can be triggered in sequence
with timing that matches the expected behavior (since we know the script
or can approximate durations). By hardcoding the animation sequence (or
using a simple state machine), we ensure the UI feedback aligns with
what the AI voice agent is presumably doing behind the scenes. This
simulation does not require actual real-time streaming from the server;
it’s more about front-end presentation.

In summary, simulating the streaming agent states with visual cues – a
typing indicator followed by a typewriter text animation – will make the
AI agent appear more interactive and alive. It reassures the user that
the agent is actively working and provides a smoother, more engaging
experience while the AI prepares and delivers its responses.

**4.** **Integrating** **ElevenLabs** **Text-to-Speech** **Audio**

We plan to use **ElevenLabs** (a powerful text-to-speech service) to
generate high-quality voice audio for the AI agent’s dialogue. The idea
is that once we have the script of what the AI should say during the
call (for
example,agreetingandappointmentrequesttotheprovider),weconvertthattextintospokenaudiousing
ElevenLabs’ API or tools. ElevenLabs can produce very natural sounding
speech in various voices, which will make the call experience much more
realistic than a default robotic voice.

Using ElevenLabs is straightforward: their API provides an endpoint
where you send the text and a chosen voice, and it returns an audio file
(e.g. an MP3) of that text spoken in the selected voice
[6](https://elevenlabs.io/docs/api-reference/text-to-speech/convert#:~:text=Converts%20text%20into%20speech%20using,your%20choice%20and%20returns%20audio)
. In fact, ElevenLabs specifically allows converting text into speech
“using a voice of your choice” and returns the audio output (with
options for format, voice ID, etc.)
[6](https://elevenlabs.io/docs/api-reference/text-to-speech/convert#:~:text=Converts%20text%20into%20speech%20using,your%20choice%20and%20returns%20audio)
. We can either use their SDK or direct REST API to obtain this audio.
For our case, since the user mentioned they can import ElevenLabs MP3
files of the scripts, we might pre-generate the audio for known script
lines and simply load those files when needed.

**Workflow** **Integration:** Once the text for a call is determined, we
will get the MP3 audio. If this is done dynamically via API, the system
would send the text to ElevenLabs and receive back the MP3 binary (or a
URL to it). Alternatively, as a pre-processing step, one could generate
the audio for expected phrases (like

> 3

“Hello, I am calling to schedule an appointment for…” etc.) and store
those files. Either way, we’ll have an audio file corresponding to the
agent’s speech.

**Playing** **Audio** **in** **Calls:** To use this audio in the voice
call, we have a couple of scenarios: - **If** **demonstrating** **in**
**the** **app** **(no** **real** **call):** We could simply play the MP3
in the browser so the user hears the agent’s voice. For example, an HTML
\<audio\> element can play the file once the user triggers the call
simulation. - **If** **making** **a** **real** **phone** **call**
**via** **a** **service** **like** **Twilio:** We can instruct the call
to play the MP3 to the callee. Twilio allows playing audio files during
a call using the \<Play\> verb in TwiML. Essentially, you give Twilio
the URL of the MP3 file, and it will retrieve and play it for the person
on the other end of the call
[7](https://www.twilio.com/docs/voice/twiml/play#:~:text=The%20%60,a%20URL%20that%20you%20provide)
. For instance, Twilio’s documentation shows an example:
\<Play\>https://api.twilio.com/ cowbell.mp3\</Play\> which makes the
caller hear that audio
[8](https://www.twilio.com/docs/voice/twiml/play#:~:text=match%20at%20L340%20)
[9](https://www.twilio.com/docs/voice/twiml/play#:~:text=%60) . In our
system, after generating the ElevenLabs MP3, we would need to host it at
a reachable URL (perhaps on our server or cloud storage). Then our
call-handling code would respond to the outgoing call by providing TwiML
that includes a \<Play\> tag with that URL. The voice agent’s speech
will then be played to the provider when the call

connects.

**Voice** **Selection:** ElevenLabs offers multiple voice options,
including very natural human-like voices and even custom voices. We
should choose a voice that fits the context (for example, a polite
female or male voice for a receptionist-like tone). The Reddit post
about AI voice agents confirms that one can indeed use ElevenLabs for
the agent’s voice and it’s a common choice in such setups
[10](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=2,do%20more%20than%20just%20talk)
. By picking a high-quality voice, we increase the chances that the call
recipients (e.g., clinic receptionists or service providers) will not
immediately realize they’re speaking to an AI, or at least will find it
pleasant and clear to listen to.

To summarize, integrating ElevenLabs involves converting the agent’s
script text to an audio file and then ensuring that audio is played
during the call. This gives our AI agent a realistic voice. With the MP3
files available, we’ll leverage telephony features (like Twilio’s play
verb) to deliver that audio in calls. This approach has been used in
other AI voice agent solutions (e.g., using ElevenLabs or similar TTS
for the agent’s side of the conversation
[10](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=2,do%20more%20than%20just%20talk)
) and is proven to be effective. It allows us to automate the speaking
part of the call with very lifelike speech synthesis.

**5.** **Automated** **Scheduling** **with** **User** **Availability**
**Input**

To make the appointment booking fully automated, we need to gather the
**user’s** **availability** *before* the AI agent makes any calls, and
then use that information during the call to schedule the appointment.
The user should have the ability to specify the days and times they are
available for an appointment. We will incorporate a step for the user to
input their available time slots (for example, they might select a few
preferred dates or a range of times like “next Monday afternoon” or “any
weekday after 5 PM”). This availability data will then be passed along
to the AI agent so it knows what options to offer or agree to when
speaking with the provider.

**User** **Interface** **for** **Availability:** On the new scheduling
route/page (from point 1), we will include a form or interactive
component for the user to choose their available times. This could be a
simple set of dropdowns for date and time, a calendar picker where the
user highlights free slots, or even just a text input that parses
something like “Mon 10am-2pm, Tue 9-11am”. A user-friendly approach is
to use date/time picker controls or a grid of upcoming days where the
user checks boxes for times they can do. For example, a date

> 4

picker combined with a time range selector can let the user add one or
multiple availability windows. The key is to capture a clear set of
options the user is willing to accept for an appointment.

Once the user submits their availability, we will store this info
(likely in the state or context of the app, and possibly also in local
storage if we want to remember it). Having this before the call is
crucial: the voice agent will use these time options to negotiate an
appointment with the provider. Essentially, the agent will say something
like, “The client is available at X or Y; do you have any openings
then?” and if the provider suggests an alternate time, the agent can
cross-check it against the user’s provided availability.

**Agent** **Using** **Availability:** We must ensure the AI agent’s
logic is informed by the user’s input. If we are using a custom script,
we can programmatically insert the chosen times into the dialogue. For
instance, if the user chose “Tuesday 10 AM” and “Wednesday 2 PM” as
possible slots, the AI’s script can include: *“I’m* *looking* *to*
*schedule* *an* *appointment.* *The* *patient* *is* *available* *on*
*Tuesday* *at* *10:00* *AM* *or* *Wednesday* *at* *2:00* *PM.* *Do*
*you* *have* *openings* *around* *those* *times?”* The agent will then
listen for the provider’s response. If the provider picks one, great –
the agent will confirm. If the provider offers an alternative, the agent
should know whether that alternative is acceptable. This can be handled
by the AI if it has a way to access the user’s availability data as a
list or through an API call.

In more advanced implementations, the AI agent could call a function or
tool to check a calendar or list of availabilities in real-time. In
fact, an example from a developer on Reddit shows they gave their voice
agent a “getAvailability” tool connected to their calendar, so the agent
could fetch free/busy times during the conversation
[11](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=mentioned%20in%20the%20prompt)
. In our case, we have the availability upfront from the user rather
than a live calendar query, but the concept is similar. We could expose
the user’s availability to the agent via a simple endpoint or a
pre-loaded variable. For example, before the call, we might generate a
small JSON like {"available_slots": \["2025-08-01T10:00",
"2025-08-02T14:00", ...\]} that the agent can reference. If we were
using a platform or an AI orchestration tool, we’d register this as
well. The Reddit procedure outlines that after setting up the tool, the
agent can call it and get an instant response with free

times
[12](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=5,so%20it%20calls%20when%20necessary)
, which is exactly what we want – the agent instantly knows the times to
propose.

**Ensuring** **the** **Agent** **Calls** **at** **the** **Right**
**Time:** There are two layers of scheduling here – one is scheduling
the **appointment** (the meeting with the provider), and the other is
scheduling the **call** (when the AI should place the call to attempt
the booking). The user’s availability pertains to the appointment time,
not necessarily the call time (the call will likely be made immediately
or as soon as possible once the user
initiatesit,unlessweallowschedulingthecallitself).Weshouldclarifythattheavailabilitytheuserprovides
is for the appointment with the provider (e.g., when they can physically
attend or have a consultation). We assume the AI will call the provider
more or less immediately after the user submits the request (or within
some automated timeframe). If instead we wanted the AI to call the
provider at a certain time (like call the ofice only during business
hours), that’s another scheduling aspect we could consider (e.g., only
call between 9am-5pm). For now, let’s assume the call execution is
immediate or handled by the system internally, so we focus on the
appointment time selection.

**Full** **Automation** **Flow:** Once the user has provided their
preferred time slots and confirmed the providers to call, the system can
proceed without further user intervention: 1. The AI agent (voice bot)
places a call to the provider’s number. 2. It interacts using the
ElevenLabs-generated voice, asking to book an appointment and providing
the user’s availability times. 3. If the provider agrees to one of the
proposed times, the agent confirms the appointment. If the provider
suggests an alternate time, the agent can check against the user’s input
– if it’s within those available slots (or perhaps the user allowed some
flexibility), the agent can

> 5

accept; if not, the agent might decline and reiterate available options
(or potentially agree to take the suggested time and mark it for user
approval later, depending on how we program it). 4. After the call, the
system could log the outcome (e.g., confirmed appointment time or need
for follow-up). We might even send the user a notification or add it to
a calendar.

By obtaining the availability beforehand, we **guarantee** **that**
**the** **agent** **will** **only** **book** **appointments** **at**
**times** **the** **user** **can** **actually** **attend**, which is of
course crucial. The user won’t be surprised by an appointment at a
random time they didn’t agree to. This is exactly why the instruction
was to let the user choose day/time availability *before* the agents
start calling. It’s a safeguard and a convenience.

In implementation, capturing availability could simply be stored and
passed to the back-end that orchestrates the call. For instance, if
using a Node.js server to handle the AI call, that server could take the
user’s availability input (from the request or from a database) and feed
it into the prompt or logic that the voice agent uses. In advanced
setups with function calling (like OpenAI function calling or a tool
system), the agent could dynamically query an “availability service”
during the call. But a simpler approach is to bake the times into the
script from the start, since we already have them in advance.

As a real-world example, a similar system by another developer had the
voice agent use a tool to get their free/busytimesfromacalendaronthefly
[11](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=mentioned%20in%20the%20prompt)
.Theydescribeconnectingascenariothatreturnsthosetimes
instantlytotheagent.Inourcase,becausewecollectthetimesviaUI,weessentiallyservethesameroleas
that calendar tool: providing a list of free slots to the agent. We just
do it manually via user input rather
thanafullcalendarintegration(thoughinthefuture,integratingwithGoogleCalendarorOutlookwouldbe
a great enhancement so the user’s actual calendar is checked).

To conclude this point, we will make the system **fully** **automated**
by ensuring the AI agent knows the user’s availability beforehand and
can act on it. The user’s role is just to input their constraints; from
there, the AI handles the call and scheduling. This eliminates
back-and-forth between user and agent after the initial input. With this
design, as soon as the user confirms “Yes, I’m free on these
days/times,” the AI agent will proceed to call the provider and book an
appointment in one continuous flow. This design mirrors other AI
scheduling agents which emphasize giving the AI the tools and data it
needs (like calendar access) to perform tasks without live user guidance
[10](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=2,do%20more%20than%20just%20talk)
[11](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=mentioned%20in%20the%20prompt)
.

**Sources:**

> 1\. LogRocket Blog – *LocalStorage* *in* *JavaScript:* *A* *complete*
> *guide* (explains that data in localStorage persists across browser
> sessions with no expiration)
> [1](https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=localStorage%20is%20a%20property%20that,browser%20or%20restarts%20the%20computer)
> .
>
> 2\. TalkJS Tutorial – *How* *to* *add* *a* *typing* *indicator* *for*
> *an* *AI* *chatbot* (discusses the importance of typing indicators and
> visual cues to show an agent is responding, e.g., animated dots)
> [3](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Image%3A%20A%20conversation%20in%20which,typing%20indicator%20using%20three%20dots)
> [4](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Typing%20awareness%20indicators%20are%20an,better%2C%20more%20effective%20chat%20experience)
> .
>
> 3\. W3Schools – *How* *To* *Create* *a* *Typing* *Effect* (provides a
> JavaScript example of a typewriter effect using setTimeout to
> gradually display text)
> [5](https://www.w3schools.com/howto/howto_js_typewriter.asp#:~:text=var%20i%20%3D%200%3B%20var,the%20effect%20in%20milliseconds)
> .
>
> 4\. ElevenLabs API Documentation – *Text* *to* *Speech* *(Convert)*
> (describes the ability to convert text into speech audio using a
> specified voice via the API, returning an MP3 or similar audio file)
> [6](https://elevenlabs.io/docs/api-reference/text-to-speech/convert#:~:text=Converts%20text%20into%20speech%20using,your%20choice%20and%20returns%20audio)
> .
>
> 6
>
> 5\. Twilio Docs – *TwiML* *Voice:* *\<Play\>* (shows that Twilio can
> play an audio file from a given URL during a call, for example playing
> an MP3 to the caller)
> [7](https://www.twilio.com/docs/voice/twiml/play#:~:text=The%20%60,a%20URL%20that%20you%20provide)
> .
>
> 6\. Reddit – *How* *to* *create* *an* *AI* *Voice* *agent* *that*
> *can* *book* *appointments* (user “Agreeable_Mountain_9” outlines
> steps for a voice agent; confirms using ElevenLabs for the agent’s
> voice and using a
>
> getAvailability tool to fetch calendar free times)
> [10](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=2,do%20more%20than%20just%20talk)
> [12](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=5,so%20it%20calls%20when%20necessary)
> .

[1](https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=localStorage%20is%20a%20property%20that,browser%20or%20restarts%20the%20computer)
[2](https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=Put%20simply%2C%20,the%20user%20closes%20the%20browser)
localStorage in JavaScript: A complete guide - LogRocket Blog
<https://blog.logrocket.com/localstorage-javascript-complete-guide/>

[3](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Image%3A%20A%20conversation%20in%20which,typing%20indicator%20using%20three%20dots)
[4](https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/#:~:text=Typing%20awareness%20indicators%20are%20an,better%2C%20more%20effective%20chat%20experience)
How to add a typing indicator for an AI chatbot
<https://talkjs.com/resources/how-to-add-a-custom-typing-indicator-for-a-chatbot/>

[5](https://www.w3schools.com/howto/howto_js_typewriter.asp#:~:text=var%20i%20%3D%200%3B%20var,the%20effect%20in%20milliseconds)
How To Create a Typing Effect
<https://www.w3schools.com/howto/howto_js_typewriter.asp>

[6](https://elevenlabs.io/docs/api-reference/text-to-speech/convert#:~:text=Converts%20text%20into%20speech%20using,your%20choice%20and%20returns%20audio)
Create speech \| ElevenLabs Documentation
<https://elevenlabs.io/docs/api-reference/text-to-speech/convert>

[7](https://www.twilio.com/docs/voice/twiml/play#:~:text=The%20%60,a%20URL%20that%20you%20provide)
[8](https://www.twilio.com/docs/voice/twiml/play#:~:text=match%20at%20L340%20)
[9](https://www.twilio.com/docs/voice/twiml/play#:~:text=%60) TwiML™
Voice: \| Twilio <https://www.twilio.com/docs/voice/twiml/play>

[10](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=2,do%20more%20than%20just%20talk)
[11](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=mentioned%20in%20the%20prompt)
[12](https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/#:~:text=5,so%20it%20calls%20when%20necessary)
How to create an AI Voice agent that can book appointments :
r/automation
<https://www.reddit.com/r/automation/comments/1et07kp/how_to_create_an_ai_voice_agent_that_can_book/>

> 7
