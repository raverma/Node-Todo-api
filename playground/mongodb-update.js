//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err){
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connect to MongoDB server');

   //deleteMany
    // db.collection('Todos').deleteMany({text: 'Eat Dinner'}).then((result)=>{
    //     console.log(result);
    // });

   //delete One
    // db.collection('Todos').deleteOne({text: 'Eat Dinner'}).then((result)=>{
    //     console.log(result);
    // });

   //Find one and Delete
    db.collection('Todos').findOneAndUpdate({_id: ObjectID('5bf403e3ab5bfc3158d7ccb8')},
    {text:"Do meeting", completed: false},{returnOriginal:false}).then((result)=>{
    console.log(result);
    });
    //db.close();
});