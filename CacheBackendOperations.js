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
            })

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

                    if(data.Application && callRulePicked.ApplicationId)
                    {
                        var app = data.Application[callRulePicked.ApplicationId];

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

module.exports.PickCallRuleInbound = PickCallRuleInbound;