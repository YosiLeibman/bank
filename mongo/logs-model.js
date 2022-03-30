const { Schema, model } = require('mongoose')

const logSchema = new Schema({
    method: String,
    url: String,
    timestemp: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        default: 'Unknown'
    }
})

module.exports.Logs = model('log', logSchema)