const jwt = require('jsonwebtoken')
const { User, Session } = require('../models')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      req.decodedToken = jwt.verify(token, process.env.SECRET)

      const session = await Session.findOne({ where: { token: token } })  
      
      if (!session) {
        return res.status(401).json({ error: 'Not authorized! Token may be expired. Please log in again.' });
      }

      const user = await User.findByPk(req.decodedToken.id)

      if (user.disabled) {
        await Session.destroy({
          where: {
              user_id: req.decodedToken.id
          }
        })
        return res.status(401).json({ error: 'Cannot proceed. Account is disabled. Please contact admin.' });
      }
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'Token is invalid' })
    }
  } else {
    return res.status(401).json({ error: 'Token is missing' })
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
    return res.status(401).json({ error: 'Unauthorized request. Please provide a valid token.' })
  }
  next()
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  console.log('Error handler:')
  return res.status(400).send({ errorName: error.name, errorMsg: error.message })
  next()
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
}