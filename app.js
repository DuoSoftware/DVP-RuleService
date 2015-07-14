var restify = require('restify');
var uuid = require('node-uuid');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;
var hostVersion = config.Host.Version;


var ruleBackendHandler = require('./CallRuleBackendOperations.js');
var transBackendHandler = require('./TranslationBackendOperations.js');


var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

restify.CORS.ALLOW_HEADERS.push('api_key');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


//server.get('/DVP/API/' + hostVersion + '/CallRule/GetCallRules/:companyId/:tenantId', function(req, res, next)
server.get('/DVP/API/' + hostVersion + '/CallRuleApi/CallRules', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.GetCallRules] - [%s] - HTTP Request Received', reqId);

        var companyId = 1;
        var tenantId = 1;

        ruleBackendHandler.GetCallRulesForCompany(companyId, tenantId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.GetCallRules] - [%s] - Exception occurred on method GetCallRulesForCompany', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.GetCallRules] - [%s] - Get call rules success - Returned : [%j]' + reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get call rules success", true, result);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRules] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});
//server.get('/DVP/API/' + hostVersion + '/CallRule/GetCallRule/:id/:companyId/:tenantId', function(req, res, next)
server.get('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var id = req.params.id;

        logger.debug('[DVP-RuleService.GetCallRule] - [%s] - HTTP Request Received - Req Params : Id : %s', reqId, id);

        var companyId = 1;
        var tenantId = 1;

        ruleBackendHandler.GetCallRuleById(id, companyId, tenantId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.GetCallRule] - [%s] - Exception occurred on method GetCallRuleById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.GetCallRule] - [%s] - Get call rule by id success - Returned : %j', reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get call rule success", true, result);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.GetCallRule] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/Outbound/ANI/:ani/DNIS/:dnis', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ani = req.params.ani;
        var dnis = req.params.dnis;

        logger.debug('[DVP-RuleService.CallRuleById] - [%s] - HTTP Request Received - Req Params : ani : %s, dnis : %s', reqId, ani, dnis);

        var companyId = 1;
        var tenantId = 1;

        ruleBackendHandler.PickCallRuleOutboundComplete(ani, dnis, '', '', companyId, tenantId, false, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.CallRuleById] - [%s] - Exception occurred on method GetCallRuleById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.CallRuleById] - [%s] - Get call rule by id success - Returned : %j', reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get call rule success", true, result);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.CallRuleById] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetTrunkNumber/:id/:trunkNumber/:companyId/:tenantId', function(req, res, next)
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetNumber/:trNum', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var trunkNumber = req.params.trNum;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.CallRuleSetNumber] - [%s] - HTTP Request Received - Req Params : Id : %s, TrunkNumber : %s', reqId, id, trunkNumber);

        if(id)
        {
            ruleBackendHandler.SetOutboundRuleTrunkNumber(id, companyId, tenantId, trunkNumber, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetNumber] - [%s] - Exception occurred on method SetOutboundRuleTrunkNumber', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetNumber] - [%s] - assign trunk number to outbound rule success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk number added to outbound rule successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.CallRuleSetNumber] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleRegEx/:id/:DNISRegExMethod/:ANIRegExMethod/:DNIS/:ANI/:companyId/:tenantId', function(req, res, next)
//params added to body
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetRegEx', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var DNISRegExMethod = req.body.DNISRegExMethod;
        var ANIRegExMethod = req.body.ANIRegExMethod;
        var DNIS = req.body.DNIS;
        var ANI = req.body.ANI;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.SetCallRuleRegEx] - [%s] - HTTP Request Received - Req Params : Id : [%s], DNISRegExMethod : [%s], ANIRegExMethod : [%s], DNIS : [%s], ANI : [%s]', reqId, id, DNISRegExMethod, ANIRegExMethod, DNIS, ANI);

        if(id)
        {
            ruleBackendHandler.SetCallRuleRegEx(id, DNISRegExMethod, ANIRegExMethod, DNIS, ANI, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.SetCallRuleRegEx] - [%s] - Exception occurred on method SetCallRuleRegEx', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug(format('[DVP-RuleService.SetCallRuleRegEx] - [%s] - set call rule reg ex success - Returned : [%s]', reqId, result));
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule reg ex set successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.SetCallRuleRegEx] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleAvailability/:id/:enabled/:companyId/:tenantId', function(req, res, next)
//added some params to get from body
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetAvailability/:enabled', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var enabled = req.params.enabled;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.CallRuleSetAvailability] - [%s] - HTTP Request Received - Req Params : Id : %s, enabled : %s', reqId, id, enabled);

        if(id)
        {
            ruleBackendHandler.SetCallRuleAvailability(id, enabled, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetAvailability] - [%s] - Exception occurred on method SetCallRuleAvailability', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetAvailability] - [%s] - set call rule availability success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule availability set successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.CallRuleSetAvailability] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRulePriority/:id/:priority/:companyId/:tenantId', function(req, res, next)
//some params moved to body
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetPriority/:priority', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var priority = req.params.priority;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.CallRuleSetPriority] - [%s] - HTTP Request Received - Req Params : Id : %s, priority : %s', reqId, id, priority);

        if(id)
        {
            ruleBackendHandler.SetCallRulePriority(id, priority, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetPriority] - [%s] - Exception occurred on method SetCallRulePriority', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetPriority] - [%s] - set call rule priority success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule priority set successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.CallRuleSetPriority] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleSchedule/:id/:scheduleId/:companyId/:tenantId', function(req, res, next)
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetSchedule/:scheduleId', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var scheduleId = req.params.scheduleId;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.CallRuleSetSchedule] - [%s] - HTTP Request Received - Req Params : Id : %s, scheduleId : %s', reqId, id, scheduleId);

        if(id)
        {
            ruleBackendHandler.SetCallRuleSchedule(id, scheduleId, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetSchedule] - [%s] - Exception occurred on method SetCallRuleSchedule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetSchedule] - [%s] - set call rule schedule success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule schedule set successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.CallRuleSetSchedule] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetCallRuleTranslation/:id/:transId/:companyId/:tenantId', function(req, res, next)
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id/SetTranslation/:transId', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var transId = req.params.transId;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.CallRuleSetTranslation] - [%s] - HTTP Request Received - Req Params : Id : %s, transId : %s', reqId, id, transId);

        if(id)
        {
            ruleBackendHandler.SetCallRuleTranslation(id, transId, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetTranslation] - [%s] - Exception occurred on method SetCallRuleTranslation', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetTranslation] - [%s] - set call rule translation success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Call rule translation set successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty id");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.CallRuleSetTranslation] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:ruleId/SetApplication/:appId', function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.ruleId;
        var appId = req.params.appId;

        logger.debug('[DVP-RuleService.CallRuleSetApplication] - [%s] - HTTP Request Received - Req Params : ruleId : %s, appId : %s', reqId, id, appId);

        if(id && appId)
        {
            ruleBackendHandler.SetCallRuleAppDB(reqId, id, appId, 1, 1, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.CallRuleSetApplication] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "App added to call rule successfully", result, undefined);
                    logger.debug('[DVP-PBXService.CallRuleSetApplication] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty params"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.CallRuleSetApplication] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.CallRuleSetApplication] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/AddOutboundRule', function(req, res, next)
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/Outbound', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ruleInfo = req.body;

        logger.debug('[DVP-RuleService.AddOutboundRule] - [%s] - HTTP Request Received - Req Body : %j', reqId, ruleInfo);

        if(ruleInfo)
        {
            ruleBackendHandler.AddOutboundRule(ruleInfo, function(err, recordId, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.AddOutboundRule] - [%s] - Exception occurred on method ruleBackendHandler.AddOutboundRule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.AddOutboundRule] - [%s] - add outbound rule success - Returned : %s', reqId, recordId);
                    var jsonString = messageFormatter.FormatMessage(err, "Outbound Rule Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.AddOutboundRule] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

//{"CallRuleDescription": "ff", "ObjClass": "MM", "ObjType":"Inbound", "ObjCategory": "URL", "Enable":true, "CompanyId": 1, "TenantId": 3, "RegExPattern":"StartWith", "ANIRegExPattern": "StartWith", "DNIS": "123", "ANI":"", "Priority": 1, "TargetScript": "ppppp", "ScheduleId":2,                                        "ExtraData": "dfd"}
//server.post('/DVP/API/' + hostVersion + '/CallRule/AddInboundRule', function(req, res, next)
server.post('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/Inbound', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ruleInfo = req.body;

        logger.debug('[DVP-RuleService.AddInboundRule] - [%s] - HTTP Request Received - Req Body : %j', reqId, ruleInfo);

        if(ruleInfo)
        {

            ruleBackendHandler.AddInboundRule(ruleInfo, function(err, recordId, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.AddInboundRule] - [%s] - Exception occurred on method ruleBackendHandler.AddInboundRule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.AddInboundRule] - [%s] - add inbound rule success - Returned : %s', reqId, recordId);
                    var jsonString = messageFormatter.FormatMessage(err, "Inbound Rule Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.AddInboundRule] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/DeleteRule/:id/:companyId/:tenantId', function(req, res, next)
server.del('/DVP/API/' + hostVersion + '/CallRuleApi/CallRule/:id', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var id = req.params.id;
        var companyId = 1;
        var tenantId = 1;

        logger.debug('[DVP-RuleService.DeleteCallRule] - [%s] - HTTP Request Received - Req Params - Id : %s', reqId);

        intId = parseInt(id);

        if(intId != NaN)
        {
            ruleBackendHandler.DeleteCallRule(id, companyId, tenantId, function(err, recordId, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.DeleteCallRule] - [%s] - Exception occurred on method ruleBackendHandler.AddInboundRule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.DeleteCallRule] - [%s] - delete call rule success - Returned : %s', reqId, recordId);
                    var jsonString = messageFormatter.FormatMessage(err, "Rule Deleted Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Rule Id need to be an integer");
        }
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.DeleteCallRule] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/CallRuleApi/Translations', function(req, res, next)
{
    var emptyArr = [];
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.TranslationsByCompany] - [%s] - HTTP Request Received', reqId);

        var companyId = 1;
        var tenantId = 1;

        transBackendHandler.GetAllTranslationsForCompany(companyId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.TranslationsByCompany] - [%s] - Exception occurred on method GetAllTranslationsForCompany', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.TranslationsByCompany] - [%s] - Get translations for company success - Returned : ', reqId, JSON.stringify(result));
                var jsonString = messageFormatter.FormatMessage(err, "Get translations for company success", true, result);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.TranslationsByCompany] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/CallRuleApi/Translation/:id', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.TranslationById] - [%s] - HTTP Request Received', reqId);

        var transId = req.params.id;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        transBackendHandler.GetTranslationById(transId, companyId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.TranslationById] - [%s] - Exception occurred on method GetTranslationById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.TranslationById] - [%s] - Get translation by id success - Returned : [%j]' + reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get translation by id success", true, result);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.TranslationById] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRuleApi/Translation', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.SaveTranslation] - [%s] - HTTP Request Received', reqId);

        var transObj = req.body;

        transBackendHandler.AddNewTranslation(transObj, function (err, transId, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.SaveTranslation] - [%s] - Exception occurred on method AddNewTranslation', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, transId);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.SaveTranslation] - [%s] - Add new translation success - Returned : [%s]' + reqId, transId);
                var jsonString = messageFormatter.FormatMessage(err, "Add new translation success", result, transId);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.SaveTranslation] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/CallRuleApi/ExistingTranslation/:id', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.UpdateTranslation] - [%s] - HTTP Request Received', reqId);

        var transId = req.params.id;
        var transObj = req.body;

        transBackendHandler.UpdateTranslation(transId, transObj, function (err, result)
        {
            transObj.CompanyId = 1;
            transObj.TenantId = 3;

            if (err)
            {
                logger.error('[DVP-RuleService.UpdateTranslation] - [%s] - Exception occurred on method UpdateTranslation', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, undefined);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.UpdateTranslation] - [%s] - Update translation success - Returned : [%s]' + reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Add new translation success", result, undefined);
                res.end(jsonString);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.UpdateTranslation] - [%s] - Exception occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});


server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});

