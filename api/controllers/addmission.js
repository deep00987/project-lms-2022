/**
 * @module Addmission
 * handles user's addmission to different terms
 */

const res = require("express/lib/response")
const db = require("../../database")
const util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * function to perfrom user admission to terms
 * @param {object} req 
 * @param {object} res 
 * @returns {object} res with status codes w.r.t opeartion results 
 */

async function getAddmission(req, res){
  const student_id = req.body.client.id
  const term_id = req.body.term_id;
  let rows;
  
  let sql1 = `
    select term_id from student where student_id = ${student_id}
  `
  let sql2 = `
    delete from student_course where student_id = ${student_id}
  `

  let sql3 = `
    UPDATE student 
    SET term_id = ${term_id}
    where student_id = ${student_id};
  `
  // check if the user is already admited in the requesting term
  try {
    rows = await query(sql1)
  } catch (error) {
    return res.status(404).json({
      "success": 0,
      "msg": "something went wrong"
    })
  }

  if(rows.length > 0 && rows[0].term_id === term_id ){
    return res.status(400).json({
      "success": 0,
      "msg": "Already addmited in this term"
    })
  }
  
  //delete courses of the previes term mapped with this user
  try {
    rows = await query(sql2)
  } catch (error) {
    return res.status(404).json({
      "success": 0,
      "msg": "something went wrong"
    })
  }

  //update term
  try {
    rows = await query(sql3)
    return res.status(200).json({
      "success": 1,
      "msg": "Addmission successful"
    })
  } catch (error) {
    return res.status(404).json({
      "success": 0,
      "msg": "something went wrong"
    })
  }
  
}

module.exports = {getAddmission}