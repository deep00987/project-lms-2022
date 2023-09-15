/**
 * student auth router v1.0 
 */
const express = require('express')
const router = express.Router()

const {loginUser,logoutUser, registerUser} = require('../controllers/auth')
const verifyCookieForApi = require('../../middleware/verifyCookieForApi')

router.post('/login', loginUser)
router.get('/logout',verifyCookieForApi, logoutUser)
router.post('/register',registerUser)

module.exports = router