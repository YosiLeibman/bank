const { Schema, model } = require('mongoose')

const actionsSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: false
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const accountSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 500
    },
    credit: {
        type: Boolean,
        default: true
    },
    actions: [actionsSchema]
})

module.exports.Accounts = model('account', accountSchema)