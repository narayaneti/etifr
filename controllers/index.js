const { Validator } = require('node-input-validator');
const db=require('../middleware/index');
const helper=require('../helper/index');
const bcrypt = require('bcrypt');
const saltRounds = 11;
const rn = require('random-number');
var formidable = require('formidable');
var fs = require('fs')


function data_encript(data){
  return bcrypt.hashSync(data, saltRounds);
}

function data_decript(data,hash){
  return bcrypt.compareSync(data, hash);
}

function enter(req,res) {
  if(!req.session.admin_id){
    res.redirect('/');
  }
}

exports.index=function(req, res, next) {
    res.render('login'); 
}

exports.login=function(req,res,next){
    const v = new Validator(req.body, {
        mobile: 'required|integer',
        password: 'required|string'
      });
      v.check().then((matched) => {
        if (!matched) {
          res.render('login',{errors:v.errors});
        }
      });
      var query = { mobile: req.body.mobile };
      db.select_one_detail_by_condition('admin',query,function(result){
            if(result){
                if(data_decript(req.body.password,result.password)){
                  req.session.admin_id=result._id;
                  if(result.password_change==0){
                    res.redirect('/first-password-change');
                  }else{
                    res.redirect('/dashboard');
                  }
                }else{
                    res.render('login',{errors:{password:{message:"Invalid password!"}}});
                }
                
            }else{
                var err={mobile:{message:"Mobile Number not register"}};
                res.render('login',{errors:err});
            }
      });
}

exports.forgot_password=function(req,res,next){
  if(req.method=='GET'){
    res.render('forgot-password');
  }else{
    const v = new Validator(req.body, {
      mobile: 'required|integer',
    });
    v.check().then((matched) => {
      if (!matched) {
        res.render('forgot-password',{errors:v.errors});
      }
    });
    var query = { mobile: req.body.mobile };
    db.select_one_detail_by_condition('admin',query,function(user_detail){
      if(user_detail.length > 0){
        var mobile=req.body.mobile;
        //var otp=rn({min:1000,max:9999,integer: true});
        var otp=1111;
        helper.send_otp(otp,mobile,function(resp){
          req.session.forgot_password={mobile:mobile,otp:otp};
          res.redirect('/forgot-password-change');
        });
        
      }else{
        var err={mobile:{message:"Mobile Number not register"}};
        res.render('forgot-password',{errors:err});
      }
    });
  }
}

exports.forgot_password_change=(req,res,next)=>{
  if(req.method=='GET'){
    if(req.session.forgot_password){
      res.render('forgot-password-change');
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
        res.render('forgot-password-change',{errors:v.errors});
      }else{
        var forgot_password=req.session.forgot_password;
        if(forgot_password.otp==req.body.otp){
          var password=data_encript(req.body.password);
          db.update_detail_by_condition('admin',{ mobile:forgot_password.mobile },{password:password},function(result) {
            delete req.session.forgot_password;
            res.redirect('/');
          })
        }else{
          var err={otp:{message:"OTP not match."}};
          res.render('forgot-password-change',{errors:err});
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
  enter(req,res);
  db.table_data_count(['admin','investors'],function (result) {
    console.log(result);
    res.render('dashboard',{count:result});
  })
  
}

exports.add_new_admin=(req,res,next)=>{
  //enter(req,res);
  if(req.method=='GET'){
    res.render('add-new-admin');
  }else{
    const v = new Validator(req.body, {
      name: 'required|string',
      employee_id: 'required|string',
      mobile: 'required|string',
      designation: 'required|string'
    });
    v.check().then((matched) => {
      if (!matched) {
        console.log(v);
        res.render('add-new-admin',{errors:v.errors});
      }else{
        db.select_one_detail_by_condition('admin',{mobile:req.body.mobile},function (result){
          if(result){
            var err={mobile:{message:"Mobile Number alrady register"}};
            res.render('add-new-admin',{errors:err});
          }else{
            var query={
              name:req.body.name,
              mobile:req.body.mobile,
              employee_id:req.body.employee_id,
              designation:req.body.designation,
              insert_admin_id:req.session.admin_id,
              password:data_encript('Aa@1'),
              admin_type:1
            }
            db.insert_data('admin',query,function (result) {
              console.log(result);
              var err={mobile:{message:"Admin added successfully"}};
              res.render('add-new-admin',{messages:err});
            });
          }
        });
      }
    });
  }
}

exports.admin_list=(req,res,next)=>{
  enter(req,res);
  console.log(req.params)
  if(req.params.action && req.params.id){
    var query={};
    if(req.params.action=='deactivate'){
      query.status=2;
    }else if(req.params.action=='activate'){
      query.status=2;
    }else if(req.params.action=='delete'){
      query.status=0;
    }
    if(query){
      console.log('hello');
      db.update_detail_by_condition('admin',{_id:req.params.id},query,function(result){
        console.log(result);
        db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
          res.render('admin-list',{admin_deatils:result});
        });
      });
    }else{
      console.log('hello1');
      db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
        res.render('admin-list',{admin_deatils:result});
      });
    }
  }else{
    console.log('hello2');
    db.select_detail_by_condition('admin',{status:{ $ne: 0 },_id:{ $ne: req.session.admin_id }},function(result){
      res.render('admin-list',{admin_deatils:result});
    });
  }
}

