var dbModel = require('DVP-DBModels');
var regExHandler = require('./RegExHandler.js');
var transHandler = require('./TranslationHandler.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;

var GetPhoneNumber = function(reqId, phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber},{CompanyId: companyId},{TenantId: tenantId}]})
            .complete(function (err, trNum)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.GetPhoneNumber] PGSQL Get phone number for company query failed', err);
                    callback(err, undefined);
                }
                else
                {
                    logger.info('[DVP-RuleService.GetPhoneNumber] PGSQL Get phone number for company query success');
                    callback(undefined, trNum);
                }
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
    try
    {
        dbModel.CallRule.findAll({where: [{CompanyId: companyId},{TenantId: tenantId}]})
            .complete(function (err, callRules)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query failed', err);
                    callback(err, undefined);
                }
                else
                {
                    logger.info('[DVP-RuleService.GetCallRulesForCompany] PGSQL Get call rules query success');
                    callback(undefined, callRules);
                }
            });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRulesForCompany] Unhandled Error occurred', ex);
        callback(ex, undefined);
    }
};

var GetCallRuleById = function(reqId, ruleId, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]})
            .complete(function (err, callRule)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.GetCallRuleById] PGSQL Get call rule by id query failed', err);
                    callback(err, undefined);
                }
                else
                {
                    logger.info('[DVP-RuleService.GetCallRuleById] PGSQL Get call rule by id query success');
                    callback(undefined, callRule);
                }
            });
    }
    catch(ex)
    {
        logger.error('[DVP-RuleService.GetCallRuleById] Unhandled Error occurred', ex);
        callback(ex, undefined);
    }
};

