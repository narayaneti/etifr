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

exports.send_push_messge=(ids,message)=>{
    
    var options = {
        'method': 'POST',
        'url': 'https://fcm.googleapis.com/fcm/send',
        'headers': {
          'Authorization': 'key=AAAA_p52nJQ:APA91bFGvzM6ufqK6cP40QFb4g_aYfbftenbNOXK7Xgk0IRflGLW2MCI3drjjltjd3JNYPYVLVcXVyrhdICin4_YvFtg7MZ9k6i8-hZAU7nBA0KfPbGO6NuZcAgR0igUd3qG9XQ69nHR',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "registration_ids":ids,
            "notification": message,
            "data":message
        })
      
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response.body);
      });
}


