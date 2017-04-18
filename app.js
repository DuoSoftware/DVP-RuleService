var restify = require('restify');
var uuid = require('node-uuid');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;
var hostVersion = config.Host.Version;


var ruleBackendHandler = require('./CallRuleBackendOperations.js');
var transBackendHandler = require('./TranslationBackendOperations.js');


var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(jwt({secret: secret.Secret}));



//server.get('/DVP/API/' + hostVersion + '/CallRule/GetCallRules/:companyId/:tenantId', function(req, res, next)
server.get('/DVP/API/:version/CallRuleApi/CallRules', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.GetCallRules] - [%s] - HTTP Request Received', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        ruleBackendHandler.GetCallRulesForCompany(reqId, companyId, tenantId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.GetCallRules] - [%s] - Exception occurred on method GetCallRulesForCompany', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.GetCallRules] - [%s] - Get call rules success - Returned : [%s]' + reqId, JSON.stringify(result));
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

server.get('/DVP/API/:version/CallRuleApi/CallRules/Direction/:direction', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.GetCallRulesByDirection] - [%s] - HTTP Request Received', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        var direction = req.params.direction;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        ruleBackendHandler.GetCallRulesByDirection(reqId, companyId, tenantId, direction, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.GetCallRulesByDirection] - [%s] - Exception occurred on method GetCallRulesByDirection', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.GetCallRulesByDirection] - [%s] - Get call rules success - Returned : [%s]' + reqId, JSON.stringify(result));
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
server.get('/DVP/API/:version/CallRuleApi/CallRule/:id', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var id = req.params.id;

        logger.debug('[DVP-RuleService.GetCallRule] - [%s] - HTTP Request Received - Req Params : Id : %s', reqId, id);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if(!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }


        ruleBackendHandler.GetCallRuleById(reqId, id, companyId, tenantId, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.GetCallRule] - [%s] - Exception occurred on method GetCallRuleById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.GetCallRule] - [%s] - Get call rule by id success - Returned : %s', reqId, JSON.stringify(result));
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

