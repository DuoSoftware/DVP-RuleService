var restify = require('restify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logHandler = require('DVP-Common/LogHandler/CommonLogHandler.js');
var config = require('config');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;
var hostVersion = config.Host.Version;


var ruleBackendHandler = require('./CallRuleBackendOperations.js');


var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/DVP/API/' + hostVersion + '/CallRule/GetCallRules/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        ruleBackendHandler.GetCallRulesForCompany(companyId, tenantId, function (err, result)
        {
            if (err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(err, "Get call rules success", true, result);
                res.end(jsonString);
            }
        });

        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/CallRule/GetCallRule/:id/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        ruleBackendHandler.GetCallRuleById(id, companyId, tenantId, function (err, result)
        {
            if (err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(err, "Get call rule success", true, result);
                res.end(jsonString);
            }
        });

        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetTrunkNumber/:id/:trunkNumber/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var trunkNumber = req.params.trunkNumber;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetOutboundRuleTrunkNumber(id, trunkNumber, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule activity set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleRegEx/:id/:DNISRegExMethod/:ANIRegExMethod/:DNIS/:ANI/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var DNISRegExMethod = req.params.DNISRegExMethod;
        var ANIRegExMethod = req.params.ANIRegExMethod;
        var DNIS = req.params.DNIS;
        var ANI = req.params.ANI;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetCallOutboundRuleRegEx(id, DNISRegExMethod, ANIRegExMethod, DNIS, ANI, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule activity set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleAvailability/:id/:enabled/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var enabled = req.params.enabled;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetCallRuleAvailability(id, enabled, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule activity set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRulePriority/:id/:priority/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var priority = req.params.priority;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetCallRulePriority(id, priority, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule priority set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleSchedule/:id/:scheduleId/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var priority = req.params.scheduleId;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetCallRuleSchedule(id, scheduleId, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule schedule set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleTranslation/:id/:transId/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var transId = req.params.transId;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        if(id)
        {
            ruleBackendHandler.SetCallRuleTranslation(id, transId, companyId, tenantId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule translation set successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/AddOutboundRule', function(req, res, next)
{
    try
    {
        var ruleInfo = req.body;

        if(ruleInfo)
        {
            ruleBackendHandler.AddOutboundRule(ruleInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Outbound Rule Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

//{"CallRuleDescription": "ff", "ObjClass": "MM", "ObjType":"Inbound", "ObjCategory": "URL", "Enable":true, "CompanyId": 1, "TenantId": 3, "RegExPattern":"StartWith", "ANIRegExPattern": "StartWith", "DNIS": "123", "ANI":"", "Priority": 1, "TargetScript": "ppppp", "ScheduleId":2,                                        "ExtraData": "dfd"}
server.post('/DVP/API/' + hostVersion + '/CallRule/AddInboundRule', function(req, res, next)
{
    try
    {
        var ruleInfo = req.body;

        if(ruleInfo)
        {
            ruleBackendHandler.AddInboundRule(ruleInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Inbound Rule Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRule/DeleteRule/:id/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        intId = parseInt(id);

        if(intId != NaN)
        {
            ruleBackendHandler.DeleteCallRule(id, companyId, tenantId, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Rule Deleted Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Rule Id need to be an integer");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});


server.listen(hostPort, hostIp, function () {
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
