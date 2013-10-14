# REST client for Node.js
This node module provides a set of methods to interact with REST services.
The module was created as part of [KidoZen](http://www.kidozen.com) project, as a connector for its Enterprise API feature.

This module is based on module [Request](http://github.com/mikeal/request.git).

## Installation

Use npm to install the module:

```
> npm install restjs-api
```

## Runing tests

Use npm to run the set of tests:

```
> npm test
```

## API

Due to the asynchronous nature of Nodejs, this module uses callbacks in requests. All callbacks have 2 arguments: `err` and `data`.

```
function callback (err, data) {
	// err contains an Error class instance, if any
	// data contains the resulting data
} 
``` 

### Constructor

The module exports a class and its constructor requires a configuration object with following property:
* `endpoint`: Required string. URL to the service.
* `headers`: Optional object containing http headers, defaults to {}.

```
var Rest = require("restjs-api");
var rest = new Rest({ endpoint: "http://your-service" });
```

### Methods

All public methods has the same signature, their have two arguments: `options` and `callback`:
*   `options` must be an object instance containig all parameters for the method.
*   `callback` must be a function.

#### exec(options, callback)
This method sends an HTTP request to the REST service.

Parameters:

*   `options` (object) Required. Specifies headers, body, timeout, etc. The option 'method' is the only one that is required.
    *       `method`: string. HTTP method. i.e.: GET, POST, DELETE, etc.
    *       `path`: string. resource.
    *       `qs`: object containing querystring values to be appended to the uri
    *       `headers`: http headers, defaults to {}
    *       `body`: entity body for PATCH, POST and PUT requests. Must be buffer or string.
    *       `followRedirect`: follow HTTP 3xx responses as redirects. defaults to true
    *       `followAllRedirects`: follow non-GET HTTP 3xx responses as redirects. defaults to false.
    *       `maxRedirects`: the maximum number of redirects to follow, defaults to 10.
    *       `encoding`: Encoding to be used on setEncoding of response data. If set to null, the body is returned as a Buffer.
    *       `timeout`: Integer containing the number of milliseconds to wait for a request to respond before aborting the request
    *       `proxy`: An HTTP proxy to be used. Support proxy Auth with Basic Auth by embedding the auth info in the uri.
    *       `jar`: Set to false if you don't want cookies to be remembered for future use or define your custom cookie jar 
    *       `auth`: A hash containing user, password and sendImmediately. See documentation at https://github.com/mikeal/request#http-authentication 
    *       `oauth`: Options for OAuth HMAC-SHA1 signing, see documentation at https://github.com/mikeal/request#oauth-signing
    *       `aws`: Object containing aws signing information, should have the properties key and secret as well as bucket unless you're specifying your bucket as part of the path, or you are making a request that doesn't use a bucket.
*   `callback`: A required function for callback.


#### get(options, callback)
This method is a shortcut to invoke the method `exec` with the option `method = "GET"`

#### put(options, callback)
This method is a shortcut to invoke the method `exec` with the option `method = "PUT"`

#### post(options, callback)
This method is a shortcut to invoke the method `exec` with the option `method = "POST"`

#### delete(options, callback)
This method is a shortcut to invoke the method `exec` with the option `method = "DELETE"`
