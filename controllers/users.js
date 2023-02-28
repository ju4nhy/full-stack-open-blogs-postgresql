const router = require('express').Router()

const { User, Blog } = require('../models')

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id, {
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
 // try {
    const user = await User.create(req.body)
    res.json(user)
 // } catch(error) {
   // return res.status(400).json({ error })
 // }
})

router.get('/:id', userFinder, async (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

router.put('/:username', async (req, res) => {
 const user = await User.findOne({
  where: {
    username: req.params.username
  },
 })

 if (user) {
   user.name = req.body.name
   await user.save();
   res.json({ name: user.name })
 } else {
   res.status(404).end();
 }
})

router.delete('/:id', userFinder, async (req, res) => {
  if (req.user) {
    await req.user.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router