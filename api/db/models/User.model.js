const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const crypto = require('crypto');

const jwtSecretKey = "OLiq8JTh0mbUzCJI0gTM1sM4bHrJTM"

const UserSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        minlength: 5,
        unique : true
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 5
    },
    sessions : [{
        token : {
            type : String,
            required : true
        },
        expiresAt : {
            type : Number,
            required : true
        }
    }]
})
UserSchema.statics.getJwtSecretKey = function() {
    return jwtSecretKey;
}
//overwriting the toJSON method
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    return _.omit(userObject, [ 'password' ]);
}

//access token is used to access the DB
UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        jwt.sign({ id : user._id.toHexString() }, jwtSecretKey, { expiresIn : '15m' }, (err, token) => {
            if(!err) {
                return resolve(token);
            }
            else {
                reject(err);
            }
        })

    })
}

//refresh token is used to get access token
//it is stored in database and localStorage in browser
UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if(!err) {
                const token = buf.toString('hex');
                return resolve(token);
            }
            else {
                return reject();
            }
        })

    })
}

//IMPORTANT METHOD
UserSchema.methods.createSession = function() {
    const user = this;
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken).then((refreshToken) => {
            return refreshToken;
        })
        .catch((error) => {
            return Promise.reject('Failed to save session to database' + error);
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = function(expiresAt) {
    let secondsSinceEpoch = Date.now() / 1000;
    if(expiresAt > secondsSinceEpoch) {
        return false;
    }
    else {
        return true;
    }
}
UserSchema.statics.findByIdAndToken = function(id, token) {
    const User = this;
    return User.findOne( {_id : id, 'sessions.token' : token} ).then((user) => {
        if(!user) {
            return Promise.reject('No Session');
        }
        return Promise.resolve(user);
    })
}
UserSchema.statics.findSessionsByUserId = function(id) {
    const User = this;
    return User.find({ _id : id }).then((user) => {
        if(!user) {
            return Promise.reject('No user found');
        }
        return Promise.resolve(user);
    })
}
UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    return User.findOne({ email }).then((user) => {
        if(!user) {
            return Promise.reject('Email is not associated with any user.');
        }
        else {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if(res) {   
                        resolve(user);
                    }
                    else {
                        reject('You have entered wrong password');
                    }
                })
            })
        }
    })
}

//pre save middlware
UserSchema.pre('save', function(next) {
    const user = this;
    const costFactor = 10;
    if(user.isModified('password')) {
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    }
    else {
        next();
    }
})
// helper methods
const saveSessionToDatabase = function(user, token) {
    return new Promise((resolve, reject) => {
        const expiresAt = generateRefreshTokenExpiryTime();
        user.sessions.push({'token' : token, expiresAt});
        user.save().then(() => {
            return resolve(token);
        }).catch((err) => {
            reject(err);
        })
    })
}
const generateRefreshTokenExpiryTime = function() {
    let daysUntilExpired = '10';
    let secondsUntilExpired = ((daysUntilExpired * 24) * 60) * 60;
    return (Date.now() / 1000) + secondsUntilExpired;
}
const User = mongoose.model('User', UserSchema);
module.exports = User;