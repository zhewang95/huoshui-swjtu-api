/**
 * Created by wz on 17-3-2.
 */
var router = require('express').Router(),
    passport = require('passport'),
    getMeanRank = require('./utils/calMeanRank'),
    TeacherRanks = require('./models/TeacherRanks'),
    MajorClasses = require('./models/MajorClasses');


router.get('/', function (req, res, next) {
    res.send({
        'login': 'https://api.wangzhe.cloud/login',
        'baseinfo': 'https://api.wangzhe.cloud/info',
        'mean score and rank': 'https://api.wangzhe.cloud/rank',
        'major classes': 'https://api.wangzhe.cloud/majorclasses',
        'query classes stat': 'https://api.wangzhe.cloud/classes?name=name',
        'login form': 'https://api.wangzhe.cloud/loginform'
    });
});

router.get('/login', function (req, res, next) {
    if (req.isAuthenticated())
        res.success('authorized');
    else
        res.failed('unauthorized');
});

router.get('/loginform', function (req, res, next) {
    res.render('login');
});

router.post('/login', passport.authenticate('swjtuLogin', {
    successRedirect: 'login',
    failureRedirect: 'login'
}));

router.get('/failed', function (req, res, next) {
    res.send({status: 'failed'});
});

router.get('/info', function (req, res, next) {
    if (req.isAuthenticated()) {
        var stu = req.user;
        res.send({
            statuscode: 0,
            status: 'success',
            name: stu.name,
            sex: stu.sex,
            grade: stu.grade,
            major: stu.major,
            class: stu.class
        })
    }
});

router.get('/rank', function (req, res, next) {
    if (req.isAuthenticated()) {
        var stu = req.user;
        var vc = stu.validclasses.split('\n').map(function (i) {
            return i.split(' ');
        });
        var ivc = stu.invalidclasses.split('\n').map(function (i) {
            return i.split(' ');
        });
        getMeanRank(stu, vc, function (ret) {
            var obj = {'statuscode': 0, 'status': 'success'};
            obj['mean'] = ret[0];
            obj['rank'] = ret[1];
            var validclasses = [];
            for (var i = 0; i < vc.length; i++) {
                var o = Object();
                o[vc[i][0]] = vc[i][1];
                validclasses.push(o);
            }
            obj['validclasses'] = validclasses;
            var invalidclasses = [];
            for (var i = 0; i < ivc.length; i++) {
                var o = Object();
                o[ivc[i][0]] = ivc[i][1];
                invalidclasses.push(o);
            }
            obj['invalidclasses'] = invalidclasses;
            res.send(obj);
        });
    }
    else
        res.failed('unauthorized');
});

router.post('/rank', function (req, res, next) {
    if (req.isAuthenticated()) {
        var stu = req.user;
        var vc = req.body;
        getMeanRank(stu, vc, function (ret) {
            var obj = {'statuscode': 0, 'status': 'success'};
            obj['mean'] = ret[0];
            obj['rank'] = ret[1];
            var validclasses = [];
            ret[2].split('\n').map(function (x) {
                t = x.split(' ');
                var o = Object();
                o[t[0]] = t[1];
                validclasses.push(o);
            });
            obj['validclasses'] = validclasses;
            var invalidclasses = [];
            ivc = ret[3].split('\n').map(function (x) {
                t = x.split(' ')
                invalidclasses.push(Object()[t[0]] = t[1])
            });
            obj['invalidclasses'] = invalidclasses;
            res.send(obj);
        });
    }
    else
        res.failed('unauthorized');
});

router.get('/classes', function (req, res, next) {
    if (req.isAuthenticated()) {
        var name = req.query['name'];
        if (name) {
            TeacherRanks.find({coursename: new RegExp(name)}, function (err, ranks) {
                if (err)
                    return next(err);
                var obj = {'statuscode': 0, 'statuc': 'success'};
                var classes = [];
                ranks.forEach(function (item, id, ranks) {
                    var c = {'courseid': item.courseid, 'coursename': item.coursename};
                    var teachers = [];
                    item.teacherrank.split("#").map(function (x) {
                        var t = x.split('*');
                        var teacher = {
                            'name': t[0],
                            'all': t[1],
                            'E': t[2],
                            'A': t[3],
                            'mean': Number(t[4]).toFixed(2),
                            'std': Number(t[5]).toFixed(2)
                        };
                        teachers.push(teacher);
                    });
                    c['teachers'] = teachers;
                    classes.push(c);
                });
                obj['classes'] = classes;
                res.send(obj);
            });
        }
        else
            res.failed('class name required')
    }
    else
        res.failed('unauthorized');
});

router.get('/majorclasses', function (req, res, next) {
    if (req.isAuthenticated()) {
        var major = req.user.major;
        MajorClasses.find({majorname: new RegExp(major)}, function (err, results) {
            if (err)
                return next(err);
            var obj = {'statuscode': 0, 'status': 'success'};
            var majors = [];
            results.forEach(function (result) {
                var major = {'majorcode': result.majorcode, 'majorname': result.majorname};
                var classes = [];
                result.classes.split('#').map(function (x) {
                    var t = x.split('*');
                    classes.push({
                        'courseid': t[3],
                        'coursename': t[4],
                        'coursetype': t[5],
                        'coursecredit': t[6],
                        'remark': t[8]
                    });
                });
                major['classes'] = classes;
                majors.push(major);
            });
            obj['majors'] = majors;
            return res.send(obj);
        })
    }
    else
        res.failed('unauthorized');
});

router.all(function (req, res, next) {
    res.statusCode = 404;
    res.failed('404 not found');
});

module.exports = router;