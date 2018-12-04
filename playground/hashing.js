const {SHA256} = require('crypto-js');

const bcrypt = require('bcryptjs');

var password = 'abc123!';

bcrypt.genSalt(10, (err, salt)=> {
    bcrypt.hash(password,salt, (err,hash)=>{
        console.log(hash);
    });
    console.log(password);
});
// var message = 'I am a user no 2';
// var message2 =  'I am a user no 3';
// var hash = SHA256(message).toString();
// var hash2 = SHA256(message2).toString();
// console.log(`message is ${hash}`);
// console.log(`messgae is ${hash2}`);
// console.log(hash === hash2);

// var data = {
//     id: 4
// }

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data)).toString()
// }

// var resultHash = SHA256(JSON.stringify(token.data)).toString();

// if (token.hash=== resultHash){
//     console.log('Data was not manipulated');
// }
// else
// {
//     console.log('Data was manipulated');
// }