const jwt = require("jsonwebtoken")

const secret = "xcvbnm"

const createJWT = ({id,role})=>{
    return jwt.sign({id,role}, secret, {expiresIn: "5h"})
}

module.exports = {createJWT}