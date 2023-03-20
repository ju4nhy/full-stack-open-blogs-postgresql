const logoutRouter = require('express').Router()
const middleware = require('../util/middleware')
const Session = require('../models/session')

logoutRouter.delete('/', middleware.tokenExtractor, async (req, res) => {
    await Session.destroy({
        where: {
            user_id: req.decodedToken.id
        }
    })
    return res.status(200).json({ message: 'Logged out' })
})

module.exports = logoutRouter