const express = require('express')
const router = express.Router()

const verifyTeacherCookie = require("../../../middleware/verifyTeacherCookie")
const {updateEmail, updatePasswd} = require("../controllers/util")
const {csrfProtection, csrfErrorHandler} = require("../../../middleware/csrfProtection")
router.post('/email',verifyTeacherCookie, csrfProtection, csrfErrorHandler, updateEmail)
router.post('/passwd',verifyTeacherCookie, csrfProtection, csrfErrorHandler, updatePasswd)
module.exports = router