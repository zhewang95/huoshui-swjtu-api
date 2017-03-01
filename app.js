/**
 * Created by wz on 17-3-1.
 */
var express=require('express');

var app=express();

app.use(function(req,res){
    res.statusCode=404;
    res.render('404');
});

app.listen(3001,function(){
    console.log('start listening at 3001');
});