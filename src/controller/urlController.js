const urlModel = require('../model/urlModel')

const shortid = require('shortid');


const urlShortner = async function (req, res) {
    try {
        let data = req.body
        let { longUrl, ...rest } = data
        if(!longUrl) return res.status(400).send({statuis:false,message:"longUrl key must be present"})
        if(Object.keys(rest).length>0) return res.status(400).send({statuis:false,message:"please provide valid keys"})
        if (!/^(?:(https:|http:)+\/\/)+[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[.com|.in|.gov.in|.io|.org]{2,5}(\/)+(?!.*\?).*$/.test(longUrl.trim()))
        return res.status(400).send({ status: false, msg: "Enter a valid URL link" });
        let code = shortid.generate()
        let details = {}
        details.urlCode = code
        details.longUrl = longUrl
        details.shortUrl = `http://localhost:3000/${code}`
        const createNewUrl = await urlModel.create(details)
        let selectUrl = await urlModel.findOne(details).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 })
        res.status(201).send({ status: true, data: selectUrl })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}

const getUrl=async function(req,res){
    try{
        let urlCode=req.params.urlCode
        console.log(urlCode)
        let findUrlCode= await urlModel.findOne({urlCode:urlCode})
        if(!findUrlCode) return res.status(404).send({status:false, message:"this urlcode is not found in DB"})
        if(urlCode != findUrlCode.urlCode) return res.status(404).send({status:false, message:"params urlcode and findUrlCode not matched"})
        return res.status(200).send({status:true,data:`redirected to ` + findUrlCode.longUrl});
    }catch(error){
        res.status(500).send({status:false, message: error.message})
    }
    
}
module.exports={ urlShortner,getUrl }




