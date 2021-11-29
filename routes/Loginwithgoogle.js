const express = require('express')
const dotenv = require('dotenv');
const router = require('express').Router();
dotenv.config({ path: './config.env' })
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.G_CLIENT_ID);
const jwt = require('jsonwebtoken') 
const bcrypt =require('bcryptjs')
const { knex , generateAuthToken} = require('../db/conn')
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



router.post("/api/v1/auth/google/:token" ,async (req, res) => {
    const { token } = req.params;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { name, email} = ticket.getPayload();
    console.log("\n", name, "\n", email);

    const user = await knex('rbac.users').where('email', `${email}`)
        .catch(err => {
            console.log(err);
            res.send({ message: err });

        })

   // console.log(user[0].id);
    if (user.length === 0) {
        console.log("ready to inesert");
        const newPassword = await bcrypt.hash(token, 6);;
       const result = await knex('rbac.users').insert({ name: `${name}`, email: `${email}`, password: `${newPassword}` })
            .returning("id")
            .then(async (id) => {
                console.log("make_id = " + id);
                const date = new Date();
                const str = new Date().toISOString().slice(0, 10);

                const text2 = await knex('rbac.userroles').insert({ user_id: `${id}`, role_id: 2, assignment_date: `${str}` });
            })
            const token1 = await generateAuthToken(user);
            console.log(token1);

            res.cookie("JWT" ,token1 , {sameSite:'strict' , path:'/' , expires: new Date(new Date().getTime()+24*3600000) , httpOnly: true})
            .send({ message: "Login successfully"});

    }
    else{
        const token1 = await generateAuthToken(user);
        console.log(token1);

        res.cookie("JWT" ,token1 , {sameSite:'strict' , path:'/' , expires: new Date(new Date().getTime()+24*3600000) , httpOnly: true})
        .send({ message: "Signin successfully"});

    }
       
})

module.exports =router;

/*
const jwt = require('jsonwebtoken')
const { knex } = require('../db/conn')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.G_CLIENT_ID);


const Auth = async (req, res, next) => {
    try {
        const token = req.cookies.JWT;
        if (req.params.token) {
            ticket = await client.verifyIdToken({
                idToken: req.params.token,
                audience: process.env.CLIENT_ID
            });
            const { name, email } = ticket.getPayload();
            console.log("\n", name, "\n", email);

            result = await knex('rbac.users').where('email', `${email}`)
                .catch(err => {
                    console.log(err);
                    res.send({ message: err });
                })
            answer = await knex.select('rbac.roles.role as role').from('rbac.users')
                .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
                .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
                .where('rbac.users.email', `${email}`);
        }

        else if (token) {
            const verify = jwt.verify(token, process.env.SECRET_KEY);
            console.log(verify._id);
            const id = verify._id;

            result = await knex.select().from('rbac.users')
                .where('rbac.users.id', `${verify._id}`);

            answer = await knex.select('rbac.roles.role as role').from('rbac.users')
                .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
                .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
                .where('rbac.users.id', `${id}`);
        }



      //  console.log(answer);
       // console.log(result);

        let str = "";
        let isAdmin = false;
        for (let i = 0; i < answer.length; i++) {
            str = answer[i].role + " & " + str;
            if (answer[i].role === 'admin') {
                isAdmin = true;
            }
        }
        const role = str.substring(0, str.length - 2).toUpperCase();


        //result.push(role)
        //console.log(result[1]);
        console.log("rtesult length :" , result.length);
        console.log("result is :" , result);
        
        if (result>1) {
            req.token = token;
            req.result = result;
            //req.userID = verify._id;
            req.role = role;
            req.Auth = true;
            req.isAdmin = isAdmin;
            console.log(result);

            next();
        }
        else {
            throw new Error('user not found')
        }

    } catch (error) {
        console.log(error);
        res.status(401).send('Unauthorized: No token provided');
    }
}

module.exports = Auth;
*/