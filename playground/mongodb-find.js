//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err){
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connect to MongoDB server');

    db.collection('Todos').find().toArray().then((docs)=>{
        console.log('Todos');
        console.log(JSON.stringify(docs,undefined, 2));
    }, (err)=> {
        console.log('Unable to fetch Todos', err);
    });

    // db.collection('Users').find({_id: new ObjectID('5bf3dfe153d10b14a44a4f34')}).toArray().then((docs)=>{
    //     console.log('Users');
    //     console.log(JSON.stringify(docs,undefined, 2));
    // }, (err)=> {
    //     console.log('Unable to fetch Users', err);
    // });
    //db.close();
});