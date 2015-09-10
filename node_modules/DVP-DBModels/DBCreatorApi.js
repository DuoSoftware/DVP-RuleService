var sequelize = require('./index.js').SequelizeConn;

var createDB = function(forcefully, callback){
    sequelize
        .sync({ force: forcefully })
        .complete(function(err) {
            if (!!err)
            {
                console.log('An error occurred while creating the database:', err);
                callback(err, false);
            }
            else
            {
                console.log('It worked!');
                callback(null, true);
            }
        });
};

createDB(false, function(err, res){

    console.log(res);

});

