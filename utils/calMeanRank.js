/**
 * Created by wz on 17-3-2.
 */
var Students = require('../models/Students');

function getMeanRank(stu, filter, next) {
    var major = stu.major;
    var grade = stu.grade;
    var sid = stu.sid;
    filter.find = function (name) {
        for (var i = 0; i < filter.length; i++)
            if (filter[i]['name'] == name)
                return true;
        return false;
    };

    Students.find({grade: grade, major: major}, function (err, stus) {
        stus = stus.map(function (x) {
            return {
                sid: x.sid,
                classes: stu.validclasses.concat(stu.invalidclasses),
                validclasses: [],
                invalidclasses: [],
                valid: 0,
                invalid: 0,
                average: 0.0
            }
        });
        for (var i = 0; i < stus.length; i++) {
            var s = stus[i];
            for (var j = 0; j < s.classes.length; j++) {
                var c = s.classes[j];
                if (filter.find(c['name']) && !isNaN(Number(c['score']))) {
                    s.valid++;
                    s.average += Number(c['score']);
                    s.validclasses.push(c);
                }
                else {
                    s.invalid++;
                    s.invalidclasses.push(c);
                }
            }
            if (s.valid != 0)
                s.average = s.average / s.valid;
            else
                s.average = 0.0;
        }
        for (var i = 0; i < stus.length; i++) {
            if (stus[i].sid == sid) {
                stu.valid = stus[i].valid, stu.invalid = stus[i].invalid;
                stu.validaverage = stus[i].average;
                stu.validclasses = stus[i].validclasses;
                stu.invalidclasses = stus[i].invalidclasses;
                break;
            }
        }
        var rank = 1;
        for (var i = 0; i < stus.length; i++) {
            if (stus[i].average > stu.validaverage) {
                rank++;
            }
        }
        stu.rank = rank;
        stu.validaverage = stu.validaverage.toFixed(2);
        stu.save();
        next([stu.validaverage, stu.rank, stus.length, stu.validclasses, stu.invalidclasses]);
    });
}

module.exports = getMeanRank;