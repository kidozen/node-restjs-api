var assert  = require('assert');
var http    = require('http');
var Stream  = require('stream');
        
describe('Rest connector:', function(){

    var Connector = require('../index.js');
    var server = null;
    var config = null;

    beforeEach(function() { 
        config = {
            endpoint: 'http://localhost:9615'
        };
    });

    afterEach(function(done) {
        if (server) {
            server.close(done);
            server = null;
        } else {
            done();
        }
    });

    it('Can be created', function(){
        assert.ok(Connector);
        assert.equal(typeof Connector, 'function');
    });

    it('Connector should fail if endpoint is missing', function(done){
        try
        {
            var instance = new Connector({});
        }
        catch(e)
        {
            assert.ok(e);
            done();
        }
    });

    it('Connection should work if endpoint is a valid url', function(){
        var instance = new Connector(config);
        assert.ok(instance);
    });

    it('HTTP requests should fail if no method', function (done) {
        var instance = new Connector(config);
        instance.exec({ }, function (err, result) { 
            assert.ok(err instanceof Error);
            done();
        });
    });

    it('HTTP requests should fail on invalid method', function (done) {
        var instance = new Connector(config);
        instance.exec({ method: "" }, function (err, result) { 
            assert.ok(err instanceof Error);
            done();
        });
    });

    it('should make HTTP requests', function (done) {

        server = http.createServer(function (req, res) {
            assert.equal('GET', req.method);
            assert.equal('/foo', req.url);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello World');
        }).listen(9615);
        
        var instance = new Connector(config);
        instance.exec({ method:'get', path: '/foo' }, function (err, result) {
            assert.ok(!err);
            assert.ok(result);
            assert.equal(200, result.status);
            assert.equal('text/plain', result.headers['content-type']);
            assert.equal('Hello World', result.body);
            done();
        });
    });

    it("'stream' option must work", function (done) {

        server = http.createServer(function (req, res) {
            res.setHeader("x-foo", "bar");
            res.setHeader("Content-Type", "text/baz");
            res.statusCode = 201;
            res.end();
        }).listen(9615);
        
        var instance = new Connector(config);
        instance.exec({ method:'get', path: '/foo', stream: true}, function(err, result) {
            assert.ok(!err);
            assert.ok(result instanceof Stream);
            assert.equal("bar", result.headers["x-foo"]);
            assert.equal("text/baz", result.headers["content-type"]);
            assert.equal(201, result.statusCode);
            done();            
        });
    });

    describe ("headers", function() {
        it('should use headers from configuration', function (done) {

            server = http.createServer(function (req, res) {
                assert.equal("bar", req.headers.foo)
                res.end();
            }).listen(9615);
            
            config.headers =  { foo: "bar" };
            var instance = new Connector(config);
            instance.exec({ method:'get', path: '/foo' }, function() {
                done();            
            });
        });

        it('should use headers from request', function (done) {

            server = http.createServer(function (req, res) {
                assert.equal("bar", req.headers.foo)
                res.end();
            }).listen(9615);
            
            var instance = new Connector(config);
            instance.exec({ method:'get', path: '/foo', headers: { foo: "bar" }}, function() {
                done();            
            });
        });

        it('headers from request should override headers from configuration', function (done) {

            server = http.createServer(function (req, res) {
                assert.equal("ok", req.headers.foo)
                res.end();
            }).listen(9615);
            
            config.headers =  { foo: "fail" };
            var instance = new Connector(config);
            instance.exec({ method:'get', path: '/foo', headers: { foo: "ok" }}, function() {
                done();            
            });
        });
    });
});
