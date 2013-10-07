var assert = require('assert');
        
describe('Rest connector:', function(){

    var Connector = require('../index.js');
    var config = {
            endpoint: 'http://localhost:9615'
        };

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
        var http = require('http');
        http.createServer(function (req, res) {
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
});
