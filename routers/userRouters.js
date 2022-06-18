const express = require("express")
const { userControllers } = require("../controllers")
const routers = express.Router()

const { authToken, auth } = require("../helper/authToken");

routers.post("/login", userControllers.login)
routers.post("/register", userControllers.register)
routers.patch("/editProfile", userControllers.editProfile)
module.exports = routers