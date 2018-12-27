var env = process.env.NODE_ENV || 'development';
console.log('env ==', env);

if (env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
const _ = require('lodash');

const {SHA256} = require('crypto-js');
const bcrypt = require('bcryptjs');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var port = process.env.PORT || 3000; 

// var todoObj = new Todo({
//     text: 'Walk the dog'
// });

// todoObj.save().then((doc)=> {
//     console.log('Todo Saved',doc);
// }, (e)=>{
//     console.log('Unable to save ToDo', e);
// });


// var userObj = new User({
//     firstName: 'Bill',
//     lastName: 'Gates',
//     email: '  BillGates@gmail.com'
// })

// userObj.save().then((doc)=> {
//     console.log('User Saved',doc);
// }, (e)=>{
//     console.log('Unable to save User', e);
// });


var app = express();

app.use(bodyParser.json());

//create a middleware function
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    
        User.findByToken(token).then((user)=>{
            if (!user){
                res.status(404).send();
            }
            //res.send(user);
            req.user = user;
            req.token = token;
            next();
        }).catch((err)=>{
            res.status(401).send(err);
        });
};


app.post('/todos', authenticate, (req, res)=> {
    var todoObj = new Todo({
        text: req.body.text,
        _createdBy: req.user._id
    });

    todoObj.save().then((doc)=> {
        res.send(doc);
    }, (e)=>{
        res.status(400).send(e);
        //console.log('Unable to save ToDo', e);
    });
    console.log(req.body);
});

app.get('/todos',authenticate, (req, res)=> {
    Todo.find({
        _createdBy: req.user._id
    }).then((todos)=>{
        res.send({todos});

    },(e)=> {
        res.status(400).send(e);
    });
});

app.get('/users', (req,res)=> {
    User.find().then((users)=>{
        res.send({users});
    })
}, (e)=>{
    res.status(400).send(e);
});


app.get('/todos/:id',authenticate, (req,res)=>{
    var id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(404).send({error:'Invalid Object Id'});
    }

    Todo.findOne({
        _id: id,
        _createdBy: req.user._id
    }).then((todo)=>{
        if (!todo){
            return res.status(404).send('Id not found');
        }
        res.send(todo);
        //console.log('Todos', todo);
    },(e)=>{
        res.status(400).send(e);
    });
})

app.delete('/todos/:id', authenticate, async (req, res)=> {
    var id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(400).send({error: 'Invalid Object Id'});
    }

    try {
        var todo = await Todo.findOneAndRemove({
            _id: id,
            _createdBy: req.user._id
        });
        if (!todo){
            return res.status(404).send({message: 'This todo does not exist'});
        }
        res.send(todo);
    } catch (err) {
        return res.status(500).send(err);
    }
 
//**** rewritten above using async await ****
    // Todo.findOneAndRemove({
    //     _id: id,
    //     _createdBy: req.user._id
    // }).then((todo)=>{
    //     if (!todo){
    //         return res.status(404).send({message: 'This todo does not exist'});
    //     }
    //     res.send(todo);
        
    // }, (err)=>{
    //     return res.status(500).send(err);
    // });
});

app.patch('/todos/:id', authenticate, (req, res)=> {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } 
    else{
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({
            _id: id, 
            _createdBy: req.user._id
        }, {$set: body}, {new: true}).then((todo)=>{
        if (!todo){
            return res.status(404).send();
        }
        
        res.send({todo});

    }, (err)=>{
        res.status(400).send(err);
    });
});

// POST /users
app.post('/users',async (req, res)=>{
    try {
        var body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
        var newUser = new User(body);
        await newUser.save();
        var token = await newUser.generateAuthToken();
        res.header('x-auth', token).send(newUser);
    }catch (err) {
        res.status(400).send(err);
    }
//**** rewritten above using async await ****
    // newUser.save().then(()=>{
    //     return newUser.generateAuthToken();
    //     //res.status(200).send(user);
    // }).then((token) => {
    //     res.header('x-auth', token).send(newUser);
    // }).catch((err)=>{
    //     res.status(400).send(err);
    // });

});


//use middleware function in below get
app.get('/users/me', authenticate, (req, res)=> {
    // var token = req.header('x-auth');

    // User.findByToken(token).then((user)=>{
    //     if (!user){
    //         res.status(404).send();
    //     }
    //     res.send(user);
    // }).catch((err)=>{
    //     res.status(401).send(err);
    // });

    res.send(req.user);
});

app.post('/users/login', async (req, res)=>{
    
    
    // User.findOne({email: body.email}).then((user)=>{
    //     if (!user){
    //         return res.status(404).send('Invalid email or email does not exist'); 
    //     }

    //     bcrypt.genSalt(10, (err, salt)=> {
    //         bcrypt.hash(password,salt, (err,hash)=>{
    //             console.log(hash);
    //         });
    //         console.log(password);
    //     });
    // });
    try {
        const  body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth',token).send(user);
    
    }catch (e) {
        res.status(400).send(e);
    }
    //**** rewritten above using async await ****
    // const  body = _.pick(req.body, ['email', 'password']);
    // User.findByCredentials(body.email, body.password).then((user)=>{
    //     //res.send(user);
    //     return user.generateAuthToken().then((token)=>{
    //         res.header('x-auth',token).send(user);
    //     });
        
    // }).catch((e)=> {
    //     res.status(400).send(e);
    // });
});

app.delete('/users/me/token', authenticate, async (req, res)=> {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    }catch (e){
        res.status(400).send();
    }
//**** rewritten above using async await ****
    // req.user.removeToken(req.token).then(() =>{
    //     res.status(200).send();
    // }, ()=>{
    //     res.status(400).send();
    // });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});


module.exports = {app};