var DbConn = require('dvp-dbmodels');
var logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var redisCacheHandler = require('dvp-common/CSConfigRedisCaching/RedisHandler.js');

function AddNewTranslation(reqId, transObj, companyId, tenantId, callback)
{
    try
    {
        var ghostNumbers = null;

        if(transObj.GhostNumbers && transObj.GhostNumbers.length > 0)
        {
            ghostNumbers = JSON.stringify(transObj.GhostNumbers);
        }

        var enabled = false;

        if(transObj.Enabled)
        {
            enabled = transObj.Enabled;
        }

        var trans = DbConn.Translation
            .build(
            {
                TransName: transObj.TransName,
                TransDescription: transObj.TransDescription,
                Enabled: enabled,
                LAdd: transObj.LAdd,
                LRemove: transObj.LRemove,
                RAdd: transObj.RAdd,
                RRemove: transObj.RRemove,
                Replace: transObj.Replace,
                CompanyId: companyId,
                TenantId: tenantId,
                ObjClass: transObj.ObjClass,
                ObjType: transObj.ObjType,
                ObjCategory: transObj.ObjCategory,
                GhostNumbers: ghostNumbers
            }
        );
        trans.save().then(function (saveRes)
        {
            redisCacheHandler.addTranslationToCompanyObj(saveRes, saveRes.TenantId, saveRes.CompanyId);
            logger.info('[DVP-RuleService.AddNewTranslation] PGSQL Insert translation query success');
            callback(undefined, trans.id, true);

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.AddNewTranslation] PGSQL Insert translation query fail', err);
            callback(err, -1, false);
        });
    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
}

function UpdateTranslation(reqId, transId, obj, companyId, tenantId, callback)
{
    try
    {
        DbConn.Translation.find({where: [{id: transId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (transObj)
        {
            if (transObj)
            {
                var ghostNumbers = null;

                if(obj.GhostNumbers && obj.GhostNumbers.length > 0)
                {
                    ghostNumbers = JSON.stringify(obj.GhostNumbers);
                }

                //update
                logger.info('[DVP-RuleService.UpdateTranslation] PGSQL Get translation by id query success');
                transObj.updateAttributes(
                    {
                        TransName: obj.TransName,
                        TransDescription: obj.TransDescription,
                        Enabled: obj.Enabled,
                        LAdd: obj.LAdd,
                        LRemove: obj.LRemove,
                        RAdd: obj.RAdd,
                        RRemove: obj.RRemove,
                        Replace: obj.Replace,
                        ObjClass: obj.ObjClass,
                        ObjType: obj.ObjType,
                        ObjCategory: obj.ObjCategory,
                        GhostNumbers: ghostNumbers
                    }
                ).then(function (updtRes)
                    {
                        redisCacheHandler.addTranslationToCompanyObj(updtRes, updtRes.TenantId, updtRes.CompanyId);

                        logger.info('[DVP-RuleService.UpdateTranslation] PGSQL Update translation with all attributes query success');
                        callback(undefined, true);


                    }).catch(function(err)
                    {
                        logger.error('[DVP-RuleService.UpdateTranslation] PGSQL Update translation with all attributes query failed', err);
                        callback(err, false);
                    });
            }
            else
            {
                logger.info('[DVP-RuleService.UpdateTranslation] PGSQL Get translation by id query success');
                callback(new Error('Translation not found with given id'), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.UpdateTranslation] PGSQL Get translation by id query failed', err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        callback(ex, false);
    }
}

function GetTranslationById(reqId, transId, companyId, callback)
{
    try
    {
        DbConn.Translation.find({where: [{id: transId},{CompanyId: companyId}]}).then(function (transObj)
        {
            logger.info('[DVP-RuleService.GetTranslationById] PGSQL Get translation by id query success');
            callback(undefined, transObj);

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.GetTranslationById] PGSQL Get translation by id query failed', err);
            callback(err, undefined);
        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}

function GetAllTranslationsForCompany(reqId, companyId, tenantId, callback)
{
    var emptyArr = [];
    try
    {
        DbConn.Translation.findAll({where: [{CompanyId: companyId},{TenantId: tenantId}]}).then(function (transList)
        {
            logger.info('[DVP-RuleService.GetAllTranslationsForCompany] PGSQL Get translations for company query success');

            var newTransList = transList.map(function(trans)
            {
                if (trans.GhostNumbers)
                {
                    trans.GhostNumbers = JSON.parse(trans.GhostNumbers);
                }

                return trans;
            });

            callback(undefined, newTransList);

        }).catch(function(err)
        {
            logger.error('[DVP-RuleService.GetAllTranslationsForCompany] PGSQL Get translations for company query failed', err);
            callback(err, emptyArr);
        });
    }
    catch(ex)
    {
        callback(ex, emptyArr);
    }
}

module.exports.AddNewTranslation = AddNewTranslation;
module.exports.UpdateTranslation = UpdateTranslation;
module.exports.GetTranslationById = GetTranslationById;
module.exports.GetAllTranslationsForCompany = GetAllTranslationsForCompany;
