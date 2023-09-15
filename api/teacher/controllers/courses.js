/**
 * @module courses
 * Module contains methods performing processes related to courses for user type: teacher
 */
const res = require("express/lib/response")
const db = require("../../../database")
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * function for mapping a course with user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function mapTeacherCourse(req, res){
  const teacher_id = req.body.client.id
  const course_id = req.body.course_id
  let rows;
  let sql = `
    INSERT INTO teacher_course (teacher_id, course_id)
    VALUES (?, ?);
  `
  //check if the requesting course is already mapped to user
  try {
    rows = await query(`SELECT teacher_id, course_id FROM teacher_course WHERE teacher_id = ${teacher_id} AND course_id = ${course_id};`)
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"cannot enroll into course"
    })
  }
  if(rows.length > 0 && rows[0].teacher_id === teacher_id && rows[0].course_id === course_id){
    return res.status(200).json({ 
      "success": 0, 
      "msg": "Already teaching the following course"
    })
  }

  //map user with the requesting course
  try {
    let result = await query(sql, [teacher_id, course_id])
    return res.status(200).json({ 
      "success": 1, 
      "msg": "Enrolled in this course for teaching"
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      "success": 0,
      "msg":"cannot enroll into course"
    })
  }

}


/**
 * function for un-mapping a course with user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function unmapTeacherCourse(req, res){
  const teacher_id = req.body.client.id
  const course_id = req.body.course_id
  
  let rows;

  const sql1 = `
    select * from teacher_course where teacher_id = ${teacher_id} AND course_id = ${course_id}
  `
  const sql2 = `
    DELETE FROM teacher_course 
    WHERE teacher_id = ${teacher_id} AND 
    course_id = ${course_id};
  `
  //check if the requesting course is alredy unmapped with the user
  try {
    rows = await query(sql1)
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

  if(rows.length === 0){
    return res.status(404).json({
      "success": 0,
      "msg": "Teaching info regarding this course is not found"
    })
  }

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

/**
 * function to get all the course available for the requesing user; user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function getCourses(req, res){
  const teacher = req.body.client.id
  let sql = `
    select course.course_id, course.course_name, course_code 
    from teacher, course, dept_course
    where teacher.dept_id = dept_course.dept_id 
    AND dept_course.course_id = course.course_id
    AND teacher.teacher_id = ${teacher};
  `
  try {
    rows = await query(sql)
    return res.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    return res.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

}

module.exports = { getCourses , mapTeacherCourse, unmapTeacherCourse}