const express = require("express")
const bcrypt = require("bcryptjs")
const {createJWT} = require("../modules/genJWT")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const router = express.Router()

router.post("/login", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology: true})
        let db = client.db("login-reg-db")
        let user = await db.collection("users").findOne({"email":req.body.email})

        if(user && bcrypt.compareSync(req.body.password,user.password)){
            
            let token = createJWT({id:user["_id"],role:user["role"]})
            
            client.close()
            res.status(200).json({
                message : "Login Success",
                token,
                role: user["role"]
            })
        }
        else{
            throw new Error("Incorrect email or password")
        }
    }
    catch(err){
        res.status(400).json({
            message : err.message
        })
    }
})

module.exports = router