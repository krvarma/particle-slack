Interacting with Particle Device using Slack and Natural Language Processing
------------------------------------------------------------------------

**Introduction**

Natural Language Processing is becoming very popular these days. This is becoming one of the major way to interact with the user. Popular examples of using NLP are Apple Siri, Google Now, Amazon Echo, etc...

There are many NLP APIs which we can use in our own applications, some of them are [Wit.ai](https://wit.ai/), [Api.ai](https://api.ai/), etc... Using these APIs you can process the natural language input in the form of text or audio. These APIs extract actions and intentions of the user and returns these. Before using these APIs to parse the input, you have to define what are the possible user expressions that should be parsed. For example when the user says "Turn on my bedroom light", user intents to turn on the bedroom light. Here *Turning On* is the user intention and *Bedroom Light* is the device to turn on. In this example the word "on" and "bedroom" are the meaningful extractions from the user input. In case of "Turn off my living room light", *Turning Off* is the user intention and *Living Room* is the location. 

Here the words "on", "off", "bedroom", "living room" are entities, we have to define these entities user expression before using these APIs, results of all these APIs depends on how well you define the user expressions and define entities.

**Sample Application**

The sample application is a simple Proof of Concept Home Automation. The Particle Photon is used as a Home Automation hub. Three LEDs are connected to the photon that represents different room lights. A DHT sensor is connected to retrieve temperature and humidity of the room (please note that only one DHT is connected for the demo purpose). Another sensor attached is the Contact Sensor, which will send message to Slack when it is opened or closed.

I am using [Slack Messaging](https://slack.com/) platform to interact with Photon. User an interact with this Home Automation hub using a particular Slack Channel (it is named *particle*). User can type "*particle, what is the temperature in living room*" to retrieve the latest temperature, similarly "*particle, what is the humidity in living room*" will retrieve the humidity. User can also turn on/off particular light by sending message like "*particle, turn on living room light*", "*particle, turn off living room light*"

An outgoing Webhook is setup in Slack which will trigger which points to a microservice hosted in Hook.io When user chooses ***Particle*** channel and type commands with special trigger word named "*particle*", this service will be called. As explained above users can send the message "*particle, what is the temperature in living room*" to get latest temperature of the living room.

The microservice hosted in Hook.io is written in Node.js. This service receives the text sends from Slack and send to [Api.ai](https://api.ai/) for NLP processing. The Api.ai will parse this test and return the user intention, location, actions etc... The service uses [Api.ai](https://api.ai/) Node.js SDK to connect to the server and retrieve the results. After receiving the results from Api.ai, the service sends corresponding commands to Particle Photon using Particle Cloud APIs. A simple pictorial representation of the interaction between the component is like this:

![Workflow](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/workflow.png)

**Setting up the project**

1. Create an account in [Hook.io](http://hook.io/), create a JavaScript hook and name if "*callapiai*" or whatever you want.
2. Copy [this code](https://raw.githubusercontent.com/krvarma/particle-slack/master/microservice/callapiai.js) and paste it to the hook just created and save it.
3. Setup a Slack Domain and  log on to it.
4. Create a channel named "***particle***"
5. Go to Slack API and create an Outgoing Webhook and enter the following details
	Channel: `#particle`
	Trigger Word: `particle`
	URL: `<<your hook.io microservice URL created in Step 1>>`
6. Create an Incoming Webhook and enter the following details and note the Webhook URL 
	Post to Channel: `paticle`
7. Create a Particle Webhook using the particle cli command
*particle webhook create slack.json*
8. Create an account in Api.ai and create a new Agent
9. Go on to Settings->Export and Import and import from from this [ZIP file](https://github.com/krvarma/particle-slack/blob/master/api.ai/particle-integration.zip).
10. Setup the hardware as per the Schematics below

Now the setup is ready and you can flash the Particle Photon and start using it.

**Using the application**

Log on to Slack and select the *particle* channel. Now you can type following commands and you can see the results. The should conversation starts with the slack trigger word *particle* or whatever you have given.

    particle, turn on the bedroom light
    particle, turn on the living room light
    particle, turn on the kitchen light
    
    particle, turn off the bedroom light
    particle, turn off the living room light
    particle, turn off the kitchen light
    
    particle, what is the temperature in living room
    particle, what is the temperature in bedroom
    particle, what is the temperature in kitchen
    
    particle, what is the humidity in living room
    particle, what is the humidity in bedroom
    particle, what is the humidity in kitchen

If everything goes well, you can turn on the lights and receive the temperature and humidity values. 

**Screenshots/Images**

*Slack Outgoing Webhook*
![Slack Outgoing Webhook](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/outgoinghook.png)

*Slack Incoming Webhook*
![Slack Incoming Webhook](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/incomingwebhook.png)

*Api.ai Intent*
![Api.ai Intent](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/api.ai_exp.png)
