/**
 * student addmission routes 
 */
const express = require('express')
const router = express.Router()

const verifyCookieForApi = require("../../middleware/verifyCookieForApi")
const {csrfProtection, csrfErrorHandler} = require("../../middleware/csrfProtection")
const {getAddmission} = require("../controllers/addmission")

router.post('/',verifyCookieForApi, csrfProtection, csrfErrorHandler, getAddmission)

module.exports = router