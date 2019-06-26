const express= require('express');
const bodyParser= require('body-parser');
const favicon= require('serve-favicon');
const session= require('express-session');
const app=express();

app.use(bodyParser.json());
app.use(favicon(__dirname+"/public/images/logo.png"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(session({
    secret: 'hp_iiitd_cookie',
    resave: false,
    saveUninitialized: false
}));

app.listen(3030, function () {
    console.log("Listening on server port: 3030");
});



//default handler
app.get("/", function (req, res) {
    res.sendFile(__dirname+"/public/html/index.html");
});

//handle user login
app.post("/login", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //post parameters
    const params= {};
    params['token']= req.body.token.trim();
    params['email']= req.body.email.trim();
    params['name']= req.body.name.trim();
    params['picture']= req.body.picture.trim();

    //call login function to signin user and authenticate
    Login(params).then(function (response) {
        //successful login
        req.session.email=params['email'];
        const temp=JSON.parse(response);
        req.session.id= temp.id;
        req.session.admin=temp.admin;
        res.end(response);
    }).catch(function (response) {
        //failed login
        res.end(response);
    });
});

//logout
app.get('/logout', function (req, res) {
    var response={};
    if (req.session.email) {
        req.session.destroy();
        response['code']=1;
        response['info']="logout successful";
    }else {
        response['code']=1;
        response['info']="logout success";
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.end(JSON.stringify(response));
});

//handle main home page
app.get('/home', function (req, res) {
    if (req.session.email) {
        if (req.session.admin===true) {
            res.redirect('/admin');
        }else {
            res.sendFile(__dirname+"/public/html/home.html");
        }
    } else {
        res.redirect("/");
    }
});

//return all account information
app.post('/accountInfo', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email=req.body.email.trim();
    const params= {};
    params['email']=email;

    if (email===req.session.email) {
        AccountInfo(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

//Place request
app.post('/requestHostel', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    params['id']=req.body.id.trim();
    params['house_no']=req.body.house_no.trim();
    params['locality']=req.body.locality.trim();
    params['city']=req.body.city.trim();
    params['state']=req.body.state.trim();
    params['pincode']=req.body.pincode.trim();
    params['semester']=req.body.semester.trim();
    params['prefered_hostel']=req.body.prefered_hostel.trim();
    params['type']=req.body.type.trim();

    if (email===req.session.email) {
        RequestHostel(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

//cancel requests
app.post('/cancelRequest', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email= req.body.email.trim();
    const params= {};
    params['email']=email;
    params['request_id']=req.body.request_id.trim();
    if (email===req.session.email) {
        CancelRequest(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

//admin panel
app.get('/admin', function (req, res) {
    if (req.session.email && req.session.admin===true) {
        res.sendFile(__dirname+"/public/html/admin.html");
    }else {
        res.redirect('/');
    }
});

//add admin
app.post('/addAdmin', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email= req.body.email.trim();
    const params= {};
    params['email']=email;
    params['add_email']=req.body.add_email.trim();
    if (email===req.session.email && req.session.admin===true) {
        AddAdmin(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

//admin account info
app.post('/adminAccountInfo', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    if (email===req.session.email && req.session.admin===true) {
        AdminAccountInfo(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

//change semester
app.post('/changeSemester', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    if (email===req.session.email && req.session.admin===true) {
        ChangeSemester().then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});


app.post('/rejectRequest', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    params['id']=req.body.id.trim();
    params['name']=req.body.name.trim();
    if (email===req.session.email && req.session.admin===true) {
        RejectRequest(params).then(function (response) {
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

app.get('/addAdminPanel', function (req, res) {
    if (req.session.email && req.session.admin===true) {
        res.sendFile(__dirname+"/public/html/addAdminPanel.html");
    }else {
        res.redirect('/');
    }
});



//reject request
let RejectRequest= function RejectRequest(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            const dateTime = require('node-datetime');
            const dt = dateTime.create().format('d-m-Y H:M');
            connection.query(`update Requests set status=3, reviewed_by_name='`+params['name']+`', reviewed_by_email='`+params['email']+`', reviewed_on='`+dt+`' where id=`+params['id']+`;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Rejected";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

//change sem function
let ChangeSemester= function ChangeSemester() {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`update Requests set status=(case when status=0 then 4 when status=1 then 2 when status=3 then 4 end);`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Semester Changed";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

//get admin account information
let AdminAccountInfo= function AdminAccountInfo(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`select * from Admin where email='`+params['email']+`'; select Requests.*, Users.name, Users.email from Requests, Users where uid=Users.id and status=0 or status=1 or status=3;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=0;
                    response['info']="Account Details";
                    response['id']=result[0][0].id;
                    response['name']=result[0][0].name;
                    response['email']=result[0][0].email;
                    response['picture']=result[0][0].picture;
                    response['lastlogin']=result[0][0].lastlogin;
                    response['requests']=[];

                    for (let i=0;i<result[1].length; i++) {
                        let obj={};
                        obj['id']=result[1][i].id;
                        obj['uid']=result[1][i].uid;
                        obj['request_time']=result[1][i].request_time;
                        obj['prefered_hostel']=result[1][i].prefered_hostel;
                        obj['semester']=result[1][i].semester;
                        obj['type']=result[1][i].type;
                        obj['house_no']=result[1][i].house_no;
                        obj['locality']=result[1][i].locality;
                        obj['city']=result[1][i].city;
                        obj['state']=result[1][i].state;
                        obj['pincode']=result[1][i].pincode;
                        obj['status']=result[1][i].status;
                        obj['room_allocated']=result[1][i].room_allocated;
                        obj['hostel_allocated']=result[1][i].hostel_allocated;
                        obj['reviewed_on']=result[1][i].reviewed_on;
                        obj['name']=result[1][i].name;
                        obj['email']=result[1][i].email;
                        obj['reviewed_by_name']=result[1][i].reviewed_by_name;
                        obj['reviewed_by_email']=result[1][i].reviewed_by_email;
                        response['requests'].push(obj);
                    }
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

//add admin
let AddAdmin= function AddAdmin(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`insert into Admin (name, email, picture, lastlogin) values ('', '`+params['add_email']+`', '', '');`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Admin Added";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

//cancel request
let CancelRequest= function CancelRequest(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`delete from Requests where id=`+params['request_id']+`;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Cancelled";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


//save hostel request
let RequestHostel= function RequestHostel(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            const dateTime = require('node-datetime');
            const dt = dateTime.create().format('d-m-Y H:M');
            //status 0:requested, 1:approved_current_sem, 2:was_approved, 3:rejected_current_sem, 4:was rejected
            connection.query(`insert into Requests (uid, request_time, prefered_hostel, semester, type, house_no, locality, city, state, pincode, status) values (`+params['id']+`, '`+dt+`', '`+params['prefered_hostel']+`', '`+params['semester']+`', '`+params['type']+`', '`+params['house_no']+`', '`+params['locality']+`', '`+params['city']+`', '`+params['state']+`', '`+params['pincode']+`', 0); update Users set house_no='`+params['house_no']+`', locality='`+params['locality']+`', city='`+params['city']+`', state='`+params['state']+`', pincode='`+params['pincode']+`' where email='`+params['email']+`';`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=0;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Placed";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=0;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


//account information function
let AccountInfo= function AccountInfo(params) {
  return new Promise(function (resolve, reject) {
      const response= {};
      connectDB().then(function (connection) {
          connection.query(`select * from Users where email='`+params['email']+`';`, function (err, result) {
              if (err) {
                  connection.end();
                  response['code']=0;
                  response['info']= "Oops! looks like we have some problem with our database. Please try again";
                  reject(JSON.stringify(response));
              } else {
                  response['code']=1;
                  response['info']= "Account Details";
                  response['id']=result[0].id;
                  response['name']=result[0].name;
                  response['email']=result[0].email;
                  response['picture']=result[0].picture;
                  response['lastlogin']=result[0].lastlogin;
                  response['house_no']=result[0].house_no;
                  response['locality']=result[0].locality;
                  response['city']=result[0].city;
                  response['state']=result[0].state;
                  response['pincode']=result[0].pincode;

                  connection.query(`select * from Requests where uid=`+result[0].id+`;`, function (err, result2) {
                      connection.end();
                      if (err) {
                          response['code']=0;
                          response['info']= "Oops! looks like we have some problem with our database. Please try again";
                          reject(JSON.stringify(response));
                      }else {
                          response['requests']=[];
                          for (let i=0;i<result2.length;i++) {
                              let obj={};
                              obj['id']=result2[i].id;
                              obj['uid']=result2[i].uid;
                              obj['request_time']=result2[i].request_time;
                              obj['prefered_hostel']=result2[i].prefered_hostel;
                              obj['semester']=result2[i].semester;
                              obj['type']=result2[i].type;
                              obj['house_no']=result2[i].house_no;
                              obj['locality']=result2[i].locality;
                              obj['city']=result2[i].city;
                              obj['state']=result2[i].state;
                              obj['pincode']=result2[i].pincode;
                              obj['status']=result2[i].status;
                              obj['room_allocated']=result2[i].room_allocated;
                              obj['hostel_allocated']=result2[i].hostel_allocated;
                              obj['reviewed_on']=result2[i].reviewed_on;
                              response['requests'].push(obj);
                          }
                          resolve(JSON.stringify(response));
                      }
                  });
              }
          })
      }).catch(function (err) {
          response['code']=0;
          response['info']= "Oops! looks like we have some problem with our database. Please try again";
          reject(JSON.stringify(response));
      });
  });
};

//login function
let Login= function Login(params) {
    return new Promise(function (resolve, reject) {
        let response= {};

        //authenticate user using google api
        GoogleVerify(params['token']).then(function (resp) {
            //successful authentication
            //connect to database
            connectDB().then(function (connection) {
                //database connected
                //check if user already exist in database
                //or if the email used belongs to a admin
                connection.query(`select * from Users where email='`+params['email']+`'; select * from Admin where email='`+params['email']+`';`, function (err, result) {
                    if (err) {
                        //returns flag=0 as database connection fails
                        connection.end();
                        response['code']= 0;
                        response['info']= "Oops! looks like we have some problem with our database. Please try again";
                        reject(JSON.stringify(response));
                    }else {
                        const dateTime = require('node-datetime');
                        const dt = dateTime.create().format('d-m-Y H:M');
                        if (result[1].length===1) {
                            //user is a admin
                            //update lastlogin and other information
                            connection.query(`update Admin set lastlogin='`+dt+`', name='`+params['name']+`', picture='`+params['picture']+`' where email='`+params['email']+`';`, function (err, result2) {
                               connection.end();
                               if (err) {
                                   //update failed
                                   console.log(err);
                                   response['code']= 0;
                                   response['info']= "Oops! looks like we have some problem with our database. Please try again";
                                   reject(JSON.stringify(response));
                               }else {
                                   //update success
                                   //admin login
                                   response['code']= 1;
                                   response['info']= "Logined";
                                   response['id']=result[1][0].id;
                                   response['admin']=true;
                                   resolve(JSON.stringify(response));
                               }
                            });
                        }else if (result[0].length===0) {
                            //user does not exist in database
                            //save user in database
                            connection.query(`insert into Users (name, email, picture, lastlogin) values ('`+params['name']+`', '`+params['email']+`', '`+params['picture']+`', '`+dt+`');`, function (err, result2) {
                                connection.end();
                                if (err) {
                                    //returns flag=0 as database connection fails
                                    response['code']= 0;
                                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                                    reject(JSON.stringify(response));
                                }else {
                                    //successful database save hence login successful flag=1
                                    response['code']= 1;
                                    response['info']= "Logined";
                                    response['id']=result2.insertId;
                                    response['admin']=false;
                                    resolve(JSON.stringify(response));
                                }
                            });
                        }else {
                            //user already exist in database
                            //updating last login of user
                            const id=result[0][0].id;
                            connection.query(`update Users set lastlogin='`+dt+`' where email='`+params['email']+`';`, function (err, result) {
                                connection.end();
                                if (err) {
                                    //returns flag=0 as database connection fails
                                    response['code']= 0;
                                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                                    reject(JSON.stringify(response));
                                }else {
                                    //success update of database hence login success flag=1
                                    response['code']= 1;
                                    response['info']= "Logined";
                                    response['id']=id;
                                    response['admin']=false;
                                    resolve(JSON.stringify(response));
                                }
                            });
                        }
                    }
                });
            }).catch(function (err) {
                //returns flag=0 as database connection fails
                response['code']= 0;
                response['info']= "Oops! looks like we have some problem with our database. Please try again";
                reject(JSON.stringify(response));
            })
        }).catch(function (resp) {
            //return flag=0 if google verification fails
            response=resp;
            reject(JSON.stringify(response));
        });
    });
};

//google verify function
let GoogleVerify= function GoogleVerify(token) {
    return new Promise(function (resolve, reject) {
        const response= {};
        const {OAuth2Client} = require('google-auth-library');
        const client= new OAuth2Client("44329165683-24uag3q8muus5d683c212pdk6p1706hk.apps.googleusercontent.com");      //gapi client id
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: "44329165683-24uag3q8muus5d683c212pdk6p1706hk.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });

            //continue if authenticated or go to catch
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            const hd= payload['hd'];

            if (hd===undefined) {
                //email account selected is not IIITD's. reject request to login
                response['code']=0;
                response['info']="Please use your iiitd.ac.in email account";
                reject(response);
            }else if (hd.toLowerCase()==='iiitd.ac.in') {
                //email account selected is IIITD's. save in database and login
                response['code']=1;
                response['info']="Sign In Complete";
                resolve(response);
            }else {
                //email account selected is not IIITD's. reject request to login
                response['code']=0;
                response['info']="Please use your iiitd.ac.in email account";
                reject(response);
            }
        }


        verify().catch(function () {        //authentication failed
            response['code']=0;
            response['info']="Couldn't verify account";
            reject(response);
        });
    });
};

//database connection function: returns connection variable or err
let connectDB= function connectDB() {
    return new Promise(function (resolve, reject) {
        const mysql= require('mysql');
        const conn=mysql.createConnection({
            host: "remotemysql.com",
            port: 3306,
            user: "4y1kC9vQqC",
            password: "orSRZaZeRh",
            database: "4y1kC9vQqC",
            multipleStatements: true
        });
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }else {
                resolve(conn);
            }
        });
    });
};
