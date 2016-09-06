"use strict";

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var passwordHash = require('password-hash');
var tokenGenerater = require("rand-token");

/*
// app is a reference to our web server (Express.js), similar to Apache.
// pool is a pool of mySql connections. To ensure performance, we do not want to connect to our DB repeatedly.
// Reusing connections will save us a lot of trouble.
*/

module.exports = function (app, pool) {
    app.post("/signup", jsonParser, function (req, res) {
        pool.getConnection(function(err, connection){
            if (err) {
                res.send({
                    flag: 1,
                    data : {
                        error: "unable to connect to mysql"
                    }
                });
            }else {
                var email = req.body.email;

                var checkUserExistenceQuery = "SELECT 1 FROM Users WHERE email = "
                    + connection.escape(email) + " "
                    + "ORDER BY email lIMIT 1";
                connection.query(checkUserExistenceQuery, function (err, rows) {
                    if (err) {
                        res.send({
                            flag : 1,
                            data : {
                                error : "unable to check user existence."
                            }
                        });
                    }else {
                        if (rows.length > 0) {
                            // user already exists
                            res.send({
                                flag : 1,
                                data : {
                                    error : "user already exists."
                                }
                            });
                        }else {
                            // user does not exist, insert new user data
                            var password = req.body.password;
                            var hashedPassword = passwordHash.generate(password);
                            var firstname = req.body.firstname;
                            var lastname = req.body.lastname;
                            var token = tokenGenerater.generate(64);
                            var newUserQuery = "INSERT INTO Users (email, firstname, lastname, nativeLan, pwd, userRole, token) VALUES ("
                                + connection.escape(email) + ","
                                + connection.escape(firstname) + ","
                                + connection.escape(lastname) + ","
                                + connection.escape(hashedPassword) + ","
				                + connection.escape(token)
                                + ")";
                           connection.query(newUserQuery, function (err, rows) {

                                if (err) {
		                   res.send({
                                        flag : 1,
                                        data : {
                                            error : "something went wrong"
                                        }
                                    });
                                }else {
                                    res.send({
                                        flag : 0,
                                        data : {
                                            msg : "welcome",
					    token : token
                                        }
                                    });
                                }
                            })
                        }
                    }
                });
                connection.release();
            }
        });
    });
};
