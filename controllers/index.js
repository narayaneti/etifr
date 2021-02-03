const { Validator } = require('node-input-validator');
const db=require('../middleware/index');
const helper=require('../helper/index');
const bcrypt = require('bcrypt');
const saltRounds = 11;
const rn = require('random-number');
var formidable = require('formidable');
var fs = require('fs');
const moment = require('moment');


function data_encript(data){
  return bcrypt.hashSync(data, saltRounds);
}

function data_decript(data,hash){
  return bcrypt.compareSync(data, hash);
}

function enter(req,res,next) {
  if(!req.session.admin_id){
    res.redirect('/');
  }else{
    next();
  }
}

exports.index=function(req, res, next) {
    res.render('login',{req:req,}); 
}

exports.login=function(req,res,next){
    const v = new Validator(req.body, {
        mobile: 'required|integer',
        password: 'required|string',
        admin_type: 'required|integer',
      });
      v.check().then((matched) => {
        if (!matched) {
          res.render('login',{req:req,errors:v.errors});
        }
      });
      var query = { mobile: req.body.mobile,admin_type:req.body.admin_type };
      db.select_one_detail_by_condition('admin',query,function(result){
            if(result){
                if(data_decript(req.body.password,result.password)){
                  req.session.admin_id=result._id;
                  req.session.admin_type=result.admin_type;
                  req.session.name=result.name;
                  //console.log(req.session)
                  if(result.status==1){
                    if(result.password_change==0){
                      res.redirect('/first-password-change');
                    }else{
                      res.redirect('/dashboard');
                    }
                  }else if(result.status==2){
                    res.render('login',{req:req,errors:{password:{message:"You account deactive!"}}});
                  }else if(result.status==0){
                    res.render('login',{req:req,errors:{password:{message:"You account delete!"}}});
                  }
                }else{
                    res.render('login',{req:req,errors:{password:{message:"Invalid password!"}}});
                }
                
            }else{
                var err={mobile:{message:"Mobile Number not register"}};
                res.render('login',{req:req,errors:err});
            }
      });
}

exports.logout=(req,res,next)=>{
  req.session.destroy();
  res.redirect('/');
}

exports.forgot_password=function(req,res,next){
  if(req.method=='GET'){
    res.render('forgot-password',{req:req});
  }else{
    const v = new Validator(req.body, {
      mobile: 'required|integer',
      admin_type: 'required|integer',
    });
    v.check().then((matched) => {
      if (!matched) {
        res.render('forgot-password',{req:req,errors:v.errors});
      }
    });
    var query = { mobile: req.body.mobile,admin_type: req.body.admin_type };
    db.select_one_detail_by_condition('admin',query,function(user_detail){
      console.log(user_detail);
      if(user_detail){
        var mobile=req.body.mobile;
        //var otp=rn({min:1000,max:9999,integer: true});
        var otp=1111;
        helper.send_otp(otp,mobile,function(resp){
          req.session.forgot_password={mobile:mobile,otp:otp,admin_type:req.body.admin_type};
          res.redirect('/forgot-password-change');
        });
        
      }else{
        var err={mobile:{message:"Mobile Number not register"}};
        res.render('forgot-password',{req:req,errors:err});
      } 
    });
  }
}

exports.forgot_password_change=(req,res,next)=>{
  if(req.method=='GET'){
    if(req.session.forgot_password){
      res.render('forgot-password-change',{req:req});
    }else{
      res.redirect('/forgot-password');
    }
  }else{
    if(!req.session.forgot_password){
      res.redirect('/forgot-password');
    }
    const v = new Validator(req.body, {
      otp: 'required|integer',
      password: 'required|string',
      conpass: 'required|string|equals:'+req.body.password
    },{
      'conpass.required':'The confirm password field is mandatory.',
      'conpass.equals':'The confirm password must be a equals password.'
    });
    v.check().then((matched) => {
      if (!matched) {
        console.log(v);
        res.render('forgot-password-change',{req:req,errors:v.errors});
      }else{
        var forgot_password=req.session.forgot_password;
        if(forgot_password.otp==req.body.otp){
          var password=data_encript(req.body.password);
          db.update_detail_by_condition('admin',{ mobile:forgot_password.mobile,admin_type:forgot_password.admin_type },{password:password},function(result) {
            delete req.session.forgot_password;
            res.redirect('/');
          })
        }else{
          var err={otp:{message:"OTP not match."}};
          res.render('forgot-password-change',{req:req,errors:err});
        }
      }
    });
    
  }
}

