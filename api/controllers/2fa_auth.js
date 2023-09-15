/**  
* @module 2fa_auth
* module for user Authentication with 2-step verificaiton
*/ 

const db = require("../../database")
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
const {getGmailTokens} = require('../../google_externals')

/** 
 * @module 2fa_auth
 * function to perform user login
 * @params {object} request - the request object 
 * @params {object} response - the response object
 * @returns {object}  
 */

async function login_user_2fa(request, response){
  
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

    const sql1 = `SELECT student_id, fname, lname, email, password, auth_secret FROM student WHERE email = ?`
    let result; 

    //check if user exist with the following email

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

    //if user exist compare password hash

    if (!bcrypt.compareSync(pass, result[0].password)) {
      return ({
        "success": 0,
        "msg": "Login credential doesn't match!"
      })
    }

    // generate new auth-secret string and store w.r.t user

    const newSecret = authenticator.generateSecret()
    let result2;

    try {
      const sql2 = `UPDATE student SET auth_secret = ? WHERE student_id = ? AND email = ?`
      result2 = await query(sql2, [newSecret, result[0].student_id, result[0].email])
    } catch (error) {
      return ({
        "success": 0, 
        "msg": "something went wrong"
      })
    }

    //generate authentication QR code w.r.t auth-secret string 

    const qr = await qrcode.toDataURL(authenticator.keyuri(email, 'LMS APPLICATION', newSecret))
   
    let code = qr
    request.session.email = result[0].email
    request.session.student_id = result[0].student_id
    const sender_data = {fname: result[0].fname, lname: result[0].lname, email: result[0].email, qr_code: code }

    //send QR code to user via registered email address

    let sus = await send_mail_to_referer(sender_data)

    return ({
      "success": 1,
      "qr_code": code,
      
    })

  }
}

/** 
 * @module 2fa_auth
 * function to verify user login
 * @params {object} request - the request object 
 * @params {object} response - the response object
 * @returns {object}  
 */

async function verify_2fa_login(req, res){
  let email = req.session.email
  let code = req.body.security_code.trim()
  const sql1 = `SELECT student_id, email, auth_secret FROM student WHERE email = ?`

  //input validation
  
  if(!email){
    return ({
      "success": 0, 
      "msg": "bad request"
    })
  }

  if(!code){
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
  // check for existing user with given user email address
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
  //check for valid input code against auth-secret
  if (!authenticator.check(code, result[0].auth_secret)) {
    return ({
      "success": 0,
      "msg": "Invalid otp"
    })
  }
  //sign and genrate JWT token
  const token = jwt.sign({
    id: result[0].student_id,
    is_staff: false,
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
 * @module 2fa_auth
 * function to send mail with QR code to the user
 * @params {object} sender_data - the object cotains user's fname, lname, email, QR_code 
 * @return {undefined}
 */

async function send_mail_to_referer(sender_data) {
  //path at which email temeplate is located
  const test_path = path.join(__dirname, '..', '..', 'template_views', 'dev_v2')
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

  //render the email template with sender data 
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

module.exports = {login_user_2fa, verify_2fa_login}