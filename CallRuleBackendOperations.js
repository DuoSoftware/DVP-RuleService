var dbModel = require('dvp-dbmodels');
var regExHandler = require('./RegExHandler.js');
var transHandler = require('./TranslationHandler.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var scheduleHandler = require('dvp-common/ScheduleValidator/ScheduleHandler.js');
var redisCacheHandler = require('dvp-common/CSConfigRedisCaching/RedisHandler.js');

var GetPhoneNumber = function(reqId, phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber},{CompanyId: companyId},{TenantId: tenantId}]})
            .then(function (trNum)
            {
                logger.info('[DVP-RuleService.GetPhoneNumber] PGSQL Get phone number for company query success');
                callback(undefined, trNum);

            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.GetPhoneNumber] PGSQL Get phone number for company query failed', err);
                callback(err, undefined);
            });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetPhoneNumber] Unhandled Error occurred', ex);
        callback(ex, undefined);
    }
};

var GetCallRulesForCompany = function(reqId, companyId, tenantId, callback)
{
    var tempList = [];
    try
    {

        dbModel.CallRule.findAll({where: [{CompanyId: companyId},{TenantId: tenantId}],include: [{model: dbModel.Application, as: "Application"}]})
            .then(function (callRules)
            {
                logger.info('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query success');
                callback(undefined, callRules);

            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query failed', err);
                callback(err, tempList);
            });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRulesForCompany] Unhandled Error occurred', ex);
        callback(ex, tempList);
    }
};

var GetCallRulesByDirection = function(reqId, companyId, tenantId, direction, callback)
{
    var tempList = [];
    try
    {

        if(direction === 'INBOUND')
        {
            dbModel.CallRule.findAll({where: [{CompanyId: companyId},{TenantId: tenantId}, {Direction: direction}], include: [{model: dbModel.Application, as: "Application"}]})
                .then(function (callRules)
                {
                    logger.info('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query success');
                    callback(undefined, callRules);

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query failed', err);
                    callback(err, tempList);
                });
        }
        else
        {
            dbModel.CallRule.findAll({where: [{CompanyId: companyId},{TenantId: tenantId}, {Direction: direction}]})
                .then(function (callRules)
                {
                    logger.info('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query success');
                    callback(undefined, callRules);

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query failed', err);
                    callback(err, tempList);
                });

        }


    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRulesForCompany] Unhandled Error occurred', ex);
        callback(ex, tempList);
    }
};

var GetCallRuleById = function(reqId, ruleId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]})
            .then(function (callRule)
            {
                logger.info('[DVP-RuleService.GetCallRuleById] PGSQL Get call rule by id query success');
                callback(undefined, callRule);

            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.GetCallRuleById] PGSQL Get call rule by id query failed', err);
                callback(err, undefined);
            });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRuleById] Unhandled Error occurred', ex);
        callback(ex, undefined);
    }
};

