const { connect } = require('mongoose')

module.exports.connectToMongo = async (req, res) => {
    try {
        await connect('mongodb://localhost/bank')
        console.log("connected to MongoDB")
    } catch (err) {
        console.log(err)
    }
}

