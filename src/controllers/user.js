const {isEmail, isStrongPassword, isAlphanumeric, isDate, escape, trim} = require('validator')
const {PrismaClient} = require('@prisma/client')
const {createHash} = require('crypto')

const prisma = new PrismaClient()
const select = {uid: 1, email: 1, name: 1, birthday: 1, createdAt: 1, updatedAt: 1}

exports.signup = i => {
  return new Promise(async (resolve, reject) => {
    try {
      const passOpts = {minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}
      if (!i.email) throw 'Email is required'
      if (!i.password) throw 'Password is required'
      if (!i.nickname) throw 'Nickname is required'
      if (!i.birthday) throw 'Birthday is required'
      if (!isEmail(i.email)) throw 'Invalid email address'
      if (!isStrongPassword(i.password, passOpts)) throw 'Please choose a strong password. (Minimum 6 characters including uppercase, lowercase, numbers and symbols)'
      if (!isAlphanumeric(i.nickname, 'en-US', {ignore: ' '})) throw 'Invalid characters in nickname. (Characters, numbers and spaces only)'
      if (!isDate(i.birthday)) throw 'Invalid birthday. (YYYY/MM/DD format only)'
      const data = {
        email: i.email,
        password: createHash('sha256').update(i.password).digest('hex'),
        name: escape(trim(i.nickname)),
        birthday: new Date(i.birthday)
      }
      const user = await prisma.user.create({data, select})
      resolve(user)
    }
    catch (error) {reject(error)}
  })
}

exports.signin = i => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!i.email) throw 'Email is required'
      if (!i.password) throw 'Password is required'
      if (!isEmail(i.email)) throw 'Invalid email address'
      const password = createHash('sha256').update(i.password).digest('hex')
      const where = {email: i.email, password}
      const user = await prisma.user.findUnique({where, select})
      if (!user) throw 'Invalid email or password'
      resolve(user)
    }
    catch (error) {reject(error)}
  })
}