const express = require('express')
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { knex , generateAuthToken} = require('../db/conn')
const jwt = require('jsonwebtoken') 
const cors = require('cors')
router.use(cors())

router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(express.text());
router.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-PINGOTHER ,X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    next();
  });


router.post("/login/:pass/:email",async (req, res) => {
    // res.send("I'm in login")
   console.log("Im in login")
    console.log(req.params);
    try {
        const { pass ,email } = req.params;
        const checkQuery = await knex.select().from('rbac.users').where('email', `${email}`)
            .then(async (result) => {
                if (result.length === 1) {
                    console.log("Im in it")
                    const isMatch = await bcrypt.compare(pass, result[0].password);
                    if (!isMatch) {
                        res.send({ message: "Password is incorrect ..." });
                    }
                    else {
                        let id = result[0].id;
                        const token = await generateAuthToken(result);
                        console.log(token);

                        res.cookie("JWT" ,token , {sameSite:'strict' , path:'/' , expires: new Date(new Date().getTime()+24*3600000) , httpOnly: true})
                        .send({ message: "Login successfully", result });         
                    }
                }
                else {
                    console.log("empty request");
                    res.send({ message: "Please register first" });
                }
            }).catch(err => {
                console.log(err);
                res.send({ message: err });
            })

    } catch (error) {
        res.send({ message: "Error while login ...." });
    }
});

module.exports = router;