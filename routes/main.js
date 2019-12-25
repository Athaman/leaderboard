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
        console.log('argh');
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
    const { email, refreshToken } = req.body;

    if ((refreshToken in tokenList) && (tokenList[refreshToken].email === email)) {
        const body = { email, _id: tokenList[refreshToken]._id };
        const token = jwt.sign({ user: body }, jwtSecret, { epxiresIn: 300 });
    
        // update jwt 
        res.cookie('jwt', token); 
        tokenList[refreshToken].token = token;
    
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

module.exports = router;