exports.forgot_password_otp=(req,res,next)=>{
  if(req.session.forgot_password){
      var forget_detail=req.session.forgot_password;
      helper.send_otp(forget_detail.otp,forget_detail.mobile,function(resp){
        res.send('1');
      });
  }else{
    res.send('0');
  }
}

exports.dashboard=(req,res,next)=>{
  enter(req,res,function(){
    db.table_data_count(['admin','investors'],function (result) {
      //console.log(result);
      res.render('dashboard',{req:req,count:result});
    })
  });
}

exports.add_new_admin=(req,res,next)=>{
  enter(req,res,function(){
    if(req.method=='GET'){
      res.render('add-new-admin',{req:req});
    }else{
      const v = new Validator(req.body, {
        name: 'required|string',
        employee_id: 'required|string',
        mobile: 'required|string',
        designation: 'required|string',
        admin_type: 'required|string'
      });
      v.check().then((matched) => {
        if (!matched) {
          console.log(v);
          res.render('add-new-admin',{req:req,errors:v.errors});
        }else{
          db.select_one_detail_by_condition('admin',{mobile:req.body.mobile,admin_type:req.body.admin_type},function (result){
            if(result){
              var err={mobile:{message:"Mobile Number alrady register"}};
              res.render('add-new-admin',{req:req,errors:err});
            }else{
              var query={
                name:req.body.name,
                mobile:req.body.mobile,
                employee_id:req.body.employee_id,
                designation:req.body.designation,
                insert_admin_id:req.session.admin_id,
                password:data_encript('Aa@1'),
                admin_type:req.body.admin_type
              }
              db.insert_data('admin',query,function (result) {
                console.log(result);
                var err={mobile:{message:"Admin added successfully"}};
                res.render('add-new-admin',{req:req,messages:err});
              });
            }
          });
        }
      });
    }
  });
}

exports.admin_list=(req,res,next)=>{
  enter(req,res,function(){
    if(req.params.action && req.params.id){
      var query={};
      if(req.params.action=='deactivate'){
        query.status=2;
      }else if(req.params.action=='activate'){
        query.status=1;
      }else if(req.params.action=='delete'){
        query.status=0;
      }
      if(query){
        console.log('hello');
        db.update_detail_by_condition('admin',{_id:req.params.id},query,function(result){
          console.log(result);
          db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
            res.render('admin-list',{req:req,admin_deatils:result});
          });
        });
      }else{
        console.log('hello1');
        db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
          res.render('admin-list',{req:req,admin_deatils:result});
        });
      }
    }else{
      console.log('hello2');
      db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
        res.render('admin-list',{req:req,admin_deatils:result});
      });
    }
  });
}

