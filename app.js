var express = require('express');
var app = express();
var path=require('path');
var bodyparser=require('body-parser');
app.use(express.urlencoded({extended:true}));
var nodemailers=require('nodemailer');
var cons = require('consolidate');
var mysql=require("mysql");
var dotenv=require('dotenv').config();
var aesjs = require("aes-js");
var pbkdf2 = require("pbkdf2");

if(dotenv.error){
  throw dotenv.error;
}
var transporter = nodemailers.createTransport({
  host: "smtp.gmail.com",
  port:465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
var mysqlconnection=mysql.createConnection({
  host:process.env.HOST_NAME,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
});
mysqlconnection.connect(function(err){
  if(!err)
  console.log("DB Connection Successfull");
  else
  console.log("[mysql error]",err.message);
});
// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(__dirname + '/views'));
var router = express.Router();
var port=9000;
var decryptedMessage;
var key = pbkdf2.pbkdf2Sync("password", "salt", 5, 256 / 8, "sha512");
console.log(key);
app.get('/',function(req,res){
    res.render('home.html');
});
app.get('/login',function(req,res){
  res.render('login.html');
});
app.get('/signup',function(req,res){
  res.render('signup.html');
});
app.get('/forgotpassword',function(req,res){
  res.render('forgot_password.html');
});
app.post('/signup',function(req,res){
    var firstname=req.body.first;
    var lastname=req.body.last;
    var username=req.body.uid;
    var email=req.body.eid;
    var password=req.body.pass;
    var sql ="insert into users (firstname,lastname,username,email,password) values ('"+firstname+"','"+lastname+"','"+username+"','"+email+"','"+password+"')";
    mysqlconnection.query(sql,function(err,result){
      if(err) console.log(err.message);
      else{
        console.log("User Registered proceed to Login!!");
        res.redirect('login');
            }
    });
  });
  

  app.post('/login',function(req,res){
    var email=req.body.eid;
    var password=req.body.pass;
    var sql="select * from users where email='"+email+"';";
    mysqlconnection.query(sql,function(err,results,fields){
      if(err) throw err;
      if(results.length>0){
        if(results[0].password==password){
          app.get('/email',function(req,res){
            res.render('email.html');
          });
          console.log("Logged In Successfully.\nRedirecting you to Spam Mailer!!");
          res.redirect('/email');
        }
        else{
          console.log("Your Password does not match with Email ID: "+email);
          res.redirect('/forgotpassword');
        }
      }
        else{
          console.log("No User Found!! Please Sign Up!!\n Redirecting You to Sign Up Page!!");
            res.redirect('/signup');
        }
    });
    });


    app.post('/forgotpassword',function(req,res){
      var email=req.body.eid;
      var password=req.body.pass;
      var sql="select * from users where email='"+email+"';";
      mysqlconnection.query(sql,function(err,results,fields){
        if(err) throw err;
        if(results.length>0){
          if(results[0].email==email){
            var sql2="update users set password='"+password+"' where email='"+email+"';";
            mysqlconnection.query(sql2,function(err,result){
              if(err){ throw err;}
              else{
                console.log("Users Password Changed Successfully");
              res.redirect('/login');
              }
            });
          }
        }
      });
    });
    app.post('/sendmail',function(req,res){
      var emailfrom=req.body.emailfrom;
      var emailto=req.body.emailto;
      var subject=req.body.subject;
      var message=req.body.message;
      var noofmail=req.body.noofmail;
      // var key_128 = pbkdf2.pbkdf2Sync("sandy", "salt", 1, 256 / 8, "sha512");
          // var key_192 = pbkdf2.pbkdf2Sync("password", "salt", 1, 192 / 8, "sha512");
          var message=req.body.message;
          var text =''+message;
          var textBytes = aesjs.utils.utf8.toBytes(text);

          var aesCtr = new aesjs.ModeOfOperation.ctr(key);
          var encryptedBytes = aesCtr.encrypt(textBytes);

          var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
          // console.log(encryptedHex);
       
      var mailOptions = {
          from: ''+emailfrom,
          to: ''+emailto,
          subject: ''+subject,
          html: encryptedHex
          // '<p>'+encryptedHex+'<p><br>\n\nThe Message you received is Encrypted<br><br><a href=http://127.0.0.1:9000/decrypt.html>Click Here</a> to Decrypt it'
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } 
          else{
            console.log("\nEmail Sent From: "+emailfrom+"\nEmail Sent To: "+emailto);
          }
        });
      });
      app.post('/decryptmail',function(req,res){
         var encryptedHex=req.body.message;
          var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
          var aesCtr = new aesjs.ModeOfOperation.ctr(key);
          var decryptedBytes = aesCtr.decrypt(encryptedBytes);
          var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
          decryptedMessage=decryptedText;
          });

      app.post('/contact',function(req,res){
        var name=req.body.name;
        var email=req.body.eid;
        var phone=req.body.phone;
        console.log(name,email,phone);
        var sql="select * from newsletter where email='"+email+"';";
        mysqlconnection.query(sql,function(err,results,fields){
          if(err) throw err;
          if(results.length>0){
            if(results[0].email==email){
              console.log("User already Registered!!");
              var mailOptions = {
                from:'spammailer@spammailer.com',
                to: ''+email,
                subject: 'Subscribed Already',
                text: 'Hi '+name+' You have Already Subscribed to our newsletter @ SPAM MAILER'
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } 
                else{
                  console.log("\nEmail Sent To: "+email);
                }
            });
          }
          else
          {
            var sql5="insert into newsletter (email,name,phone) values ('"+email+"','"+name+"','"+phone+"')";
        mysqlconnection.query(sql5,function(err,results){
          if(err) throw err;
          console.log('User Subscribed to the Newsletter');
            var mailOptions = {
              from:'spammailer@spammailer.com',
              to: ''+email,
              subject: 'SPAM MAILER Subscription Done',
              text: "Hi "+name+" You have Subscribed to our newsletter @ SPAM MAILER.\n\tThank You for Subscribing to SPAM MAILER Newsletter\n\tYou will be Notified for\n\t1. New Updates on our Website\n\t2. Changelog of our Updates and much more..\n\n\t***VISIT Our Website and Use our SPAM MAILING service to SPAM your frined\'s EMAIL Accounts for fun!!😃😃😄\n\n\nDisclaimer:-\nOnly for  Fun!!!"
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              }
              else
              {
                console.log("\nEmail Sent To: "+email);
              }
        });
      });
    }
  }
  });
});
app.listen(port,function(){
    console.log("\nSite is hosted @ : http://localhost:"+port);
});
