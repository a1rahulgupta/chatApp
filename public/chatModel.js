'use strict';

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var chatSchema = new mongoose.Schema({
    status: { type: Number, default: 1 },
    userName : { type: String, default: ''},
    roomCode: { type: String , default: ''},
    message: {type: String , default : ''},
}, {
        timestamps: true
});

var chatModel = mongoose.model('chatmodel', chatSchema);
module.exports = chatModel;

