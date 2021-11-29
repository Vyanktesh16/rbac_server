const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.HOST,
    port: process.env.PORT ,
    user: process.env.USERNAME ,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  }
})

const generateAuthToken = async (result) => {
    try {
    
      let id = result[0].id;
      let token = await jwt.sign({ _id: id }, process.env.SECRET_KEY);
 
 
      const answer = await knex('rbac.users').where({ id: `${id}` }).update('token', `${token}`)
        .catch((err) => {
            console.log(err);
        });
      
      if (answer) {
        console.log("token inserted successfully");
      }
     else {
       console.log("sorry token not inserted ....");
      }
      return token;
    } catch (err) {
     console.log("Error while inserting token",err);
    }
 
  }

  const generateNewAuthToken  = async (id) =>{
    try {
    
        let token = await jwt.sign({ _id: id }, process.env.SECRET_KEY);
   
   
        const answer = await knex('rbac.users').where({ id: `${id}` }).update('token', `${token}`)
          .catch((err) => {
              console.log(err);
          });
        
        if (answer) {
          console.log("token inserted successfully");
        }
       else {
         console.log("sorry token not inserted ....");
        }
        return token;
      } catch (err) {
       console.log("Error while inserting token",err);
      }
  }
 
 

module.exports ={knex , generateAuthToken , generateNewAuthToken};
