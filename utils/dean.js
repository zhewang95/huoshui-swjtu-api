/**
 * Created by wz on 17-3-1.
 */
var request = require('request')
    , iconv = require('iconv-lite')
    , gm = require('gm').subClass({imageMagick: true})
    , fs = require('fs')
    , Tesseract = require('tesseract.js');

function loginonce(username, password, next) {
    imgurl = 'http://jiaowu.swjtu.edu.cn/servlet/GetRandomNumberToJPEG';
    url = 'http://jiaowu.swjtu.edu.cn/servlet/UserLoginSQLAction';
    form = {
        'url': "../usersys/index.jsp",
        'OperatingSystem': "",
        "Browser": "",
        "user_id": username.toString(),
        "password": password.toString(),
        "set_language": "cn",
        "user_type": "student",
        "btn1": ""
    };
    headers = {
        'Host': 'jiaowu.swjtu.edu.cn',
        'Referer': "http://jiaowu.swjtu.edu.cn/service/login.jsp?user_type=student",
    };

    var j = request.jar();
    gm(request({url: imgurl, headers: headers, jar: j}))
        .type('Grayscale')
        .threshold('41%')
        .motionBlur(2)
        .threshold('50%')
        .fill('#FFFFFF')
        .drawRectangle(0, 0, 1, 22)
        .drawRectangle(0, 0, 55, 1)
        .toBuffer('jpg', function (err, buffer) {
            if (err)return next(err);
            Tesseract.recognize(buffer)
                .then(function (result) {
                    if (!result.words[0])
                        return next(null, false);
                    ranstring = result.words[0].text;
                    ranstring = ranstring.replace(/[^\w]/g, '').toLowerCase();
                    if (ranstring.length != 4)
                        return next(null, false);
                    form.ranstring = ranstring;
                    request.post({
                        url: url,
                        form: form,
                        headers: headers,
                        jar: j,
                        encoding: null
                    }, function (err, res, body) {
                        if (err)return next(err);
                        var html = iconv.decode(body, 'gb2312');
                        if (html.indexOf('登录成功') != -1)
                            next(null, true);
                        else
                            next(null, false);
                    });
                });
        });
};

//how to improve this?
var login = function (username, password, next) {
    var fun = function (times, username, password, next) {
        if (times > 5)
            return next(null, false, times);
        loginonce(username, password, function (err, res) {
            if (res)
                return next(null, true, times);
            fun(times + 1, username, password, next);
        });
    };
    fun(1, username, password, next);
};

module.exports.login = login;

if (require.main === module) {
    for (var i = 0; i < 1; i++)
        login('', '', function (err, res, times) {
            console.log(err);
            console.log(res);
            console.log(times);
        });
}