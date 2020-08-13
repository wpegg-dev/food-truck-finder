import { BotDeclaration, MessageExtensionDeclaration, PreventIframe } from "express-msteams-host";
import * as debug from "debug";
import { DialogSet, DialogState } from "botbuilder-dialogs";
import { StatePropertyAccessor, CardFactory, TurnContext, MemoryStorage, ConversationState, ActivityTypes, TeamsActivityHandler } from "botbuilder";
import WelcomeCard from "./dialogs/WelcomeDialog";
import FoodHelper from "./helpers/FoodHelper";
let FoodTruckResultsCard = require('./dialogs/FoodTruckResultsCard.json');

// Initialize debug logging module
const log = debug("msteams");

/**
 * Implementation for FoodTrucker Bot
 */
@BotDeclaration(
    "/api/messages",
    new MemoryStorage(),
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD)

export class FoodTruckerBot extends TeamsActivityHandler {
    private readonly conversationState: ConversationState;
    private readonly dialogs: DialogSet;
    private dialogState: StatePropertyAccessor<DialogState>;

    /**
     * The constructor
     * @param conversationState
     */
    public constructor(conversationState: ConversationState) {
        super();
        
        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.dialogs = new DialogSet(this.dialogState);

        // Set up the Activity processing

        this.onMessage(async (context: TurnContext): Promise<void> => {
            // TODO: add your own bot logic in here
            switch (context.activity.type) {
                case ActivityTypes.Message:
                    let text = TurnContext.removeRecipientMention(context.activity);
                    text = text.toLowerCase();
                    if (text.startsWith("find near")) { //TODO: this could probably be cleaned up with regex so it isn't such a hard check
                        let streetAddress =  encodeURI(text.replace("find near","").trim());
                        if(streetAddress.length > 0){
                            let coordinates = await FoodHelper.convertStreetAddressToCoord(streetAddress);
                            let closestTrucks = await FoodHelper.getClosestAndValidateEnoughLocations(coordinates);
                            let finalTruckList = FoodHelper.getTruckLocationCache()
                                .filter(at => closestTrucks.findIndex(function(ct) { return ct.id === at.objectid }) >= 0)
                                .map(function(e) {
                                    let ct = closestTrucks.findIndex(function(ct) { return ct.id === e.objectid });
                                    return {
                                        "type": "TextBlock",
                                        "spacing": "medium",
                                        "size": "default",
                                        "text": "* **Truck/Cart Name:** "+e.applicant+" **Serving:** "+e.fooditems.replace(/:/gi,",")+" **Located At:** ["+e.address+"](https://www.google.com/maps/search/?api=1&query="+e.latitude+","+e.longitude+") **Distance:** "+closestTrucks[ct].distance.toFixed(2)+" miles",
                                        "wrap": true,
                                        "maxLines": 0
                                    }
                                });
                            FoodTruckResultsCard.body = FoodTruckResultsCard.body.concat(finalTruckList);
                            await context.sendActivity({ attachments: [CardFactory.adaptiveCard(FoodTruckResultsCard)] });
                        } else {
                            await context.sendActivity(`I\'m terribly sorry, but my it looks like I didn't understand your request.`);
                        }
                    } else if (text.startsWith("help")) {
                        // await context.sendActivity(`If you're looking for food trucks and carts near to you just use one of the following commands to find some food:\n* **Find food** - This will return a list of approved trucks and carts within a 1 mile radius`);
                        await context.sendActivity(`I\'m here to help you find some food! simply type **Find near [street address]** and I'll tell you what's near by.\n\nExample:\n\n**Find near 555 California Street**`);
                    } else {
                        await context.sendActivity(`I\'m terribly sorry, but my it looks like I didn't understand your request.`);
                    }
                    break;
                default:
                    break;
            }
            // Save state changes
            return this.conversationState.saveChanges(context);
        });

        this.onConversationUpdate(async (context: TurnContext): Promise<void> => {
            if (context.activity.membersAdded && context.activity.membersAdded.length !== 0) {
                for (const idx in context.activity.membersAdded) {
                    if (context.activity.membersAdded[idx].id === context.activity.recipient.id) {
                        const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                        await context.sendActivity({ attachments: [welcomeCard] });
                    }
                }
            }
        });

        this.onMessageReaction(async (context: TurnContext): Promise<void> => {
            const added = context.activity.reactionsAdded;
            if (added && added[0]) {
                await context.sendActivity({
                    textFormat: "xml",
                    text: `That was an interesting reaction (<b>${added[0].type}</b>)`
                });
            }
        });;
   }


}