exports.add_new_investors=(req,res,next)=>{
  enter(req,res,function(){
    if(req.method=='GET'){
      res.render('add-new-investors',{req:req});
    }else{
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        //console.log(files);
        if(files.pan_card_copy.size==0){
          var err={pan_card:{message:"pan card copy required!"}};
          res.render('add-new-investors',{req:req,errors:err});
        }else{
          if (!files.pan_card_copy.name.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
            var err={pan_card:{message:"Only jpg/jpge/png files are allowed!"}};
            res.render('add-new-investors',{req:req,errors:err});
          }else{
            var oldpath = files.pan_card_copy.path;
            var image_name=rn(54,100000)+files.pan_card_copy.name;
            var newpath = 'public/investors/pan_card/'+image_name;
            
              const v = new Validator(fields, {
                investor_name: 'required|string',
                investor_mobile: 'required|integer',
                investor_address: 'required|string',
                invested_amount: 'required|string', 
                rate_of_interest: 'required|integer',
                tenure_period_of_investment_month: 'required|string',
                tenure_period_of_investment_year: 'required|string',
                interest_pay_out_frequencies: 'required|string',
                interest_amount_to_be_paid_in_each_interval: 'required|string',
                investor_account_no: 'required|string',
                account_ifsc_code: 'required|string',
                pan_card_no: 'required|string',
                payment_day: 'required|string',
              });
              v.check().then((matched) => {
                if (!matched) {
                  res.render('add-new-investors',{req:req,errors:v.errors});
                }else{
                  fs.copyFile(oldpath, newpath, function (err) {
                    if (err) throw err;
                    fields.pan_card_copy=image_name;
                    fields.insert_admin_id=req.session.admin_id;

                    var date_ob=new Date();
                      var payment_day=0;
                      if(fields.payment_day && fields.payment_day >=0 && fields.payment_day<=28){
                        payment_day=parseInt(fields.payment_day)+1;
                      }
                      var new_date_ob=new Date(date_ob.getFullYear(), (parseInt(date_ob.getMonth()) + parseInt(fields.interest_pay_out_frequencies)), payment_day);
                      fields.next_payment_date=new_date_ob;
                    db.insert_data('investors',fields,function(result) {
                      var messages={pan_card:{message:"success"}};
                      res.render('add-new-investors',{req:req,messages:messages});
                    })
                    
                  });
                }
              });
          }
        }
      })
        
    }
  });
} 

exports.investors_list=(req,res,next)=>{
  enter(req,res,function(){
    var date_ob=new Date();
    var new_date_ob=new Date(date_ob.getFullYear(), 14 + 1, 1);
    //console.log(new_date_ob)
    db.select_detail_by_condition('investors',{status:{ $ne: 0 }},function(result){
      res.render('investors-list',{req:req,investors_deatils:result});
    });
  });
} 

exports.edit_investors=(req,res,next)=>{
  enter(req,res,function(){
    if(req.params.id){
      db.select_one_detail_by_condition('investors',{_id:req.params.id},function(result) {
        if(result){
          if(req.method=='GET'){
            res.render('edit-investors',{req:req,investors_deatil:result});
          }else{
            const v = new Validator(req.body, {
              investor_name: 'required|string',
              investor_address: 'required|string',
              invested_amount: 'required|string', 
              rate_of_interest: 'required|string',
              tenure_period_of_investment_month: 'required|string',
              tenure_period_of_investment_year: 'required|string',
              interest_pay_out_frequencies: 'required|string',
              interest_amount_to_be_paid_in_each_interval: 'required|string',
              investor_account_no: 'required|string',
              account_ifsc_code: 'required|string',
            });
            v.check().then((matched) => {
              if (!matched) {
                res.render('edit-investors',{req:req,errors:v.errors,investors_deatil:result});
              }else{
                db.update_detail_by_condition('investors',{_id:req.params.id},req.body,function(resu) {
                  var messages={pan_card:{message:"update successfully!"}};
                  res.render('edit-investors',{req:req,messages:messages,investors_deatil:result});
                })
              }
            });
          }
        }else{
          res.redirect('/dashboard');
        }
      })
    }else{
      res.redirect('/dashboard');
    }
  });
}

exports.first_password_change=(req,res,next)=>{
  enter(req,res,function(){
    if(req.method=='GET'){
      res.render('first-password-change',{req:req});
    }else{
      const v = new Validator(req.body, {
        password: 'required|string',
        conpass: 'required|string|equals:'+req.body.password
      },{
        'conpass.required':'The confirm password field is mandatory.',
        'conpass.equals':'The confirm password must be a equals password.'
      });
      v.check().then((matched) => {
        if (!matched) {
          console.log(v);
          res.render('first-password-change',{req:req,errors:v.errors});
        }else{
          var password=data_encript(req.body.password);
            db.update_detail_by_condition('admin',{ _id:req.session.admin_id },{password:password,password_change:1},function(result) {
              delete req.session.forgot_password;
              res.redirect('/dashboard');
            });
        }
      });
    }
  });
}

