const readinglistRouter = require('express').Router()
const middleware = require('../util/middleware')
const { ReadingList } = require('../models')

readinglistRouter.get('/', async (req, res) => {
    const readinglists = await ReadingList.findAll({})
    res.json(readinglists)
})

readinglistRouter.post('/', async (req, res) => {
    const readingList = await ReadingList.create({
        blogId: req.body.blog_id,
        userId: req.body.user_id
    })
    res.json(readingList)
})

readinglistRouter.put('/:id', middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
    if (!req.decodedToken || !req.decodedToken.id) {
        return res.status(401).json({ error: 'Token missing or invalid' })
    }

    const readingListEntry = await ReadingList.findByPk(req.params.id)

    if (readingListEntry) {
      if (req.decodedToken.id === readingListEntry.userId) {
        readingListEntry.read = req.body.read
        await readingListEntry.save()
        res.json({ read: readingListEntry.read })
      } else {
        res.status(401).json({ error: 'Permission denied. Readinglist can be edited only by author' })
      }
    } else {
        res.status(404).end()
    }
})

module.exports = readinglistRouter