const router = require('express').Router();
const { knex } = require('../db/conn')
const bcrypt = require('bcryptjs');
const Joi = require('joi');

function validateUser(user)
{
    const JoiSchema = Joi.object({
      
        name: Joi.string()
                  .min(5)
                  .max(30)
                  .required(),
                    
        email: Joi.string()
               .email()
               .min(5)
               .max(50)
               .required(), 
                 
        password: Joi.string()
                .trim()
                .min(4)
                .required()
                         
       
    }).options({ abortEarly: false });
  
    return JoiSchema.validate(user)
}
  



router.post("/register/:name/:email/:pass" ,async (req, res, next) => {
   
   const { name, email, pass } = req.params;
   const user = {
        name: name ,
        email: email ,
        password: pass
   }
    let  response = validateUser(user)
   if(response.error)
   {
       console.log(response.error.details[0].message);
       res.send({message:response.error.details[0].message});
   }
   else{
   try {
        const user = await knex('rbac.users').where('email', `${email}`)
            .catch(err => {
                console.log(err);
               // res.send({ message: err });

            })


        if (user.length === 0) {
            console.log("ready to inesert");
            const newPassword = await bcrypt.hash(pass, 6);
            await knex('rbac.users').insert({ name: `${name}`, email: `${email}`, password: `${newPassword}` })
                .returning("id")
                .then(async (id) => {
                    console.log("make_id====" + id);
                    const date = new Date();
                    const str = new Date().toISOString().slice(0, 10);

                    const text2 = await knex('rbac.userroles').insert({ user_id: `${id}`, role_id: 2, assignment_date: `${str}` });
                    res.send({ message: "Successfully Registered Please Login Now" });

                }).catch(async (err) => {
                    await knex('rbac.users ').where('id', `${user.id}`).del()
                    res.send({ message: "Something went wrong please try to register again ...", err });
                })
        } else {
            res.send({ message: "user already exist" });
        }
    } catch (error) {
        res.send({ message: error.message });
    }
  }
});

module.exports = router;