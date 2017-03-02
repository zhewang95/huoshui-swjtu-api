/**
 * Created by wz on 17-3-1.
 */
var passport=require('passport');
var Students=require('./models/Students');
var localStrategy=require('passport-local').Strategy;
var deanSpider=require('./utils/dean.js');

passport.use('swjtuLogin',new localStrategy(
    function(username,password,done){
        deanSpider.login(username,password,function(err,result,times){
            if(err)
                return done(err);
            if(!result)
                return done(null,false);
            Students.findOne({sid:username},function(err,student){
                if(err)return done(err);
                return done(null,student);
            });
        })
    })
);

module.exports=function(){
    passport.serializeUser(function(student,done){
        done(null,student._id);
    });

    passport.deserializeUser(function(id,done){
        Students.findById(id,function(err,student){
            done(err,student);
        });
    });
};