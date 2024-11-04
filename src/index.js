const express = require('express')
const cors = require('cors')
const port = 5000
const {createHash} = require('crypto')
const {isEmail, isStrongPassword, isAlphanumeric, isDate, escape, trim} = require('validator')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const select = {id: 1, email: 1, nickname: 1, birthday: 1, createdAt: 1, updatedAt: 1}

const api = express()
api.use(cors({origin: '*'}))
api.use(express.json())

api.post('/signup', async (req, res, next) => {
  const i = req.body
  const passOpts = {minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}
  if (!i.email) return next('Email is required')
  if (!i.password) return next('Password is required')
  if (!i.nickname) return next('Nickname is required')
  if (!i.birthday) return next('Birthday is required')
  if (!isEmail(i.email)) return next('Invalid email address')
  if (!isStrongPassword(i.password, passOpts)) 
    return next('Please choose a strong password. (Minimum 6 characters including uppercase, lowercase, numbers and symbols)')
  if (!isAlphanumeric(i.nickname, 'en-US', {ignore: ' '})) 
    return next('Invalid characters in nickname. (Characters, numbers and spaces only)')
  if (!isDate(i.birthday)) 
    return next('Invalid birthday. (YYYY/MM/DD format only)')
  const data = {
    email: i.email,
    password: createHash('sha256').update(i.password).digest('hex'),
    nickname: escape(trim(i.nickname)),
    birthday: i.birthday.replaceAll('/', '-')
  }
  const user = await prisma.user.create({data, select})
  res.json({result: user})
})

api.post('/signin', async (req, res, next) => {
  const i = req.body
  if (!isEmail(i.email)) return next('Invalid email address')
  const password = createHash('sha256').update(i.password).digest('hex')
  const where = {email: i.email, password}
  const user = await prisma.user.findUnique({where, select})
  if (!user) return next('Invalid email or password')
  res.json({result: user})
})

api.use((err, req, res, next) => {
  if (err) res.json({error: err})
  else next()
})

api.listen(port, () => console.log('SSO server is running on port', port))