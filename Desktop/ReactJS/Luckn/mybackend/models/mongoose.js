const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
//const db=require('./config/config').get(process.env.NODE_ENV);
const confiq=require('../config/config').get(process.env.NODE_ENV);
const salt=10;

const userSchema=mongoose.Schema({
username:{
    type:String,
},
password:{
    type:String,   
},
token:{
    type: String
}
})

//to login
userSchema.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err){console.log(this.password); return cb(next);}
        cb(null,isMatch);
    });
}
console.log("from model/mongoose");

//const User=mongoose.model("User",userSchema)
//module.exports=User;
// to signup a user
userSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

//find by token
// find by token
userSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

// generate token

userSchema.methods.generateToken=function(cb){ 
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}


//delete token

userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}


module.exports = User = mongoose.model('user', userSchema)