/**
 * student courses routes 
 */
const express = require('express')
const router = express.Router()

const verifyCookieForApi = require("../../middleware/verifyCookieForApi")
const {csrfProtection, csrfErrorHandler} = require("../../middleware/csrfProtection")
const {mapStudentCourse,unmapStudentCourse} = require("../controllers/courses")

router.post('/enroll',verifyCookieForApi, csrfProtection, csrfErrorHandler, mapStudentCourse)
router.post('/opt_out',verifyCookieForApi, csrfProtection, csrfErrorHandler, unmapStudentCourse)

module.exports = router