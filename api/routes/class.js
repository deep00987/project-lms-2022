/**
 * student class routes 
 */
const express = require('express')
const router = express.Router()

const verifyCookieForApi = require("../../middleware/verifyCookieForApi")
const {csrfProtection, csrfErrorHandler} = require("../../middleware/csrfProtection")

const {joinClass, leaveClass, postComment, deleteComment} = require('../controllers/class')

router.post('/join',verifyCookieForApi, csrfProtection, csrfErrorHandler, joinClass)
router.post('/leave',verifyCookieForApi, csrfProtection, csrfErrorHandler, leaveClass)
router.post('/comment', verifyCookieForApi, csrfProtection, csrfErrorHandler, postComment)
router.post('/comment/delete', verifyCookieForApi, csrfProtection, csrfErrorHandler, deleteComment)


module.exports = router