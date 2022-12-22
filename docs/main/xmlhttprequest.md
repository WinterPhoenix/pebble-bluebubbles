
### XMLHttpRequest

`XMLHttpRequest` is [available for your use](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), but consider using the [ajax] module instead which provides a jQuery-like ajax alternative to performing asynchronous and synchronous HTTP requests, with built in support for forms and headers.

````js
var ajax = require('ajax');

ajax({ url: 'http://api.theysaidso.com/qod.json', type: 'json' },
  function(data, status, req) {
    console.log('Quote of the day is: ' + data.contents.quotes[0].quote);
  }
);
````
