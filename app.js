const express = require("express")
const ejs = require('ejs')
const dotenv = require('dotenv')
const path = require('path')
const router = require('./router/router')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const morgan = require("morgan")
const request = require('request')


require('./auth/passport')(passport)
require('./auth/auth')

//Creating App
const app = express()


//IMPORTING FROM THE CONFILE.ENV 
dotenv.config({path:'./config.env'})
const PORT = process.env.PORT;
const URL = process.env.URL;


//CREATING THE MONGOOSE CONNECTION
mongoose.connect(URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})
    .then(()=>console.log(`MongoDB connected`))
    .catch((err)=>console.log(`Error Connecting Database: ${err}`))

mongoose.set('useFindAndModify',false);

//SETTING UP THE MIDDLEWARE FOR STATIC FILES
app.use(express.static(path.resolve(__dirname,'./assets/')))
app.use(express.static(__dirname+'assets'))


//SETTING UP THE VIEW ENGINE
app.set('views',path.resolve(__dirname,'views'))
app.set('view engine','ejs')


//SETTING UP THE BODYPARSER
app.use(express.urlencoded({extended:true}))
app.use(express.json())


//SETTING UP THE SESSION
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))


//PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());


//SETTING UP THE FLASH
app.use(flash())


//SETTING UP THE MORGAN
app.use(morgan('tiny'))

//SETTING UP THE VARS
app.use((req,res,next)=>{
    res.locals.login = req.isAuthenticated();
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    next();
})


//USING ROUTES
app.use('/',router)



//Listening on the PORT
app.listen(PORT,()=>{
    console.log(`The server is running at ${PORT} http://localhost:${PORT}`)
})
