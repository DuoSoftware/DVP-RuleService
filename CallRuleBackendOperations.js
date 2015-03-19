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
                                                    callback(err, -1, undefined);
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
                                                        ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.RegExPattern),
                                                        RegExPattern: ruleInfo.RegExPattern,
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
                                                callback(err, -1, undefined);
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
                                                    ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.RegExPattern),
                                                    RegExPattern: ruleInfo.RegExPattern,
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
                                        ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.RegExPattern),
                                        RegExPattern: ruleInfo.RegExPattern,
                                        DNIS: ruleInfo.DNIS,
                                        ANI: ruleInfo.ANI,
                                        Priority: ruleInfo.Priority,
                                        TargetScript: ruleInfo.TargetScript,
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
                                    ANIRegEx: regExHandler.GenerateRegEx(ruleInfo.ANI, ruleInfo.RegExPattern),
                                    RegExPattern: ruleInfo.RegExPattern,
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


};