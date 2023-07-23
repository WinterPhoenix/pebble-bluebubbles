# BlueBubbles for Pebble (unofficial)

Send iMessages using your Pebble smartwatch!

BlueBubbles works independently of the smartphone you have. This works with both iOS and Android!

## How to use

### Requirements
1. A [Pebble smartwatch](https://en.wikipedia.org/wiki/Pebble_(watch)) (w/ microphone, for now)
2. A [Rebble voice subscription](https://help.rebble.io/subscription/) for reply dictation
3. A [BlueBubbles](https://bluebubbles.app) server

### Installation
You can [download the latest version](https://apps.rebble.io/en_US/application/64bd08371b3bd8056570ae77) from the Rebble App Store, or sideload it from [Releases](https://github.com/WinterPhoenix/pebble-bluebubbles/releases).

### Configuration
Open the Pebble app on your smartphone and tap the settings cog next to BlueBubbles in the Apps list.

There are 3 settings that need to be configured for the app to work:
- **Server URL**: The url your BlueBubbles server can be accessed at
- **Server Password**: The password you use to access your BlueBubbles server
- **Country Calling Code**: The international calling code used for your country
    - Needed to resolve phone numbers for participants in your chats to Contacts in your Apple ID*
    - In the US and Canada, this is +1

\* Please note that if you don't have contact(s) phone number/email addresses saved, we can't display their names for chats! You'll only see their phone number/email address.

##
Inspired by [Pebble-Imessager](https://github.com/integraloftheday/Pebble-Imessager).
