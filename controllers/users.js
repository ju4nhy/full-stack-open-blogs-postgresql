
const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const middleware = require('../util/middleware')

const { User, Blog, ReadingList } = require('../models')

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash', 'admin', 'createdAt', 'updatedAt'] },
    include: [{
      model: Blog,
      attributes: { exclude: ['userId'] }
    },
    {
      model: Blog,
      as: "readings",
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
      through: {
        attributes: ["id", "read"],
      },
    },
    ]
  })
  next()
}

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (!user.admin) {
    return res.status(401).json({ error: 'Operation not permitted. Only admin is allowed to enable and disable users.' })
  }
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

userRouter.put('/:username/disabled', middleware.tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({ 
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.disabled = req.body.disabled
    await user.save()
    res.json({ disabled: user.disabled })
  } else {
    res.status(404).end()
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