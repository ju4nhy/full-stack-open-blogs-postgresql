const authorRouter = require('express').Router()
const { Blog } = require('../models')
const { sequelize } = require('../util/db')

const { Op } = require('sequelize')

authorRouter.get('/', async (req, res) => {
    const authorStats = await Blog.findAll({
      attributes: [
        'author',
        [sequelize.fn('count', sequelize.col('author')), 'blogs'],
        [sequelize.fn('sum', sequelize.col('likes')), 'likes']
      ],
      group: 'author',
      order: [[sequelize.col('likes'), 'DESC']],
      where: {
        [Op.not]: { author: null }
      },
      raw: true
     })
     res.json(authorStats)
});

module.exports = authorRouter