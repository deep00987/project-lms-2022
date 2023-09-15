/**
 * @module class
 * handles user's intercation with classes
 */

const res = require('express/lib/response')
const db = require('../../database')
const util = require('util')
const query = util.promisify(db.query).bind(db);

/**
 * functon to handle class join operaion
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} res with status codes w.r.t results 
 */
async function joinClass(req,res){

  const student_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;

  let rows;

  let sql1 = `
    SELECT * FROM student_class where student_id = ${student_id} AND class_room_id = ${class_room_id};
  `


  let sql2 = `
    INSERT INTO student_class (student_id, class_room_id)
    VALUES (?, ?);
  `
  //check if user already joined the requesting class or not 
  try {
    rows = await query(sql1)
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

  if(rows.length !== 0){
    return res.status(400).json({
      "success" : 0,
      "msg" : "Student already joined this class"
      })
  }
  // map the user with the requesting class
  try {
    rows = await query(sql2, [student_id, class_room_id])
    return res.status(200).json({
      "success" : 1,
      "msg" : "Class joined successfully"
    })
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }


}

/**
 * function to handle leave class operation
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} res with status codes w.r.t results 
 */
async function leaveClass(req,res){

  const student_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  let rows;

  let sql1 = `
    SELECT * FROM student_class where student_id = ${student_id} AND class_room_id = ${class_room_id};
  `
  let sql2 = `
    DELETE FROM student_class where student_id = ${student_id} AND class_room_id = ${class_room_id};
  `
  //check if the user had joined the requesting class or not 
  try {
    rows = await query(sql1)
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }
  // if the requesing class had not been joined, then show err message
  if(rows.length === 0){
    return res.status(400).json({
      "success" : 0,
      "msg" : "Student has not joined this class"
      })
  }

  //unmap user from the requesting class 
  try {
    rows = await query(sql2)
    return res.status(200).json({
      "success" : 1,
      "msg" : "Left class successfully"
    })
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

}

/**
 * function to handle posting comment operation
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} res with status codes w.r.t results 
 */
async function postComment(req, res){

  const student_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  const class_post_id = req.body.class_post_id;
  const content = req.body.content.trim();

  let sql = `
    INSERT INTO class_comments (class_room_id, class_post_id, student_id, content)
    VALUES (?, ?, ?, ?);
  `
  //add an entry to class_comments w.r.t user 
  try {
    rows = await query(sql, [class_room_id, class_post_id, student_id, content])
    return res.status(200).json({
      "success" : 1,
      "msg" : "comment posted successfully",
      "data" : {class_room_id, class_post_id, student_id, content}

    })
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

  
}

/**
 * function to handle delete comment operation
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} res with status codes w.r.t results 
 */
async function deleteComment(req, res){

  const student_id = req.body.client.id;
  const class_room_id = req.body.class_room_id;
  const class_post_id = req.body.class_post_id;
  const comment_id = req.body.comment_id;
  
  let sql0 = `
    select * FROM class_comments
    WHERE class_room_id = ${class_room_id}
    AND comment_id = ${comment_id} 
    AND class_post_id = ${class_post_id}
    AND student_id = ${student_id};
  `
  let sql1 = `
    DELETE FROM class_comments
    WHERE class_room_id = ${class_room_id}
    AND comment_id = ${comment_id} 
    AND class_post_id = ${class_post_id}
    AND student_id = ${student_id};
  `
  //check if the comment exist w.r.t user or not

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

  //delete entry of the requesting comment
  try {
    rows = await query(sql1)
    return res.status(200).json({
      "success" : 1,
      "msg" : "Comment deleted successfully",
      "data" : {class_room_id, class_post_id, student_id, comment_id}

    })
  } catch (error) {
    return res.status(400).json({
    "success" : 0,
    "msg" : "something went wrong"
    })
  }

  
}

module.exports = {joinClass, leaveClass, postComment, deleteComment}