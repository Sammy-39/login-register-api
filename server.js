const express = require("express")
const cors = require("cors")

const port = process.env.PORT || 5000

const app = express()

app.use(cors())
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

