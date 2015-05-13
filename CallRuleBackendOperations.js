var dbModel = require('DVP-DBModels');
var regExHandler = require('./RegExHandler.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;

var GetPhoneNumber = function(phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkNumber.find({where: [{PhoneNumber: phoneNumber},{CompanyId: companyId}]})
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
        callback(ex, undefined);
    }
};

var GetCallRulesForCompany = function(companyId, tenantId, callback)
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
        callback(ex, undefined);
    }
};

var GetCallRuleById = function(ruleId, companyId, tenantId, callback)
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
        callback(ex, undefined);
    }
};

var PickCallRuleOutbound = function(aniNum, dnisNum, domain, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {ObjType: 'OUTBOUND'}], order: ['Priority']})
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

                                if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum))
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
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}, {model: dbModel.Translation, as: "Translation"}, {model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber"}]})
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

var PickCallRuleInbound = function(aniNum, dnisNum, domain, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule
            .findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{Enable: true}, {ObjType: 'INBOUND'}], order: ['Priority']})
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
                            if(crList[i].DNISRegEx && crList[i].ANIRegEx)
                            {
                                var dnisRegExPattern = new RegExp(crList[i].DNISRegEx);
                                var aniRegExPattern = new RegExp(crList[i].ANIRegEx);

                                if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum))
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

var SetOutboundRuleTrunkNumber = function(ruleId, companyId, tenantId, trunkNum, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId},{TenantId: tenantId}]})
            .complete(function (err, callRule)
            {
                if(err)
                {
                    logger.error('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query failed', err);
                    callback(err, false);
                }
                else
                {
                    logger.info('[DVP-RuleService.SetOutboundRuleTrunkNumber] PGSQL Get call rule by id query success');
                    GetPhoneNumber(trunkNum, companyId, tenantId, function(err, num)
                    {
                        if(err)
                        {
                            callback(err, false);
                        }
                        else if(num)
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
                            callback(new Error('Trunk number is not valid for the company'), false);
                        }
                    })
                }
            });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }

}

