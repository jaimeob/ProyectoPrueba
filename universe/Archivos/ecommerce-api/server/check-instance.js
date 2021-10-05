module.exports = function() {
  return function myMiddleware(req, res, next) {
    next()
  }
}
