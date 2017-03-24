var DbConn = require('dvp-dbmodels');

function TranslateHandler(obj, Tstring)
{
    try
    {
        if(Tstring!=null)
        {
            var Rep=Replace(Tstring,obj.Replace);

            var ghostNumArray = [];

            if(obj.GhostNumbers)
            {
                ghostNumArray = JSON.parse(obj.GhostNumbers);
            }

            var Rand = Randomize(Rep, ghostNumArray);

            var Lrem=LRemove(Rand,obj.LRemove);
            var Rrem=RRemove(Lrem,obj.RRemove);
            var Ladd=LAdd(Rrem,obj.LAdd);
            var Radd=RAdd(Ladd,obj.RAdd);




            return Radd;

        }
        else
        {
            return Tstring;
        }

    }
    catch(ex)
    {
        return Tstring;
    }


}

function RRemove(Tstring,Rrem)
{

    if(Tstring!=null && Rrem>0)
    {
        var RRST = Tstring.substring(0,(Tstring.length)-Rrem );

        return RRST;
    }
    else
    {

        return Tstring;
    }

}

function LRemove(Tstring,Lrem)
{

    if(Tstring!=null && Lrem>0)
    {
        var LRST = Tstring.substring(Lrem,Tstring.length);

        return LRST;
    }
    else
    {
        return Tstring;
    }

}

function RAdd(Tstring,Radd)
{

    if(Tstring!=null && Radd!=null)
    {
        var RADD = Tstring+Radd;
        return RADD;
    }
    else
    {
        return Tstring;
    }
}

function LAdd(Tstring,Ladd)
{
    if(Tstring!=null && Ladd!=null)
    {
        var LADD = Ladd+Tstring;
        return LADD;
    }
    else
    {
        return Tstring;
    }
}

function Replace(Tstring,Nstring)
{
    if(Nstring!=null)
    {
        Tstring=Nstring;
        return Tstring;
    }
    else
    {
        return Tstring;
    }
}

function Randomize(Tstring, randomizeArr)
{
    if(randomizeArr && randomizeArr.length > 0)
    {
        Tstring=randomizeArr[Math.floor(Math.random()*randomizeArr.length)];
        return Tstring;
    }
    else
    {
        return Tstring;
    }
}

function TranslateHandlerById(id)
{
    try {
        DbConn.Translation.find({where: [{id: id}]}).complete(function (err, TransObject) {
            if (!err && TransObject==null)
            {
                console.log("Null object Found for id : "+TransObject.id);
            }
            else if (TransObject && !err) {

                var transString = TranslateHandler(TransObject,"0123456789");

                return transString;
            }
            else
            {

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