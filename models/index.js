const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog)
Blog.belongsTo(User)

// Blog.sync({ alter: true }) // Delete
// User.sync({ alter: true }) // Delete

module.exports = {
  Blog, User
}