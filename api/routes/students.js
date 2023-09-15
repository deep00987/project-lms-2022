/**
 * student routes 
 */
const express = require('express')
const {getUsers, getUserById, getCurrentUser} = require('../controllers/students')
const verifyCookieForApi = require('../../middleware/verifyCookieForApi')
const router = express.Router()
const verifyToken = require("../../middleware/verifyToken")
//debug-- route 
//router.get('/',verifyCookieForApi, getUsers)


router.get('/current',verifyCookieForApi, getCurrentUser)
//router.get('/:id',verifyToken, getUserById)



module.exports = router