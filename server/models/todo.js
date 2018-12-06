
var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minLength: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },

    _createdBy: {
        type: mongoose.Schema.ObjectId,
        require: true
    }
});

module.exports = {Todo};