var PickCallRuleOutboundComplete = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, callback)
{
    try
    {
        PickCallRuleOutbound(aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, function(err, callRule)
        {
            if(err)
            {
                callback(err, undefined);
            }
            else if(callRule)
            {
                dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: callRule.TrunkNumber}, {TenantId: tenantId}], include: [{model: dbModel.LimitInfo, as: 'LimitInfoOutbound'},{model: dbModel.LimitInfo, as: 'LimitInfoBoth'},{model: dbModel.Trunk, as: 'Trunk', include: [{model: dbModel.Translation, as: "Translation"}]}]})
                    .complete(function (err, phnNumTrunkInfo)
                    {
                        if (err)
                        {
                            logger.error('[DVP-RuleService.PickCallRuleOutboundComplete] PGSQL Get trunk and phone number query failed', err);
                            callback(err, undefined);
                        }
                        else if(phnNumTrunkInfo)
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
                                        tempDestination = transHandler.TranslateHandler(callRule.Transaction, tempDestination);
                                    }
                                    if(callRule.ANITranslation)
                                    {
                                        //Translate ANI And DNIS
                                        tempOrigination = transHandler.TranslateHandler(callRule.ANITranslation, tempOrigination);
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

var PickCallRuleOutbound = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, matchContext, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {Direction: 'OUTBOUND'}], order: ['Priority']})
            .complete(function (err, crList)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get outbound rules query failed', err);
                    callback(err, undefined);
                }
                else
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
                                .complete(function (err, crInfo)
                                {
                                    if(err)
                                    {
                                        logger.error('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get schedules translations for outbound rule query failed', err);
                                    }
                                    else
                                    {
                                        logger.info('[DVP-RuleService.PickCallRuleOutbound] PGSQL Get schedules translations for outbound rule query success');
                                    }
                                    callback(err, crInfo);

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

                }

            })
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var PickCallRuleInbound = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {Direction: 'INBOUND'}], order: ['Priority']})
            .complete(function (err, crList)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.PickCallRuleInbound] PGSQL Get inbound rules query failed', err);
                    callback(err, undefined);
                }
                else
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

                                if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum) && contextRegEx.test(context))
                                {
                                    //pick call rule and break op
                                    callRulePicked = crList[i];
                                    break;
                                }
                            }
                        }

                        if(callRulePicked)
                        {
                            //get application, get schedule, get translations
                            dbModel.CallRule
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Application, as: "Application", include : [{model: dbModel.Application, as: "MasterApplication"}]},{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}, {model: dbModel.Translation, as: "Translation"}]})
                                .complete(function (err, crInfo)
                                {
                                    if(err)
                                    {
                                        logger.error('[DVP-RuleService.PickCallRuleInbound] PGSQL Get schedules translations for inbound rule query failed', err);
                                    }
                                    else
                                    {
                                        logger.info('[DVP-RuleService.PickCallRuleInbound] PGSQL Get schedules translations for inbound rule query success');
                                    }
                                    callback(err, crInfo);

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


                }

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
            .complete(function (err, callRule)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query failed', err);
                    callback(err, false);
                }
                else
                {
                    if(callRule)
                    {
                        logger.info('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query success');
                        GetPhoneNumber(trunkNum, companyId, tenantId, function(err, num)
                        {
                            if(err)
                            {
                                callback(err, false);
                            }
                            else if(num && (num.ObjCategory === 'BOTH' || num.ObjCategory === 'OUTBOUND'))
                            {
                                callRule.updateAttributes({TrunkId: num.TrunkId, TrunkNumber: trunkNum, PhoneNumId: num.id}).complete(function (err)
                                {
                                    if(err)
                                    {
                                        logger.error('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Update call rule with trunk number query failed', err);
                                        callback(err, false);
                                    }
                                    else
                                    {
                                        logger.info('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Update call rule with trunk number query success');
                                        callback(undefined, true);
                                    }

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

                }
            });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }

};

var AddOutboundRule = function(reqId, ruleInfo, callback)
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
                GetPhoneNumber(ruleInfo.TrunkNumber, ruleInfo.CompanyId, ruleInfo.TenantId, function (err, num)
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
                            ObjCategory: '',
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
                            ExtraData: ruleInfo.ExtraData,
                            Direction: ruleInfo.Direction
                        });

                        rule
                            .save()
                            .complete(function (err)
                            {
                                try
                                {
                                    if (err)
                                    {
                                        logger.error('[DVP-RuleService.AddOutboundRule] PGSQL Insert outbound call rule with all attributes query failed', err);
                                        callback(err, -1, false);
                                    }
                                    else
                                    {
                                        logger.info('[DVP-RuleService.AddOutboundRule] PGSQL Insert outbound call rule with all attributes query success');
                                        var ruleId = rule.id;
                                        callback(undefined, ruleId, true);
                                    }
                                }
                                catch (ex)
                                {
                                    callback(ex,-1, false);
                                }

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

var AddInboundRule = function(reqId, ruleInfo, callback)
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
                ObjCategory: '',
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
                TranslationId: ruleInfo.TranslationId,
                ExtraData: ruleInfo.ExtraData
            });

            rule
                .save()
                .complete(function (err)
                {
                    try {
                        if (err)
                        {
                            logger.error('[DVP-RuleService.AddInboundRule] PGSQL Insert inbound call rule with all attributes query failed', err);
                            callback(err, -1, false);
                        }
                        else
                        {
                            logger.info('[DVP-RuleService.AddInboundRule] PGSQL Insert inbound call rule with all attributes query success');
                            var ruleId = rule.id;
                            callback(undefined, ruleId, true);
                        }
                    }
                    catch (ex)
                    {
                        callback(ex,-1, false);
                    }

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
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).complete(function (err, ruleRec)
        {
            if(err)
            {
                logger.error('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({Enable: enable}).complete(function (err)
                {
                    if(err)
                    {
                        logger.error('[DVP-RuleService.AddInboundRule] PGSQL Update call rule with availability query failed', err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.info('[DVP-RuleService.AddInboundRule] PGSQL Update call rule with availability query success');
                        callback(undefined, true);
                    }

                });
            }
            else
            {
                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId},{TenantId: tenantId}]}).complete(function (err, ruleRec)
        {
            if(err)
            {
                logger.error('[DVP-RuleService.SetCallRuleRegEx] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
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
                    }).complete(function (err)
                    {
                        if (err)
                        {
                            logger.error('[DVP-RuleService.SetCallRuleRegEx] PGSQL Update call rule with regular expressions query failed', err);
                            callback(err, false);
                        }
                        else
                        {
                            logger.info('[DVP-RuleService.SetCallRuleRegEx] PGSQL Update call rule with regular expressions query success');
                            callback(undefined, true);
                        }

                    });


            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleRegEx] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).complete(function (err, ruleRec)
        {

            if(err)
            {
                logger.error('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({Priority: priority}).complete(function (err)
                {
                    if(err)
                    {
                        logger.error('[DVP-RuleService.SetCallRulePriority] PGSQL Update call rule with priority query failed', err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Update call rule with priority query success');
                        callback(undefined, true);
                    }

                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRulePriority] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, ruleRec)
        {
            if(err)
            {
                logger.error('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule query failed', err);
                callback(err, false);
            }
            else if (ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule query success');

                dbModel.Application.find({where: [{id: appId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, appRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query failed', err);
                        callback(err, false);
                    }
                    else if(appRec)
                    {
                        logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query success');
                        ruleRec.setApplication(appRec).complete(function (err, result)
                        {
                            if (err)
                            {
                                logger.error('[DVP-RuleService.SetCallRuleAppDB] - [%s] - update rule with application PGSQL query failed', reqId, err);
                                callback(err, false);
                            }
                            else
                            {
                                logger.debug('[DVP-RuleService.SetCallRuleAppDB] - [%s] - update rule with application PGSQL query success', reqId);
                                callback(undefined, true);
                            }

                        })

                    }
                    else
                    {
                        logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get app query success');
                        callback(new Error('No app found'), false);
                    }
                });


            }
            else
            {
                logger.debug('[DVP-RuleService.SetCallRuleAppDB] PGSQL Get call rule by id query success');
                callback(new Error('No call rule found'), false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId}]}).complete(function (err, ruleRec)
        {
            if (!err && ruleRec)
            {
                logger.info('[DVP-RuleService.DeleteCallRule] PGSQL Get call rule by id query success');
                if(ruleRec.CompanyId == companyId)
                {
                    ruleRec.destroy().complete(function (err, result)
                    {
                        if(!err)
                        {
                            logger.info('[DVP-RuleService.DeleteCallRule] PGSQL Delete call rule query success');
                            callback(undefined, true);
                        }
                        else
                        {
                            logger.error('[DVP-RuleService.DeleteCallRule] PGSQL Delete call rule query failed', err);
                            callback(err, false);
                        }
                    });
                }
                else
                {
                    callback(new Error('Rule belongs to a different company'))
                }

            }
            else
            {
                logger.error('[DVP-RuleService.DeleteCallRule] PGSQL Get call rule by id query failed', err);
                callback(undefined, false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).complete(function (err, ruleRec)
        {

            if(err)
            {
                logger.error('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query success');
                //update attrib
                ruleRec.updateAttributes({ScheduleId: scheduleId}).complete(function (err)
                {
                    if(err)
                    {
                        logger.error('[DVP-RuleService.SetCallRuleSchedule] PGSQL Update call rule with schedule query fail', err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Update call rule with schedule query success');
                        callback(undefined, true);
                    }

                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleSchedule] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

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
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).complete(function (err, ruleRec)
        {

            if(err)
            {
                logger.error('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query success');
                ruleRec.updateAttributes({TranslationId: transId}).complete(function (err)
                {
                    if(err)
                    {
                        logger.error('[DVP-RuleService.SetCallRuleTranslation] PGSQL Update call rule with translation query fail', err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Update call rule with translation query success');
                        callback(undefined, true);
                    }

                });
            }
            else
            {
                logger.info('[DVP-RuleService.SetCallRuleTranslation] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

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