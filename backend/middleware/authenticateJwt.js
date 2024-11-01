const jwt = require('express-jwt');  
const jwksRsa = require('jwks-rsa');

const authenticateJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_e311RfTfz/.well-known/jwks.json',
    }),
    audience: '1tp9mg2i4kih1ko1a9nbk7pe2q',
    issuer: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_e311RfTfz',
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
