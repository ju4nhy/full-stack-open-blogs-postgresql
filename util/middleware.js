const jwt = require('jsonwebtoken')

const { User } = require('../models')

const unknownEndpoint = (req, res) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      console.log(authorization.substring(7))
      req.decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const userExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  const decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
  const user = await User.findByPk(decodedToken.id)

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.user = user
  } else {
    req.user = null
    return res.status(401).json({ error: 'TESTING TESTING TESTING' })
  }
  next()
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  console.log('Error handler:')

  return res.status(400).send({ errorName: error.name, errorMsg: error.message })

  next(error)
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}