server.get('/DVP/API/:version/CallRuleApi/CallRule/Outbound/ANI/:ani/DNIS/:dnis', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ani = req.params.ani;
        var dnis = req.params.dnis;

        logger.debug('[DVP-RuleService.PickOutboundRule] - [%s] - HTTP Request Received - Req Params : ani : %s, dnis : %s', reqId, ani, dnis);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if(!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        ruleBackendHandler.PickCallRuleOutboundComplete(reqId, ani, dnis, '', '', companyId, tenantId, false, null, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.PickOutboundRule] - [%s] - Exception occurred on method GetCallRuleById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.PickOutboundRule] - [%s] - Get call rule by id success - Returned : %j', reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get call rule success", true, result);
                res.end(jsonString);
            }
        });


    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.PickOutboundRule] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/:version/CallRuleApi/CallRule/Outbound/ANI/:ani/DNIS/:dnis/Category/:category', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ani = req.params.ani;
        var dnis = req.params.dnis;
        var category = req.params.category;

        logger.debug('[DVP-RuleService.PickOutboundRuleByCat] - [%s] - HTTP Request Received - Req Params : ani : %s, dnis : %s', reqId, ani, dnis);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if(!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        ruleBackendHandler.PickCallRuleOutboundWithCategoryComplete(reqId, ani, dnis, category, '', '', companyId, tenantId, false, null, function (err, result)
        {
            if (err)
            {
                logger.error('[DVP-RuleService.PickOutboundRule] - [%s] - Exception occurred on method GetCallRuleById', reqId, err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                res.end(jsonString);
            }
            else
            {
                logger.debug('[DVP-RuleService.PickOutboundRule] - [%s] - Get call rule by id success - Returned : %j', reqId, result);
                var jsonString = messageFormatter.FormatMessage(err, "Get call rule success", true, result);
                res.end(jsonString);
            }
        });


    }
    catch(ex)
    {
        logger.error(format('[DVP-RuleService.PickOutboundRule] - [%s] - Exception occurred', reqId), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/CallRule/SetTrunkNumber/:id/:trunkNumber/:companyId/:tenantId', function(req, res, next)
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetNumber/:trNum', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var trunkNumber = req.params.trNum;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetNumber] - [%s] - HTTP Request Received - Req Params : Id : %s, TrunkNumber : %s', reqId, id, trunkNumber);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }
        if (id)
        {
            ruleBackendHandler.SetOutboundRuleTrunkNumber(reqId, id, companyId, tenantId, trunkNumber, function (err, result)
            {

                if (err)
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
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetRegEx', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var DNISRegExMethod = req.body.DNISRegExMethod;
        var ANIRegExMethod = req.body.ANIRegExMethod;
        var DNIS = req.body.DNIS;
        var ANI = req.body.ANI;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.SetCallRuleRegEx] - [%s] - HTTP Request Received - Req Params : Id : [%s], DNISRegExMethod : [%s], ANIRegExMethod : [%s], DNIS : [%s], ANI : [%s]', reqId, id, DNISRegExMethod, ANIRegExMethod, DNIS, ANI);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }
        if (id)
        {
            ruleBackendHandler.SetCallRuleRegEx(reqId, id, DNISRegExMethod, ANIRegExMethod, DNIS, ANI, companyId, tenantId, function (err, result)
            {

                if (err)
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
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetAvailability/:enabled', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var enabled = req.params.enabled;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetAvailability] - [%s] - HTTP Request Received - Req Params : Id : %s, enabled : %s', reqId, id, enabled);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }


        if (id)
        {
            ruleBackendHandler.SetCallRuleAvailability(reqId, id, enabled, companyId, tenantId, function (err, result)
            {

                if (err)
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
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetPriority/:priority', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var priority = req.params.priority;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetPriority] - [%s] - HTTP Request Received - Req Params : Id : %s, priority : %s', reqId, id, priority);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }
        if (id)
        {
            ruleBackendHandler.SetCallRulePriority(reqId, id, priority, companyId, tenantId, function (err, result)
            {

                if (err)
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
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetSchedule/:scheduleId', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var scheduleId = req.params.scheduleId;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetSchedule] - [%s] - HTTP Request Received - Req Params : Id : %s, scheduleId : %s', reqId, id, scheduleId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if (id)
        {
            ruleBackendHandler.SetCallRuleSchedule(reqId, id, scheduleId, companyId, tenantId, function (err, result)
            {

                if (err)
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
server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetDNISTranslation/:transId', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var transId = req.params.transId;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetDNISTranslation] - [%s] - HTTP Request Received - Req Params : Id : %s, transId : %s', reqId, id, transId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if (id)
        {
            ruleBackendHandler.SetCallRuleTranslation(reqId, id, transId, companyId, tenantId, function (err, result)
            {

                if (err)
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

server.post('/DVP/API/:version/CallRuleApi/CallRule/:id/SetANITranslation/:transId', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.id;
        var transId = req.params.transId;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetANITranslation] - [%s] - HTTP Request Received - Req Params : Id : %s, transId : %s', reqId, id, transId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if (id)
        {
            ruleBackendHandler.SetCallRuleANITranslation(reqId, id, transId, companyId, tenantId, function (err, result)
            {

                if (err)
                {
                    logger.error('[DVP-RuleService.CallRuleSetANITranslation] - [%s] - Exception occurred on method SetCallRuleTranslation', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.CallRuleSetANITranslation] - [%s] - set call rule translation success - Returned : %s', reqId, result);
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

server.post('/DVP/API/:version/CallRuleApi/CallRule/:ruleId/SetApplication/:appId', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();

    try
    {
        var id = req.params.ruleId;
        var appId = req.params.appId;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.CallRuleSetApplication] - [%s] - HTTP Request Received - Req Params : ruleId : %s, appId : %s', reqId, id, appId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if(id && appId)
        {
            ruleBackendHandler.SetCallRuleAppDB(reqId, id, appId, companyId, tenantId, function(err, result){

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


server.put('/DVP/API/:version/CallRuleApi/CallRule/:ruleId', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {

        var reqBody = req.body;
        var ruleId = req.params.ruleId;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.UpdateRule] - [%s] - HTTP Request Received - Req Body : ', reqId, reqBody);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if(reqBody)
        {

            ruleBackendHandler.UpdateRule(reqId, ruleId, reqBody, companyId, tenantId, function(err, updateResult)
            {
                if(err || !updateResult)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Update PBX User Failed", false, false);
                    logger.debug('[DVP-RuleService.UpdateRule] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Update PBX User Success", true, updateResult);
                    logger.debug('[DVP-RuleService.UpdateRule] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }

            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error('Empty request body'), "Empty request body", false, false);
            logger.debug('[DVP-RuleService.UpdateRule] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);

        }


    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.UpdateRule] - [%s] - Exception Occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-RuleService.UpdateRule] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }

    return next();

});


//{"CallRuleDescription": "ff", "ObjClass": "MM", "ObjType":"Inbound", "ObjCategory": "URL", "Enable":true, "CompanyId": 1, "TenantId": 3, "RegExPattern":"StartWith", "ANIRegExPattern": "StartWith", "DNIS": "123", "ANI":"", "Priority": 1, "TargetScript": "ppppp", "ScheduleId":2,                                        "ExtraData": "dfd"}
//server.post('/DVP/API/' + hostVersion + '/CallRule/AddInboundRule', function(req, res, next)
server.post('/DVP/API/:version/CallRuleApi/CallRule', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var ruleInfo = req.body;

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.AddInboundRule] - [%s] - HTTP Request Received - Req Body : %j', reqId, ruleInfo);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        if(ruleInfo.Direction)
        {
            if(ruleInfo.Direction == 'INBOUND')
            {
                ruleBackendHandler.AddInboundRule(reqId, ruleInfo, companyId, tenantId, function(err, recordId, result)
                {
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
                ruleBackendHandler.AddOutboundRule(reqId, ruleInfo, companyId, tenantId, function(err, recordId, result)
                {

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
server.del('/DVP/API/:version/CallRuleApi/CallRule/:id', authorization({resource:"callrule", action:"delete"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var id = req.params.id;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.DeleteCallRule] - [%s] - HTTP Request Received - Req Params - Id : %s', reqId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        var intId = parseInt(id);

        if(intId != NaN)
        {
            ruleBackendHandler.DeleteCallRule(reqId, id, companyId, tenantId, function(err, result)
            {

                if(err)
                {
                    logger.error('[DVP-RuleService.DeleteCallRule] - [%s] - Exception occurred on method ruleBackendHandler.AddInboundRule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.DeleteCallRule] - [%s] - delete call rule success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Rule Deleted Successfully", result, result);
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
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, false);
        res.end(jsonString);
    }

    return next();

});

server.del('/DVP/API/:version/CallRuleApi/Translation/:id', authorization({resource:"callrule", action:"delete"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var id = req.params.id;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        logger.debug('[DVP-RuleService.DeleteTranslation] - [%s] - HTTP Request Received - Req Params - Id : %s', reqId);

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        var intId = parseInt(id);

        if(intId != NaN)
        {
            ruleBackendHandler.DeleteTranslation(reqId, id, companyId, tenantId, function(err, result){

                if(err)
                {
                    logger.error('[DVP-RuleService.DeleteCallRule] - [%s] - Exception occurred on method ruleBackendHandler.AddInboundRule', reqId, err);
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, false);
                    res.end(jsonString);
                }
                else
                {
                    logger.debug('[DVP-RuleService.DeleteCallRule] - [%s] - delete call rule success - Returned : %s', reqId, result);
                    var jsonString = messageFormatter.FormatMessage(err, "Rule Deleted Successfully", result, result);
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
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, false);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/:version/CallRuleApi/Translations', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var emptyArr = [];
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.TranslationsByCompany] - [%s] - HTTP Request Received', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        transBackendHandler.GetAllTranslationsForCompany(reqId, companyId, tenantId, function (err, result)
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

server.get('/DVP/API/:version/CallRuleApi/Translation/:id', authorization({resource:"callrule", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.TranslationById] - [%s] - HTTP Request Received', reqId);

        var transId = req.params.id;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        transBackendHandler.GetTranslationById(reqId, transId, companyId, tenantId, function (err, result)
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

server.post('/DVP/API/:version/CallRuleApi/Translation', function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.SaveTranslation] - [%s] - HTTP Request Received', reqId);

        var transObj = req.body;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        transBackendHandler.AddNewTranslation(reqId, transObj, companyId, tenantId, function (err, transId, result)
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

server.put('/DVP/API/:version/CallRuleApi/Translation/:id', authorization({resource:"callrule", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-RuleService.UpdateTranslation] - [%s] - HTTP Request Received', reqId);

        var transId = req.params.id;
        var transObj = req.body;

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        transBackendHandler.UpdateTranslation(reqId, transId, transObj, companyId, tenantId, function (err, result)
        {

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

