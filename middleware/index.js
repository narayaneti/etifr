var MongoClient = require('mongoose');
// MongoClient.connect('mongodb://localhost:27017/eti_investment', { useUnifiedTopology: true, useNewUrlParser: true  });
MongoClient.connect('mongodb+srv://narayan727:Narayan@704@cluster0.5mp0z.mongodb.net/eti?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true  });
var conn=MongoClient.connection;

var adminschema=new MongoClient.Schema({ 
    mobile:Number,
    name:String,
    password:String,
    admin_type:String,
    status:{ type: Number, default: 1 },
    employee_id:String,
    designation:String,
    insert_admin_id:String,
    password_change:{ type: Number, default: 0 },
});

var investorsschema=new MongoClient.Schema({ 
    investor_mobile:Number,
    investor_name:String,
    investor_address:String,
    invested_amount:String,
    rate_of_interest:Number,
    tenure_period_of_investment_month:String,
    tenure_period_of_investment_year:String,
    interest_pay_out_frequencies:String,
    interest_amount_to_be_paid_in_each_interval:String,
    investor_account_no:String,
    account_ifsc_code:String,
    pan_card_no:String,
    pan_card_copy:String,
    insert_admin_id:String,
    date: { type: Date, default: Date.now },
    status:{ type: Number, default: 1 },
});
conn.on('connected',function(){
 console.log('connected');
});
conn.on('disconnected',function(){
 console.log('disconnected');
});
conn.on('error',console.error.bind(console,'Connection error:'));
exports.insert_data=(table,data,next)=>{
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    var data=new adminmodel(data);
    //conn.once('open',function () {
        data.save(function(err,res) {
            if(err) throw err;
            //conn.close();
            next(res);
        })
    //});
}
/*var MongoClienturl = "mongodb://localhost:27017/eti_investment";
var dbname="eti_investment";*/

exports.select_one_detail_by_condition=function(table,query,next){
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.findOne(query,function(err,data){
    if(err) throw err;
        next(data);
    })
}

exports.select_detail_by_condition=function(table,query,next){
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.find(query,function(err,data){
    if(err) throw err;
        next(data);
    })
}

exports.update_detail_by_condition=function(table,query,data,next){
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.updateOne(query, {$set:data},function (err,res) {
        if(err) throw err;
        next(res);
    })  
}

//conn.once('open',function () {
    /*data=new adminmodel({
        mobile:'9644774397',
        name:'Narayan Kumar Singh',
        password:'$2b$11$4VIkNP.BDMTwCaXUe7ADoODOEbTHZrkRkj08NZKcxD8p1imAjEPfS',
        admin_type:'1',
        status:1,
        employee_id:'abc',
        designation:'def',
        insert_admin_id:0,
        password_change:1,
    });
        data.save(function(err,res) {
            if(err) throw err;
            conn.close();
            console.log(res)
            //next(200);
        })*/
    
    //adminmodel.findOne({mobile:9644774397},function(err,data){
        //if(err) throw err;
        //console.log(data);
    //})
//});

