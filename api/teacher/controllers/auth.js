/**
 * @module auth
 * Module for registration and general user authentication for use type: teacher
 */

const db = require('../../../database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { authenticator } = require('otplib')
require('dotenv').config()
const validator = require('validator')
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * function for performing registration operation for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function registerTeacher(req, res){

    const secret_key = authenticator.generateSecret()
    const dept = {
      'CS' : 1,
      'MATH' : 2,
    }
    let data = req.body

    //input validation
    if(!data.email || !data.password || !data.fname || !data.lname || !data.department ){
      return res.status(400).json({
        "success": 0, 
        "msg": "Bad request"
      })
    }

    if (!data.fname.match(/^([a-zA-Z]+)$/)) {
      return res.status(400).json({
        "success": 0,
        "msg": "bad name format"
      })
    }

    if (!data.lname.match(/^([a-zA-Z]+)$/)) {
      return res.status(400).json({
        "success": 0,
        "msg": "bad name format"
      })
    }

    if(!validator.isEmail(data.email)){
      return res.status(400).json({
        "success": 0, 
        "msg": "Bad email format"
      })
    }

    if(!data.password.match(/^([a-zA-Z0-9 _@]+)$/)){
      return res.status(400).json({
        "success": 0, 
        "msg": "bad password format"
      })
    }

    // perform registration 
    let department = dept[req.body.department]
    const hash = bcrypt.hashSync(data.password, 10);

    const sql = `INSERT INTO teacher (fname, lname, email, password, dept_id, auth_secret)
        VALUES (?,?,?,?,?,?)
      `
    try {
      const result = await query(sql, [
        data.fname,
        data.lname, 
        data.email,
        hash,
        department,
        secret_key,
      ])
      return res.status(201).json({
        "success": 1,
        "msg": "user created"
      })
    } catch (error) {
      return res.status(400).json({
          "success": 0, 
          "msg": "user creation unsuccessful"
      })
    }
    
}

/**
 * function for performing login operation for user type: teacher
 * Unused_function refer module 2fs_auth_teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
function loginTeacher(request, response){
    let email = request.body.email
    let pass = request.body.password
    if(!email || !pass){
        return response.status(400).json({
            "success": 0, 
            "msg": "bad request"
        })
    }else{
        db.query(
            `SELECT teacher_id, email, password FROM teacher WHERE email = ?`
            ,[email],
            (err, result,fields)=>{
                if(!err && result.length > 0){
                    if(!bcrypt.compareSync(pass, result[0].password)){
                      return response.status(401).json({
                        "success": 0, 
                        "msg": "Login credential doesn't match!"
                      })
                    }else{
                      const token = jwt.sign({
                        id: result[0].teacher_id,
                        is_staff: true,
                        email: result[0].email,
                        }, 
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                      );
                      response.cookie("JWT_COOKIE",token,{
                          httpOnly: true
                      })
                      return response.status(200).json({
                          "success": 1, 
                          "data": result,
                          "token": token
                      })

                    }
                   
                }else{
                    return response.status(404).json({
                        "success": 0, 
                        "msg": "User not found"
                    })
                }
            }
        )
    }
}

/**
 * function for performing logout operation for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
function logoutStaff(request, response){
  const token = request.cookies.JWT_COOKIE
  if(token){
    response.clearCookie("JWT_COOKIE",{
      httpOnly:true,
    })

    return response.json({
      'msg':"logged out"
    })

  }
  else{
    return response.json({
      'msg':"Something went wrong"
    })
  }
}


module.exports = {registerTeacher, loginTeacher, logoutStaff}