var AddOutboundRule = function(ruleInfo, callback)
{
    try
    {
        if(ruleInfo.ObjType == 'Outbound')
        {
            //allow opereation

            if(ruleInfo.ObjCategory && (ruleInfo.ObjCategory == 'IVR' || ruleInfo.ObjCategory == 'URL' || ruleInfo.ObjCategory == 'Gateway'))
            {
                dbModel.CallRule
                    .find({where: {id: ruleInfo.id}})
                    .complete(function (err, rule)
                    {
                        try
                        {
                            if (err)
                            {
                                logger.error('[DVP-RuleService.AddOutboundRule] PGSQL Get call rule by id query failed', err);
                                callback(err, -1, false);
                            }
                            else if (rule)
                            {
                                //update call rule
                                logger.info('[DVP-RuleService.AddOutboundRule] PGSQL Get call rule by id query success');

                                if(rule.CompanyId == ruleInfo.CompanyId && rule.TenantId == ruleInfo.TenantId)
                                {
                                    //allow update

                                    if(ruleInfo.ObjCategory == "Gateway")
                                    {
                                        //need to validate trunk number

                                        if(ruleInfo.TrunkNumber)
                                        {
                                            //find trunk connecting to that trunk number
                                            GetPhoneNumber(ruleInfo.TrunkNumber, ruleInfo.CompanyId, ruleInfo.TenantId, function(err, num)
                                            {
                                                if(err)
                                                {
                                                    callback(err, -1, false);
                                                }
                                                else if(num)
                                                {
                                                    rule.updateAttributes({CallRuleDescription: ruleInfo.CallRuleDescription,
                                                        ObjClass: ruleInfo.ObjClass,
                                                        ObjType: ruleInfo.ObjType,
                                                        ObjCategory: ruleInfo.ObjCategory,
                                                        Enable: ruleInfo.Enable,
                                                        CompanyId: ruleInfo.CompanyId,
                                                        TenantId: ruleInfo.TenantId,
                                                        DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                                                        ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                                                        RegExPattern: ruleInfo.RegExPattern,
                                                        ANIRegExPattern: ruleInfo.ANIRegExPattern,
                                                        DNIS: ruleInfo.DNIS,
                                                        ANI: ruleInfo.ANI,
                                                        Priority: ruleInfo.Priority,
                                                        TargetScript: ruleInfo.TargetScript,
                                                        TrunkId: num.TrunkId,
                                                        TrunkNumber: ruleInfo.TrunkNumber,
                                                        ExtraData: ruleInfo.ExtraData}).complete(function (err)
                                                    {
                                                        if(err)
                                                        {
                                                            logger.error('[DVP-RuleService.AddOutboundRule] PGSQL Update outbound call rule with all attributes query failed', err);
                                                            callback(err, -1, false);
                                                        }
                                                        else
                                                        {
                                                            logger.info('[DVP-RuleService.AddOutboundRule] PGSQL Update outbound call rule with all attributes query success');
                                                            callback(undefined, rule.id, true);
                                                        }

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
                                        callback(new Error('Value Gateway is only allowed of ObjCategory'), -1, false);
                                    }


                                }
                                else
                                {
                                    //cant update other company rules
                                    callback(new Error('Rule belongs to a different company'), -1, false);
                                }
                            }
                            else
                            {
                                logger.info('[DVP-RuleService.AddOutboundRule] PGSQL Get call rule by id query success');

                                if (ruleInfo.ObjCategory == "Gateway")
                                {
                                    //need to validate trunk number

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
                                                    ObjClass: ruleInfo.ObjClass,
                                                    ObjType: ruleInfo.ObjType,
                                                    ObjCategory: ruleInfo.ObjCategory,
                                                    Enable: ruleInfo.Enable,
                                                    CompanyId: ruleInfo.CompanyId,
                                                    TenantId: ruleInfo.TenantId,
                                                    DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                                                    ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                                                    RegExPattern: ruleInfo.RegExPattern,
                                                    ANIRegExPattern: ruleInfo.ANIRegExPattern,
                                                    DNIS: ruleInfo.DNIS,
                                                    ANI: ruleInfo.ANI,
                                                    Priority: ruleInfo.Priority,
                                                    TargetScript: ruleInfo.TargetScript,
                                                    ExtraData: ruleInfo.ExtraData
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
                                    callback(new Error('Value Gateway is only allowed of ObjCategory'), -1, false);
                                }
                                //save call rule
                            }
                        }
                        catch (ex)
                        {
                            callback(ex, undefined);
                        }

                    })
            }
            else
            {
                callback(new Error('Invalid rule category'), -1, false);
            }


        }
        else
        {
            callback(new Error('Invalid rule type'), -1, false);
        }

    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}

var AddInboundRule = function(ruleInfo, callback)
{
    try
    {
        if(ruleInfo.ObjType == 'Inbound')
        {
            //allow opereation

            if(ruleInfo.ObjCategory && (ruleInfo.ObjCategory == 'IVR' || ruleInfo.ObjCategory == 'URL' || ruleInfo.ObjCategory == 'FAX'))
            {
                dbModel.CallRule
                    .find({where: {id: ruleInfo.id}})
                    .complete(function (err, rule)
                    {
                        try
                        {
                            if (err)
                            {
                                logger.error('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query failed', err);
                                callback(err, -1, false);
                            }
                            else if (rule)
                            {
                                //update call rule
                                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');

                                if(rule.CompanyId == ruleInfo.CompanyId && rule.TenantId == ruleInfo.TenantId)
                                {
                                    //allow update
                                    rule.updateAttributes({CallRuleDescription: ruleInfo.CallRuleDescription,
                                        ObjClass: ruleInfo.ObjClass,
                                        ObjType: ruleInfo.ObjType,
                                        ObjCategory: ruleInfo.ObjCategory,
                                        Enable: ruleInfo.Enable,
                                        CompanyId: ruleInfo.CompanyId,
                                        TenantId: ruleInfo.TenantId,
                                        DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                                        ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                                        RegExPattern: ruleInfo.RegExPattern,
                                        ANIRegExPattern: ruleInfo.ANIRegExPattern,
                                        DNIS: ruleInfo.DNIS,
                                        ANI: ruleInfo.ANI,
                                        Priority: ruleInfo.Priority,
                                        TargetScript: ruleInfo.TargetScript,
                                        ScheduleId: ruleInfo.ScheduleId,
                                        TranslationId: ruleInfo.TranslationId,
                                        ExtraData: ruleInfo.ExtraData}).complete(function (err)
                                    {
                                        if(err)
                                        {
                                            logger.error('[DVP-RuleService.AddInboundRule] PGSQL Update inbound call rule with all attributes query failed', err);
                                            callback(err, -1, false);
                                        }
                                        else
                                        {
                                            logger.info('[DVP-RuleService.AddInboundRule] PGSQL Update inbound call rule with all attributes query success');
                                            callback(undefined, rule.id, true);
                                        }

                                    });
                                }
                                else
                                {
                                    //cant update other company rules
                                    callback(new Error('Rule belongs to a different company'), -1, false);
                                }
                            }
                            else
                            {
                                logger.info('[DVP-RuleService.AddInboundRule] PGSQL Get call rule by id query success');
                                //save call rule
                                var rule = dbModel.CallRule.build({
                                    CallRuleDescription: ruleInfo.CallRuleDescription,
                                    ObjClass: ruleInfo.ObjClass,
                                    ObjType: ruleInfo.ObjType,
                                    ObjCategory: ruleInfo.ObjCategory,
                                    Enable: ruleInfo.Enable,
                                    CompanyId: ruleInfo.CompanyId,
                                    TenantId: ruleInfo.TenantId,
                                    DNISRegEx: regExHandler.GenerateRegEx(ruleInfo.DNIS, ruleInfo.RegExPattern),
                                    ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.ANIRegExPattern),
                                    RegExPattern: ruleInfo.RegExPattern,
                                    ANIRegExPattern: ruleInfo.ANIRegExPattern,
                                    DNIS: ruleInfo.DNIS,
                                    ANI: ruleInfo.ANI,
                                    Priority: ruleInfo.Priority,
                                    TargetScript: ruleInfo.TargetScript,
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
                        }
                        catch (ex)
                        {
                            callback(ex, undefined);
                        }

                    })
            }
            else
            {
                callback(new Error('Invalid rule category'), -1, false);
            }


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

var SetCallRuleAvailability = function(ruleId, enable, companyId, tenantId, callback)
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

var SetCallOutboundRuleRegEx = function(ruleId, DNISRegExMethod, ANIRegExMethod, DNIS, ANI, companyId, tenantId, callback)
{
    try
    {
        dbModel.CallRule.find({where: [{id: ruleId},{CompanyId: companyId}]}).complete(function (err, ruleRec)
        {
            if(err)
            {
                logger.error('[DVP-RuleService.SetCallOutboundRuleRegEx] PGSQL Get call rule by id query failed', err);
                callback(err, false);
            }
            else if(ruleRec)
            {
                logger.info('[DVP-RuleService.SetCallOutboundRuleRegEx] PGSQL Get call rule by id query success');
                //update attrib
                if(ruleRec.ObjType == "Outbound")
                {
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
                                logger.error('[DVP-RuleService.SetCallOutboundRuleRegEx] PGSQL Update call rule with regular expressions query failed', err);
                                callback(err, false);
                            }
                            else
                            {
                                logger.info('[DVP-RuleService.SetCallOutboundRuleRegEx] PGSQL Update call rule with regular expressions query success');
                                callback(undefined, true);
                            }

                        });
                }
                else
                {
                    callback(new Error("Call rule provided to update is not an outbound rule"), false);
                }


            }
            else
            {
                logger.info('[DVP-RuleService.SetCallOutboundRuleRegEx] PGSQL Get call rule by id query success');
                callback(new Error("Unable to find call rule for company"), false);
            }

        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var SetCallRulePriority = function(ruleId, priority, companyId, tenantId, callback)
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

var DeleteCallRule = function(ruleId, companyId, tenantId, callback)
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

var SetCallRuleSchedule = function(ruleId, scheduleId, companyId, tenantId, callback)
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

var SetCallRuleTranslation = function(ruleId, transId, companyId, tenantId, callback)
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
module.exports.SetCallOutboundRuleRegEx = SetCallOutboundRuleRegEx;
module.exports.SetCallRuleSchedule = SetCallRuleSchedule;
module.exports.SetCallRuleTranslation = SetCallRuleTranslation;
module.exports.PickCallRuleInbound = PickCallRuleInbound;
module.exports.PickCallRuleOutbound = PickCallRuleOutbound;