const dotenv = require("dotenv")
const { createToken } = require("../helper/createToken")
const transporter = require("../helper/nodemailer");
dotenv.config()
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')

const db = require("better-sqlite3")(process.env.DB_DIR)
const imageDefault = 'default.png'

module.exports = {
  register: (req, res) => {
    let { email } = req.body
    let dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    try{
      const insert = db.prepare('INSERT INTO user (id, nama, email, nomor_telepon, jenis_kelamin, tanggal_lahir, password, date, image, otp, verified, verification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      insert.run(null, null, email, null, null, null, null, dateTime, imageDefault, 1, 0, null)
      
      let otpCode = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      let encryptOtp = createToken({
        code: otpCode,
        email,
      }, "1h")
      const query = db.prepare(`update user set verification = ? where email = ?`)
      query.run(encryptOtp, email)
      let mail = {
        from: "admin <app.fintree@gmail.com>",
        to: `${email}`,
        subject: "Account OTP Verification",
        html: `Hai ${email.split("@")[0]},
        <br>
        Mohon verifikasi akun anda terlebih dahulu sebelum melanjutkan proses registrasi. Silahkan masukkan kode One Time Password (OTP) di bawah ini pada website.
        <br><br>
        <b>PERHATIAN</b>: Jangan memberikan kode pada siapapun tanpa terkecuali!
        <br>
        <b>${otpCode}</b>
        <br><br>
        One Time Password hanya valid dalam waktu 1 jam.
        <br><br>
        Terima kasih`,
      }

      transporter.sendMail(mail, (errMail, resMail) => {
        if (errMail) {
          const query = db.prepare(`delete from user where id = ?`)
          query.run(email)
          console.log(errMail);
          res.status(404).send({
            message: "Pendaftaran gagal",
            success: false,
          });
        }else{
          res.status(200).send({
            result: true
          })
        }
      })
    }catch(err){
      console.log(err)
      res.status(404).send({
        result: false,
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
          verified,
          verification
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
          verified,
          verification
        })
      }else{
        res.status(404).send({
          result: false,
          message: "Akun belum verifikasi email"
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
        message: "Akun tidak ditemukan atau kata sandi tidak cocok"
      })
    }
  },
  editProfile: (req, res) => {
    let { email, nomor_telepon, jenis_kelamin, tanggal_lahir, image} = req.body
    let dateTime = new Date(tanggal_lahir);
    dateTime.setMinutes(date.getMinutes() - dateTime.getTimezoneOffset())
    tanggal_lahir = dateTime.toJSON().slice(0, 10)
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
          verified,
          verification
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
          verified,
          verification
        })
        res.status(200).send({
          result: true,
          token,
          data: getUser[0]
        })
      }else{
        res.status(404).send({
          result: false,
          message: "Akun belum verifikasi email"
        })
      }
    }else{
      res.status(404).send({
        result: false,
        message: "Akun tidak ditemukan"
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
  },
  verificationOtp: (req, res) => {
    let { code, email } = req.body
    if(!isNaN(code) && email){
      let scriptQuery = `select * from user where email = '${email}'`
      let getUser = db.prepare(scriptQuery).all()
      if(getUser.length > 0){
        let encryptedOtp = getUser[0].verification
        jwt.verify(encryptedOtp, `${process.env.TOKEN_KEY}`, (err, decode) => {
          if (err) {
            console.log(err)
            res.status(404).send({
              result: false,
              message: "Kode One Time Password salah satau sudah kadaluarsa"
            })
          }else if(parseInt(decode.code) === code && decode.email === email) {
            const query = db.prepare(`update user set verified = ?, verification = ? where email = ?`)
            query.run(1, "", email)
            let scriptQuery = `select * from user where email = '${email}'`
            let getUser = db.prepare(scriptQuery).all()
            let {
              id,
              nama,
              nomor_telepon, 
              jenis_kelamin, 
              tanggal_lahir, 
              password, 
              date, 
              image, 
              otp,
              verified,
              verification
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
              verified,
              verification
            })
            res.status(200).send({
              result: true,
              token,
              data: getUser[0]
            })
          }else{
            res.status(404).send({
              result: false,
              message: "Kode One Time Password salah satau sudah kadaluarsa"
            })
          }
        })
      }else{
        res.status(404).send({
          result: false,
          message: "Akun tidak ditemukan"
        })
      }
    }else{
      res.status(404).send({
        result: false,
        message: "Membutuhkan query"
      })
    }
  }
}