const { hash, compare } = require('bcrypt')
const { onlyLogged } = require('../middlewares/onlyLogged')
const { Accounts } = require('../mongo/account-model')
const router = require('express').Router()

/**
 * @openapi
 * components:
 *   schemas:
 *     AccoountBody:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: name of the account owner
 *         password:
 *           type: string
 *           descripton: choose password to securly log into your account
 *       example:
 *         username: jo
 *         password: qwerty
 *
 */

/**
 * @openapi
 * /api/accounts/register:
 *   post:
 *     description: create new account.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccoountBody'
 *     responses:
 *       201:
 *         description: account created successfully.
 *       400:
 *         description: missing info in the request body.
 */
router.post('/register', async (req, res) => {

    const { username, password } = req.body

    try {
        const hashedPassword = await hash(password, 10)

        const accountToBeSaved = new Accounts({ username, password: hashedPassword })

        await accountToBeSaved.save()

        res.status(201).send({ msg: 'user added successfully' })

    } catch (err) {

        res.status(400)

        if (err.code == 11000) {

            res.send({ err: "username already taken" })

        } else {

            res.send({ err: "username and password are required" })

        }
    }

})


/**
 * @openapi
 * /api/accounts/login:
 *   post:
 *     description: log to your account.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccoountBody'
 *     responses:
 *       200:
 *         description: welcome to your account.
 *       400:
 *         description: missing info in the request body.
 *       401:
 *         description: wrong password.
 */
router.post('/login', async (req, res) => {

    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).send({ err: 'missing some info' })
        return
    }

    try {
        const account = await Accounts.findOne({ username: username })

        if (!account) {
            return res.status(400).send({ err: 'user not found' })
        }

        if (!await compare(password, account.password)) {
            return res.status(401).send({ err: 'wrong password' })
        }

        req.session.account = { username, id: account._id }

        res.send({ msg: 'logged successfully, welcome ' + username })

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

})


/**
 * @openapi
 * /api/accounts/logout:
 *   delete:
 *     description: log out of your account so other cannot use it.
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: bye bye.
 *       401:
 *         description: you need to log in in order to log out.
 */
router.delete('/logout', onlyLogged, (req, res) => {
    const name = req.session.account.username
    req.session.destroy()
    res.send({ msg: "bye bye " + name })
})


module.exports = router