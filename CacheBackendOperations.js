/**
 * Created by dinusha on 3/8/2016.
 */
var underscore = require('underscore');

var PickCallRuleInbound = function(reqId, aniNum, dnisNum, domain, context, companyId, tenantId, data, callback)
{
    try
    {
        if(data && data.CallRule)
        {
            var rules = underscore.filter(data.CallRule, function(rule)
            {
                return rule.Enable === true && rule.Direction === 'INBOUND'
            });

            var crList = underscore.sortBy(rules, function(filteredRule)
            {
                return filteredRule.Priority;
            });

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

                    var crInfo = callRulePicked;

                    if(data.Application && callRulePicked.AppId)
                    {
                        var app = data.Application[callRulePicked.AppId];

                        if(app)
                        {
                            crInfo.Application = app;

                            if(app.MasterApplicationId)
                            {
                                var masterApp = data.Application[app.MasterApplicationId];

                                if(masterApp)
                                {
                                    app.MasterApplication = masterApp
                                }
                            }


                        }
                    }

                    if(data.Translation && callRulePicked.TranslationId)
                    {
                        var dnisTrans = data.Translation[callRulePicked.TranslationId];

                        if(dnisTrans)
                        {
                            crInfo.Translation = dnisTrans;
                        }

                    }

                    if(data.Translation && callRulePicked.ANITranslationId)
                    {
                        var aniTrans = data.Translation[callRulePicked.ANITranslationId];

                        if(aniTrans)
                        {
                            crInfo.ANITranslation = aniTrans;
                        }

                    }

                    callback(undefined, crInfo);

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
        else
        {
            callback(new Error('Cache has no rules configured'), undefined);
        }

    }
    catch(ex)
    {
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
                var phnNumTrunkInfo = callRule.TrunkPhoneNumber;

                if(phnNumTrunkInfo)
                {
                    redisHandler.GetObject(null, 'TRUNK:' + phnNumTrunkInfo.TrunkId, function(err, tr)
                    {

                        if(tr)
                        {
                            phnNumTrunkInfo.Trunk = tr;

                            if(data.Translation && phnNumTrunkInfo.Trunk.TranslationId)
                            {
                                var dnisTrans = data.Translation[phnNumTrunkInfo.Trunk.TranslationId];

                                if(dnisTrans)
                                {
                                    phnNumTrunkInfo.Trunk.Translation = dnisTrans;
                                }

                            }
                        }

                        var phnNumType = phnNumTrunkInfo.ObjCategory;

                        if(phnNumType === 'OUTBOUND' || phnNumType === 'BOTH')
                        {
                            var outLimit = undefined;
                            var bothLimit = undefined;

                            if(data && data.LimitInfo)
                            {
                                if(phnNumTrunkInfo.OutboundLimitId)
                                {
                                    var outLim = data.LimitInfo[phnNumTrunkInfo.OutboundLimitId];

                                    if(outLim)
                                    {
                                        phnNumTrunkInfo.LimitInfoOutbound = outLim;
                                    }
                                }

                                if(phnNumTrunkInfo.BothLimitId)
                                {
                                    var bothLim = data.LimitInfo[phnNumTrunkInfo.BothLimitId];

                                    if(bothLim)
                                    {
                                        phnNumTrunkInfo.LimitInfoBoth = bothLim;
                                    }
                                }

                            }

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
                    });





                }
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
                                        tempDestination = transHandler.TranslateHandler(callRule.Transaction, tempDestination);
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

        if(data && data.CallRule)
        {
            var rules = underscore.filter(data.CallRule, function(rule)
            {
                return rule.Enable === true && rule.Direction === 'OUTBOUND'
            });

            var crList = underscore.sortBy(rules, function(filteredRule)
            {
                return filteredRule.Priority;
            });

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
                    var crInfo = callRulePicked;

                    if(data.Translation && callRulePicked.TranslationId)
                    {
                        var dnisTrans = data.Translation[callRulePicked.TranslationId];

                        if(dnisTrans)
                        {
                            crInfo.Translation = dnisTrans;
                        }

                    }

                    if(data.Translation && callRulePicked.ANITranslationId)
                    {
                        var aniTrans = data.Translation[callRulePicked.ANITranslationId];

                        if(aniTrans)
                        {
                            crInfo.ANITranslation = aniTrans;
                        }

                    }

                    if(data.TrunkPhoneNumber && callRulePicked.PhoneNumId)
                    {
                        var phnNum = data.TrunkPhoneNumber[callRulePicked.PhoneNumId];

                        if(phnNum)
                        {
                            crInfo.TrunkPhoneNumber = phnNum;
                        }

                    }

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
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

module.exports.PickCallRuleInbound = PickCallRuleInbound;
module.exports.PickCallRuleOutboundComplete = PickCallRuleOutboundComplete;