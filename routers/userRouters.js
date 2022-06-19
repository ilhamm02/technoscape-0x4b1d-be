const express = require("express")
const { userControllers } = require("../controllers")
const routers = express.Router()

const { authToken, auth } = require("../helper/authToken");

routers.post("/login", userControllers.login)
routers.post("/register", userControllers.register)
routers.patch("/editProfile", userControllers.editProfile)
routers.patch("/editEmail", userControllers.editEmail)
routers.post("/forgotPassword", userControllers.forgotPassword)
routers.patch("/editPassword", userControllers.editPassword)
routers.post("/verification", userControllers.verificationOtp)
routers.get("/resendOtp", userControllers.resendOtp)
module.exports = routers