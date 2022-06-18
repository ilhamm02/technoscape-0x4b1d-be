const dotenv = require("dotenv")
const { createToken } = require("../helper/createToken")
dotenv.config()

const db = require("better-sqlite3")(process.env.DB_DIR)
const imageDefault = 'default.png'

module.exports = {
  register: (req, res) => {
    let { email, password } = req.body
    password = Crypto.createHmac("sha1", process.env.SHARED_KEY).update(password).digest("hex")
    let scriptQuery = `select * from user where email = '${email}'`
    let getUser = db.prepare(scriptQuery).all()
    if(getUser.length === 0){
      let dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      let scriptQuery = `insert into user values (null, null, ${email}, null, null, null, null, ${dateTime}, ${imageDefault}, 1)`
      const insert = db.prepare('INSERT INTO project (id, nama, email, nomor_telepon, jenis_kelamin, tanggal_lahir, password, date, image, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      query.run(null, null, email, null, null, null, null, dateTime, imageDefault, 1);
      scriptQuery = `select * from user where email = '${email}'`
      let getUser = db.prepare(scriptQuery).all()
      let {
        id,
        nama, 
        email,
        nomor_telepon, 
        jenis_kelamin, 
        tanggal_lahir, 
        password, 
        date, 
        image, 
        otp,
        verified
      } = getUser[0]
      let token = createToken({
        id,
        nama, 
        email,
        nomor_telepon, 
        jenis_kelamin, 
        tanggal_lahir, 
        password, 
        date, 
        image, 
        otp,
        verified
      })

      res.status(200).send({
        result: true,
        token,
        data: getUser[0]
      })
    }else{
      res.status(404).send({
        result:false,
        token: false,
        data: "Email sudah digunakan"
      })
    }
  },
  login: (req,res) => {
    req.body.password = Crypto.createHmac("sha1", `${process.env.TOKEN_KEY}`).update(req.body.password).digest("hex")
    let scriptQuery = `select * from user where username=${db.escape(req.body.username)} and password=${db.escape(req.body.password)};`
    let getUser = db.prepare(scriptQuery).all()
    if(getUser.length === 1){
      if(getUser[0].verified){
        let {
          id,
          nama, 
          email,
          nomor_telepon, 
          jenis_kelamin, 
          tanggal_lahir, 
          password, 
          date, 
          image, 
          otp,
          verified
        } = getUser[0]
        
        let token = createToken({
          id,
          nama, 
          email,
          nomor_telepon, 
          jenis_kelamin, 
          tanggal_lahir, 
          password, 
          date, 
          image, 
          otp,
          verified
        })
      }else{
        res.status(404).send({
          result: false,
          token: false,
          data: "Akun belum verifikasi email"
        })
      }
      res.status(200).send({
        result: true,
        token,
        data: getUser[0]
      })
    }else{
      res.status(404).send({
        result: false,
        token: false,
        data: "Akun tidak ditemukan atau kata sandi tidak cocok"
      })
    }
  },
  editProfile: (req, res) => {
    let { email, nomor_telepon, jenis_kelamin, tanggal_lahir, image} = req.body
    let dateTime = new Date(tanggal_lahir);
    dateTime.setMinutes(date.getMinutes() - dateTime.getTimezoneOffset());
    tanggal_lahir = dateTime.toJSON().slice(0, 10);
    let scriptQuery = `select * from user where email=${email};`
    let getUser = db.prepare(scriptQuery).all()
    if(getUser.length > 0){
      if(getUser[0].verified){
        const query = db.prepare(`update user set nomor_telepon = ?, jenis_kelamin = ?, tanggal_lahir = ?, image = ? where email = ?`)
        query.run(nomor_telepon, jenis_kelamin, tanggal_lahir, image, email)
        if(getUser[0].nomor_telepon !== nomor_telepon){
          //nodemailer
        }
        scriptQuery = `select * from user where email=${email};`
        getUser = db.prepare(scriptQuery).all()
        let {
          id,
          nama, 
          email,
          nomor_telepon, 
          jenis_kelamin, 
          tanggal_lahir, 
          password, 
          date, 
          image, 
          otp,
          verified
        } = getUser[0]
        let token = createToken({
          id,
          nama, 
          email,
          nomor_telepon, 
          jenis_kelamin, 
          tanggal_lahir, 
          password, 
          date, 
          image, 
          otp,
          verified
        })
        res.status(200).send({
          result: true,
          token,
          data: getUser[0]
        })
      }else{
        res.status(404).send({
          result: false,
          token: false,
          data: "Akun belum verifikasi email"
        })
      }
    }else{
      res.status(404).send({
        result: false,
        token: false,
        data: "Akun tidak ditemukan"
      })
    }
  },
  editEmail: (req, res) => {
    let {oldEmail, newEmail} = req.body
    let scriptQuery = `select * from user where email=${oldEmail};`
    let getUser = db.prepare(scriptQuery).all()
    if(getUser.length > 0){
      const query = db.prepare(`update user set email = ? where email = ?`)
      query.run(newEmail, oldEmail)
    }
  }
}