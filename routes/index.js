var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');
const {UserModel , ChatModel} = require('../db/models');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
const filter = {password:0,__v:0};//查询时过滤出指定的属性
//注册路由
router.post('/register',function (req,res) {
  const {username,password,type} = req.body;
  console.log(username,password,type)
  UserModel.findOne({username},function (err,user) {
    if(user){
      res.send({code:1,msg:'此用户已存在'})
    }else{

      new UserModel({username,password:md5(password),type}).save(function (err,user) {
          // 生成一个cookie(userid: user._id), 并交给浏览器保存
          console.log('save()'+user)
       res.cookie('userid',user._id,{maxAge:1000*60*60*24})
          // 保存成功, 返回成功的响应数据: user
        res.send({code:0,data:{_id:user._id,username,type}})
      })
    }
  })
})
//登录路由
router.post('/login',function (req,res) {
  const {username , password} = req.body;
  //根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
    UserModel.findOne({username,password:md5(password)},filter,function(err,user){
      if(user){//说明用户存在，登录成功
          res.cookie('userid',user._id,{maxAge:1000*60*60*24})
          res.send({code:0,data:user})
      }else{
        res.send({code:1,msg:'用户名或密码错误'})
      }
    })

})

// 更新用户信息的路由
router.post('/update', function (req, res) {
    // 从请求的cookie得到userid
    const userid = req.cookies.userid
    // 如果不存在, 直接返回一个提示信息
    if(!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }
    // 存在, 根据userid更新对应的user文档数据
    // 得到提交的用户数据
    const user = req.body // 没有_id
    UserModel.findByIdAndUpdate({_id: userid}, user, function (error, oldUser) {

        if(!oldUser) {
            // 通知浏览器删除userid cookie
            res.clearCookie('userid')
            // 返回返回一个提示信息
            res.send({code: 1, msg: '请先登陆'})
        } else {
            // 准备一个返回的user数据对象
            const {_id, username, type} = oldUser
            const data = Object.assign({_id, username, type}, user)
            // 返回
            res.send({code: 0, data})
        }
    })
})

// 获取用户信息的路由(根据cookie中的userid)
router.get('/user', function (req, res) {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if(!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }
  // 根据userid查询对应的user
  UserModel.findOne({_id: userid}, filter, function (error, user) {
    res.send({code: 0, data: user})
  })
})
//根据type查看用户列表
router.get('/userlist',function (req,res) {
  const type = req.query.type
    UserModel.find({type} , filter ,function (err,users) {
        return res.send({code:0,data:users})
    })
})

//获取当前用户所有相关的聊天信息列表
router.get('/msglist',function (req,res) {
  //获取cookie中的userid
    const userid = req.cookies.userid
//    查询所有的user文档数据，获取的users是一个对象
    UserModel.find(function (err,userDocs) {
      const users = userDocs.reduce((users,user)=>{
            users[user._id] = {username: user.username, header: user.header}
            return users
        },{})
        ChatModel.find({'$or':[{from:userid},{to:userid}]},filter,function (err, chatMsgs) {
            res.send({code:0,data:{users , chatMsgs}})
        })
    })
    /*查询userid相关的所有聊天信息
        参数1: 查询条件
        参数2: 过滤条件
        参数3: 回调函数
    */

})
/*
修改指定消息为已读
 */
router.post('/readmsg',function (req,res) {
  //  得到请求中的from和to
  const from = req.body.from
    // 这个to的获取为什么直接从cookie中获取?
  const to = req.cookies.userid
   ChatModel.update({from , to , read:false} ,{read:true},{multi:true},function (err,doc) {
       console.log('/readmsg', doc)
       res.send({code: 0, data: doc.nModified}) // 更新的数量
   })
})

module.exports = router;
