const exp = require('express')
const session = require('express-session')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { logger } = require('./middlewares/logger')
const { connectToMongo } = require('./mongo/config')

const app = exp()

connectToMongo()

app.use(session({
    secret: "BlAhbLaH",
    resave: false,
    saveUninitialized: true,
    name:'nothing-to-see-here'
}))

app.use(logger)

const openApiSpecs = swaggerJsdoc({
    definition:{
        openapi:"3.0.0",
        info:{
            description:"Bank API for creating accounts and taking actions like money transfer",
            title:"Open Bank API",
            version:'1.0.0',
        },
        tags:['Accounts', 'Actions','Data', 'Logs'],
    },
    apis:['./routes/*.js'],
})

app.use(exp.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecs))
app.use('/api/accounts', require('./routes/account'))
app.use('/api/actions', require('./routes/actions'))
app.use('/api/data', require('./routes/data'))

app.get('/', (req,res)=>res.redirect('/api/docs'))

app.listen(80, () => console.log("app runing"))