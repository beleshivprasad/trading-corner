const mongoose = require('mongoose')
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')

require('../auth/passport')(passport)
require('../auth/auth')

//DEFINING Home ROUTE
var getHome = function (req,res) {
    res.render('index',{
        name:req.user
    })
}


//DEFINING HOME ROUTE
var getLearn = function (req,res) {
    res.render('learn',{
        name: req.user
    })
}


//DEFINING HOME ROUTE
var getMarket = function (req,res) {
    res.render('market',{
        name: req.user
    })
}


//DEFINING Prediction ROUTE
var getPrediction = function (req,res) {
    res.render('prediction',{
        name: req.user
    })
}


//DEFINING LOGIN ROUTE
var getLogin = function (req,res) {
    res.render('login')
}


//DEFINING SIGNUP ROUTE
var getSignup = function (req,res) {
    res.render('signup')
}

//DEFINING LOGOUT ROUTE
var getLogout = function(req,res){
    req.logout()
    req.flash('success_msg','Logged out Successfully')
    res.redirect('/login')
}


//DEFINING THE POSTS ROUTE

//DEFINING LOGIN ROUTE
var postSignup = function (req,res) {
    const {name,email,pswd,cnfpswd} = req.body;
    let error = [];
    if(!name || !email || !pswd || !cnfpswd){
        error.push({msg:"All field Required"});
    }
    if(pswd !== cnfpswd){
        error.push({msg:"Password Dont Match"});
    }
    if(pswd.length < 6){
        error.push({msg:"Password Should be at least  6 character"});
    }
    if(error.length > 0){
        res.render('signup',{
            error,name,email,pswd,cnfpswd
        })
    }
    else{
        User.findOne({email:email})
            .then(user =>{
                if(user){
                    error.push({msg:"User Already Existed"})
                    res.render('signup',{
                        name,email,pswd,cnfpswd
                    })
                }
                else{
                    const newUser = new User({
                        name,
                        email,
                        pswd
                    })

                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.pswd,salt,(err,hash)=>{
                            if(err) throw err;
                            newUser.pswd = hash;
                            newUser.save()
                                .then(user=>{
                                    req.flash('success_msg','User Registered Successfully')
                                    res.redirect('/login')
                                })
                                .catch(err=>{
                                    console.log(err)
                                })
                        })
                    })
                }
            })
    }
}

//DEFINING LOGIN ROUTE
var postLogin = function (req,res,next) {
    const {email,pswd} = req.body;
    if(!email || !pswd ){
        req.flash('error_msg','All Field Required')
        res.redirect('/login')
    }
    else{
        passport.authenticate('local',{
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
        })(req,res,next);
    }
}


//EXPORTING THE CONTROLLER FUNCTIONS

module.exports = {getHome,getLearn,getMarket,getPrediction,getSignup,getLogin,postSignup,postLogin,getLogout}