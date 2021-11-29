const router = require('express').Router();
const {knex} = require('../db/conn');

router.post("/viewrole/:id", async (req, res) => {
    try {
        const { id } = req.params;

        knex.select('rbac.roles.role as role').from('rbac.users')
            .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
            .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
            .where('rbac.users.id', `${id}`)
            .then((result) => {
                console.log(result);
                res.cookie("Name1" ,"Vyanktesh1" , {sameSite:'strict' , path:'/' , expires: new Date(new Date().getTime()+100*1000) , httpOnly: true})
                .send(result);
            }).catch(err => {
                res.send("error");
            })
    } catch (error) {
        console.log(error);
        res.send({ message: "Error while fetching data", error })
    }
})

module.exports = router;