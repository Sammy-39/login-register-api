const express = require("express")
const cors = require("cors")

const port = process.env.PORT || 5000

const app = express()

const corsOptions = {
    origin: 'https://login-reg-app.netlify.app',
    optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions))

app.use(express.json())
app.use("/",express.static("public"))

const loginRouter = require("./routes/login")
const registerRouter = require("./routes/register")
const userRouter = require("./routes/users")

app.use("/api",loginRouter)
app.use("/api",registerRouter)
app.use("/api",userRouter)

app.listen(port,()=>{
    console.log("Server running on: http://localhost:"+port)
})

