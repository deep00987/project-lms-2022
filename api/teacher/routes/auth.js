const express = require('express')
const router = express.Router()

const {registerTeacher, loginTeacher, logoutStaff} = require('../controllers/auth')

const verifyTeacherCookie = require('../../../middleware/verifyTeacherCookie')

router.post('/login', loginTeacher)
router.get('/logout',verifyTeacherCookie, logoutStaff)
router.post('/register',registerTeacher)

module.exports = router