/**
 * @module 2fs_auth_teacher
 * Module for login and 2 login verification for use type: teacher
 */

const db = require("../../../database")
const bcrypt = require('bcryptjs')
const util = require('util');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
const query = util.promisify(db.query).bind(db);
const qrcode = require('qrcode')
const { authenticator } = require('otplib');
const { verify } = require("crypto");
const session = require("express-session");
const path = require('path')
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const {getGmailTokens} = require('../../../google_externals')

/**
 * function for performing login operation for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function login_user_2fa_teacher(request, response){
  
  let email = request.body.email
  let pass = request.body.password

  //input validation
  if(!email || !pass){
      return ({
          "success": 0, 
          "msg": "bad request"
      })
  }else{

    if(!validator.isEmail(email) || !pass.match(/^([a-zA-Z0-9 _@]+)$/)) {
      return ({
        "success": 0, 
        "msg": "bad request"
      })
    }

    
    const sql1 = `SELECT teacher_id, fname, lname, email, password, auth_secret FROM teacher WHERE email = ?`
    
    let result; 
    //check if the user the user creds are valid or not 
    try {
      result = await query(sql1, [email])
    } catch (error) {
      return ({
        "success": 0, 
        "msg": "something went wrong"
      })
    }

    if(result.length === 0){
      return ({
        "success": 0, 
        "msg": "User doesnt exist"
      })
    }

    if (!bcrypt.compareSync(pass, result[0].password)) {
      return ({
        "success": 0,
        "msg": "Login credential doesn't match!"
      })
    }
    //generate auth-secret for login verification
    const newSecret = authenticator.generateSecret()
    let result2;
    //add a record with auth-secret w.r.t top current requesting user
    try {
      const sql2 = `UPDATE teacher SET auth_secret = ? WHERE teacher_id = ? AND email = ?`
      result2 = await query(sql2, [newSecret, result[0].teacher_id, result[0].email])
    } catch (error) {
      return ({
        "success": 0, 
        "msg": "something went wrong"
      })
    }
    //generate QR CODE w.r.t generated auth-secret
    const qr = await qrcode.toDataURL(authenticator.keyuri(email, 'LMS APPLICATION', newSecret))
    
    let code = qr
    request.session.email = result[0].email
    request.session.student_id = result[0].teacher_id
    const sender_data = {fname: result[0].fname, lname: result[0].lname, email: result[0].email, qr_code: code }
    
    //send mail to requestiung user with QR code 
    let sus = await send_mail_to_referer(sender_data)

    return ({
      "success": 1,
      "qr_code": code,
      "email": request.session.email
    })

  }
}

/**
 * function for performing login verification operation for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function verify_2fa_login_teacher(req, res){
  let email = req.session.email
  let code = req.body.security_code.trim()
  
  const sql1 = `SELECT teacher_id, email, auth_secret FROM teacher WHERE email = ?`
  
  //input validation
  if(!email || !code){
    return ({
      "success": 0, 
      "msg": "bad request"
    })
  }

  if(!validator.isEmail(email)) {
    return ({
      "success": 0, 
      "msg": "bad request"
    })
  }

  let result;

  try {
    result = await query(sql1, [email])
  } catch (error) {
    return ({
      "success": 0,
      "msg": "something went wrong"
    })
  }

  if (result.length === 0) {
    return ({
      "success": 0,
      "msg": "User doesnt exist"
    })
  }
  //verify the input code against the auth-secret stored w.r.t user 
  if (!authenticator.check(code, result[0].auth_secret)) {
    return ({
      "success": 0,
      "msg": "Invalid otp"
    })
  }
  //generate and sign a JWT 
  const token = jwt.sign({
    id: result[0].teacher_id,
    is_staff: true,
    email: result[0].email,
  },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  //req.session.destroy()
  return ({
    "success": 1,
    "msg": "valid otp",
    "data": token
  })

}

/**
 * function for sending mail with QR code for auththentication to user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {undefined} 
 */
async function send_mail_to_referer(sender_data) {
  //path at which email tempate is defined 
  const test_path = path.join(__dirname, '..', '..', '..', 'template_views', 'dev_v2')
  //const {token} = await getGmailTokens()

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    }
    
    // host: 'smtp.gmail.com',
    // port: 465,
    // secure: true,
    // auth: {
    //   type: 'OAuth2',
    //   user: process.env.EMAIL,
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,    
    // },
  });
  
  //render eamil template with sender data
  const data = await ejs.renderFile(test_path + "/send_mail_template.ejs" , {data: sender_data});

  let mailOptions = {
    from: process.env.EMAIL, // sender address
    subject: `Hi!, ${sender_data?.fname} ${sender_data?.lname}, new QR code generated for login verification`, // Subject line
    text: `Scan the QR code to get the 6-digit security code`, // plaintext body
    to: sender_data.email,
    attachDataUrls: true,
    html: data,
    // auth:{
    //   refreshToken: process.env.REFERSH_TOKEN,
    //   accessToken: token
    // },
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

module.exports = {login_user_2fa_teacher, verify_2fa_login_teacher}