var PickCallRuleOutboundComplete = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, data, callback)
{
    try
    {
        PickCallRuleOutbound(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, data, function(err, callRule)
        {
            if(err)
            {
                callback(err, undefined);
            }
            else if(callRule)
            {
                dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: callRule.TrunkNumber}, {TenantId: tenantId}], include: [{model: dbModel.LimitInfo, as: 'LimitInfoOutbound'},{model: dbModel.LimitInfo, as: 'LimitInfoBoth'},{model: dbModel.Trunk, as: 'Trunk', include: [{model: dbModel.Translation, as: "Translation"}]}]})
                    .then(function (phnNumTrunkInfo)
                    {
                        if(phnNumTrunkInfo)
                        {
                            var phnNumType = phnNumTrunkInfo.ObjCategory;

                            if(phnNumType === 'OUTBOUND' || phnNumType === 'BOTH')
                            {
                                var outLimit = undefined;
                                var bothLimit = undefined;

                                if(phnNumTrunkInfo.LimitInfoOutbound && phnNumTrunkInfo.LimitInfoOutbound.Enable && phnNumTrunkInfo.LimitInfoOutbound.MaxCount)
                                {
                                    outLimit = phnNumTrunkInfo.LimitInfoOutbound.MaxCount;
                                }

                                if(phnNumTrunkInfo.LimitInfoBoth && phnNumTrunkInfo.LimitInfoBoth.Enable && phnNumTrunkInfo.LimitInfoBoth.MaxCount)
                                {
                                    bothLimit = phnNumTrunkInfo.LimitInfoBoth.MaxCount;
                                }

                                if(phnNumTrunkInfo.Trunk)
                                {
                                    var tempOrigination = callRule.TrunkNumber;
                                    var tempDestination = dnisNum;

                                    if(callRule.Translation)
                                    {
                                        //Translate ANI And DNIS
                                        tempDestination = transHandler.TranslateHandler(callRule.Translation, tempDestination);
                                    }
                                    if(callRule.ANITranslation)
                                    {
                                        //Translate ANI And DNIS
                                        tempOrigination = transHandler.TranslateHandler(callRule.ANITranslation, tempOrigination);
                                    }

                                    if(phnNumTrunkInfo.Trunk && phnNumTrunkInfo.Trunk.Translation)
                                    {
                                        tempOrigination = transHandler.TranslateHandler(phnNumTrunkInfo.Trunk.Translation, tempOrigination);
                                    }

                                    var outrule =
                                    {
                                        DNIS : tempDestination,
                                        ANI : tempOrigination,
                                        GatewayCode : phnNumTrunkInfo.Trunk.TrunkCode,
                                        IpUrl : phnNumTrunkInfo.Trunk.IpUrl,
                                        Timeout : callRule.Timeout,
                                        OutLimit : outLimit,
                                        BothLimit : bothLimit,
                                        NumberType : phnNumType,
                                        TrunkNumber : phnNumTrunkInfo.PhoneNumber,
                                        CompanyId : callRule.CompanyId,
                                        TenantId : callRule.TenantId,
                                        CheckLimit : true
                                    };

                                    if(phnNumTrunkInfo.Trunk.LoadBalancerId)
                                    {
                                        outrule.CheckLimit = false;
                                    }

                                    callback(undefined, outrule);

                                }
                                else
                                {
                                    logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] - No trunk found');
                                    callback(new Error('No trunk found'), undefined);
                                }
                            }
                            else
                            {
                                logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] - phone number is not tagged as an outbound number');
                                callback(new Error('phone number is not tagged as an outbound number'), undefined);
                            }

                        }
                        else
                        {
                            logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] - Phone number trunk info not found');
                            callback(new Error('Phone number trunk info not found'), undefined);
                        }

                    }).catch(function(err)
                    {
                        logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] PGSQL Get trunk and phone number query failed', err);
                        callback(err, undefined);
                    });

            }
            else
            {
                logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] - Call rule not found');
                callback(new Error('Call rule not found'), undefined);
            }

        });

    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] Unhandled Error occurred', ex);
        callback(ex, undefined);
    }
};

