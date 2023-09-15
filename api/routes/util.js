/**
 * student utils routes 
 */
const express = require('express')
const router = express.Router()

const verifyCookieForApi = require("../../middleware/verifyCookieForApi")
const {csrfProtection, csrfErrorHandler} = require("../../middleware/csrfProtection")
const {updateEmail, updatePasswd} = require("../controllers/util")

router.post('/email',verifyCookieForApi, csrfProtection, csrfErrorHandler, updateEmail)
router.post('/passwd',verifyCookieForApi, csrfProtection, csrfErrorHandler, updatePasswd)

module.exports = router