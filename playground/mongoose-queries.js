const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5bf7a14961480a0c3d246d1e';

Todo.find({
    _id: id
}).then((todos)=>{
    console.log('Todos', todos);
});

Todo.findOne({
    _id: id
}).then((todo)=>{
    if (!todo){
        return console.log('Id not found');
    }
    console.log('Todos', todo);
});

var userId = '5bf7aaf9e8b29bac506dffb0';

User.findById(userId).then((user)=>{
    if (!user){
        return console.log('User not found');
    }
    return console.log('User by Id',user);
}).catch((err)=>{
    console.log(err);
});