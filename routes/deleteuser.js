const router = require('express').Router();
const { knex } = require('../db/conn');


router.post("/manage/:id", async (req, res) => {
    try {
        const { id } = req.params;
        /* // if remove self
         const user= await knex.select('rbac.roles.role as role').from('rbac.users')
         .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
         .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
         .where('rbac.users.id', `${id}`).catch(err => {
             res.send({ message: err });
         });        
         let status = false;
 
         for (let i = 0; i < user.length; i++) {
             if (user[i].role === 'admin') {
                 status = true;
                 break;
             }
         }
         if (status === true) {
             res.send({ message: "Please ask another admin to remove you" });
         }*/

        const result = await knex('rbac.users ')
            .where('id', `${id}`)
            .del()
            .then(answer => {
                knex('rbac.userroles')
                    .where('user_id', `${id}`)
                    .del().then(a => {
                        res.send({ message: "Deleted successfully" })
                    })
            })
            .catch(err => {
                res.send({ message: err });
            })

    } catch (error) {
        res.send(error);
        console.log(error);
    }
})

module.exports = router;