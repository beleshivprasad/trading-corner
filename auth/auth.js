module.exports = {

    ensureAuth : function(req,res,next) {
        if(req.isAuthenticated()){
            return next();
        }
        else{
            req.flash('error_msg','Please Login to View this Resource')
            res.redirect('/login');
        }
    }
}