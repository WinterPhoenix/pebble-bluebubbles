### Light
[Light]: #light

`Light` allows you to control the Pebble's backlight.
````js
var Light = require('ui/light');

// Turn on the light
Light.on('long');
````

#### Light.on()
Turn on the light indefinitely.

#### Light.auto()
Restore the normal behavior.

#### Light.trigger()
Trigger the backlight to turn on momentarily, just like if the user shook their wrist.