const jwt = require('express-jwt');  
const jwksRsa = require('jwks-rsa');

const {
    COGNITO_JWKS_URI,
    COGNITO_AUDIENCE,
    COGNITO_ISSUER
} = process.env;

const authenticateJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: COGNITO_JWKS_URI,
    }),
    audience: COGNITO_AUDIENCE,
    issuer: COGNITO_ISSUER,
    algorithms: ['RS256'],
    getToken: (req) => {
        
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    }
});

authenticateJwt.unless = require('express-unless');  

module.exports = authenticateJwt;
