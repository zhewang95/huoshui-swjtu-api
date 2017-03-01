/**
 * Created by wz on 17-3-1.
 */
var mongoose = require('mongoose');

function connect(){
    mongoose.Promise=global.Promise;
    mongoose.connect("mongodb://root:1995119100@localhost:27017/test");
}

module.exports=connect;