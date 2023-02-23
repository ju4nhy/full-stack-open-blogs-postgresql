const unknownEndpoint = (req, res) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  console.log('Error handler:')

  return res.status(400).send({ errorName: error.name, errorMsg: error.message })

  next(error)
}

module.exports = {
    errorHandler,
    unknownEndpoint
}
