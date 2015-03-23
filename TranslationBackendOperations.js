/**
 * Created by dinusha on 3/19/2015.
 */
var DbConn = require('./DVP-DBModels');

function AddNewTranslation(obj,callback)
{
    try {
        DbConn.Translation.find({where: [{id: obj.id}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null) {

                var NewTransObject = DbConn.Translation
                    .build(
                    {

                        TransName: obj.TransName,
                        TransDescription: obj.TransDescription,
                        Enabled: obj.Enabled,
                        LAdd: obj.LAdd,
                        LRemove: obj.LRemove,
                        RAdd: obj.RAdd,
                        RRemove: obj.RRemove,
                        Replace: obj.Replace,
                        CompanyId: obj.CompanyId,
                        TenantId: obj.TenantId,
                        ObjClass: obj.ObjClass,
                        ObjType: obj.ObjType,
                        ObjCategory: obj.ObjCategory


                    }
                )

                Translation.save().complete(function (err) {
                    if (!err) {


                        var status = 1;


                        console.log("..................... Saved Successfully ....................................");


                        callback(undefined, NewTransObject.id);


                    }
                    else {
                        console.log("..................... Error found in saving.................................... : " + err);
                        callback(-1, undefined);

                    }


                });


            }
            else if (TransObject) {
                console.log("................................... Given Cloud Already in DB  ................................ ");
                callback(-1, undefined);

            }
            else {
                console.log("Some error occured");
                callback(-1, undefined);

            }


        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}

function UpdateTransalationRecord(obj,callback)
{
    try {
        DbConn.Translation.find({where: [{id: obj.id},{CompanyId:obj.CompanyId}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null) {
                callback(-1, undefined);



            }
            else if (TransObject && !err) {
                console.log("................................... Given Cloud Already in DB  ................................ ");

                try{
                    DbConn.Translation
                        .update(
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
                            //  AddDate:obj.AddTime,
                            // UpdateDate: obj.UpdateTime,
                            // createdAt:new Date(2009,10,11),
                            //updatedAt:new Date(2009,10,12)
                        },
                        {
                            where: {
                                id: obj.id
                            }
                        }
                    ).then(function (results) {

                            console.log("Updated successfully!");
                            callback(undefined, results);


                        }).error(function (err) {

                            console.log("Project update failed !");
                            callback(err, -1);
                            //handle error here

                        });
                }
                catch(ex)
                {
                    callback(ex, -1);
                }




            }
            else {
                console.log("Some error occured");
                callback(err, -1);

            }


        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}

function GetValuesOfId(obj,callback)
{
    try {
        DbConn.Translation.find({where: [{id: obj.id}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null) {

                callback(-1, undefined);

            }
            else if (TransObject && !err) {
               // console.log("................................... Given Cloud Already in DB  ................................ ");

                if(obj.CompanyId==obj.CompanyId)
                {
                    console.log("Record Found");

                    callback(undefined, TransObject);

                }
                else
                {console.log("Illegal Access  ");
                    callback(-1, undefined);
                }




            }
            else {
                console.log("Some error occured");
                callback(-1, undefined);

            }


        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}

function GetAllByCompany(obj,callback)
{
    try {
        DbConn.Translation.find({where: [{CompanyId: obj.CompanyId}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null) {

                callback(-1, undefined);

            }
            else if (TransObject && !err) {
                // console.log("................................... Given Cloud Already in DB  ................................ ");

                    console.log("Record Found");

                    callback(undefined, TransObject);

            }
            else {
                console.log("Some error occured");
                callback(-1, undefined);

            }


        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}