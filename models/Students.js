/**
 * Created by wz on 17-3-1.
 */
var mongoose = require('mongoose');

var StudentsSchema = mongoose.Schema({
    sid: {type: String, required: true, unique: true},
    grade: String,
    ID: String,
    name: String,
    sex: String,
    state: String,
    school: String,
    major: String,
    class: String,
    valid: Number,
    validclasses: String,
    validaverage: Number,
    invalidclasses: String,
    rank: Number
});


var Students = mongoose.model("Stu", StudentsSchema);

module.exports = Students;