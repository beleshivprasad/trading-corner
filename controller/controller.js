const mongoose = require('mongoose')
const User = require('../model/User')
const Stock =require('../model/Stock')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const dotenv = require('dotenv')
const request = require('request')
const cheerio = require('cheerio')
dotenv.config({
    path: './config.env'
})
const unirest = require("unirest");
const API_KEY = process.env.API_KEY;



require('../auth/passport')(passport)
require('../auth/auth')

//DEFINING Home ROUTE
var getHome = function (req, res) {
    res.render('index', {
        name: req.user
    })
}


//DEFINING HOME ROUTE
var getLearn = function (req, res) {
    res.render('learn', {
        name: req.user
    })
}


//DEFINING HOME ROUTE
var getMarket = function (req, res) {
    var NSE = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'SBIN'];
    setInterval(() => {
        NSE.forEach((item, index) => {
            request({
                url: `https://www.google.com/finance/quote/${item}:NSE`,
                headers: {
                    "accept": " */*",
                    "accept-encoding": "json",
                    "accept-language": "en-US"
                },
                json: true
            },
            function (error, response, body) {
                if (error) {
                    // console.log(err)
                }
                if (body) {
                    var $ = cheerio.load(body)
                    let price = $('div.fxKbKc').text()
                    let title = $('#yDmH0d > c-wiz.zQTmif.SSPGKf.u5wqUe > div > div.e1AOyf > main > div.VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.QZMA8b > c-wiz > div > div:nth-child(1) > div > div.rPF6Lc > div:nth-child(1) > h1').text()

                    Stock.findOneAndUpdate({symbol:item},{price:price})
                        .then(data=>{
                            console.log(data.price);
                        })
                        .catch(err=>console.log(err))

                }
            });
    });
    }, 5000);

    Stock.find({})
        .then(data=>{
            // console.log(data[0])
            res.render('market', {
                name: req.user,
                data: data
            })
        })
        .catch(err=>console.log(err))

}


//DEFINING Prediction ROUTE
var getPrediction = function (req, res) {

    res.render('prediction', {
        name: req.user,
        prediction: 'default'
    })
}


//DEFINING LOGIN ROUTE
var getLogin = function (req, res) {
    res.render('login')
}


//DEFINING SIGNUP ROUTE
var getSignup = function (req, res) {
    res.render('signup')
}

//DEFINING LOGOUT ROUTE
var getLogout = function (req, res) {
    req.logout()
    req.flash('success_msg', 'Logged out Successfully')
    res.redirect('/login')
}


//DEFINING THE POSTS ROUTE

//DEFINING LOGIN ROUTE
var postSignup = function (req, res) {
    const {
        name,
        email,
        pswd,
        cnfpswd
    } = req.body;
    let error = [];
    if (!name || !email || !pswd || !cnfpswd) {
        error.push({
            msg: "All field Required"
        });
    }
    if (pswd !== cnfpswd) {
        error.push({
            msg: "Password Dont Match"
        });
    }
    if (pswd.length < 6) {
        error.push({
            msg: "Password Should be at least  6 character"
        });
    }
    if (error.length > 0) {
        res.render('signup', {
            error,
            name,
            email,
            pswd,
            cnfpswd
        })
    } else {
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    error.push({
                        msg: "User Already Existed"
                    })
                    res.render('signup', {
                        name,
                        email,
                        pswd,
                        cnfpswd
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        pswd
                    })

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.pswd, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.pswd = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'User Registered Successfully')
                                    res.redirect('/login')
                                })
                                .catch(err => {
                                    console.log(err)
                                })
                        })
                    })
                }
            })
    }
}

//DEFINING LOGIN ROUTE
var postLogin = function (req, res, next) {
    const {
        email,
        pswd
    } = req.body;
    if (!email || !pswd) {
        req.flash('error_msg', 'All Field Required')
        res.redirect('/login')
    } else {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true,
        })(req, res, next);
    }
}

var postPrediction = function (req, res) {
    var ticker = req.body.stock;
    console.log(ticker)
    if (ticker == 'none') {
        req.flash("error_msg", "Please Select Stock")
        res.redirect('/prediction')
    } else {
        predict = "Under Development"
        res.render('prediction', {
            prediction: predict,
            name: req.user
        })
    }
}

//EXPORTING THE CONTROLLER FUNCTIONS

module.exports = {
    getHome,
    getLearn,
    getMarket,
    getPrediction,
    getSignup,
    getLogin,
    postSignup,
    postLogin,
    getLogout,
    postPrediction
}