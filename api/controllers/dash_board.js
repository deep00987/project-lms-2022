/**
 * @module dashboard 
 * Module for accessing the user data 
 */
const res = require("express/lib/response")
const db = require("../../database")
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * function for accesing the users dashboard data
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
function getDashBoardData(req, res){
    let data = req.body.client.id
    const sql = `SELECT fname,lname,term_id,dept_id,email FROM student WHERE student_id = ${data}`

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
 * function for accesing the user data
 * @param {object} req - the request object 
 * @param {object} res - the response object
 * @returns {object} res with status code w.r.t operations
 */
async function getStudentData(req, res){
  let user_id = req.body.client.id;
  let result = {};
  let rows;

  const sql0 = `
    select student.student_id, fname, lname, email, student.dept_id, dept_name, student.term_id, term_name
    from student, department, term 
    where student.dept_id = department.dept_id
    AND student.term_id = term.term_id
    AND student_id = ${user_id};
  `

  const sql1 = `
    select course.course_id ,course.course_code, course.course_name   
    from student, term_course, course 
    where student.dept_id = term_course.dept_id 
    AND student.term_id = term_course.term_id 
    AND term_course.course_id = course.course_id 
    AND student.student_id = ${user_id};
  `
  const sql2 = `
    select course.course_id, course.course_name
    from student_course, course 
    where student_course.course_id = course.course_id 
    AND student_id = ${user_id};
  `
  let sql3 = `
    select class_room.class_room_id, class_room.teacher_id,teacher.fname, teacher.lname, class_room.course_code, course.course_id, course.course_name,
    class_room.class_name
    from student_course, class_room, course, teacher
    where student_course.course_id = class_room.course_id 
    AND class_room.course_id = course.course_id
    AND class_room.teacher_id = teacher.teacher_id
    AND student_course.student_id = ${user_id};
  `
  let sql4 = `

    SELECT class_room.class_room_id, course.course_code, class_room.class_name, teacher.fname, teacher.lname
    FROM student_class, class_room, course, teacher  
    WHERE student_class.class_room_id = class_room.class_room_id
    AND class_room.course_id = course.course_id 
    AND class_room.teacher_id = teacher.teacher_id
    AND student_class.student_id = ${user_id};
  
  `
  try {
    rows = await query(sql0)
    result["student_info"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return res.status(404).json({"student_info":[]})
  }

  try {
    rows = await query(sql1)
    result["available_courses"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return res.status(404).json({"courses_available":[]})
  }

  try {
    rows = await query(sql2)
    result["courses_enrolled"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return res.status(404).json({"courses_enrolled":[]})
  }

  try {
    rows = await query(sql3)
    result["classrooms_for_courses"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return res.status(404).json({"classrooms_for_courses":[]})
  }

  try {
    rows = await query(sql4)
    result["class_rooms_joined"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return res.status(404).json({"class_rooms_joined":[]})
  }

  return res.status(200).json(result)

}

module.exports = {getDashBoardData, getStudentData}
