const urlModel = require('../model/urlModel')
const shortid = require('shortid');
//const validator= require("validator")
//Redis is an open source , in-memory data structure store, used as a database, cache, and message broker

const redis = require("redis");
// util is basically node.js module with provides promisify function
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    13800,
    "redis-13800.c264.ap-south-1-1.ec2.cloud.redislabs.com", // publuc end point
    { no_ready_check: true }
);
redisClient.auth("Vtbolgcq4b2IlvwksBW5lYBVnei8JVeP", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient); //data has been created , as well as fect will set to the casching
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient); // avoiding db call to get te output in a fast way.


const urlShortner = async function (req, res) {
    try {
        let data = req.body
        let { longUrl, ...rest } = data
        //check longUrl is present or not
        if (!longUrl) return res.status(400).send({ statuis: false, message: "longUrl key must be present" })
        //check if any unwanted key is present or not in body
        if (Object.keys(rest).length > 0) return res.status(400).send({ statuis: false, message: "please provide valid keys" })
        //check longUrl is valid or not
        if (!/^(https:\/\/|http:\/\/)[a-zA-Z]+\.[a-zA-Z0-9\!-_$]+\.[a-zA-Z]{2,5}(\/)+[A-Za-z0-9\!@#$%&*?=+_.-]+/.test(longUrl.trim()))
            return res.status(400).send({ status: false, msg: "Enter a valid URL link" });
        // fetch data from cache
        let getData = await GET_ASYNC(`${longUrl}`)
        let result = JSON.parse(getData)  // conevert  string to object  
        if (result) {
            const data = {
                "urlCode": result.urlCode,
                "longUrl": result.longUrl,
                "shortUrl": result.shortUrl
            }
            return res.status(200).send({ status: true, data: data }) // cache response
        } else {
            // create shortUrl
            let code = shortid.generate()
            let details = {}
            details.urlCode = code
            details.longUrl = longUrl
            details.shortUrl = `http://localhost:3000/${code}`
            const createNewUrl = await urlModel.create(details) // data is created
            let selectUrl = {
                "urlCode": createNewUrl.urlCode,
                "longUrl": createNewUrl.longUrl,
                "shortUrl": createNewUrl.shortUrl
            }
            await SET_ASYNC(`${longUrl}`, JSON.stringify(selectUrl)) // convert object to string
            res.status(201).send({ status: true, data: selectUrl }) // db response or cache res  
        }


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        if (!shortid.isValid(urlCode)) return res.status(400).send({ status: false, message: "invalid urlCode"})
        let cashUrl = await GET_ASYNC(`${urlCode}`) //get url from cache memory 
        if (cashUrl) return res.status(302).redirect(cashUrl) //cache hit
        else {
            let findUrlCode = await urlModel.findOne({ urlCode: urlCode }).select({ urlCode: 0, _id: 0 }); // db call
            if (!findUrlCode) return res.status(404).send({ status: false, message: "this urlcode is not found in DB" })
            await SET_ASYNC(`${urlCode}`, findUrlCode.longUrl) //cache miss
            return res.status(302).redirect(findUrlCode.longUrl)
        } 
    

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}


module.exports = { urlShortner, getUrl }

