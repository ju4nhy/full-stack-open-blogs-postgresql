const readinglistRouter = require('express').Router()
const { User, Blog, ReadingList } = require('../models')

readinglistRouter.get('/', async (req, res) => {
    const readinglists = await ReadingList.findAll({})
    res.json(readinglists)
})

readinglistRouter.post('/', async (req, res) => {
    console.log(req.body)
    //const { blogId, userId } = req.body

    const readingListItem = await ReadingList.create({
        blogId: req.body.blog_id,
        userId: req.body.user_id
    })
    res.json(readingListItem)
})

readinglistRouter.put('/', async (req, res) => {
    console.log('test')
})

module.exports = readinglistRouter