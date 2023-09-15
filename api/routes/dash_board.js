/**
 * student dashboard routes 
 */
const express = require('express')
const {getDashBoardData, getStudentData} = require('../controllers/dash_board')
const router = express.Router()
const verifyCookieForApi = require("../../middleware/verifyCookieForApi")

//router.get('/', verifyCookieForApi, getDashBoardData)
router.get('/', verifyCookieForApi, getStudentData)

module.exports = router