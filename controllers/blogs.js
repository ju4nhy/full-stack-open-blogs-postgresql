const router = require('express').Router()

const { Blog, User } = require('../models')

const middleware = require('../util/middleware')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
  })
  res.json(blogs)
})
  
router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    console.log(req.blog.toJSON())
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

/* ORIGINAL WORKED...?   CAN BE DELETED WHEN BELOW POST WORKS
router.post('/', blogFinder, async (req, res) => {
    console.log(req.body)
    const user = await User.findOne()
    const blog = await Blog.create({ ...req.body, userId: user.id })
    return res.json(blog)
})
*/

router.post('/', middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
    console.log(req.body)
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, userId: user.id })
    return res.json(blog)
})

router.delete('/:id', blogFinder, middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
  if (!req.decodedToken || !req.decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or invalid' })
  }

  if (req.blog) {
    if (req.decodedToken.id === req.blog.userId) {
      await req.blog.destroy()
      res.status(204).end()
    } else {
      res.status(401).json({ error: 'Permission denied. Blog can be deleted only by blog author.' })
    }
  } else {
    res.status(404).end()
  }
})

router.put('/:id', blogFinder, async (req, res) => {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json({ likes: req.blog.likes })
})

module.exports = router