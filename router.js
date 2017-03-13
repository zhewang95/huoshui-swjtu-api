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
        var vc = stu.validclasses;
        var ivc = stu.invalidclasses;
        getMeanRank(stu, vc, function (ret) {
            var obj = {'statuscode': 0, 'status': 'success'};
            obj['mean'] = ret[0];
            obj['rank'] = ret[1];
            obj['all'] = ret[2];
            obj['validclasses'] = vc;
            obj['invalidclasses'] = ivc;
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
            obj['all'] = ret[2];
            var validclasses = [];
            ret[3].split('\n').map(function (x) {
                var t = x.split(' ');
                var o = Object();
                o[t[0]] = t[1];
                validclasses.push(o);
            });
            obj['validclasses'] = validclasses;
            var invalidclasses = [];
            ret[4].split('\n').map(function (x) {
                var t = x.split(' ');
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
            TeacherRanks.find({coursename: new RegExp(name)}, {'_id': 0}, function (err, ranks) {
                if (err)
                    return next(err);
                var obj = {'statuscode': 0, 'statuc': 'success'};
                obj['classes'] = ranks;
                res.send(obj);
            });
        }
        else
            res.failed('class name required');
    }
    else
        res.failed('unauthorized');
});

router.get('/majorclasses', function (req, res, next) {
    if (req.isAuthenticated()) {
        var major = req.user.major;
        MajorClasses.find({majorname: new RegExp(major)}, {'_id': 0, "__v": 0}, function (err, results) {
            if (err)
                return next(err);
            var obj = {'statuscode': 0, 'status': 'success'};
            obj['majors'] = results;
            return res.send(obj);
        })
    }
    else
        res.failed('unauthorized');
});

router.all(function (req, res) {
    res.statusCode = 404;
    res.failed('404 not found');
});

module.exports = router;