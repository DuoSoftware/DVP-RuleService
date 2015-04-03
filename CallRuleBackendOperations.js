var dbModel = require('./DVP-DBModels');
var regExHandler = require('./RegExHandler.js');

var GetPhoneNumber = function(phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkNumber.find({where: [{PhoneNumber: phoneNumber},{CompanyId: companyId}]})
            .complete(function (err, trNum)
            {
                if(err)
                {
                    callback(err, undefined);
                }
                else
                {
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
                    callback(err, undefined);
                }
                else
                {
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
                    callback(err, undefined);
                }
                else
                {
                    callback(undefined, callRule);
                }
            });
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
                    callback(err, undefined);
                }
                else
                {
                    var callRulePicked = undefined;

                    try
                    {
                        var crCount = crList.length;

                        for (i = 0; i < crCount; i++)
                        {
                            if(cr[i].DNISRegEx && cr[i].ANIRegEx)
                            {
                                var dnisRegExPattern = new RegExp(cr[i].DNISRegEx);
                                var aniRegExPattern = new RegExp(cr[i].ANIRegEx);

                                if(dnisRegExPattern.test(dnisNum) && aniRegExPattern.test(aniNum))
                                {
                                    //pick call rule and break op
                                    callRulePicked = cr[i];
                                    break;
                                }
                            }
                        }

                        if(callRulePicked)
                        {
                            //get application, get schedule, get translations
                            dbModel.CallRule
                                .find({where :[{id: callRulePicked.id}], include: [{model: dbModel.Application, as: "Application"}], include: [{model: dbModel.Schedule, as: "Schedule", include: [{ model: dbModel.Appointment, as: "Appointment"}]}], include: [{model: dbModel.Translation, as: "Translation"}]})
                                .complete(function (err, crInfo)
                                {
                                    callback(err, crInfo);

                                });

                        }
                        else
                        {
                            callback(undefined, undefined);
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
                    callback(err, false);
                }
                else
                {
                    GetPhoneNumber(trunkNum, companyId, tenantId, function(err, num)
                    {
                        if(err)
                        {
                            callback(err, false);
                        }
                        else if(num)
                        {
                            callRule.updateAttributes({TrunkId: num.TrunkId, TrunkNumber: trunkNum}).complete(function (err)
                            {
                                if(err)
                                {
                                    callback(err, false);
                                }
                                else
                                {
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
                                callback(err, -1, false);
                            }
                            else if (rule)
                            {
                                //update call rule

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
                                                            callback(err, -1, false);
                                                        }
                                                        else
                                                        {
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


                                }
                                else
                                {
                                    //cant update other company rules
                                    callback(new Error('Rule belongs to a different company'), -1, false);
                                }
                            }
                            else {

                                if (ruleInfo.ObjCategory == "Gateway") {
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
                                                        try {
                                                            if (err)
                                                            {
                                                                callback(err, -1, false);
                                                            }
                                                            else {
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
                                            else {
                                                callback(new Error('Trunk number is not valid for the company'), -1, false);
                                            }
                                        })
                                    }
                                }
                                //save call rule
                            }
                        }
                        catch (ex) {
                            console.log(ex.toString());
                            callback(undefined, undefined);
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
        console.log(ex.toString());
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
                                callback(err, -1, false);
                            }
                            else if (rule)
                            {
                                //update call rule

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
                                            callback(err, -1, false);
                                        }
                                        else
                                        {
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
                                                callback(err, -1, false);
                                            }
                                            else {
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
                        catch (ex) {
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
        console.log(ex.toString());
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
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                ruleRec.updateAttributes({Enable: enable}).complete(function (err)
                {
                    if(err)
                    {
                        callback(err, false);
                    }
                    else
                    {
                        callback(undefined, true);
                    }

                });
            }
            else
            {
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
                callback(err, false);
            }
            else if(ruleRec)
            {
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
                        }).complete(function (err) {
                            if (err) {
                                callback(err, false);
                            }
                            else {
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
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                ruleRec.updateAttributes({Priority: priority}).complete(function (err)
                {
                    if(err)
                    {
                        callback(err, false);
                    }
                    else
                    {
                        callback(undefined, true);
                    }

                });
            }
            else
            {
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
                if(ruleRec.CompanyId == companyId)
                {
                    ruleRec.destroy().complete(function (err, result)
                    {
                        if(!err)
                        {
                            callback(undefined, true);
                        }
                        else
                        {
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
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                ruleRec.updateAttributes({ScheduleId: scheduleId}).complete(function (err)
                {
                    if(err)
                    {
                        callback(err, false);
                    }
                    else
                    {
                        callback(undefined, true);
                    }

                });
            }
            else
            {
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
                callback(err, false);
            }
            else if(ruleRec)
            {
                //update attrib
                ruleRec.updateAttributes({TranslationId: transId}).complete(function (err)
                {
                    if(err)
                    {
                        callback(err, false);
                    }
                    else
                    {
                        callback(undefined, true);
                    }

                });
            }
            else
            {
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