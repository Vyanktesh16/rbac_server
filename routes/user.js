const router = require('express').Router();
const { knex } = require('../db/conn')
const Auth =require('../middleware/Auth')
  router.get("/manage" , async (req, res) => {
    console.log("See all users");
    try {
        const result = await knex.select().table('rbac.users').orderBy('id').then(answer => {
            res.send(answer);
        }).catch(err => {
            console.log(err);
            res.send(err);
        });
    } catch (error) {
        res.send({ message: error });
    }
});

module.exports = router;