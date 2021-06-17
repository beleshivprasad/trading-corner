const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const User = require('../model/User')


module.exports = function(passport) {
    passport.use(
        new LocalStrategy( {
            usernameField: "email",
            passwordField: "pswd",
          },(email,pswd,done)=>{
            User.findOne({email:email})
                .then(user=>{
                    if(!user){
                        return done(null,false,{message: 'Email is not Registered '});
                    }
                    bcrypt.compare(pswd,user.pswd,(err,isMatch)=>{
                        if(err) throw err;

                        if(isMatch){
                            return done(null,user)
                        }else{
                            return done(null,false,{message: 'Incorrect Password'})
                        }
                    })
                })
                .catch(err=>console.log(err))
        })
    );
    passport.serializeUser((user, done) =>{
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done)=>{
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}
