const jwt = require("jsonwebtoken")

module.exports = {
  createToken: (payload, expiresTime) => {
    if(!expiresTime){
      expiresTime = "24h"
    }
    return jwt.sign(payload, process.env.TOKEN_KEY,{
      expiresIn: expiresTime
    })
  }
}