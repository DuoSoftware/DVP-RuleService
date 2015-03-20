/**
 * Created by pawan on 3/20/2015.
 */

var restify = require('restify');
var t=require('./TranslatioHandler.js');

var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.listen(9095, 'localhost', function () {
    console.log('%s listening at %s', server.name, server.url);

  t.TranslateHandlerById('1');
});

