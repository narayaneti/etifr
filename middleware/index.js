var MongoClient = require('mongoose');
// MongoClient.connect('mongodb://localhost:27017/eti_investment', { useUnifiedTopology: true, useNewUrlParser: true  });
MongoClient.connect('mongodb+srv://narayan727:Narayan@704@cluster0.5mp0z.mongodb.net/eti?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true  });
var conn=MongoClient.connection;

var adminschema=new MongoClient.Schema({ 
    mobile:Number,
    name:String,
    password:String,
    admin_type:String,
    browser_token:{ type: String, default: '' },
    status:{ type: Number, default: 1 },
    employee_id:String,
    designation:String,
    insert_admin_id:String,
    password_change:{ type: Number, default: 0 },
    date: { type: Date, default: Date.now },
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
    payment_day:Number,
    insert_admin_id:String,
    last_payment_date:{type:Date,default: ''},
    next_payment_date:{type:Date,default: Date.now},
    date: { type: Date, default: Date.now },
    status:{ type: Number, default: 1 }, 
});

var invested_paymentschema=new MongoClient.Schema({ 
    investor_id:Object,
    invoice_id:Number,
    bank_name:String,
    transaction_amount:Number,
    transaction_id:Number,
    transaction_date_time: Date,
    investor_account_no:Number,
    account_ifsc_code:String,
    pan_card_no:String,
    admin_id:Object,
    date: { type: Date, default: Date.now },
    status:{ type: Number, default: 1 },
});

var notificationschema=new MongoClient.Schema({ 
    title:String,
    body:String,
    noti_type:Number,
    admin_id:String,
    view:{ type:Number,default:0},
    date: { type: Date, default: Date.now },
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


exports.table_data_count=(tables,next)=>{
    var table_count=tables.length,i=0,count=[];
    tables.forEach(table => { 
        //var table+'model'='';
        global[table+'model']=MongoClient.model(table,eval(table+'schema'));
        Promise.all([
            eval(table+'model').countDocuments().exec()
        ]).then(function(counts) {
            count[tables[i++]]=counts[0];
            if(i>=table_count){
                next(count);
            }
        });
    })
    
}
 
exports.invoice_detail=(id,next)=>{
    var table='invested_payment';
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.aggregate([
        {$match:{_id:new MongoClient.Types.ObjectId(id)}},
        {
            $lookup:{
                from: "investors",
                localField: "investor_id",
                foreignField: "_id",
                as: "inventory_docs",
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$inventory_docs", 0 ] }, "$$ROOT" ] } }
         },
         
         { $project: { inventory_docs: 0 } }
    ],function (err,res) {
        if(err) throw err;
        next(res);
    });
    
}

exports.total_transaction_amount_if_the_condiction=(current_date,next_date,next)=>{
    var table='invested_payment';
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.aggregate([ 
        {$match:{$and: [{transaction_date_time:{$gte:current_date}},{transaction_date_time:{$lte:next_date}}]}},
        {
            $group:{
                _id: null,
                totalAmount:{ $sum:"$transaction_amount" }
            }
        }
    ],function (err,res) {
        if(err) throw err;
        next(res);
    });
}

exports.total_transaction_amount=(next)=>{
    var table='invested_payment';
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.aggregate([ 
        {
            $group:{
                _id: null,
                totalAmount:{ $sum:"$transaction_amount" }
            }
        }
    ],function (err,res) {
        if(err) throw err;
        next(res);
    });
}

exports.tran_detail=(next)=>{
    var table='invested_payment';
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.aggregate([
        {
            $lookup:{
                from: "investors",
                let: { investor_id:"$investor_id"},
                pipeline: [
                    { $match:
                        { $expr:
                           { $and:
                              [
                                { $eq: [ "$_id", "$$investor_id"] }
                              ]
                           }
                        }
                     },
                    { $project: { investor_name: 1, investor_mobile: 1,_id:0 } }
                ],
                as: "inventory_docs",
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$inventory_docs", 0 ] }, "$$ROOT" ] } }
         },
         
         { $project: { inventory_docs: 0 } },
         { $sort : { _id : -1 } }
    ],function (err,res) {
        if(err) throw err;
        next(res);
    });
    
}

exports.invester_list=(next)=>{
    var table='investors';
    const adminmodel=MongoClient.model(table,eval(table+'schema'));
    adminmodel.aggregate([
        {
            $lookup:{
                from: "invested_payments",
                localField: "_id",
                foreignField: "investor_id",
                as: "inventory_docs",
            },
        },
        { "$addFields": {
            "total_tran": { "$size": "$inventory_docs" }
        }},
        { $unset: "inventory_docs" }
    ],function (err,res) {
        if(err) throw err;
        next(res);
    });
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