exports.profile=(req,res,next)=>{
  enter(req,res,function(){
    db.select_detail_by_condition('admin',{_id:req.session.admin_id},function(result){
      if(result.length>0){
        res.render('profile',{req:req,user:result[0]}); 
      }else{
        req.session.destroy;
        res.redirect('/');
      }
    });
  });
}

exports.change_password=(req,res,next)=>{
  enter(req,res,function(){
    if(!req.session.admin_id){
      res.redirect('/');
    }
    if(req.method=='GET'){
      res.render('change-password',{req:req});
    }else{
      const v = new Validator(req.body, {
        password: 'required|string',
        conpass: 'required|string|equals:'+req.body.password
      },{
        'conpass.required':'The confirm password field is mandatory.',
        'conpass.equals':'The confirm password must be a equals password.'
      });
      v.check().then((matched) => {
        if (!matched) {
          console.log(v);
          res.render('change-password',{req:req,errors:v.errors});
        }else{
          var password=data_encript(req.body.password);
            db.update_detail_by_condition('admin',{ _id:req.session.admin_id },{password:password,password_change:1},function(result) {
              delete req.session.forgot_password;
              res.redirect('/dashboard');
            });
        }
      });
    }
  });
}

exports.upcoming_payment=(req,res,next)=>{
  enter(req,res,function(){
    var date=new Date();
    let current_date = new Date(date.getFullYear()+'-'+("0" +(parseInt(date.getMonth()) + parseInt(1))).slice(-2)+'-'+("0" +date.getDate()).slice(-2)+'T00:00:00.000Z');
    let next_date= new Date(date.getFullYear()+'-'+("0" +(parseInt(date.getMonth()) + parseInt(1))).slice(-2)+'-'+("0" +date.getDate()).slice(-2)+'T00:00:00.000Z');
    next_date.setDate(next_date.getDate() + 3);
    db.select_detail_by_condition('investors',{$and: [{next_payment_date:{$gte:current_date}},{next_payment_date:{$lte:next_date}}]},function(result){
      console.log(result);
      res.render('upcoming-payment',{req:req,investors_deatils:result});
    });
  });
}
 
exports.payment_investors_deatil=(req,res,next)=>{
  enter(req,res,function(){
    if(req.params.id){
      db.select_one_detail_by_condition('investors',{_id:req.params.id},function(result) {
        if(result){
          if(req.method=='GET'){
            res.render('payment-investors-deatil',{req:req,investors_deatil:result});
          }else{
            const v = new Validator(req.body, {
              bank_name: 'required|string',
              transaction_amount: 'required|integer',
              transaction_id: 'required|integer',
              date_time: 'required|string',
            });
            v.check().then((matched) => {
              if (!matched) {
                res.render('payment-investors-deatil',{req:req,investors_deatil:result,errors:v.errors});
              }else{
                var in_data={
                  investor_id: result._id,
                  bank_name: req.body.bank_name,
                  transaction_amount: req.body.transaction_amount,
                  transaction_id: req.body.transaction_id,
                  transaction_date_time: new Date(req.body.date_time),
                  investor_account_no:result.investor_account_no,
                  account_ifsc_code:result.account_ifsc_code,
                  pan_card_no:result.pan_card_no,
                  admin_id:req.session.admin_id,
                };
                db.insert_data('invested_payment',in_data,function (result1) {
                  if(result1){
                      var date_ob=new Date(req.body.date_time);
                      var payment_day=0;
                      if(result.payment_day && result.payment_day >=0 && result.payment_day<=28){
                        payment_day=result.payment_day;
                      }
                      var new_date_ob=new Date(date_ob.getFullYear(), (parseInt(date_ob.getMonth()) + parseInt(result.interest_pay_out_frequencies)), payment_day);
                  
                    var up_data={
                      last_payment_date:new Date(req.body.date_time),
                      next_payment_date:new_date_ob
                    };
                    db.update_detail_by_condition('investors',{_id:req.params.id},up_data,function (result2) {
                      console.log(result2);
                    })
                  }
                });
              }
            });
          }
        }else{
          res.redirect('/upcoming-payment');
        }
      });
    }else{
      res.redirect('/upcoming-payment');
    }
  });
}

