const jwt = require("jsonwebtoken")

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, process.env.TOKEN_KEY,{
      expiresIn: "1d"
    })
  }
}