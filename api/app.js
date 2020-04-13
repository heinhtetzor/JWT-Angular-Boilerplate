const express = require('express');
const app = express();
const User = require('./db/models/User.model');
const jwt = require('jsonwebtoken');
const mongoose = require('./db/mongoose')
// middlware starts
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id, user-id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next();
});
//authenticate middleware
let authenticate = function(req, res, next) {
    let accessToken = req.header('x-access-token');
    
    jwt.verify(accessToken, User.getJwtSecretKey(), (err, decoded) => {
        if(err) {
            res.status(401).send(err);
        }
        else {
            req.user_id = decoded.id;
            next();
        }
    })
}
//verify session middleware for creating new access token
let verifySession = function(req, res, next) {
    
    let userId = req.header('user-id');
    let refreshToken = req.header('x-refresh-token');  
    User.findByIdAndToken(userId, refreshToken).then((user) => {
        if(!user) {
            return Promise.reject('User not found.');
        }
        req.userObj = user;
        req.user_id = user._id;
        req.refreshToken = refreshToken;

        let sessionIsValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken) {
                if(!User.hasRefreshTokenExpired(session.expiresAt)) {
                    sessionIsValid = true;
                }
            }
        })

        if(sessionIsValid) {
            return next();
        }
        else {
            return Promise.reject('token expired');
        }
    })
    .catch((err) => {
        res.status(401).send(err);
    })
}
// middleware ends

app.post('/signup', (req, res) => {
    const newUser = new User(req.body);
    newUser.save().then((user) => {
        return user.createSession().then((refreshToken) => {
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken };
            })
            .then((authTokens) => {
                res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);    
            })
        })
    })
    .catch((err) => {
        res.send(err);
    })
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {    
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken };
            }).then((authTokens) => {
                res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
            })
        })
    })
    .catch((err) => {
        res.status(400).send(err);
    })
})

app.get('/getSessions', authenticate, (req, res) => {
    User.findSessionsByUserId(req.user_id).then((sessions) => {
        
        res.json(sessions);
    })
})

app.get('/getNewAccessToken', verifySession, (req, res) => {
    //get the user object
    //use createSessionMethod
    const userObj = req.userObj;
    userObj.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token, accessToken')
        .status(200)
        .send({ accessToken });
    })
    .catch((err) => {
        res.status(400).send(err);
    })
})

app.post('/removesession', (req, res) => {
    let token = req.body.token;
    let _id = req.body.userId;
    User.findByIdAndUpdate({_id}, 
        {
            $pull : {
                sessions : {
                    token 
                }
            }
        }).then((res) => {
            console.log(res);
            
        })
})
app.listen(5000, () => console.log('Server is listeing at 5000'));