exports.payment_invoice=(req,res,next)=>{
  enter(req,res,function(){    
    if(req.params.id){
      db.select_one_detail_by_condition('invested_payment',{_id:req.params.id},function(result) {
        if(result){
          db.invoice_detail(req.params.id,function (result) {
            if(result.length>0){
              res.render('invoice',{req:req,moment:moment,invoice_detail:result[0]}); 
            }else{
              res.redirect('/dashboard');
            }
          });          
        }else{
          res.redirect('/dashboard');
        }
      });
    }
  });
}

exports.due_payment=(req,res,next)=>{
  enter(req,res,function(){
    var date=new Date();
    let current_date = new Date(date.getFullYear()+'-'+("0" +(parseInt(date.getMonth()) + parseInt(1))).slice(-2)+'-'+("0" +date.getDate()).slice(-2)+'T00:00:00.000Z');
    db.select_detail_by_condition('investors',{next_payment_date:{$lt:current_date}},function(result){
      console.log(result);
      res.render('due-payment',{req:req,investors_deatils:result});
    });
  });
}

exports.save_token=(req,res,next)=>{
  if(req.session.admin_id){
    if(req.body.token){
      db.update_detail_by_condition('admin',{_id:req.session.admin_id},{browser_token:req.body.token},function(result){
        res.end();
      });
    }else{
      res.end();
    }
  }else{
    res.end();
  }
}

exports.remainder=(req,res,next)=>{
  var date=new Date();
    let current_date = new Date(date.getFullYear()+'-'+("0" +(parseInt(date.getMonth()) + parseInt(1))).slice(-2)+'-'+("0" +date.getDate()).slice(-2)+'T00:00:00.000Z');
    let next_date= new Date(date.getFullYear()+'-'+("0" +(parseInt(date.getMonth()) + parseInt(1))).slice(-2)+'-'+("0" +date.getDate()).slice(-2)+'T00:00:00.000Z');
    next_date.setDate(next_date.getDate() + 3);
    db.select_detail_by_condition('investors',{$and: [{next_payment_date:{$gte:current_date}},{next_payment_date:{$lte:next_date}}]},function(result){
      if(result.length>0){
        db.select_detail_by_condition('admin',{$and:[{status:1},{admin_type:2},{$ne:{browser_token:''}}]},function(result1){
          if(result1.length>0){
            var ids=[],i=0;
            result1.forEach(function(admin_deatil){
              ids[i++]=admin_deatil.browser_token;
            });
            var message={
              title:"Upcoming Payment",
              body:"new upcoming payment",
              noti_type:1
            }
            helper.send_push_messge(ids,message);
          }
        })
      }
    });

    db.select_detail_by_condition('investors',{next_payment_date:{$lt:current_date}},function(result){
      if(result.length>0){
        db.select_detail_by_condition('admin',{$and:[{status:1},{admin_type:1},{browser_token:{$ne:''}}]},function(result1){
          if(result1.length>0){
            var ids=[],i=0;
            result1.forEach(function(admin_deatil){
              ids[i++]=admin_deatil.browser_token;
            });
            var message={
              title:"due Payment",
              body:"new due payment",
              noti_type:2
            }
            helper.send_push_messge(ids,message);
          }
        })
      }
    });
    res.end();
}
exports.test=(req,res,next)=>{
  helper.send_push_messge();
  res.end();
}