---
layout: page
title: "Pebble.js"
date:   2022-12-22 11:21:42

permalink: /
---
# Updated Documentation for Pebble.js

Want to make a Pebble app? If so, you've come to the right place! These pages document how to program your Pebble smartwatch with JavaScript. Here are some things to note:
- The Pebble app most be open on your companion device for Pebble.js apps to work on the watch. Thus, they are best suited to pulling information from the web such as sports and news data. (HTTP requests)
- Pebble.js apps are a bit more resource intensive and will drain watch and phone battery life faster than native apps. They are also a bit slower than their native counterparts.
- Pebble.js app bundles can be edited by renaming the file extension from .pbw to .zip, so it is very easy to reference existing projects. Also check GitHub!
- For JS watchface development, consider checking out [RockyJS](https://developer.rebble.io/developer.pebble.com/guides/rocky-js/rocky-js-overview/index.html).
- Note that Pebble.js was still in beta when Pebble folded, so anticipate some weirdness! Don't worry, it's just part of the fun. ;)

## Table of Contents
It's time to begin your Pebble.js journey! We recommend starting with the basics, as seen below. Godspeed, fellow Rebbler!

### The Basics
1. [Getting Started](getting_started.md)
2. [Images](images.md)
3. [Fonts](fonts.md)
4. [Using Color](using_color.md)
5. [Feature Detection](feature_detection.md)

### API Reference
#### Main Stuff
- [Require](main/require.md)
- [Pebble](main/pebble.md)
- [Local Storage](main/local_storage.md)
- [XMLHttpRequest](main/xmlhttprequest.md)
- [Window (Browser)](main/window_browser.md)
- [Clock](main/clock.md)
- [Platform](main/platform.md)
- [Feature](main/feature.md)
- [Settings](main/settings.md)
- [TimeText](main/timetext.md)

#### Hardware Features
- [Accelerometer](hardware/accel.md)
- [Voice](hardware/voice.md)
- [Vibration Motor](hardware/vibe.md)
- [Light](hardware/light.md)

#### UI Elements
- [Window](ui/window.md)
- [Card](ui/card.md)
- [Menu](ui/menu.md)
- [Text](ui/text.md)
- [Image](ui/image.md)
##### Shapes
- [Element](ui/shapes/element.md)
- [Line](ui/shapes/line.md)
- [Circle](ui/shapes/circle.md)
- [Radial](ui/shapes/radial.md)
- [Rectangle](ui/shapes/rect.md)

#### Miscellaneous
- [Timeline](misc/timeline.md)
- [Wakeup](misc/wakeup.md)

### Libraries
- [Ajax](lib/ajax.md)
- [Vector2](lib/vector2.md)

Documentation maintained by JohnSpahr and BlockArchitech. Long live Rebble!
