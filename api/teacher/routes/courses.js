const express = require('express')
const router = express.Router()

const verifyTeacherCookie = require('../../../middleware/verifyTeacherCookie')
const {mapTeacherCourse,unmapTeacherCourse, getCourses} = require("../controllers/courses")
const {csrfProtection, csrfErrorHandler} = require("../../../middleware/csrfProtection")

router.get('/',verifyTeacherCookie, getCourses)
router.post('/start_teaching',verifyTeacherCookie, csrfProtection, csrfErrorHandler, mapTeacherCourse)
router.post('/opt_out',verifyTeacherCookie, csrfProtection, csrfErrorHandler, unmapTeacherCourse)

module.exports = router