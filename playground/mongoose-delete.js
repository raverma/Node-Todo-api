const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5bfba984b904b0a4417d6558';

Todo.find({
    _id: id
}).then((todos)=>{
    console.log('Todos', todos);
});

Todo.remove({}).then((res)=>{
    return console.log(res);
});

Todo.findOneAndRemove({
    _id: id
}).then((todo)=>{
    if (!todo){
        return console.log('Id not found');
    }
    console.log('Deleted Todos', todo);
});

