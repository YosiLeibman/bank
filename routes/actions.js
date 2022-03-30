const { onlyLogged } = require('../middlewares/onlyLogged')
const { Accounts } = require('../mongo/account-model')

const router = require('express').Router()


/**
 * @openapi
 * components:
 *   schemas:
 *     ActionBody:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *       properties:
 *         type:
 *           type: string
 *           description: type of the action taken, options - withwaral, deposit, transfer
 *         amount:
 *           type: number
 *           descripton: the amount of money involved in the action
 *         to:
 *           type: ObjectId
 *           descripton: optional, in case of transfer action
 *       example:
 *         type: deposit
 *         amount: 450
 *
 */

/**
 * @openapi
 * /api/actions/:
 *   post:
 *     description: create new action.
 *     tags: [Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActionBody'
 *     responses:
 *       200:
 *         description: action complited successfully.
 *       400:
 *         description: missing info in the request body or unknown account.
 */
router.post('/', onlyLogged, async (req, res) => {
    try {
        const { type, amount, to } = req.body

        if (!amount || amount <= 0) {
            return res.status(400).send({ err: 'invalid amount' })
        }

        const account = await Accounts.findById(req.session.account.id)

        switch (type) {
            case 'deposit':
                account.actions.push({ type, amount })
                account.balance = account.balance + amount
                break;
            case 'withrawal':
                if (!account.credit && account.balance - amount < 0) {
                    return res.status(400)
                        .send({ err: `your account is limited to debit only, please deposite at least $${Math.abs(account.balance - amount)} before trying again. ` })
                }
                account.actions.push({ type, amount })
                account.balance = account.balance - amount
                break;
            case 'transfer':
                if (!to) {
                    return res.status(400).send({ err: 'invalid destenation. please choose valive account' })
                }

                if (!account.credit && account.balance - amount <= 0) {
                    return res.status(400)
                        .send({ err: `your account is limited to debit only, please deposite at least $${Math.abs(account.balance - amount)} before trying again. ` })
                }

                account.actions.push({ type, amount, to })
                account.balance = account.balance - amount

                const reciver = await Accounts.findById(to)

                if (!reciver) {
                    return res.status(400).send({ err: 'invalid destenation. please choose valive account' })
                }
                reciver.actions.push({ type, amount, from: account._id })
                reciver.balance = reciver.balance + amount
                await reciver.save()
                break;

            default:
                return res.status(400).send({ err: 'invalid action type' })
        }
        await account.save()

        res.send({ msg: "action done" })

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router