/**
 * @module student 
 * Module for accessing the student data for testing 
 */
const res = require('express/lib/response')
const db = require('../../database')

/**
 * function for accesing all students
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with satus code w.r.t operations
 */
function getUsers(req, res){
    const sql = `SELECT * FROM student`
    db.query(sql, (err, result, fields)=>{
        if(!err){
            return res.status(200).json({
                'success': 1,
                'data': result
            })
            
        }else{
            return res.status(500).json({
                'success': 0,
                'data': ''
            })
        }
    })
}

/**
 * function for accesing the student by id
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
function getUserById(req, res){
    let data = req.params.id
    const sql = `SELECT * FROM student WHERE student_id = ${data}`
    db.query(sql, (err, result, fields)=>{
        if(!err && result.length > 0){
            return res.status(200).json({
                'success': 1,
                'data': result
            })
            
        }else{
            return res.status(500).json({
                'success': 0,
                'data': ''
            })
        }
    })
}   

/**
 * function for accesing current student
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
function getCurrentUser(req, res){
  let student_ID = req.body.client.id
  const sql = `SELECT fname, lname, dept_id, term_id, student_id, email FROM student WHERE student_id = ${student_ID}`
  db.query(sql, (err, result, fields)=>{
      if(!err && result.length > 0){
          return res.status(200).json({
              'success': 1,
              'data': result
          })
          
      }else{
          return res.status(500).json({
              'success': 0,
              'data': ''
          })
      }
  })
}   

module.exports =  {getUsers, getUserById, getCurrentUser} 