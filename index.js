var request = require("request");
var configProperties = [
        "qs", "body", "followRedirect",
        "followAllRedirects", "maxRedirects", "encoding", 
        "timeout", "proxy", "jar", "auth", "oauth", "aws"
    ];

module.exports = function(config){

    // Validates arguments
    if (typeof config !== 'object') throw Error("'config' argument must be an object instance.");
    if (!config.endpoint) throw Error("'endpoint' property is missing.");
    if (config.headers && typeof config.headers!=='object') throw Error("'headers' property is invalid.");

    // variables
    var self = this;
    this.config = config;

    this.exec = function (options, cb) {
        if (!options || !options.method || typeof options.method !== 'string') return cb(new Error("Property 'options.method' is missing or invalid."));
        options.method = options.method.toUpperCase();
        _exec(options, cb);
    };
    
    this.get = function (options, cb) {
        if (options) options.method = "GET";
        _exec(options, cb);
    };
    
    this.post = function (options, cb) {
        if (options) options.method = "POST";
        _exec(options, cb);
    };
    
    this.put = function (options, cb) {
        if (options) options.method = "PUT";
        _exec(options, cb);
    };
    
    this.delete = function (options, cb) {
        if (options) options.method = "DELETE";
        _exec(options, cb);
    };
    
    /**
     * function _exec ([options,] cb)
     *
     * @param  options (object) Optional. Specifies headers, body, timeout, etc. All options listed bellow are optionals.
     *       path                - string. resource
     *       qs                  - object containing querystring values to be appended to the uri
     *       headers             - http headers, defaults to {}
     *       body                - entity body for PATCH, POST and PUT requests. Must be buffer or string.
     *       followRedirect      - follow HTTP 3xx responses as redirects. defaults to true
     *       followAllRedirects  - follow non-GET HTTP 3xx responses as redirects. defaults to false.
     *       maxRedirects        - the maximum number of redirects to follow, defaults to 10.
     *       encoding            - Encoding to be used on setEncoding of response data. If set to null, the body is returned as a Buffer.
     *       timeout             - Integer containing the number of milliseconds to wait for a request to respond before aborting the request
     *       proxy               - An HTTP proxy to be used. Support proxy Auth with Basic Auth by embedding the auth info in the uri.
     *       jar                 - Set to false if you don't want cookies to be remembered for future use or define your custom cookie jar 
     *       auth                - A hash containing user, password and sendImmediately. See documentation at https://github.com/mikeal/request#http-authentication 
     *       oauth               - Options for OAuth HMAC-SHA1 signing, see documentation at https://github.com/mikeal/request#oauth-signing
     *       stream              - A boolean that specifies if the response ust be a stream.
     *       aws                 - Object containing aws signing information, should have the properties key and secret as well as bucket 
     *                             unless you're specifying your bucket as part of the path, or you are making a request that doesn't use a bucket 
     * 
     * @param cb (function) Required. Callback function
     **/
    var _exec = function (options, cb) {

        // validates arguments
        var args = Array.prototype.slice.call(arguments, 0);
        if (args.length === 0) {
            throw "Callback is missing.";
        }

        if (typeof options === 'function') {
            cb = options;
            options = {};
        }
        
        if (typeof cb !== 'function') throw new Error("Callback argument must be a function.");
        if (typeof options !== 'object') return cb(new Error("'options' argument must be an object instance."));
        if (options.headers && typeof options.headers!=='object') cb(Error("'options.headers' property is invalid."));

        // Set the options that will be used in the request.
        // The set of options will be the result of merging globalConfig and options.
        var optionsToUse = {};
        configProperties.forEach(function (prop) {
            if (prop in options) optionsToUse[prop] = options[prop];
            else if (prop in self.config) optionsToUse[prop] = self.config[prop];
        });

        // set default headers
        optionsToUse.headers = merge(options.headers, self.config.headers);

        var metadata = options._kidozen || options.metadata;
        if (metadata && metadata.actAs) {
            optionsToUse.headers.authorization = metadata.actAs;
        };
        
        // set required options
        optionsToUse.method = options.method || "GET";
        optionsToUse.url = self.config.endpoint + (options.path || "");

        if (options.stream) {
            
            // send request and pipe the response
            cb(null, request(optionsToUse));

        } else {
            
            // send request and wait for its response
            request(optionsToUse, function(error, response) {            
                cb(error, response ? {
                        status: response.statusCode,
                        headers: response.headers,
                        body: tryParseBodyAsJson(response)
                    } : null );
            });
        }
    };

    var tryParseBodyAsJson = function (response) {
        var contentType = getHeader(response.headers, "content-type");
        if (contentType && contentType.toLowerCase().indexOf("json")!==-1) {
            try {
                return JSON.parse(response.body);
            }
            catch (e) {
            }
        }
        return response.body;
    };

    var getHeader = function (headers, name) {
        if (headers && name) {
            name = name.toLowerCase();
            for (var prop in headers) {
                if (prop.toLowerCase()===name) {
                    return headers[prop];
                }
            }
        }
        return null;
    };

    // Merges two objects. Properties from object 'a' prevail over properties from object 'b'. 
    var merge = function (a, b) {

        var result = {};
        var propsA = Object
            .keys(a || {})
            .forEach(function (propA) { result[propA] = a[propA]; });

        Object
            .keys(b || {})
            .filter(function (propB) { return !(propB in result); })
            .forEach(function (propB) { 
                result[propB] = b[propB];
            });

        return result;
    };
};

