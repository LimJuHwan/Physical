var express = require('express');
var http = require('http');
var static = require('serve-static');
var path= require('path');
var fs = require('fs');
var parse = require('csv-parse')


var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var expressErrorHandler = require('express-error-handler');

//mongodb 모듈 사용
var MongoClient = require('mongodb').MongoClient;

var mongoose = require('mongoose');

var app = express();

app.set('port',process.env.PORT || 3000);
app.use('/public',static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));


var inputPath = 'data3.csv'
var x=new Array();
var y=new Array();



fs.readFile(inputPath, function (err, fileData) {
     parse(fileData, {columns: false, trim: true}, function(err, rows) {
         for(var i=0; i<2; i++){
             for(var j=0; j<rows.length; j++){
                console.log(rows[j][i])
                 if(i==0) x[j]=rows[j][i];
                 else y[j]=rows[j][i];
            }
        }
        console.log(x);
     })
 })








//'mongodb+srv://Lim:123@cluster0-xpwsf.mongodb.net/test?retryWrites=true&w=majority';

var db; // 연결 받아올 변수(중요)
 //"mongodb+srv://Lim:123@cluster0-xpwsf.mongodb.net/test?retryWrites=true&w=majority"





function connectDB() {
    var databaseUrl = "mongodb://Lim:123@cluster0-shard-00-00-xpwsf.mongodb.net:27017,cluster0-shard-00-01-xpwsf.mongodb.net:27017,cluster0-shard-00-02-xpwsf.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
    var client = new MongoClient(databaseUrl, { useNewUrlParser: true }); 
    client.connect(function(err, database) {
        if(err) {
            console.log('err');
            return;
        }
        
        console.log('데이터베이스에 연결됨: '+databaseUrl);
        db=database.db('test'); /*database명을 명시했다.*/
    });
}


var router = express.Router();

router.route('/process/login').post(function(req,res){
    console.log('/process/login 라우팅 함수 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : ' + paramId + ' , ' + paramPassword);
    
    if(db){
        authUser(db,paramId,paramPassword, function(err, docs){
            if(err) {
                console.log('에러 발생');
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>에러 발생 </h1>');
                res.end();
                return;
            }
            if(docs){
                console.dir(docs);
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>사용자 로그인 성공 </h1>');
                res.write('<div><p>사용자 : ' + docs[0].name + '</p></div>');
                res.write('<br><br><a href ="/public/login.html">다시 로그인하기</a>')
                res.end();
            }
            else{
                console.log('에러 발생');
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>사용자 데이터 조회 안됨.</h1>');
                res.end();
            }
            
        });
    }
    else{
        console.log('에러 발생');
        res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        res.write('<h1>데이터 베이스 연결 안됨.</h1>');
        res.end();
    }
    
});


router.route('/process/adduser').post(function(req,res){
    console.log('/process/adduser 라우팅 함수 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    
    console.log('요청 파라미터 : ' + paramId + ' , ' + paramPassword + ', ' + paramName);
    
    if(db){
        addUser(db,paramId,paramPassword,paramName,function(err,result){
            if(err){
                console.log('에러 발생');
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>에러 발생 </h1>');
                res.end();
                return;
            }
            
            if (result){
                console.dir(result);
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>사용자 추가 성공 </h1>');
                res.write('<div><p>사용자 : ' + paramName + '</p></div>');
                res.end();
            }
            else{
                console.log('에러 발생');
                res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                res.write('<h1>사용자 추가 안됨.</h1>');
                res.end();
            }
        })
    }
    else{
        console.log('에러 발생');
        res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        res.write('<h1>데이터 베이스 연결 안됨.</h1>');
        res.end();
    }
});


app.use('/',router);


var authUser = function(database,id,password,callback){
    console.log('authUser 호출됨 : ' + id + ', ' + password);
    
    var users = database.collection('users');
    
    users.find({"id":id,"password":password}).toArray(function(err,docs) {
        if (err) {
            callback(err,null);
            return;
        }
        
        if(docs.length > 0) {
            console.log('일치하는 사용자를 찾음.');
            callback(null,docs);
        }
        else{
            console.log('일치하는 사용자를 찾지 못함');
            callback(null,null);
        }
    });
}

var addUser = function(db,id,password,name,callback){
    console.log('addUser 호출됨 : ' + id + ' , ' + password + ' ,' + name);
    
    var users = db.collection('users');
    
    users.insertMany([{"id":id,"password":password,"name":name}],function(err,result){
        if(err){
            callback(err,null);
            return;
        }
        
        if(result.insertedCount > 0){
            console.log('사용자 추가됨 : ' + result.insertedCount);
            callback(null,result);
        }
        else{
            console.log('추가된 레코드가 없음.');
            callback(null,null);
        }
    })
};



// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404' : './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );





var server = http.createServer(app).listen(app.get('port'),function(req,res){
    console.log('익스프레스로 웹 서버를 실행함 : ' +app.get('port'));
    
});

