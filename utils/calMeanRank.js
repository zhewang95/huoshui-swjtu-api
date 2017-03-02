/**
 * Created by wz on 17-3-2.
 */
var Students = require('../models/Students');

function getMeanRank(stu, filter, next) {
    var major = stu.major;
    var grade = stu.grade;
    var sid = stu.sid;
    var vc = stu.validclasses.split('\n');
    if (!filter) {
        filter = vc.map(function (x) {
            return x.split(' ');
        });
    }
    filter.find = function (name) {
        if (typeof filter[name] !== "undefined")
            return true;
        for (var i = 0; i < filter.length; i++) {
            if (filter[i][0] == name)
                return true;
        }
        return false;
    };

    Students.find({grade: grade, major: major}, function (err, stus) {
        stus = stus.map(function (x) {
            return {
                sid: x.sid,
                classes: (stu.validclasses ? stu.validclasses.split('\n') : []).concat((stu.invalidclasses ? stu.invalidclasses.split('\n') : [])),
                validclasses: [],
                invalidclasses: [],
                valid: 0,
                invalid: 0,
                average: 0.0
            }
        });
        for (var i = 0; i < stus.length; i++) {
            stus[i].classes = stus[i].classes.map(function (x) {
                return x.split(' ')
            });
            s = stus[i];
            for (var j = 0; j < s.classes.length; j++) {
                c = s.classes[j];
                if (filter.find(c[0]) && !isNaN(Number(c[1]))) {
                    s.valid++;
                    s.average += Number(c[1]);
                    s.validclasses.push(c.join(' '));
                }
                else {
                    s.invalid++;
                    s.invalidclasses.push(c.join(' '));
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
                stu.validclasses = stus[i].validclasses.join('\n');
                stu.invalidclasses = stus[i].invalidclasses.join('\n');
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
        stu.validaverage = stu.validaverage.toFixed(2)
        stu.save();
        next([stu.validaverage, stu.rank,stu.validclasses,stu.invalidclasses]);
    });
}

module.exports = getMeanRank;