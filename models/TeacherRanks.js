/**
 * Created by wz on 17-3-1.
 */
var mongoose = require('mongoose');

var TeacherRanksSchema = mongoose.Schema({
    courseid: {type: String, required: true, unique: true},
    coursename: String,
    teacherrank: String
});

var TeacherRanks = mongoose.model('TeacherRank', TeacherRanksSchema);

module.exports = TeacherRanks;
