const express = require('express')
const router = express.Router()

const verifyTeacherCookie = require('../../../middleware/verifyTeacherCookie')
const {createClassRoom, postClassContent, postClassComment, deleteClassComment, deleteClassPost, deleteClassRoom} = require("../controllers/class")
const {csrfProtection, csrfErrorHandler} = require("../../../middleware/csrfProtection")

router.post('/create',verifyTeacherCookie, csrfProtection, csrfErrorHandler, createClassRoom)

router.post('/post_comment',verifyTeacherCookie, csrfProtection, csrfErrorHandler, postClassComment)

router.post('/delete_comment',verifyTeacherCookie, csrfProtection, csrfErrorHandler, deleteClassComment)

router.post('/delete_post',verifyTeacherCookie, csrfProtection, csrfErrorHandler, deleteClassPost)

router.post('/delete_class_room',verifyTeacherCookie, csrfProtection, csrfErrorHandler, deleteClassRoom)

module.exports = router