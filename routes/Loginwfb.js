const express = require('express')
const router = require('express').Router();
const bcrypt = require('bcryptjs')
const { knex, generateAuthToken } = require('../db/conn')
const cors = require('cors')

router.use(cors())


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.text());
router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-PINGOTHER ,X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    next();
});



router.post("/loginwfb/:name/:email/:id", async (req, res) => {
    try {
        const { name, email, id } = req.params;

        const user = await knex('rbac.users').where('email', `${email}`);

        // console.log(user[0].id);
        if (user.length === 0) {
            console.log("ready to inesert");
            const newPassword = await bcrypt.hash(id, 6);
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

            res.cookie("JWT", token1, { sameSite: 'strict', path: '/', expires: new Date(new Date().getTime() + 24 * 3600000), httpOnly: true })
                .send({ message: "Login successfully" });

        }
        else {
            const token1 = await generateAuthToken(user);
            console.log(token1);

            res.cookie("JWT", token1, { sameSite: 'strict', path: '/', expires: new Date(new Date().getTime() + 24 * 3600000), httpOnly: true })
                .send({ message: "Signin successfully" });

        }
    } catch (error) {
        res.send({ message: error.message });
    }
})

module.exports = router;