exports.add_new_investors=(req,res,next)=>{
  enter(req,res);
  if(req.method=='GET'){
    res.render('add-new-investors');
  }else{
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      console.log(files);
      if(files.pan_card_copy.size==0){
        var err={pan_card:{message:"pan card copy required!"}};
        res.render('add-new-investors',{errors:err});
      }else{
        if (!files.pan_card_copy.name.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
          var err={pan_card:{message:"Only jpg/jpge/png files are allowed!"}};
          res.render('add-new-investors',{errors:err});
        }else{
          var oldpath = files.pan_card_copy.path;
          var image_name=rn(54,100000)+files.pan_card_copy.name;
          var newpath = 'investors/pan_card/'+image_name;
          
            const v = new Validator(fields, {
              investor_name: 'required|string',
              investor_mobile: 'required|string',
              investor_address: 'required|string',
              invested_amount: 'required|string', 
              rate_of_interest: 'required|string',
              tenure_period_of_investment_month: 'required|string',
              tenure_period_of_investment_year: 'required|string',
              interest_pay_out_frequencies: 'required|string',
              interest_amount_to_be_paid_in_each_interval: 'required|string',
              investor_account_no: 'required|string',
              account_ifsc_code: 'required|string',
              pan_card_no: 'required|string',
            });
            v.check().then((matched) => {
              if (!matched) {
                res.render('add-new-investors',{errors:v.errors});
              }else{
                fs.copyFile(oldpath, newpath, function (err) {
                  if (err) throw err;
                  fields.pan_card_copy=image_name;
                  fields.insert_admin_id=req.session.admin_id;
                  db.insert_data('investors',fields,function(result) {
                    var messages={pan_card:{message:"success"}};
                    res.render('add-new-investors',{messages:messages});
                  })
                  
                });
              }
            });
        }
      }
    })
      
  }
} 

exports.investors_list=(req,res,next)=>{
  enter(req,res);
  db.select_detail_by_condition('investors',{status:{ $ne: 0 }},function(result){
    res.render('investors-list',{investors_deatils:result});
  });
}

exports.edit_investors=(req,res,next)=>{
  //enter(req,res);
  if(req.params.id){
    db.select_one_detail_by_condition('investors',{_id:req.params.id},function(result) {
      if(result){
        if(req.method=='GET'){
          res.render('edit-investors',{investors_deatil:result});
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
              res.render('edit-investors',{errors:v.errors,investors_deatil:result});
            }else{
              db.update_detail_by_condition('investors',{_id:req.params.id},req.body,function(resu) {
                var messages={pan_card:{message:"update successfully!"}};
                res.render('edit-investors',{messages:messages,investors_deatil:result});
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
}

exports.first_password_change=(req,res,next)=>{
  enter(req,res);
  if(req.method=='GET'){
    res.render('first-password-change');
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
        res.render('first-password-change',{errors:v.errors});
      }else{
        var password=data_encript(req.body.password);
          db.update_detail_by_condition('admin',{ _id:req.session.admin_id },{password:password,password_change:1},function(result) {
            delete req.session.forgot_password;
            res.redirect('/dashboard');
          });
      }
    });
  }
}

exports.profile=(req,res,next)=>{
  enter(req,res);
  db.select_detail_by_condition('admin',{_id:req.session.admin_id},function(result){
    if(result.length>0){
      res.render('profile',{user:result[0]}); 
    }else{
      req.session.destroy;
      res.redirect('/');
    }
  });
}