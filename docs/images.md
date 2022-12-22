## Using Images
[Using Images]: #using-images

You can use images in your Pebble.js application. Currently all images must be embedded in your applications. They will be resized and converted to black and white when you build your project.

We recommend that you follow these guidelines when preparing your images for Pebble:

 * Resize all images for the screen of Pebble. A fullscreen image will be 144 pixels wide by 168 pixels high.
 * Use an image editor or [HyperDither](http://2002-2010.tinrocket.com/software/hyperdither/index.html) to dither your image in black and white.
 * Remember that the maximum size for a Pebble application is 100kB. You will quickly reach that limit if you add too many images.

To add an image in your application, edit the `appinfo.json` file and add your image:

````js
{
  "type": "png",
  "name": "IMAGE_CHOOSE_A_UNIQUE_IDENTIFIER",
  "file": "images/your_image.png"
}
````

To reference your image in Pebble.js, you can use the `name` field or the `file` field.

````js
// These two examples are both valid ways to show the image declared above in a Card
card.icon('images/your_image.png');
card.icon('IMAGE_CHOOSE_A_UNIQUE_IDENTIFIER');
````

You can also display images with [Image] when using a dynamic [Window].

````js
// This is an example of using an image with Image and Window
var UI = require('ui');
var Vector2 = require('vector2');

var wind = new UI.Window({ fullscreen: true });
var image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  image: 'images/your_image.png'
});
wind.add(image);
wind.show();
````

## Using Fonts
[Using Fonts]: #using-fonts

You can use any of the Pebble system fonts in your Pebble.js applications. Please refer to [this guide to](https://developer.rebble.io/developer.pebble.com/guides/app-resources/system-fonts/index.html) for a list of all the Pebble system fonts. When referring to a font, using lowercase with dashes is recommended. For example, `GOTHIC_18_BOLD` becomes `gothic-18-bold`.

````js
var Vector2 = require('vector2');

var wind = new UI.Window();
var textfield = new UI.Text({
 position: new Vector2(0, 0),
 size: new Vector2(144, 168),
 font: 'gothic-18-bold',
 text: 'Gothic 18 Bold'
});
wind.add(textfield);
wind.show();
````
