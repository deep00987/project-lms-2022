/**
 * @module courses 
 * Handles users intercations with the cources 
 */
const res = require("express/lib/response")
const db = require("../../database")
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * this function maps students with the requestion courses
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
async function mapStudentCourse(req, res){

  const student_id = req.body.client.id
  const course_id = req.body.course_id
  let rows;
  let sql = `
    INSERT INTO student_course (student_id, course_id)
    VALUES (?, ?);
  `
  //check if the user already joined the course or not 
  try {
    rows = await query(`SELECT student_id, course_id FROM student_course WHERE student_id = ${student_id} AND course_id = ${course_id};`)
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"cannot enroll into course"
    })
  }

  if(rows.length > 0 && rows[0].student_id === student_id && rows[0].course_id === course_id){
    return res.status(200).json({ 
      "success": 0, 
      "msg": "already enrolled in the following course"
    })
  }
  // map student with the requesting course
  try {
    let result = await query(sql, [student_id, course_id])
    return res.status(200).json({ 
      "success": 1, 
      "msg": "Enrolled"
    })
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"cannot enroll into course"
    })
  }

}

/**
 * this function un-maps students with the requestion courses
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
async function unmapStudentCourse(req, res){

  const student_id = req.body.client.id
  const course_id = req.body.course_id
  let rows;
  const sql1 = `
    select * from student_course where student_id = ${student_id} AND course_id = ${course_id}
  `
  const sql2 = `
    DELETE FROM student_course 
    WHERE student_id = ${student_id} AND 
    course_id = ${course_id};
  `
  //check if the user joined the course or not
  try {
    rows = await query(sql1)
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

  // show error if the requesting course had not been joined by the user
  if(rows.length === 0){
    return res.status(404).json({
      "success": 0,
      "msg": "Enrollment info regarding this course is not found"
    })
  }
  //delete entry from student course 
  try {
    rows = await query(sql2)
    return res.json({"success": 1, "msg": "opted out off the course sucessfully"})
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }
  
}

module.exports = {mapStudentCourse, unmapStudentCourse}