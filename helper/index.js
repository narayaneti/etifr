const request = require('request');
const https=require('https');
var urlencode = require('urlencode');

exports.send_otp=function(otp,mobile,next){
    var message=urlencode('ETI mobile otp is'+otp);
    var url='https://pgapi.vispl.in/fe/api/v1/send?username=escalates.trans&password=RK3x3&unicode=false&from=POJPAN&to='+ mobile +'&text='+message;
    //request({url:url, "rejectUnauthorized": false}, (err, res, body) => {
        //if (err) { return console.log(err); }
        next(200);
    //});
}


