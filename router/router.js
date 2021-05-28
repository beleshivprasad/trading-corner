const express = require('express')
const router = express.Router()
const controller = require('../controller/controller')
const {ensureAuth} = require('../auth/auth')


//HOME PAGE ROUTE
router.get('/',controller.getHome)


//LEARN PAGE ROUTE
router.get('/learn',controller.getLearn)


//MARKET PAGE ROUTE
router.get('/market',controller.getMarket)


//PREDICTION PAGE ROUTE
router.get('/prediction',ensureAuth,controller.getPrediction)


//LOGIN PAGE ROUTE
router.get('/login',controller.getLogin)


//SIGNUP PAGE ROUTE
router.get('/signup',controller.getSignup)


//LOGOUT ROUTE
router.get('/logout',controller.getLogout)


//POST METHODS

//LOGIN ROUTE
router.post('/signup',controller.postSignup)
router.post('/login',controller.postLogin)




//EXPORTING THE ROUTER
module.exports = router