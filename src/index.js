const express = require('express')
const cors = require('cors')
const port = 5000
const { signup, signin } = require('./controllers/user')
const { sign } = require('./controllers/jwt')

const api = express()
api.use(cors({origin: '*'}))
api.use(express.json())

const toTS = value => {
  return parseInt(new Date(value).getTime() / 1000)
}

api.post('/signup', async (req, res, next) => {
  signup(req.body)
  .then(user => res.json({result: sign(user, 'secret')}))
  .catch(error => next(error))
})

api.post('/signin', async (req, res, next) => {
  signin(req.body)
  .then(user => res.json({result: sign(user, 'secret')}))
  .catch(error => next(error))
})

api.use((err, req, res, next) => {
  if (err) res.json({error: err})
  else next()
})

api.listen(port, () => console.log('SSO server is running on port', port))