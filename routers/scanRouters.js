const express = require("express")
const { scanControllers } = require("../controllers")
const routers = express.Router()

const { authToken, auth } = require("../helper/authToken");

routers.post("/upload", scanControllers.upload)
module.exports = routers