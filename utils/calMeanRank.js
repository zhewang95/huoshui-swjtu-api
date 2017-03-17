/**
 * Created by wz on 17-3-2.
 */
var Students = require('../models/Students');

function getMeanRank(stu, filter, next) {
    var major = stu.major;
    var grade = stu.grade;
    var sid = stu.sid;
    filter.find = function (c) {
        var name = c['name'], score = c['score'];
        for (var i = 0; i < filter.length; i++)
            if (filter[i]['name'] == name && filter[i]['score'] == score)
                return true;
        return false;
    };

    Students.find({grade: grade, major: major}, function (err, stus) {
        stus = stus.map(function (x) {
            return {
                sid: x.sid,
                classes: x.validclasses.concat(x.invalidclasses),
                validclasses: [],
                invalidclasses: [],
                valid: 0,
                average: 0.0
            }
        });
        for (var i = 0; i < stus.length; i++) {
            var s = stus[i];
            for (var j = 0; j < s.classes.length; j++) {
                var c = s.classes[j];
                if (!isNaN(Number(c['score'])) && filter.find(c)) {
                    s.valid++;
                    s.average += Number(c['score']);
                    s.validclasses.push(c);
                }
                else {
                    s.invalidclasses.push(c);
                }
            }
            s.average = s.valid > 0 ? (s.average / s.valid) : 0.0;
        }
        for (var i = 0; i < stus.length; i++) {
            if (stus[i].sid == sid) {
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