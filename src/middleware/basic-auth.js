const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    const authToken = req.get('authorization') || ''
    let basicToken 

    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({
            error : 'Missing bearer token'
        })
    } else {
        basicToken = authToken.slice('bearer '.length, authToken.length)
    }
    const [ tokenUserName, tokenPassword ] = AuthService.parseBasicToken(basicToken)

    if(!tokenUserName || !tokenPassword) {
        return res.status(401).json({
            error: 'Unauthorized request'
        })
    }

    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if(!user){
                return res.status(401).json({
                    error: 'Unauthorized request'
                })
            }

        return AuthService.comparePasswords(tokenPassword, user.password)
            .then(passwordMatch => {
                if(!passwordMatch){
                    return res.status(401).json( {error: `Unauthorized request`} )
                }
                req.user =user
                next()
            })
        })
    .catch(next)
    }

  
module.exports = {
    requireAuth
  }