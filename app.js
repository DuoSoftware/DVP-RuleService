var restify = require('restify');
var messageFormatter = require('./DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logHandler = require('./DVP-Common/LogHandler/CommonLogHandler.js');
var gwBackendHandler = require('./TrunkBackendHandler.js');

var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.listen(9093, 'localhost', function () {
    console.log('%s listening at %s', server.name, server.url);
});