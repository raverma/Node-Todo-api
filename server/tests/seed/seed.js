const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();

// create dummy todos
const dummytodos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _createdBy: userOneId
}, {
    _id : new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 1233,
    _createdBy: userTwoId
}];





const dummyUsers = [{
    _id: userOneId,
    firstName: 'User',
    lastName: 'One',
    email: 'user1@test.com',
    password: 'user1@123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId,access: 'auth' }, 'abc123').toString()
    }       
    ]
},{
    _id: userTwoId,
    firstName: 'User',
    lastName: 'Two',
    email: 'user2@test.com',
    password: 'user2@123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId,access: 'auth' }, 'abc123').toString()
    }       
    ]
}]

//remove all Todos from db first
const populateTodos = (done)=> {
    Todo.remove({}).then(()=>{
        return Todo.insertMany(dummytodos);
    }).then(()=>done());
}

const populateUsers = (done)=> {
    User.remove({}).then(()=>{
        var userOne = new User(dummyUsers[0]).save();
        var userTwo = new User(dummyUsers[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(()=> done());
}
module.exports = {dummytodos, dummyUsers, populateTodos, populateUsers}