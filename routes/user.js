const express = require('express');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../model/User');

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

 router.post('/signup', [
    check("username", "Please Enter a valid Username").not().isEmpty(),
    check("email", "Please Enter a Valid email").isEmail(),
    check("password", "Please Enter a Valid password").isLength({ min: 6 })
 ],
 async (req, res) => {
     const errors = validationResult(req);
     if(!errors.isEmpty()) {
         return res.status(400).json({
             errors: errors.array()
         });
     }
     const {
         username,
         email,
         password
     } = req.body;
     try {
        let user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({
                msg: "User Already exists"
            });
        }
        user = new User({
            username,
            email,
            password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if(err) throw err;
                res.status(200).json({ token });
            }
        );
     } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in saving");
     }
 }
);

router.post('/login', [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a vlid password").isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            const { email, password } = req.body;
            try{
                let user = await User.findOne({ email });
                if(!user)
                    return res.status(400).json({ message: "User doesn't exist" });
                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch)
                    return res.status(400).json({ message: "Incorrect password" });

                const payload = {
                    user: { id: user.id }
                };

                jwt.sign(
                    payload,
                    "secret",
                    {
                        expiresIn: 4600
                    },
                    (err, token) => {
                        //if(err) throw err;
                        res.status(200).json({ token });
                    }
                );
            } catch (e) {
                console.error(e);
                res.status(500).json({ message: "Server error!!" });
            }
        }
    }
);

/**
 * @method - POST
 * @description - get logged in user
 * @param - /user/me
 */

router.get('/me', auth, async (req, res) => {
    try{
        //request.user is getting fetched from middleware after token authentication
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch(e){
        res.send({ message: "Error in ferching user" });
    }
});

module.exports = router;
