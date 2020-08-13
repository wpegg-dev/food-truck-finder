# Food Truck Finder

This is a project that I am working on to help design a simple system that will allow people who loves to discover new places to eat. Specifically eating at food trucks in the San Fransisco area.

## Design Process

Before jumping right into coding I thought it would be a good idea to look at he people this would be for. The assignment is fairly generic so I took it upon myself to look into creating personas to help have a clear picture of the individuals this could be of use to. 

In the past I have not created many personas so I took a few minutes to read up on common practices. I found [this](https://www.microsoft.com/design) great toolkit and activities about inclusive designs and it's what helped me to come up with my personas which can be found [here](docs/personas/)

I decided to get started with [Patrick](docs/personas/patrick.md) because he offers a unique experience and pain-points for the solution. 

## MVP

To get the MVP put together I've decided that in an effort to help meet the needs of Patrick this will be a Teams Bot. The service will allow the individual to interact with the bot to find nearby food trucks.

#### Technology

* NodeJS / Express
* Azure
* MS Teams
* TypeScript
* Bot Framework
* Azure MS Maps

#### Local Setup

1. Make sure you have [NodeJS](https://nodejs.org/en/download/) installed
2. Make sure you've downloaded and installed the [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.9.0) for local testing
3. Follow the steps [here](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0&tabs=javascript) on how to get running locally.

## Future Updates

* Add a web view to allow interaction via web browser and/or mobile device 
* Create ability to initiate search via SMS and push to MS Teams as well
* Add ability to send the location via SMS for people who cannot use GPS or Web data