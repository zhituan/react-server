/*1. 连接数据库*/
 // 1.1. 引入mongoose
const mongoose = require('mongoose')
const md5 =require('blueimp-md5')
 // 1.2. 连接指定数据库(URL只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/gzhipin_test')
 // 1.3. 获取连接对象
const conn = mongoose.connection
//  1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected',function(){
    console.log('数据库连接成功')
})
/* 2. 得到对应特定集合的Model*/
  // 2.1. 字义Schema(描述文档结构)
const userSchema = mongoose.Schema({
    username:{type:String,required:true},
    password: {type: String, required: true}, // 密码
    type: {type: String, required: true}, // 用户类型: dashen/laoban
})
  // 2.2. 定义Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('user',userSchema)
/*3. 通过Model或其实例对集合数据进行CRUD操作*/
// 3.1. 通过Model实例的save()添加数据
function testSave() {
  const userModel = new UserModel({
      username : 'Bob',
      password:md5('123'),
      type:'dashen'
  })
    userModel.save(function (err,user) {
        console.log('save()',err,user)
    })

}
//testSave()
// 3.2. 通过Model的find()/findOne()查询多个或一个数据
function testFind() {
    UserModel.find({_id:'5ae3df9d0d3db1176028a5a4'},function(err,users){
        console.log('find()',err,users)
    })
    UserModel.findOne({_id:'5ae3df9d0d3db1176028a5a4'},function (err,user) {
      console.log('findone()',err,user)
    })
}
//testFind()
// 3.3. 通过Model的findByIdAndUpdate()更新某个数据
function testUpdate() {
    UserModel.findByIdAndUpdate({_id:'5ae3df9d0d3db1176028a5a4'},{username:'xxx'},
        function (err,olduser) {
          console.log('findByIdAndUpdate()',err,olduser)
        })
}
//testUpdate()
// 3.4. 通过Model的remove()删除匹配的数据
function testRemove() {
    UserModel.remove({_id:'5ae3df9d0d3db1176028a5a4'},function(err,result){
        console.log('remove()',err,result)
    })
}
testRemove()