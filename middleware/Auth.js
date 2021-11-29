const jwt = require('jsonwebtoken')
const { knex } = require('../db/conn')

const Auth = async (req, res, next) => {
    try {
        const token = req.cookies.JWT;
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        const id = verify._id;

        const result = await knex.select().from('rbac.users')
            .where('rbac.users.id', `${verify._id}`)
            .andWhere('rbac.users.token', token);

        const answer = await knex.select('rbac.roles.role as role').from('rbac.users')
            .innerJoin('rbac.userroles', 'id', 'rbac.userroles.user_id')
            .innerJoin('rbac.roles', 'rbac.userroles.role_id', 'rbac.roles.role_id')
            .where('rbac.users.id', `${id}`);

        let str = "";
        let isAdmin =false;
        for (let i = 0; i < answer.length; i++) {
            str = answer[i].role + " & " + str;
            if (answer[i].role === 'admin') {
                isAdmin = true;
            }
        }
        const role = str.substring(0, str.length - 2).toUpperCase();


        result.push(role)

        if (result.length > 0) {
            req.token = token;
            req.result = result;
            req.userID = verify._id;
            req.role = role;
            req.Auth = true;
            req.isAdmin = isAdmin;
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