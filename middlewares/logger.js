const { Logs } = require("../mongo/logs-model")

module.exports.logger = async (req, res, next) => {
    try {
        const logToBeSaved = new Logs({
            method: req.method,
            url: req.url,
            username: req.session.account?.username
        })
        await logToBeSaved.save()
        next()
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}