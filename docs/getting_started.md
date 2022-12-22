## Getting Started

So it begins! Just remember, Pebble.js applications follow the best and most modern JavaScript practices circa 2014. Some things might be a bit dated for that reason. Regardless, here's how to get up and running:
 * With the Pebble SDK

   This option allows you to customize Pebble.js. Follow the [Pebble SDK installation instructions](http://help.rebble.io/sdk) to install the SDK on your computer and Install the pebble package.
   ```
   pebble package install pebblejs
   ```
   
   The main entry point for your application is in the `src/js/app.js` file. For projects with multiple files, you may move `src/js/app.js` to `src/js/app/index.js` instead and create new files under `src/js/app`.

   [Install the Pebble SDK on your computer >](http://help.rebble.io/sdk)


To get started, you just need to call `require('ui')` to load the UI module and start building user interfaces.

````js
var UI = require('ui');
````

The basic block to build user interface is the Card. A Card is a type of Window] that occupies the entire screen and allows you to display some text in a pre-structured way: a title at the top, a subtitle below it and a body area for larger paragraphs. Cards can be made scrollable to display large quantities of information. You can also add images next to the title, subtitle or in the body area.

````js
var card = new UI.Card({
  title: 'Hello World',
  body: 'This is your first Pebble app!',
  scrollable: true
});
````

After creating a card window, push it onto the screen with the `show()` method.

````js
card.show();
````

To interact with the users, use the buttons or the accelerometer. Add callbacks to a window with the `.on()` method:

````js
card.on('click', function(e) {
  card.subtitle('Button ' + e.button + ' pressed.');
});
````

Making HTTP connections is very easy with the included `ajax` library.

````js
var ajax = require('ajax');
ajax({ url: 'http://api.theysaidso.com/qod.json', type: 'json' },
  function(data) {
    card.body(data.contents.quotes[0].quote);
    card.title(data.contents.quotes[0].author);
  }
);
````

You can do much more with Pebble.js:

 - Get accelerometer values
 - Display complex UI mixing geometric elements, text and images
 - Animate elements on the screen
 - Display arbitrary long menus
 - Use the GPS and LocalStorage on the phone
 - etc!

<breadcrumb>