var PickCallRuleOutbound = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, data, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {Direction: 'OUTBOUND'}], order: ['Priority']})
            .then(function (crList)
            {

                    logger.info('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get outbound rules query success');
                    var callRulePicked = undefined;

                    try
                    {
                        var crCount = crList.length;

                        for (i = 0; i < crCount; i++)
                        {
                            if(crList[i].DNISRegEx && crList[i].ANIRegEx)
                            {
                                var dnisRegExPattern = new RegExp(crList[i].DNISRegEx);
                                var aniRegExPattern = new RegExp(crList[i].ANIRegEx);
                                var contextRegEx = undefined;
                                if(matchContext)
                                {
                                    if(crList[i].ContextRegEx)
                                    {
                                        contextRegEx = new RegExp(crList[i].ContextRegEx);

                                        if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context))
                                        {
                                            //pick call rule and break op
                                            callRulePicked = crList[i];
                                            break;
                                        }
                                    }

                                }
                                else
                                {
                                    if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum))
                                    {
                                        //pick call rule and break op
                                        callRulePicked = crList[i];
                                        break;
                                    }
                                }


                            }
                        }

                        if(callRulePicked)
                        {
                            //get application, get schedule, get translations
                            dbModel.CallRule
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}, {model: dbModel.Translation, as: "Translation"},{model: dbModel.Translation, as: "ANITranslation"}, {model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber"}]})
                                .then(function (crInfo)
                                {
                                    logger.info('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get schedules translations for outbound rule query success');

                                    callback(undefined, crInfo);

                                }).catch(function(err)
                                {
                                    logger.error('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get schedules translations for outbound rule query failed', err);
                                    callback(err, undefined);
                                });

                        }
                        else
                        {
                            callback(new Error('No matching outbound rules found for reg ex'), undefined);
                        }



                    }
                    catch(ex)
                    {
                        callback(ex, undefined);
                    }



            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get outbound rules query failed', err);
                callback(err, undefined);
            })
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var PickCallRuleInboundByCat = function(reqId, aniNum, dnisNum, extraData, context, category, companyId, tenantId, data, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {Direction: 'INBOUND'}, {ObjCategory: category}], order: ['Priority']})
            .then(function (crList)
            {

                    logger.info('[DVP-RuleService.PickClickToCallRuleInbound] PGSQL Get inbound rules query success');
                    var callRulePicked = undefined;

                    try
                    {
                        var crCount = crList.length;

                        for (i = 0; i < crCount; i++)
                        {
                            if(crList[i].DNISRegEx && crList[i].ANIRegEx && crList[i].ContextRegEx)
                            {
                                var dnisRegExPattern = new RegExp(crList[i].DNISRegEx);
                                var aniRegExPattern = new RegExp(crList[i].ANIRegEx);
                                var contextRegEx = new RegExp(crList[i].ContextRegEx);
                                var customRegEx = null;

                                if(crList[i].CustomRegEx)
                                {
                                    customRegEx = new RegExp(crList[i].CustomRegEx);
                                }

                                if(customRegEx)
                                {
                                    if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context) && customRegEx.test(extraData))
                                    {
                                        //pick call rule and break op
                                        callRulePicked = crList[i];
                                        break;
                                    }
                                }
                                else
                                {
                                    if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context))
                                    {
                                        //pick call rule and break op
                                        callRulePicked = crList[i];
                                        break;
                                    }
                                }


                            }
                        }

                        if(callRulePicked)
                        {
                            //get application, get schedule, get translations
                            dbModel.CallRule
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Application, as: "Application", include : [{model: dbModel.Application, as: "MasterApplication"}]},{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}, {model: dbModel.Translation, as: "Translation"}]})
                                .then(function (crInfo)
                                {
                                    logger.info('[DVP-RuleService.PickClickToCallRuleInbound] PGSQL Get schedules translations for inbound rule query success');

                                    callback(undefined, crInfo);

                                }).catch(function(err)
                                {
                                    logger.error('[DVP-RuleService.PickClickToCallRuleInbound] PGSQL Get schedules translations for inbound rule query failed', err);
                                    callback(err, undefined);
                                });

                        }
                        else
                        {
                            callback(new Error('No matching c2c inbound rules found for reg ex'), undefined);
                        }



                    }
                    catch(ex)
                    {
                        callback(ex, undefined);

                    }




            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.PickClickToCallRuleInbound] PGSQL Get inbound rules query failed', err);
                callback(err, undefined);
            })
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var PickCallRuleInbound = function(reqId, aniNum, dnisNum, extraData, domain, context, category, companyId, tenantId, data, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {ObjCategory: category}, {Direction: 'INBOUND'}], order: ['Priority']})
            .then(function (crList)
            {

                    logger.info('[DVP-RuleService.PickCallRuleInbound] PGSQL Get inbound rules query success');
                    var callRulePicked = undefined;

                    try
                    {
                        var crCount = crList.length;

                        for (i = 0; i < crCount; i++)
                        {
                            if(crList[i].DNISRegEx && crList[i].ANIRegEx && crList[i].ContextRegEx)
                            {
                                var dnisRegExPattern = new RegExp(crList[i].DNISRegEx);
                                var aniRegExPattern = new RegExp(crList[i].ANIRegEx);
                                var contextRegEx = new RegExp(crList[i].ContextRegEx);
                                var customRegEx = null;

                                if(crList[i].CustomRegEx)
                                {
                                    customRegEx = new RegExp(crList[i].CustomRegEx);
                                }

                                if(customRegEx && extraData)
                                {
                                    if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context) && customRegEx.test(extraData))
                                    {
                                        //pick call rule and break op
                                        callRulePicked = crList[i];
                                        break;
                                    }
                                }
                                else
                                {
                                    if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context))
                                    {
                                        //pick call rule and break op
                                        callRulePicked = crList[i];
                                        break;
                                    }
                                }
                            }
                        }

                        if(callRulePicked)
                        {
                            //get application, get schedule, get translations
                            dbModel.CallRule
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Application, as: "Application", include : [{model: dbModel.Application, as: "MasterApplication"}]},{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}, {model: dbModel.Translation, as: "Translation"}]})
                                .then(function (crInfo)
                                {
                                    if(crInfo && crInfo.Schedule && crInfo.Schedule.Appointment)
                                    {
                                        var pickedAppointment = scheduleHandler.CheckScheduleValidity(crInfo.Schedule);

                                        if(pickedAppointment && pickedAppointment.Action)
                                        {
                                            dbModel.Application
                                                .find({where :[{id: pickedAppointment.Action, CompanyId: companyId, TenantId: tenantId}], include: [{model: dbModel.Application, as: "MasterApplication"}]})
                                                .then(function (appInfo)
                                                {
                                                    crInfo.Application = appInfo;
                                                    callback(undefined, crInfo);

                                                }).catch(function(err)
                                                {
                                                    callback(err, null);
                                                })
                                        }
                                        else
                                        {
                                            callback(null, crInfo);
                                        }
                                    }
                                    else
                                    {
                                        callback(null, crInfo);
                                    }



                                }).catch(function(err)
                                {
                                    logger.error('[DVP-RuleService.PickCallRuleInbound] PGSQL Get schedules translations for inbound rule query failed', err);
                                    callback(err, undefined);
                                });

                        }
                        else
                        {
                            callback(new Error('No matching inbound rules found for reg ex'), undefined);
                        }



                    }
                    catch(ex)
                    {
                        callback(ex, undefined);
                    }




            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.PickCallRuleInbound] PGSQL Get inbound rules query failed', err);
                callback(err, undefined);
            })
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var SetOutboundRuleTrunkNumber = function(reqId, ruleId, companyId, tenantId, trunkNum, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId},{Direction: 'OUTBOUND'}]})
            .then(function (callRule)
            {

                    if(callRule)
                    {
                        logger.info('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query success');
                        GetPhoneNumber(reqId, trunkNum, companyId, tenantId, function(err, num)
                        {
                            if(err)
                            {
                                callback(err, false);
                            }
                            else if(num && (num.ObjCategory === 'BOTH' || num.ObjCategory === 'OUTBOUND'))
                            {
                                callRule.updateAttributes({TrunkId: num.TrunkId, TrunkNumber: trunkNum, PhoneNumId: num.id}).then(function (updtRes)
                                {
                                    redisCacheHandler.addCallRuleToCompanyObj(updtRes, updtRes.TenantId, updtRes.CompanyId);

                                    logger.info('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Update call rule with trunk number query success');
                                    callback(undefined, true);

                                }).catch(function(err)
                                {
                                    logger.error('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Update call rule with trunk number query failed', err);
                                    callback(err, false);
                                });
                            }
                            else
                            {
                                callback(new Error('Cannot find an outbound trunk number'), false);
                            }
                        })
                    }
                    else
                    {
                        callback(new Error('Cannot find an outbound rule with given id'), false);
                    }


            }).catch(function(err)
            {
                logger.error('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }

};

var UpdateRule = function(reqId, ruleId, ruleInfo, companyId, tenantId, callback)
{
    try
    {
        if(ruleInfo.Direction === 'INBOUND')
        {
            dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId},{Direction: 'INBOUND'}]})
                .then(function (callRule)
                {
                    logger.info('[DVP-RuleService.UpdateRule] PGSQL Get call rule by id query success');

                    if(callRule)
                    {
                        if(!ruleInfo.Context || ruleInfo.Context.toUpperCase() === "ANY")
                        {
                            ruleInfo.ContextRegExPattern = "ANY";
                            ruleInfo.Context = "ANY";
                        }
                        else
                        {
                            ruleInfo.ContextRegExPattern = "EXACTMATCH";
                        }

                        callRule.updateAttributes({
                            CallRuleDescription: ruleInfo.CallRuleDescription,
                            ObjClass: 'DVP',
                            ObjType: 'CALLRULE',
                            ObjCategory: ruleInfo.ObjCategory,
                            Enable: ruleInfo.Enable,
                            CompanyId: ruleInfo.CompanyId,
                            TenantId: ruleInfo.TenantId,
                            DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                            ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                            ContextRegEx: regExHandler.GenerateRegEx(ruleInfo.Context, ruleInfo.ContextRegExPattern),
                            RegExPattern: ruleInfo.RegExPattern,
                            ANIRegExPattern: ruleInfo.ANIRegExPattern,
                            DNIS: ruleInfo.DNIS,
                            ANI: ruleInfo.ANI,
                            Priority: ruleInfo.Priority,
                            ScheduleId: ruleInfo.ScheduleId,
                            ExtraData: ruleInfo.ExtraData,
                            Direction: ruleInfo.Direction,
                            Context: ruleInfo.Context,
                            CustomRegEx: ruleInfo.CustomRegEx
                        }).then(function(updateResult)
                        {
                            redisCacheHandler.addCallRuleToCompanyObj(updateResult, updateResult.TenantId, updateResult.CompanyId);
                            logger.debug('[DVP-RuleService.UpdateRule] - [%s] - PGSQL UpdateRule query success', reqId);
                            callback(undefined, true);
                        }).catch(function(err)
                        {
                            logger.error('[DVP-RuleService.UpdateRule] - [%s] - PGSQL UpdateRule Failed', reqId, err);
                            callback(err, false);
                        });
                    }
                    else
                    {
                        callback(new Error('Unable to find a outbound call rule for company with given id'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.UpdateRule] PGSQL Get call rule by id query failed', err);
                    callback(err, undefined);
                });

        }
        else
        {
            dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId},{Direction: 'OUTBOUND'}]})
                .then(function (callRule)
                {
                    logger.info('[DVP-RuleService.UpdateRule] PGSQL Get call rule by id query success');

                    if(callRule)
                    {
                        if(!ruleInfo.Context || ruleInfo.Context.toUpperCase() === "ANY")
                        {
                            ruleInfo.ContextRegExPattern = "ANY";
                            ruleInfo.Context = "ANY";
                        }
                        else
                        {
                            ruleInfo.ContextRegExPattern = "EXACTMATCH";
                        }

                        if (ruleInfo.TrunkNumber)
                        {
                            GetPhoneNumber(reqId, ruleInfo.TrunkNumber, companyId, tenantId, function (err, num)
                            {
                                if (err)
                                {
                                    callback(err, false);
                                }
                                else if (num)
                                {
                                    callRule.updateAttributes({
                                        CallRuleDescription: ruleInfo.CallRuleDescription,
                                        ObjClass: 'DVP',
                                        ObjType: 'CALLRULE',
                                        ObjCategory: ruleInfo.ObjCategory,
                                        Enable: ruleInfo.Enable,
                                        DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                                        ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                                        ContextRegEx: regExHandler.GenerateRegEx(ruleInfo.Context, ruleInfo.ContextRegExPattern),
                                        RegExPattern: ruleInfo.RegExPattern,
                                        ANIRegExPattern: ruleInfo.ANIRegExPattern,
                                        DNIS: ruleInfo.DNIS,
                                        ANI: ruleInfo.ANI,
                                        Priority: ruleInfo.Priority,
                                        ExtraData: ruleInfo.ExtraData,
                                        TrunkId: num.TrunkId,
                                        TrunkNumber: ruleInfo.TrunkNumber,
                                        PhoneNumId: num.id,
                                        Context: ruleInfo.Context,
                                        CustomRegEx: ruleInfo.CustomRegEx

                                    }).then(function(updateResult)
                                    {
                                        redisCacheHandler.addCallRuleToCompanyObj(updateResult, updateResult.TenantId, updateResult.CompanyId);
                                        logger.debug('[DVP-RuleService.UpdateRule] - [%s] - PGSQL UpdateRule query success', reqId);
                                        callback(undefined, true);
                                    }).catch(function(err)
                                    {
                                        logger.error('[DVP-RuleService.UpdateRule] - [%s] - PGSQL UpdateRule Failed', reqId, err);
                                        callback(err, false);
                                    });


                                }
                                else
                                {
                                    callback(new Error('Trunk number is not valid for the company'), -1, false);
                                }
                            })
                        }
                        else
                        {
                            callback(new Error('Trunk number not given'), -1, false);
                        }
                    }
                    else
                    {
                        callback(new Error('Unable to find a outbound call rule for company with given id'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.UpdateRule] PGSQL Get call rule by id query failed', err);
                    callback(err, undefined);
                });

        }
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var AddOutboundRule = function(reqId, ruleInfo, companyId, tenantId, callback)
{
    try
    {
        if(ruleInfo.Direction === 'OUTBOUND')
        {
            //allow opereation
            if(!ruleInfo.Context || ruleInfo.Context.toUpperCase() === "ANY")
            {
                ruleInfo.ContextRegExPattern = "ANY";
                ruleInfo.Context = "ANY";
            }
            else
            {
                ruleInfo.ContextRegExPattern = "EXACTMATCH";
            }

            if (ruleInfo.TrunkNumber)
            {
                GetPhoneNumber(reqId, ruleInfo.TrunkNumber, companyId, tenantId, function (err, num)
                {
                    if (err)
                    {
                        callback(err, -1, false);
                    }
                    else if (num)
                    {
                        var rule = dbModel.CallRule.build({
                            CallRuleDescription: ruleInfo.CallRuleDescription,
                            ObjClass: 'DVP',
                            ObjType: 'CALLRULE',
                            ObjCategory: ruleInfo.ObjCategory,
                            Enable: ruleInfo.Enable,
                            CompanyId: companyId,
                            TenantId: tenantId,
                            DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                            ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                            ContextRegEx: regExHandler.GenerateRegEx(ruleInfo.Context, ruleInfo.ContextRegExPattern),
                            RegExPattern: ruleInfo.RegExPattern,
                            ANIRegExPattern: ruleInfo.ANIRegExPattern,
                            DNIS: ruleInfo.DNIS,
                            ANI: ruleInfo.ANI,
                            Priority: ruleInfo.Priority,
                            ExtraData: ruleInfo.ExtraData,
                            Direction: ruleInfo.Direction,
                            TrunkId: num.TrunkId,
                            TrunkNumber: ruleInfo.TrunkNumber,
                            PhoneNumId: num.id,
                            Context: ruleInfo.Context,
                            CustomRegEx: ruleInfo.CustomRegEx
                        });

                        rule
                            .save()
                            .then(function (saveRes)
                            {
                                redisCacheHandler.addCallRuleToCompanyObj(saveRes, saveRes.TenantId, saveRes.CompanyId);
                                try
                                {
                                        logger.info('[DVP-RuleService.AddOutboundRule] PGSQL Insert outbound call rule with all attributes query success');
                                        var ruleId = rule.id;
                                        callback(undefined, ruleId, true);
                                }
                                catch (ex)
                                {
                                    callback(ex,-1, false);
                                }

                            }).catch(function(err)
                            {
                                logger.error('[DVP-RuleService.AddOutboundRule] PGSQL Insert outbound call rule with all attributes query failed', err);
                                callback(err, -1, false);
                            })

                    }
                    else
                    {
                        callback(new Error('Trunk number is not valid for the company'), -1, false);
                    }
                })
            }
            else
            {
                callback(new Error('Trunk number not given'), -1, false);
            }
        }
        else
        {
            callback(new Error('Invalid rule direction'), -1, false);
        }

    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var AddInboundRule = function(reqId, ruleInfo, companyId, tenantId, callback)
{
    try
    {
        if(ruleInfo.Direction == 'INBOUND')
        {
            //allow opereation

            if(!ruleInfo.Context || ruleInfo.Context.toUpperCase() === "ANY")
            {
                ruleInfo.ContextRegExPattern = "ANY";
                ruleInfo.Context = "ANY";
            }
            else
            {
                ruleInfo.ContextRegExPattern = "EXACTMATCH";
            }

            var rule = dbModel.CallRule.build({
                CallRuleDescription: ruleInfo.CallRuleDescription,
                ObjClass: 'DVP',
                ObjType: 'CALLRULE',
                ObjCategory: ruleInfo.ObjCategory,
                Enable: ruleInfo.Enable,
                CompanyId: companyId,
                TenantId: tenantId,
                DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                ContextRegEx: regExHandler.GenerateRegEx(ruleInfo.Context, ruleInfo.ContextRegExPattern),
                RegExPattern: ruleInfo.RegExPattern,
                ANIRegExPattern: ruleInfo.ANIRegExPattern,
                DNIS: ruleInfo.DNIS,
                ANI: ruleInfo.ANI,
                Priority: ruleInfo.Priority,
                ScheduleId: ruleInfo.ScheduleId,
                ExtraData: ruleInfo.ExtraData,
                Direction: ruleInfo.Direction,
                Context: ruleInfo.Context,
                CustomRegEx: ruleInfo.CustomRegEx
            });

            rule
                .save()
                .then(function (saveRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(saveRes, saveRes.TenantId, saveRes.CompanyId);
                    try
                    {

                            logger.info('[DVP-RuleService.AddInboundRule] PGSQL Insert inbound call rule with all attributes query success');
                            var ruleId = rule.id;
                            callback(undefined, ruleId, true);

                    }
                    catch (ex)
                    {
                        callback(ex,-1, false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.AddInboundRule] PGSQL Insert inbound call rule with all attributes query failed', err);
                    callback(err, -1, false);
                })


        }
        else
        {
            callback(new Error('Invalid rule type'), -1, false);
        }
    }
    catch(ex)
    {
        callback(ex, -1, false);
    }


};

var SetCallRuleAvailability = function(reqId, ruleId, enable, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).then(function (ruleRec)
        {
            if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({Enable: enable}).then(function (upRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(upRes, upRes.TenantId, upRes.CompanyId);
                    logger.info('[DVP-RuleService.AddInboundRule] PGSQL Update call rule with availability query success');
                    callback(undefined, true);


                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.AddInboundRule] PGSQL Update call rule with availability query failed', err);
                    callback(err, false);
                });
            }
            else
            {
                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRuleRegEx = function(reqId, ruleId, DNISRegExMethod, ANIRegExMethod, DNIS, ANI, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{TenantId: tenantId}]}).then(function (ruleRec)
        {
            if(ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallRuleRegEx] PGSQL Get call rule by id query success');
                //update attrib

                rule.updateAttributes(
                    {
                        DNISRegEx: regExHandler.GenerateRegEx(DNIS, DNISRegExMethod),
                        ANIRegEx: regExHandler.GenerateRegEx(ANI, ANIRegExMethod),
                        RegExPattern: DNISRegExMethod,
                        ANIRegExPattern: ANIRegExMethod,
                        DNIS: DNIS,
                        ANI: ANI
                    }).then(function (updtRes)
                    {
                        redisCacheHandler.addCallRuleToCompanyObj(updtRes, updtRes.TenantId, updtRes.CompanyId);

                            logger.info('[DVP-RuleService.SetCallRuleRegEx] PGSQL Update call rule with regular expressions query success');
                            callback(undefined, true);


                    }).catch(function(err)
                    {
                        logger.error('[DVP-RuleService.SetCallRuleRegEx] PGSQL Update call rule with regular expressions query failed', err);
                        callback(err, false);
                    });


            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleRegEx] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRuleRegEx] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRulePriority = function(reqId, ruleId, priority, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).then(function (ruleRec)
        {

            if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({Priority: priority}).then(function (updtRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(updtRes, updtRes.TenantId, updtRes.CompanyId);
                    logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Update call rule with priority query success');
                    callback(undefined, true);


                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.SetCallRulePriority] PGSQL Update call rule with priority query failed', err);
                    callback(err, false);
                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRuleAppDB = function(reqId, ruleId, appId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (ruleRec)
        {
            if (ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule query success');

                dbModel.Application.find({where: [{id: appId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (appRec)
                {
                    if(appRec)
                    {
                        logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query success');
                        ruleRec.setApplication(appRec).then(function (result)
                        {
                            redisCacheHandler.addCallRuleToCompanyObj(result, result.TenantId, result.CompanyId);
                            logger.debug('[DVP-RuleService.SetCallRuleAppDB] - [%s] - update rule with application PGSQL query success', reqId);
                            callback(undefined, true);


                        }).catch(function(err)
                        {
                            logger.error('[DVP-RuleService.SetCallRuleAppDB] - [%s] - update rule with application PGSQL query failed', reqId, err);
                            callback(err, false);
                        })

                    }
                    else
                    {
                        logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query success');
                        callback(new Error('No app found'), false);
                    }
                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query failed', err);
                    callback(err, false);
                });


            }
            else
            {
                logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule by id query success');
                callback(new Error('No call rule found'), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule query failed', err);
            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.SetCallRuleAppDB] Exception occurred', ex);
        callback(ex, false);
    }
}

var DeleteCallRule = function(reqId, ruleId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (ruleRec)
        {
            if (ruleRec)
            {
                logger.info('[DVP-RuleService.DeleteCallRule] PGSQL Get call rule by id query success');

                    ruleRec.destroy().then(function (result)
                    {
                        redisCacheHandler.removeCallRuleFromCompanyObj(ruleId, tenantId, companyId);
                        logger.info('[DVP-RuleService.DeleteCallRule] PGSQL Delete call rule query success');
                        callback(undefined, true);

                    }).catch(function(err)
                    {
                        logger.error('[DVP-RuleService.DeleteCallRule] PGSQL Delete call rule query failed', err);
                        callback(err, false);
                    });

            }
            else
            {
                logger.error('[DVP-RuleService.DeleteCallRule] Call rule not found for given id');
                callback(new Error('Call rule not found for given id'), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.DeleteCallRule] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var DeleteTranslation = function(reqId, transId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Translation.find({where: [{id: transId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (transRec)
        {
            if (transRec)
            {
                logger.info('[DVP-RuleService.DeleteTranslation] PGSQL Get translation by id query success');

                transRec.destroy().then(function (result)
                {
                    redisCacheHandler.removeTranslationFromCompanyObj(transId, tenantId, companyId);
                    logger.info('[DVP-RuleService.DeleteTranslation] PGSQL Delete translation query success');
                    callback(undefined, true);

                }).catch(function (err) {
                    logger.error('[DVP-RuleService.DeleteTranslation] PGSQL Delete translation query failed', err);
                    callback(err, false);
                });

            }
            else
            {
                logger.error('[DVP-RuleService.DeleteTranslation] Translation record not found for given id');
                callback(new Error('Translation record not found for given id'), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.DeleteTranslation] PGSQL Get translation by id query failed', err);
            callback(err, false);
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var SetCallRuleSchedule = function(reqId, ruleId, scheduleId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).then(function (ruleRec)
        {

            if(ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query success');
                //update attrib
                ruleRec.updateAttributes({ScheduleId: scheduleId}).then(function (updtRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(updtRes, updtRes.TenantId, updtRes.CompanyId);
                    logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Update call rule with schedule query success');
                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.SetCallRuleSchedule] PGSQL Update call rule with schedule query fail', err);
                    callback(err, false);
                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRuleANITranslation = function(reqId, ruleId, transId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).then(function (ruleRec)
        {

            if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.SetCallRuleANITranslation] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({ANITranslationId: transId}).then(function (upRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(upRes, upRes.TenantId, upRes.CompanyId);
                    logger.info('[DVP-RuleService.SetCallRuleANITranslation] PGSQL Update call rule with translation query success');
                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.SetCallRuleANITranslation] PGSQL Update call rule with translation query fail', err);
                    callback(err, false);
                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleANITranslation] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRuleANITranslation] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRuleTranslation = function(reqId, ruleId, transId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).then(function (ruleRec)
        {

            if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({TranslationId: transId}).then(function (upRes)
                {
                    redisCacheHandler.addCallRuleToCompanyObj(upRes, upRes.TenantId, upRes.CompanyId);
                    logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Update call rule with translation query success');
                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-RuleService.SetCallRuleTranslation] PGSQL Update call rule with translation query fail', err);
                    callback(err, false);
                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};


module.exports.AddOutboundRule = AddOutboundRule;
module.exports.AddInboundRule = AddInboundRule;
module.exports.DeleteCallRule = DeleteCallRule;
module.exports.SetCallRuleAvailability = SetCallRuleAvailability;
module.exports.SetCallRulePriority = SetCallRulePriority;
module.exports.GetCallRulesForCompany = GetCallRulesForCompany;
module.exports.GetCallRuleById = GetCallRuleById;
module.exports.SetOutboundRuleTrunkNumber = SetOutboundRuleTrunkNumber;
module.exports.SetCallRuleRegEx = SetCallRuleRegEx;
module.exports.SetCallRuleSchedule = SetCallRuleSchedule;
module.exports.SetCallRuleTranslation = SetCallRuleTranslation;
module.exports.PickCallRuleInbound = PickCallRuleInbound;
module.exports.PickCallRuleOutbound = PickCallRuleOutbound;
module.exports.PickCallRuleOutboundComplete = PickCallRuleOutboundComplete;
module.exports.SetCallRuleAppDB = SetCallRuleAppDB;
module.exports.PickCallRuleInboundByCat = PickCallRuleInboundByCat;
module.exports.GetCallRulesByDirection = GetCallRulesByDirection;
module.exports.SetCallRuleANITranslation = SetCallRuleANITranslation;
module.exports.UpdateRule = UpdateRule;
module.exports.DeleteTranslation = DeleteTranslation;