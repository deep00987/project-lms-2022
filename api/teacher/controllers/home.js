/**
 * @module home 
 * THis module contain methods for getting home informations
 */
const res = require("express/lib/response")
const db = require("../../../database")
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * this function gets the current teacher info and other teacher realted info
 * @param {object} request - the request object
 * @param {object} response - the response object
 * @returns {object} 
 */
async function getTeacherInfo(request,response){
  let teacher_id = request.body.client.id
  let result= {};
  let sql1 = `
    select fname, lname, email,teacher_id, department.dept_name, teacher.dept_id
    from teacher, department
    where teacher.dept_id = department.dept_id 
    AND teacher.teacher_id = ${teacher_id};
  `
  let sql2 = `
    select course.course_id, course.course_name, course_code 
    from teacher, course, dept_course
    where teacher.dept_id = dept_course.dept_id 
    AND dept_course.course_id = course.course_id
    AND teacher.teacher_id = ${teacher_id};
  
  `
  let sql3 = `
    select course.course_id, course.course_name,course.course_code
    from teacher_course, course 
    where teacher_course.course_id = course.course_id 
    AND teacher_id = ${teacher_id};
  `

  let sql4 = `
    SELECT class_room.class_room_id, course.course_id, course.course_code,course.course_code,
    class_room.class_name, teacher.fname, teacher.lname
    FROM teacher, course, class_room
    WHERE teacher.teacher_id = class_room.teacher_id 
    AND class_room.course_id = course.course_id
    AND teacher.teacher_id = ${teacher_id};
  `

  let rows;
  try {
    rows = await query(sql1)
    result["teacher_info"] = JSON.parse(JSON.stringify(rows))
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

  try {
    rows = await query(sql2)
    result["available_courses"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

  try {
    rows = await query(sql3)
    result["courses_teaching"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }


  try {
    rows = await query(sql4)
    result["class_rooms_created"] = JSON.parse(JSON.stringify(rows))
    //return response.json({"success": 1, "data": JSON.parse(JSON.stringify(rows))})
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }
  return response.json(result)
}

module.exports = {getTeacherInfo }