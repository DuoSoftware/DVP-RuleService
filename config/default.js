module.exports = {

    "DB": {
        "Type":"postgres",
        "User":"duo",
        "Password":"DuoS123",
        "Port":5432,
        "Host":"104.236.231.11",
        "Database":"duo"
    },

    "Redis":
        {
            "mode":"instance",//instance, cluster, sentinel
            "ip": "45.55.142.207",
            "port": 6389,
            "user": "",
            "password": "",
            "sentinels":{
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port":16389,
                "name":"redis-cluster"
            }

        },


    "Security":
        {

            "ip" : "45.55.142.207",
            "port": 6389,
            "user": "",
            "password": "",
            "mode":"instance",//instance, cluster, sentinel
            "sentinels":{
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port":16389,
                "name":"redis-cluster"
            }
        },

    "Services":
        {
            "httprogrammingapiHost": "httpprogrammingapi.app.veery.cloud",
            "httprogrammingapiPort": 9999,
            "dynamicPort" : false

        },

    "Host":{
        "Ip":"0.0.0.0",
        "Port":"8816",
        "Version":"1.0.0.0"
    }
};
