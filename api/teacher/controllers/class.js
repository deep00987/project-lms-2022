/**
 * @module class
 * This module conatins methods for performing processes concerning class
 */
const res = require("express/lib/response")
const db = require("../../../database")
const fileUpload = require('express-fileupload')
const util = require('util')
const query = util.promisify(db.query).bind(db);


/**
 * function for creating a new class/classRoom for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function createClassRoom(request, response){

  const courses = {
    '1':"CSCORE01",
    '2':"CSCORE02",
    '3':"CSCORE03",
    '4':"CSCORE04",
    '5':"CSCORE05",
    '6':"CSCORE06",
    '7': "MTCORE01",
    '8': "MTCORE02",
    '9': "MTCORE03",
    '10': "MTCORE04",
    '11': "MTCORE05",
    '12': "MTCORE06",
  }

  let teacher_id = request.body.client.id
  let course_code = courses[request.body.course_id]
  let course_id = +request.body.course_id
  let class_name = request.body.class_name

  let sql1 = `
    SELECT class_room_id from class_room where teacher_id = ${teacher_id} AND course_id = ${course_id}
  `
  let sql2 = `
    INSERT INTO class_room (teacher_id, course_code, course_id, class_name)
    VALUES
    (?,?,?,?);
  `  
  let rows;

  //check if the a class created by the user already exists for the requesting course
  try {
    rows = await query(sql1)
    
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

  if(rows.length !== 0){
    return response.json({
      "success": 0,
      "msg":"classroom for this course already exists"
    })
  }

  // create a new classroom for the requesting course
  try {
    rows = await query(sql2, [teacher_id, course_code, course_id, class_name])
    return response.status(200).json({
      "success": 1,
      "msg":"Classroom created successfully"
    })
  } catch (error) {
    return response.status(400).json({
      "success": 0,
      "msg":"something went wrong"
    })
  }

}

/**
 * function for posting comments in a post for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function postClassComment(request, response){
  const teacher_id = request.body.client.id;
  const class_room_id = request.body.class_room_id;
  const class_post_id = request.body.class_post_id;
  const content = request.body.content.trim();

  let sql = `
    INSERT INTO class_comments (class_room_id, class_post_id, teacher_id, content)
    VALUES (?, ?, ?, ?);
  `

  try {
    rows = await query(sql, [class_room_id, class_post_id, teacher_id, content])
    return response.status(200).json({
      "success" : 1,
      "msg" : "comment posted successfully",
      "data" : {class_room_id, class_post_id, teacher_id, content}

    })
  } catch (error) {
    return response.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

}

/**
 * function for deleting a comment for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function deleteClassComment(req, res){
  const teacher_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  const class_post_id = req.body.class_post_id;
  const comment_id = req.body.comment_id;
  

  let sql0 = `
    select * FROM class_comments
    WHERE class_room_id = ${class_room_id}
    AND comment_id = ${comment_id} 
    AND class_post_id = ${class_post_id}
    AND teacher_id = ${teacher_id};
  `


  let sql1 = `
    DELETE FROM class_comments
    WHERE class_room_id = ${class_room_id}
    AND comment_id = ${comment_id} 
    AND class_post_id = ${class_post_id}
    AND teacher_id = ${teacher_id};
  `
  //check if the requesting user is the owner of the commment(that is to be deleted) or not
  try{
    rows = await query(sql0);
  }catch(error){
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

  if(rows.length === 0){
    return res.status(400).json({
      "success" : 0,
      "msg" : "something went wrong"
      })
  }
  // delete the record of the comment from database
  try {
    rows = await query(sql1)
    return res.status(200).json({
      "success" : 1,
      "msg" : "Comment deleted successfully",
      "data" : {class_room_id, class_post_id, teacher_id, comment_id}

    })
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

}

/**
 * function for deleting a post for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function deleteClassPost(req, res){
  const teacher_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  const class_post_id = req.body.class_post_id;
  
  

  let sql0 = `
    SELECT * FROM class_post
    WHERE class_room_id = ${class_room_id}
    AND class_post_id = ${class_post_id}
    AND teacher_id = ${teacher_id};
  `


  let sql1 = `
    DELETE FROM class_post
    WHERE class_room_id = ${class_room_id}
    AND class_post_id = ${class_post_id}
    AND teacher_id = ${teacher_id};
  `
  //check if the requesting user is the owner of the post or not 
  try{
    rows = await query(sql0);
  }catch(error){
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

  if(rows.length === 0){
    return res.status(400).json({
      "success" : 0,
      "msg" : "something went wrong"
      })
  }

  //delete record of the post from the database
  try {
    rows = await query(sql1)
    console.log(rows)
    return res.status(200).json({
      "success" : 1,
      "msg" : "Post deleted successfully",
      "data" : {class_room_id, class_post_id, teacher_id}

    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

}

/**
 * function for deleting a classroom for user type: teacher
 * @param {object} request - the request object
 * @param {object} response - the reponse object
 * @returns {object} 
 */
async function deleteClassRoom(req, res){
  const teacher_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  let rows;
  let sql0 = `
    select * from class_room where class_room_id = ${class_room_id} and teacher_id = ${teacher_id};
  `
  let sql1 = `
    delete from class_room where class_room_id = ${class_room_id} and teacher_id = ${teacher_id};
  `

  try {
    rows = await query(sql0)
    console.log("delete_class", rows)
  } catch (error) {
    return res.status(400).json({
      "success":0,
      "msg": "something went wrong"
    })
  }

  if(rows.length === 0){
    return res.status(400).json({
      "success":0,
      "msg": "something went wrong"
    })
  }
 
  try {
    rows = await query(sql1)
    return res.status(200).json({
      "working": "ok",
      "data": { teacher_id, class_room_id },
      "msg": "classroom deleted successfully"
    })
  } catch (error) {
    return res.status(400).json({
      "success":0,
      "msg": "something went wrong"
    })
  }

}

module.exports = {createClassRoom, postClassComment, deleteClassComment, deleteClassPost, deleteClassRoom}