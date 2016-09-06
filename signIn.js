"use strict";

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var passwordHash = require('password-hash');

module.exports = function (app, pool) {
    app.post("/signin", jsonParser, function (req, res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                res.send({
                    flag : 1,
                    data : {
                        err : "something went wrong"
                    }
                });
            }else {
                var email = req.body.email;
                var password = req.body.password;
                var signInQuery = "SELECT email, pwd, token FROM Users WHERE email=" + connection.escape(email);
                connection.query(signInQuery, function (err, rows) {
                    if (err) {
                        res.send({
                            flag : 1,
                            data : {
                                err : "something went wrong"
                            }
                        });
                    }else {
                        if (rows.length > 0) {
                            var hashed_password = rows[0].pwd;
                            var verifiedPassword = passwordHash.verify(password, hashed_password);
                            if (verifiedPassword) {
                                res.send({
                                    flag : 0,
                                    data : {
                                        msg : "Welcome!",
					token : rows[0].token
                                    }
                                });
                            }else {
                                res.send({
                                    flag : 1,
                                    data : {
                                        err : "Incorrect password"
                                    }
                                });
                            }
                        }else {
                            res.send({
                                flag : 1,
                                data : {
                                    err : "User does not exist"
                                }
                            });
                        }
                    }
                });
                connection.release();
            }
        })
    });
};

