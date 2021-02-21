const express = require("express")
const bcrypt = require("bcryptjs")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const router = express.Router()

router.post("/register",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology: true})
        let db = client.db("login-reg-db")

        let emailExists = await db.collection("users").findOne({"email":req.body.email})
        if(emailExists){
            throw new Error("Email already exists")
        }

        let pwdHash = bcrypt.hashSync(req.body.password,10)
        req.body.password = pwdHash

        await db.collection("users").insertOne(req.body)

        client.close()
        res.status(200).json({
            message: "Registered Successfully"
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

module.exports = router