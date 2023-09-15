const express = require('express')
const router = express.Router()

const verifyTeacherCookie = require('../../../middleware/verifyTeacherCookie')
const {getTeacherInfo} = require("../controllers/home")

router.get('/',verifyTeacherCookie, getTeacherInfo)

// router.post('/opt_out',verifyCookieForApi, unmapStudentCourse)

module.exports = router