const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(cors())
app.use(express.json())

const routers = require("./routers")
app.use("/user", routers.userRouters)

app.listen(PORT, () => console.log('Api Running :', PORT));