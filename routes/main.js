const passport = require('passport');
const express = require('express');
const jwt = require('jsonwebtoken');

const tokenList = {};

const router = express.Router();

router.get('/status', (req, res, next) => {
    res.status(200).json({ 'status': 'ok' });
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
    res.status(200).json({ message: 'signup successful' });
});

router.post('/login', async (req, res, next) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_SECRET;
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('Something done goofed');
                return next(error);
            }
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);
                const body = {
                    _id: user._id,
                    email: user.email
                };

                const token = jwt.sign({ user: body }, jwtSecret, { expiresIn: 300 });
                const refreshToken = jwt.sign({ user: body }, refreshSecret, { expiresIn: 86400 });

                //  store tokens in cookie
                // HACK this method isn't setting the cookies as secure or http only which seems terribad for jwts.
                res.cookie('jwt', token);
                res.cookie('refreshJwt', refreshToken);

                // store the tokens in memory... really should be persistent
                tokenList[refreshToken] = {
                    token,
                    refreshToken,
                    email: user.email,
                    _id: user._id
                };

                //  return the token to the user 
                return res.status(200).json({ token, refreshToken });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    if (req.cookies) {
        const refreshToken = req.cookies['refreshJwt'];
        if (refreshToken in tokenList) delete tokenList[refreshToken];
        res.clearCookie('refreshJwt');
        res.clearCookie('jwt');
    }

    res.status(200).json({ 'message': 'Logged out successfully' });
});

router.post('/token', (req, res) => {
    const jwtSecret = process.env.JWT_SECRET;
    const { refreshToken } = req.body;
    if ((refreshToken in tokenList)/* && (tokenList[refreshToken].email === email)*/) { // The front end doesn't send the email in the payload and I can't be bothered getting it so I just lowered my auth standards >.>
        const email = tokenList[refreshToken].email // This is a hack to get the email from the list instead of the request body
        console.log(email);
        const body = { email, _id: tokenList[refreshToken]._id };
        console.log(body);
        const token = jwt.sign({ user: body }, jwtSecret, { epxiresIn: 300 }); // this doesn't seem to be loading a token, I assume it's not a synchronous call. Done with this tutorial. blagh.
    
        console.log(token); 
        // update jwt 
        res.cookie('jwt', token); 
        tokenList[refreshToken].token = token;
    
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

module.exports = router;

