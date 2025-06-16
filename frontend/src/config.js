const config = {
    API_URL: process.env.REACT_APP_API_URL,
    cognito: {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        ClientId: process.env.REACT_APP_CLIENT_ID,
    },
};

export default config;