/**
 * Created by wz on 17-3-1.
 */
var mongoose = require('mongoose');

var MajorClassesSchema = mongoose.Schema({
    majorcode: {type: String, required: true, unique: true},
    majorname: String,
    collegecode: String,
    collegename: String,
    classes: String
});

var MajorClasses = mongoose.model("GraduateClasses13", MajorClassesSchema);

module.exports = MajorClasses;