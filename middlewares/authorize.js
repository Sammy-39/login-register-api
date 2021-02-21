const jwt = require("jsonwebtoken")
const privateKey = "xcvbnm"

const authorize = (req,res,next) =>{
    try{
        const bearer = req.headers.authorize
        if(!bearer){
            throw new Error("Access not allowed. Token not available")
        }
        jwt.verify(bearer,privateKey,(err,decoded)=>{
            if(err){ throw err }
            res.locals.role = decoded.role
            next()
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
}

const adminAccess = (req,res,next) =>{
    try{
        if(res.locals.role==="admin"){ next() }
        else{ throw new Error("Admin access needed") }
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {authorize,adminAccess}