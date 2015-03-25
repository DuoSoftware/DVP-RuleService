var restify = require('restify');
var messageFormatter = require('./DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logHandler = require('./DVP-Common/LogHandler/CommonLogHandler.js');
var gwBackendHandler = require('./TrunkBackendHandler.js');
var TH=require('./TranslatioHandler.js');


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
/*
server.post('/dvp/:version/rule_service/translation_handler/translate_handler',function(req,res,next)
{

    try {
        var x=TH.TranslateHandler(req,req.body.t);
        res.end(x);


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "AddAppointment failed", false, res);
        res.end(jsonString);
    }
    return next();
});
*/