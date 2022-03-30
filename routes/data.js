const { onlyLogged } = require('../middlewares/onlyLogged')
const { Accounts } = require('../mongo/account-model')
const { Logs } = require('../mongo/logs-model')

const router = require('express').Router()


/**
 * @openapi
 * /api/data/history:
 *   get:
 *     description: returns account's actions history.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: ok.
 *       401:
 *         description: please log in.
 */
router.get('/history', onlyLogged, async (req, res) => {
    try {
        const account = await Accounts.findById(req.session.account.id).populate({
            path: 'actions.to',
            select: 'username'
        }).populate({
            path: 'actions.from',
            select: 'username'
        })
        res.send({ history: account.actions, balance: account.balance })
    } catch (err) {
        res.sendStatus(500)
        console.log(err)
    }
})

/**
 * @openapi
 * /api/data/accounts:
 *   get:
 *     description: returns accounts search results.
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: ok.
 *       401:
 *         description: please log in.
 */
router.get('/accounts', onlyLogged, async (req, res) => {
    try {
        const accounts = await Accounts.find({}, { username: 1 })
        res.send(accounts)
    } catch (err) {
        res.sendStatus(500)
        console.log(err)
    }
})

/**
 * @openapi
 * /api/data/logs:
 *   get:
 *     description: returns visit and actions log of all accounts.
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: ok.
 *       401:
 *         description: please log in.
 */
router.get('/logs', onlyLogged, async (req, res) => {
    try {
        const logs = await Logs.find({})
        res.send(logs)
    } catch (err) {
        res.sendStatus(500)
        console.log(err)
    }
})

module.exports = router