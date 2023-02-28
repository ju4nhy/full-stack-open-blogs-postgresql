const blogRouter = require('express').Router()
const { Op } = require('sequelize')
const middleware = require('../util/middleware')
const { Blog, User } = require('../models')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id, {
    include: {
      model: User,
      attributes: ['name']
    }
  })
  next()
}

blogRouter.get('/', async (req, res) => {
  where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${req.query.search}%`
          }
        },
        {
          author: {
            [Op.iLike]: `%${req.query.search}%`
          }
        }
      ],
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [
      ['likes', 'DESC']
    ]
  })
  res.json(blogs)
})

blogRouter.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    console.log(req.blog.toJSON())
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

/* ORIGINAL WORKED...?   CAN BE DELETED WHEN BELOW POST WORKS
blogRouter.post('/', blogFinder, async (req, res) => {
    console.log(req.body)
    const user = await User.findOne()
    const blog = await Blog.create({ ...req.body, userId: user.id })
    return res.json(blog)
})
*/

blogRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
    console.log(req.body)
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, userId: user.id })
    return res.json(blog)
})

blogRouter.delete('/:id', blogFinder, middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
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

blogRouter.put('/:id', blogFinder, async (req, res) => {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json({ likes: req.blog.likes })
})

module.exports = blogRouter

   /* ORIGINAL
    where: {
      title: {
        [Op.iLike]: '%' + (req.query.search ? req.query.search : '') + '%'
      }
   }*/

 /*    
    where: req.query.search ? {
     [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${req.query.search}%`
          }
        },
        {
          author: {
            [Op.iLike]: `%${req.query.search}%`
          }
        }
      ]
    } : {}
  */