---
name: Reservation agent
description: An agent that can make reservations via a phone call 
type: AI-Agent
technologies:
  - TypeScript
  - Python
  - AI-SDK
  - Docker
github: https://github.com/Padi142/reservation-agent
order: 1
---

## TLDR
A bot for managing events with friends and making reservations automatically. When an event is created, you can specify a place by its generic name, like **"Apples and Pears London"**. The bot then does **research** about the place, gets info like opening hours and tries to find a phone number that it can use to make a reservation. If a number is found, the agent then **makes a phone call** to the place and arranges a reservation for the specified time and the number of people. The bot role plays one of my friends by having their voice and name. 

## The why?

With my friends from university, we have a discord server with a dedicated room for various events, like lunch, dinner, afternoon beer or a movie night. Sometimes, it was hard to track who is coming and who is not, because we are a rather large group of friends. I have created a bot, where anyone can create an event, the bot makes a message, pins it and then people can react with emojis to indicate if they are coming or not. The bot also keeps track of the number of people coming and not coming, so that we can easily see how many people are coming to the event. 

![Screenshot from discord showing an example event](/projects/research-agent/screen1.png)

The initial part of this problem was fixed, yay! However, we still had one problem. In some cases its better to make a reservation at a place beforehand, especially when a large group was expected. But choosing someone to make the call can be difficult. After some back and forth and a few rejections from some places due to us not having a reservation. 

Because everyone hates making phone calls, I came with an only valid solution for 2026, make an Agent do it! In the past, I have worked with [AI-sdk](https://ai-sdk.dev) a ton so I decided to use it for this project too. Firstly, the research part. The agent must be able to find a reservation phone number for a place given its name. At first, I wanted to make some kind of web scraper or Google maps integration, but then I realized that the AI-sdk has some third party tools for the agents. I quickly found the [Exa search](https://exa.ai/) toolset and it worker perfectly for my use case. The agent can now find a phone number for a place given its name and location.

```ts
const result = await generateText({
         model: openrouter('openai/gpt-5.4'),
         system: researchSystemPrompt,
         tools: {
           // Exa web search tool (https://github.com/exa-labs/ai-sdk)
             webSearch: webSearch({
                 numResults: 5,
                 contents: {
                     text: { maxCharacters: 3000 },
                     livecrawl: "fallback",
                 },
             }),
         },
         output: Output.object({
             schema: BusinessInfoSchema,
         }),
     });
````
This can take a simple prompt of a place, like **"Alterna Brno"** and produce a structured output with the name, address, phone number and website of the place. 

![Screenshot from discord showing a filled out research ](/projects/research-agent/screen2.png)


Okay, we got the event, the participants and the place. Now we need to make a reservation. For this, I have chosen to use the awesome [ElevenLabs](https://elevenlabs.io/) Voice Agents product. It offers a Twillio integration, giving the voice agent a phone number and the ability to take and make outbound calls, which is exactly what I need. After connecting their api, iterating the system prompt and testing the agent, I was able to make the agent call me and present themselves as someone who wants to make a reservation. This way I could test some scenarios and edge cases to see how the agent would react. 


![Screenshot from Elevenlabs dashboard showing a call transcript](/projects/research-agent/screen3.png)

ElevenLabs was great for this and their dashboard even shows recordings and transcripts of the calls the agent did. I was able to test the agent with a few friends and we had a lot of fun. 

But then came the production test. I wanted to see if the agent could make a reservation at a real place that we actually wanted to go to. I created an event for a dinner at a restaurant and the agent made the call. 
