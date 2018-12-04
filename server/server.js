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

app.post('/todos', (req, res)=> {
    var todoObj = new Todo({
        text: req.body.text
    });

    todoObj.save().then((doc)=> {
        res.send(doc);
    }, (e)=>{
        res.status(400).send(e);
        //console.log('Unable to save ToDo', e);
    });
    console.log(req.body);
});

app.get('/todos', (req, res)=> {
    Todo.find().then((todos)=>{
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


app.get('/todos/:id',(req,res)=>{
    var id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(404).send({error:'Invalid Object Id'});
    }

    Todo.findOne({
        _id: id
    }).then((todo)=>{
        if (!todo){
            return res.status(404).send('Id not found');
        }
        res.send(todo);
        console.log('Todos', todo);
    },(e)=>{
        res.status(400).send(e);
    });
})

app.delete('/todos/:id', (req, res)=> {
    var id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(400).send({error: 'Invalid Object Id'});
    }

    Todo.findOneAndRemove({
        _id: id
    }).then((todo)=>{
        if (!todo){
            return res.status(404).send({message: 'This todo does not exist'});
        }
        res.send(todo);
        
    }, (err)=>{
        return res.status(500).send(err);
    });
});

app.patch('/todos/:id', (req, res)=> {
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
    Todo.findByIdAndUpdate(id,{$set: body}, {new: true}).then((todo)=>{
        if (!todo){
            return res.status(404).send();
        }
        
        res.send({todo});

    }, (err)=>{
        res.status(400).send(err);
    });
});

// POST /users
app.post('/users',(req, res)=>{
   
    var body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
    var newUser = new User(body);
    
    newUser.save().then(()=>{
        return newUser.generateAuthToken();
        //res.status(200).send(user);
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((err)=>{
        res.status(400).send(err);
    });

});

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

app.post('/users/login', (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    
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
    User.findByCredentials(body.email, body.password).then((user)=>{
        //res.send(user);
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        });
        
    }).catch((e)=> {
        res.status(400).send(e);
    });
});

app.delete('/users/me/token', authenticate, (req, res)=> {
    req.user.removeToken(req.token).then(() =>{
        res.status(200).send();
    }, ()=>{
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});


module.exports = {app};