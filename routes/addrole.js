const router = require('express').Router();
const { knex } = require('../db/conn')



router.post("/addrole/:id/:role", async (req, res) => {
    try {
        const { id, role } = req.params;
        console.log(id + " - " + role)

        const answer2 = await knex.select('rbac.roles.role as role').from('rbac.users')
            .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
            .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
            .where('rbac.users.id', `${id}`).catch(err => {
                res.send({ message: err });
            })

        let status = false;
        for (let i = 0; i < answer2.length; i++) {
            if (answer2[i].role === role) {
                status = true;
                break;
            }
        }

        if (status === true) {
            res.send({ message: "This role added previously" })
        }
        else {
            const answer = await knex.select('role_id').from('rbac.roles').where('role', `${role}`);//await pool.query("select role_id from rbac.roles where role=$1", [role]);
            console.log(answer[0].role_id);
            const role_id = answer[0].role_id;

            const date = new Date();
            const str = new Date().toISOString().slice(0, 10);
            console.log(id, " ", role_id, " ", str);

            const temp = await knex('rbac.userroles')
                .insert({ user_id: `${id}`, role_id: `${role_id}`, assignment_date: `${str}` });

            if (temp.rowCount === 1) {
                res.send({ message: "Role added Succesfully" });
            }
            else {
                res.send({ message: "error while adding role", err })
            }

        }
    } catch (error) {
        res.send({ message: "Error while changing role" })
    }
})

module.exports = router;