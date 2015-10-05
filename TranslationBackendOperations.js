var DbConn = require('DVP-DBModels');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;

function AddNewTranslation(transObj, callback)
{
    try
    {
        var trans = DbConn.Translation
            .build(
            {
                TransName: transObj.TransName,
                TransDescription: transObj.TransDescription,
                Enabled: transObj.Enabled.toString(),
                LAdd: transObj.LAdd,
                LRemove: transObj.LRemove,
                RAdd: transObj.RAdd,
                RRemove: transObj.RRemove,
                Replace: transObj.Replace,
                CompanyId: transObj.CompanyId,
                TenantId: transObj.TenantId,
                ObjClass: transObj.ObjClass,
                ObjType: transObj.ObjType,
                ObjCategory: transObj.ObjCategory
            }
        );
        trans.save().then(function (saveRes)
        {
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

function UpdateTranslation(transId, obj, callback)
{
    try
    {
        DbConn.Translation.find({where: [{id: transId},{CompanyId: obj.CompanyId}]}).then(function (transObj)
        {
            if (transObj)
            {
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
                        ObjCategory: obj.ObjCategory
                    }
                ).then(function (updtRes)
                    {

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

function GetTranslationById(transId, companyId, callback)
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

function GetAllTranslationsForCompany(companyId, callback)
{
    var emptyArr = [];
    try
    {
        DbConn.Translation.findAll({where: [{CompanyId: companyId}]}).then(function (transList)
        {
            logger.info('[DVP-RuleService.GetAllTranslationsForCompany] PGSQL Get translations for company query success');

            callback(undefined, transList);

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
