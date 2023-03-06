
const bcrypt = require('bcrypt')
const userRouter = require('express').Router()

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

userRouter.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

userRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  //const user = await User.create(req.body)
  const user = await User.create({
    username,
    name,
    passwordHash
  })
  res.json(user)
})

userRouter.get('/:id', userFinder, async (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

userRouter.put('/:username', async (req, res) => {
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

userRouter.delete('/:id', userFinder, async (req, res) => {
  if (req.user) {
    await req.user.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = userRouter