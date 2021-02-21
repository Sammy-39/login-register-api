const express = require("express")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

const {authorize,adminAccess} = require("../middlewares/authorize")

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const dbURL = `mongodb://sammy:sammydb@cluster0-shard-00-00.pvarl.mongodb.net:27017,cluster0-shard-00-01.pvarl.mongodb.net:27017,cluster0-shard-00-02.pvarl.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-wb3j6y-shard-0&authSource=admin&retryWrites=true&w=majority`

const router = express.Router()

dotenv.config()

router.get("/users",[authorize,adminAccess], async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology: true})
        let db = client.db("login-reg-db")

        let users = await db.collection("users").find().toArray()
        client.close()

        res.status(200).json(users)
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/forgotPassword", async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("login-reg-db")
        let user = await db.collection("users").findOne({email:req.body.email})
        if(user) { 
            const token = crypto.randomBytes(20).toString('hex')
            await db.collection("users").updateOne({email:req.body.email},{$set:{
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000
            }})

            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.PASSWORD
                }
            });
            
            const mailOptions = {
                from : 'offLoginApp@mail.com',
                to : `${user.email}`,
                subject: 'Link to rest password',
                text:
                'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
                + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
                + `http://localhost:3000/reset/${token}\n\n`
                + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
            };

            await transport.sendMail(mailOptions)

            client.close()
            res.status(200).json({
                message: "Email Sent"
            }) 
        }
        else { 
            throw new Error("Email not registered")
        }
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.patch("/changePassword",async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbURL,{useUnifiedTopology:true})
        let db = client.db("login-reg-db")
        let user = await db.collection("users").findOne({resetPasswordToken: {$exists:req.body.token}})
        if(!user) { throw new Error("User not found. Check the reset token") }
        if(user.resetPasswordExpires>=Date.now()){
            let hashPwd = bcrypt.hashSync(req.body.password,10)
            await db.collection("users").updateOne({resetPasswordToken: {$exists:req.body.token}},
                {$set: {password:hashPwd}, $unset: {resetPasswordToken:1, resetPasswordExpires:1}})

            client.close()
            res.status(200).json({
                message: "Password changed successfully"
            })
        }
        else{
            throw new Error("Change Password link expired")
        }
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }

})

module.exports = router