const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {dummytodos, dummyUsers, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);



describe('POST /todos', () => {
    it('should create a new todo', (done)=> {
        var text = 'Test todo text';


        request(app)
            .post('/todos')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err, res)=>{
                if (err) {
                    return done(err);
                }

                //the is to test database
                Todo.find({text}).then((todos)=> {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e)=> done(e));
            })
    });

    it('should not create todo with invalid body data',(done)=>{

        request(app)
            .post('/todos')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res)=>{
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos)=> {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e)=> done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos associated with the user', (done)=>{
        request(app)
            .get('/todos')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                //expect(res.body.todos.length).toBe(2);
                //this will be now 1 because of authentication
                expect(res.body.todos.length).toBe(1); 
            })
            .end(done);
    });
});


describe('GET /todos/id', ()=>{
    it('should get the todo with id', (done)=>{
        request(app)
            .get(`/todos/${dummytodos[0]._id.toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(dummytodos[0].text);
            })
            .end(done);
    });

    it('should not get the todo created by other id', (done)=>{
        request(app)
            .get(`/todos/${dummytodos[1]._id.toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if todo is not found', (done)=>{
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for a non valid todo id', (done)=>{
        request(app)
            .get('/todos/1234')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});


describe('DELETE /todos/id', ()=>{
    it('should not delete the todo for invalid id', (done)=>{
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .set('x-auth', dummyUsers[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should delete the todo with valid id', (done)=>{
        var toDeleteId = dummytodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${toDeleteId}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=> {
                expect(res.body.text).toBe('First test todo');
            })
           .end((err, res)=>{
               if (err){
                   return done(err);
               }

               Todo.findById(toDeleteId).then((todo)=> {
                  expect(todo).toNotExist();
                  done();
                }).catch((e)=>done(e));
           });
    });

    it('should not delete the todo with other id', (done)=>{
        var toDeleteId = dummytodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${toDeleteId}`)
            .set('x-auth', dummyUsers[1].tokens[0].token)
            .expect(404)
            .end((err, res)=>{
               if (err){
                   return done(err);
               }

               Todo.findById(toDeleteId).then((todo)=> {
                  expect(todo).toExist();
                  done();
                }).catch((e)=>done(e));
           });
    });
});

describe('PATCH /todo/id', ()=>{
    it('should update the todo with authenticated user', (done)=>{
        var toUpdateId = dummytodos[0]._id;
        var toUpdate = {text: 'First test todo updated', completed:true};
        request(app)
            .patch(`/todos/${toUpdateId}`)
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .send(toUpdate)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(toUpdate.text);
                expect(res.body.todo.completed).toBe(toUpdate.completed);
                expect(res.body.todo.completedAt).toBeA('number');
                //done();
            })
            .end(done);
   
    });

    it('should not update the todo with invalid user', (done)=>{
        var toUpdateId = dummytodos[0]._id;
        var toUpdate = {text: 'First test todo updated', completed:true};
        request(app)
            .patch(`/todos/${toUpdateId}`)
            .send(toUpdate)
            .set('x-auth', dummyUsers[1].tokens[0].token)
            .expect(404)
            .end(done);
   
    });

    it('should clear completedAt when todo is not completed',(done)=>{
        var toUpdateId = dummytodos[1]._id;
        var toUpdate = {text: 'Second test todo updated', completed:false};
        request(app)
            .patch(`/todos/${toUpdateId}`)
            .send(toUpdate)
            .set('x-auth', dummyUsers[1].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(toUpdate.text);
                expect(res.body.todo.completed).toBe(toUpdate.completed);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });
});

beforeEach(populateUsers);

describe('GET /users/me', () => {
    it('should return user if authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
                expect(res.body.email).toBe(dummyUsers[0].email);
            })
            .end(done);
    });

    it('should return a 401 if user not authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=> {
                expect(res.body).toEqual({});
            })
            .end(done);

    });
});

describe('POST /users', ()=>{
    it('should create a user', (done)=>{
        var fname = 'Rahul';
        var lname = 'Verma';
        var email = 'rv00426311@gmail.com';
        var password = "password!";

        request(app)
            .post('/users')
            .send({firstName: fname, lastName: lname, email: email, password: password})
            .expect(200)
            .expect((res)=> {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.firstName).toBe(fname);
                expect(res.body.lastName).toBe(lname);
                expect(res.body.email).toBe(email);
            })
            .end((err)=>{
                if (err){
                    return done(err);
                }
                User.findOne({email}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('should return validation errors if request is invalid', (done)=>{
        var fname = 'Rahul';
        var lname = 'Verma';
        var email = 'rv00426311$gmail.com';
        var password = "password!"; 
        request(app)
            .post('/users')
            .send({firstName: fname, lastName: lname, email: email, password: password})
            .expect(400)
            .end(done);

    });

    it('should not create a user if email already in use', (done)=>{
        var fname = 'Rahul';
        var lname = 'Verma';
        var email = dummyUsers[0].email;
        var password = "password!"; 
        request(app)
            .post('/users')
            .send({firstName: fname, lastName: lname, email: email, password: password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login',() => {
    it('should login user and return auth token', (done)=>{
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].email,
                password: dummyUsers[1].password
            })
            .expect(200)
            .expect((res)=> {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res)=>{
                if (err){
                    return done(err);
                }

                User.findById(dummyUsers[1]._id).then((user)=>{
                    //console.log(user);
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('should reject invalid login', (done)=>{
        request(app)
            .post('/users/login')
                .send({
                    email: dummyUsers[1].email,
                    password: 'pass123'
                })
                .expect(400)
                .expect((res)=> {
                    expect(res.headers['x-auth']).toNotExist();
                })
                .end((err, res)=>{
                    if (err){
                        return done(err);
                    }
    
                    User.findById(dummyUsers[1]._id).then((user)=>{
                        expect(user.tokens.length).toBe(1);
                        done();
                    }).catch((e)=>done(e));
                });
    });
});

describe('DELETE /users/me/token', () =>{
    it('should remove auth token on logout', (done)=>{
        request(app)
            .delete('/users/me/token')
                .set('x-auth', dummyUsers[0].tokens[0].token)
                .expect(200)
                .end((err, res)=>{
                    if (err){
                        return done(err);
                    }

                    User.findById(dummyUsers[0]._id).then((user)=>{
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch((e) => done(e));
                });
    });
});

