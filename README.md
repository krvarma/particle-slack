Interacting with Particle Device using Slack and Natural Language Processing
------------------------------------------------------------------------

**Introduction**

Natural Language Processing is becoming very popular these days. This is becoming one of the major method of user interaction. Apple Siri, Google Now, Amazon Echo, etc... all are examples of products that uses NLP.

There are many NLP APIs which we can used in our own applications, some of them are [Wit.ai](https://wit.ai/), [Api.ai](https://api.ai/), etc... Using these APIs you can process the natural language input in the form of text or audio. These APIs extract actions and intentions of the user and return something meaningful to our application. Before using these APIs to parse the input, you have to define what are the possible user expressions. For example when the user says "Turn on my bedroom light", user intents to turn on the bedroom light. Here *Turning On* is the user intention and *Bedroom Light* is the device to turn on. In this example the word "on" and "bedroom" are the meaningful extractions from the user input. In case of "Turn off my living room light", *Turning Off* is the user intention and *Living Room* is the location. 

Here the words "on", "off", "bedroom", "living room" are entities. To use these NLP APIs, we have to define these entities in all the possible user expressions. The results of all these APIs depends on how well you define the user expressions and entities.

**Sample Application**

The sample application is a simple Proof of Concept Home Automation Hub which can be controlled using [Slack Messaging Platform](https://slack.com). Particle Photon is used as a Home Automation hub. Three LEDs are connected to the photon that represents different room lights. A DHT sensor is connected to retrieve temperature and humidity of the room (please note that only one DHT is connected for the demo purpose). Another sensor attached is the Contact Sensor, which will send message to Slack when it is opened or closed. Using Slack messaging platform, a user can send messages to a channel to control the lights or retrieve the temperature and humidity values. An outgoing webhook is setup in Slack which points to microservice hosted on [Hook.io](http://hook.io/). This service uses [Api.ai](https://api.ai) to process the user message and retrieve the meaningful actions from the message. Once the message is processed and retrieve the user actions, the service call the Particle Cloud APIs to control the lights or retrieve the sensor values. 

On the Particle device side, a webhook is setup which points to an incoming slack webhook URL. The event corresponding this webhook is **pslack**. There are three particle functions defined in the firmware to retrieve the sensor values and to control lights. When these functions are called the firmware publish the event *pslack* with data. These events will trigger the Slack Incoming Webhook. The definition of the Webhook given below:

    {
    	"eventName": "pslack",
    	"url": "<<Replace it with your Slack Incoming Webhook URL>>",
    	"requestType": "POST",
    	"rejectUnauthorized": false,
    	"json": {
    		"text": "{{SPARK_EVENT_VALUE}}"
    	}
    }

User can interact with this Home Automation hub by sending Slack messages to a particular channel (in this case it is "*particle*"). Also the message should start with *particle* trigger word. For example sending the message "*particle, what is the temperature in living room*" will retrieve latest temperature, similarly "*particle, what is the humidity in living room*" will retrieve the humidity. User can also turn on/off particular lights by sending message like "*particle, turn on living room light*", "*particle, turn off living room light*", etc...

The microservice hosted in Hook.io is written in Node.js. This service receives the text sends from Slack and send to [Api.ai](https://api.ai/) for NLP processing. The Api.ai will parse this test and return the user intention, location, actions etc... The service uses Api.ai Node.js SDK to connect to the server and retrieve the results. After receiving the results from Api.ai, the service calls corresponding Particle Functions to control the lights or retrieve the sensor values.

A pictorial representation of the interaction between the components is:

![Workflow](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/workflow.png)

**Setting up the project**

1. Create an account in [Hook.io](http://hook.io/), create a JavaScript hook and name it "*callapiai*" or whatever you want.
2. Copy [this code](https://raw.githubusercontent.com/krvarma/particle-slack/master/microservice/callapiai.js) from Github and paste it to the hook just created and save it.
3. Setup a Slack Domain and  log on to it.
4. Create a channel named "***particle***"
5. Go to [Slack API](https://api.slack.com/) and create an Outgoing Webhook and enter the following details
	Channel: `#particle`
	Trigger Word: `particle`
	URL: `<<URL to the hook.io microservice created in Step 1>>`
6. Create an Incoming Webhook and enter the following details and note the Webhook URL 
	Post to Channel: `paticle`
7. Open this slack.json file and replace the the URL of the incoming webhook and create a Particle Webhook using the particle cli command
*particle webhook create slack.json*
8. Create an account in Api.ai and create a new Agent
9. Go on to Settings->Export and Import and import the intents and actions from this [ZIP file](https://github.com/krvarma/particle-slack/blob/master/api.ai/particle-integration.zip).
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

**Schematics**

![Schematics](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/schematics.png)

**Screenshots/Images**

*Slack Outgoing Webhook*
![Slack Outgoing Webhook](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/outgoinghook.png)

*Slack Incoming Webhook*
![Slack Incoming Webhook](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/incomingwebhook.png)

*Api.ai Intent*
![Api.ai Intent](https://raw.githubusercontent.com/krvarma/particle-slack/master/images/api.ai_exp.png)
