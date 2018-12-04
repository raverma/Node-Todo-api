//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

// var user = {name: 'Rahul', age:44};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err){
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connect to MongoDB server');

    db.collection('Todos').insertOne({
        text: 'Eat Lunch',
        completed: true
    }, (err,result) => {
        if (err){
            return console.log('Inable to insert todo', err);
        }

        console.log(JSON.stringify(result.ops,undefined,2));
    });


    // db.collection('Users').insertOne({
    //     name: 'Tarun',
    //     age: 43,
    //     location: 'Bangalore'
    // }, (err,result) => {
    //     if (err){ 
    //         return console.log('Unable to insert user', err);
    //     }

    //     console.log(JSON.stringify(result, undefined, 2));
    // });
    db.close();
});