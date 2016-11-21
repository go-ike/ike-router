# Ike Router
The express router used by [Ike](https://github.com/go-ike/ike-base).

Ike Router inspires itself a lot on the [Rails router](http://guides.rubyonrails.org/routing.html#path-and-url-helpers) and implements some of the basic concepts. You''ll get routes using shorthands, resources and some helpers.

## Installation

Install using npm:
```sh
$ npm install --save ike-router
```

## Usage
Controllers **must** be a class (not even a class instance). Ike router instantiates the class and executes a method within it's context.

```js
// CONTROLLER
class SamplesController {
    constructor() {}
    
    index(req, res) {
        let hello = this.helloWorld();
        res.status(200).send(hello);
    }
    
    helloWorld() {
        retunrn 'Hello world';
    }
}

module.exports = SamplesController;
```

Having controllers like this will make you able to:
```js
// MAIN APP FILE (OR WHATEVER YOU LIKE)
const express = require('express');
const app     = express();
const routes  = require('ike-router')();

routes.get('/', 'samples#index');

app.use('/', routes.draw());
app.listen(3000, () => { console.log('Example running') });
```

This will boot a simple server, routed by Ike router.

## Options
You can choose the **controllers path** when you instantiate the routes object.

```js
...
const routes = require('ike-router')('./controllers/');
...
```

It will be realtive to where the app.js file is being executed from.
