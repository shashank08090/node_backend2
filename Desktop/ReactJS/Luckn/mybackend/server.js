const express = require('express');
const mongoose=require("mongoose");
const cookieParser=require('cookie-parser');
const db=require('./config/config').get(process.env.NODE_ENV);
const cors=require('cors');

const User=require('./models/mongoose');
const {auth} =require('./middlewares/auth');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

app.use(cors());

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/fckcap',
{ useNewUrlParser: true,useUnifiedTopology:true },
function(err){
    if(err) console.log(err);
    console.log("database is connected");
});



// adding new user (sign-up route)
app.post('/',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    console.log(newuser);
 
    
    
    User.findOne({username:newuser.username},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                succes:true,
                user : doc
            });
        });
    });
 });
 
//login
app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'username':req.body.username},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email,
                        msg:"Congratulations, you are logged in finnaly after a month"
                    });
                });    
            });
          });
        }
    });
});

//logout user
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 


app.listen(4000,()=>console.log("running on 4k"));