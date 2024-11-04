const jwt = require('jsonwebtoken')
const secret = 'secret'

const toTS = value => {
  return parseInt(new Date(value).getTime() / 1000)
}

exports.sign = user => {
  const data = {...user}
  if (data.birthday) data.birthday = toTS(data.birthday)
  if (data.createdAt) data.createdAt = toTS(data.createdAt)
  if (data.updatedAt) data.updatedAt = toTS(data.updatedAt)
  return jwt.sign(data, secret)
}