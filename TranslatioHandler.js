/**
 * Created by pawan on 3/20/2015.
 */

var DbConn = require('./DVP-DBModels');




function TranslateHandler(obj,Tstring)
{
    try
    {
        if(Tstring!=null)
        {
            var Lrem=LRemove(Tstring,obj.LRemove);
            var Rrem=RRemove(Lrem,obj.RRemove);
            var Ladd=LAdd(Rrem,obj.LAdd);
            var Radd=RAdd(Ladd,obj.RAdd);
            var Rep=Replace(Radd,obj.Replace);

            console.log("Final Result :"+Rep);
            return Rep;

        }
        else
        {
            console.log("Empty recieved to translate : ");
            return Tstring;
        }

    }
    catch(ex)
    {

    }


}

function RRemove(Tstring,Rrem)
{
    console.log("To Rrem :"+Tstring);

    if(Tstring!=null && Rrem>0) {
        var RRST = Tstring.substring(0,(Tstring.length)-Rrem );
        console.log("After Rrem :"+RRST);
        return RRST;
    }
    else
    {console.log("After Rrem :"+Tstring);
        return Tstring;
    }

}

function LRemove(Tstring,Lrem)
{
    console.log("TO Lrem :"+Tstring);
    if(Tstring!=null && Lrem>0) {
        var LRST = Tstring.substring(Lrem,Tstring.length);
        //console.log(RRST);
        console.log("After Lrem :"+LRST);
        return LRST;
    }
    else
    {console.log("After Lrem :"+Tstring);
        return Tstring;
    }

}

function RAdd(Tstring,Radd)
{
    console.log("To Radd :"+Tstring);
    if(Tstring!=null && Radd!=null)
    {
        var RADD = Tstring+Radd;
        console.log("After Radd :"+RADD);
        return RADD;
    }
    else
    {
        console.log("After Radd :"+Tstring);
        return Tstring;
    }
}

function LAdd(Tstring,Ladd)
{
    console.log("To Ladd :"+Tstring);
    if(Tstring!=null && Ladd!=null)
    {
        var LADD = Ladd+Tstring;
        console.log("After LADD :"+LADD);
        return LADD;
    }
    else
    {
        console.log("After LADD :"+Tstring);
        return Tstring;
    }
}

function Replace(Tstring,Nstring)
{
    console.log("To Replace :"+Tstring);
    if(Nstring!=null)
    {
        Tstring=Nstring;
        console.log("After rep :"+Tstring);
        return Tstring;
    }
    else
    {
        console.log("After rep :"+Tstring);
        return Tstring;
    }
}

function TranslateHandlerById(id)
{
    try {
        DbConn.Translation.find({where: [{id: id}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null) {
console.log("Null object Found for id : "+TransObject.id);


            }
            else if (TransObject && !err) {

                TranslateHandler(TransObject,"0123456789");
            }
            else {

                console.log("Error for search id : "+TransObject.id);
            }


        });
    }
    catch(ex)
    {
        console.log("Exception in Searching id : "+id+" exception is : "+ex);
    }
}


module.exports.TranslateHandler = TranslateHandler;
module.exports.TranslateHandlerById = TranslateHandlerById;