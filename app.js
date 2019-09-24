const express= require('express');
const bodyParser= require('body-parser');
const favicon= require('serve-favicon');
const session= require('express-session');
const request = require('request');
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

app.listen(80, function () {
    console.log("Listening on server port: 80");
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
    const response={};
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
    params['id']=req.body.id.trim();
    if (email===req.session.email && req.session.admin===true) {
        ChangeSemester(params).then(function (response) {
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

app.post('/approveRequest', function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    params['id']=req.body.id.trim();
    params['hostel_allocated']=req.body.hostel_allocated.trim();
    params['room_allocated']=req.body.room_allocated.trim();
    params['name']=req.body.name.trim();
    if (email===req.session.email && req.session.admin===true) {
        ApproveRequest(params).then(function (response) {
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

//add admin
app.get('/addAdminPanel', function (req, res) {
    if (req.session.email && req.session.admin===true) {
        res.sendFile(__dirname+"/public/html/addAdminPanel.html");
    }else {
        res.redirect('/');
    }
});


app.get('/allRequests', function (req, res) {
    if (req.session.email && req.session.admin===true) {
        res.sendFile(__dirname+"/public/html/allrequests.html");
    }else {
        res.redirect('/');
    }

});

app.post('/getAllRequests', function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    if (email===req.session.email && req.session.admin===true) {
        AllRequests(params).then(function (response) {
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

//add new Semester
app.post("/addSemester", function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    params['name']=req.body.name.trim().toLowerCase();
    if (email===req.session.email && req.session.admin===true) {
        AddSemester(params).then(function (response) {
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


//add new Semester
app.post("/getSemesters", function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    if (email===req.session.email && req.session.admin===true) {
        GetSemesters(params).then(function (response) {
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

app.post('/getFees', function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    if (email===req.session.email && req.session.admin===true) {
        GetFees(params).then(function (response) {
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

app.post('/saveFees', function (req, res) {
    const email=req.body.email.trim();
    const params= {};
    params['email']=email;
    params['f1']=req.body.f1.trim();
    params['f2']=req.body.f2.trim();
    params['f3']=req.body.f3.trim();
    params['f4']=req.body.f4.trim();
    params['f5']=req.body.f5.trim();

    if (email===req.session.email && req.session.admin===true) {
        SaveFees(params).then(function (response) {
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

//invalid routes
app.get("*", function (req, res) {
    res.sendFile(__dirname+"/public/html/error.html");
});

//invalid routes
app.post("*", function (req, res) {
    res.sendFile(__dirname+"/public/html/error.html");
});


let SaveFees= function SaveFees(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`update Fees set fees =(case when id=1 then `+params['f1']+` when id=2 then `+params['f2']+` when id=3 then `+params['f3']+` when id=4 then `+params['f4']+` when id=5 then `+params['f5']+` end)`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code'] = -1;
                    response['info'] = "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                } else {
                    response['code'] = 1;
                    response['info'] = "Fees updated";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

let GetFees= function GetFees(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`select * from Fees;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Fees info Found";
                    response['fees']= [];

                    for (let i=0;i<result.length;i++) {
                        let obj= {};
                        obj['id']=result[i].id;
                        obj['name']=result[i].name;
                        obj['fees']=result[i].fees;
                        response['fees'].push(obj);
                    }

                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


let GetSemesters= function GetSemesters() {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`Select * from Semesters;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Semesters info Found";
                    response['semesters']= [];

                    for (let i=0;i<result.length;i++) {
                        let obj= {};
                        obj['id']=result[i].id;
                        obj['name']=result[i].name;
                        obj['status']=result[i].status;
                        response['semesters'].push(obj);
                    }
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


// add semester
let AddSemester= function AddSemester(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`select * from Semesters where name="`+params['name']+`";`, function (err, result) {
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    if (result.length===0) {
                        connection.query(`insert into Semesters (name, status) values ("`+params['name']+`", 3)`, function (err, result) {
                            // 1: current semester      2: previous semester    3:future semesters
                            connection.end();
                            if (err) {
                                console.log(err);
                                response['code']=-1;
                                response['info']= "Oops! looks like we have some problem with our database. Please try again";
                                reject(JSON.stringify(response));
                            }else {
                                response['code']=1;
                                response['info']= "Semester added";
                                resolve(JSON.stringify(response));
                            }
                        });
                    }else {
                        response['code']=2;
                        response['info']= "Semester already exist!";
                        resolve(JSON.stringify(response));
                    }
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


//fetch all requests
let AllRequests= function AllRequests(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`select * from Admin where email='`+params['email']+`'; select Requests.*, Users.name, Users.email from Requests, Users where uid=Users.id and status!=0 order by distance desc;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']="Account Details";
                    let obj= {};
                    obj['id']=result[0][0].id;
                    obj['name']=result[0][0].name;
                    obj['email']=result[0][0].email;
                    obj['picture']=result[0][0].picture;
                    obj['lastlogin']=result[0][0].lastlogin;
                    response['user']= obj;

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
                        obj['distance']=result[1][i].distance;
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
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


//approve request
let ApproveRequest= function ApproveRequest(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            const dateTime = require('node-datetime');
            const dt = dateTime.create().format('Y-m-d H:M:S');
            connection.query(`update Requests set status=1, reviewed_by_name='`+params['name']+`', reviewed_by_email='`+params['email']+`', reviewed_on='`+dt+`', room_allocated='`+params['room_allocated']+`', hostel_allocated='`+params['hostel_allocated']+`' where id=`+params['id']+`;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Approved";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};

//reject request
let RejectRequest= function RejectRequest(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            const dateTime = require('node-datetime');
            const dt = dateTime.create().format('Y-m-d H:M:S');
            connection.query(`update Requests set status=3, reviewed_by_name='`+params['name']+`', reviewed_by_email='`+params['email']+`', reviewed_on='`+dt+`' where id=`+params['id']+`;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Rejected";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
            response['info']= "Oops! looks like we have some problem with our database. Please try again";
            reject(JSON.stringify(response));
        });
    });
};


//change sem function
let ChangeSemester= function ChangeSemester(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
        connectDB().then(function (connection) {
            connection.query(`update Requests set status=(case when status=0 then 4 when status=1 then 2 when status=3 then 4 end) where status=0 or status=1 or status=3; update Semesters set status=1 where status=2; update Semesters set status=2 where id=`+params['id']+`;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Semester Changed.";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
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
            connection.query(`select * from Admin where email='`+params['email']+`'; select Requests.*, Users.name, Users.email from Requests, Users where uid=Users.id and (status=0 or status=1 or status=3); select * from Semesters;`, function (err, result) {
                connection.end();
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']="Account Details";
                    let obj= {};
                    obj['id']=result[0][0].id;
                    obj['name']=result[0][0].name;
                    obj['email']=result[0][0].email;
                    obj['picture']=result[0][0].picture;
                    obj['lastlogin']=result[0][0].lastlogin;
                    response['user']= obj;

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
                        obj['distance']=result[1][i].distance;
                        obj['room_allocated']=result[1][i].room_allocated;
                        obj['hostel_allocated']=result[1][i].hostel_allocated;
                        obj['reviewed_on']=result[1][i].reviewed_on;
                        obj['name']=result[1][i].name;
                        obj['email']=result[1][i].email;
                        obj['reviewed_by_name']=result[1][i].reviewed_by_name;
                        obj['reviewed_by_email']=result[1][i].reviewed_by_email;
                        response['requests'].push(obj);
                    }
                    response['semesters']=[];
                    for (let i=0;i<result[2].length; i++) {
                        let obj={};
                        obj['id']=result[2][i].id;
                        obj['name']=result[2][i].name;
                        obj['status']=result[2][i].status;
                        response['semesters'].push(obj);
                    }
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
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
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Admin Added";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
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
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    response['code']=1;
                    response['info']= "Request Cancelled";
                    resolve(JSON.stringify(response));
                }
            });
        }).catch(function (err) {
            response['code']=-1;
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
            const dt = dateTime.create().format('Y-m-d H:M:S');

            const url="http://dev.virtualearth.net/REST/v1/Routes?wayPoint.1="+params['house_no']+",+"+params['locality']+",+"+params['city']+",+"+params['state']+",+"+params['pincode']+"&wayPoint.2=Indraprastha+Institute+of+Information+Technology+Delhi,+Okhla+Industrial+Estate,+Phase+III,+Near+Govind+Puri+Metro+Station,+New Delhi,+Delhi+110020&optimize=distance&distanceUnit=km&key=Ak_kpR98HPwCaUnY5WzO8_EN6sKtSIZ-_cov0gUmGi3tlLXawKiAogmFTDeGj2x0";
            request(url, function (error, resp, body) {
                if (error) {
                    console.log(error);
                    response['code']=-1;
                    response['info']= "Opps! we couldn't find the distance between your home and college. Please try again";
                    reject(JSON.stringify(response));
                }else {
                    //calculated distance from maps api
                    const distance=JSON.parse(body).resourceSets[0].resources[0].travelDistance;

                    //status 0:requested, 1:approved_current_sem, 2:was_approved, 3:rejected_current_sem, 4:was rejected
                    connection.query(`insert into Requests (uid, request_time, prefered_hostel, semester, type, house_no, locality, city, state, pincode, status, distance) values (`+params['id']+`, '`+dt+`', '`+params['prefered_hostel']+`', '`+params['semester']+`', '`+params['type']+`', '`+params['house_no']+`', '`+params['locality']+`', '`+params['city']+`', '`+params['state']+`', '`+params['pincode']+`', 0, `+distance+`); update Users set house_no='`+params['house_no']+`', locality='`+params['locality']+`', city='`+params['city']+`', state='`+params['state']+`', pincode='`+params['pincode']+`' where email='`+params['email']+`';`, function (err, result) {
                        connection.end();
                        if (err) {
                            console.log(err);
                            response['code']=-1;
                            response['info']= "Oops! looks like we have some problem with our database. Please try again";
                            reject(JSON.stringify(response));
                        }else {
                            response['code']=1;
                            response['info']= "Request Placed";
                            resolve(JSON.stringify(response));
                        }
                    });
                }
            });
        }).catch(function (err) {
            response['code']=-1;
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
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                } else {
                    response['code']=1;
                    response['info']= "Account Details";
                    let obj= {};
                    obj['id']=result[0].id;
                    obj['name']=result[0].name;
                    obj['email']=result[0].email;
                    obj['picture']=result[0].picture;
                    obj['lastlogin']=result[0].lastlogin;
                    obj['house_no']=result[0].house_no;
                    obj['locality']=result[0].locality;
                    obj['city']=result[0].city;
                    obj['state']=result[0].state;
                    obj['pincode']=result[0].pincode;
                    response['user']=obj;

                    connection.query(`select * from Requests where uid=`+result[0].id+`; select * from Semesters; select * from Fees`, function (err, result2) {
                        connection.end();
                        if (err) {
                            response['code']=-1;
                            response['info']= "Oops! looks like we have some problem with our database. Please try again";
                            reject(JSON.stringify(response));
                        }else {
                            response['requests']=[];
                            for (let i=0;i<result2[0].length;i++) {
                                let obj={};
                                obj['id']=result2[0][i].id;
                                obj['uid']=result2[0][i].uid;
                                obj['request_time']=result2[0][i].request_time;
                                obj['prefered_hostel']=result2[0][i].prefered_hostel;
                                obj['semester']=result2[0][i].semester;
                                obj['type']=result2[0][i].type;
                                obj['house_no']=result2[0][i].house_no;
                                obj['locality']=result2[0][i].locality;
                                obj['city']=result2[0][i].city;
                                obj['state']=result2[0][i].state;
                                obj['pincode']=result2[0][i].pincode;
                                obj['status']=result2[0][i].status;
                                obj['distance']=result2[0][i].distance;
                                obj['room_allocated']=result2[0][i].room_allocated;
                                obj['hostel_allocated']=result2[0][i].hostel_allocated;
                                obj['reviewed_on']=result2[0][i].reviewed_on;
                                response['requests'].push(obj);
                            }

                            response['semesters']=[];
                            for (let i=0;i<result2[1].length;i++) {
                                let obj={};
                                obj['id']=result2[1][i].id;
                                obj['name']=result2[1][i].name;
                                obj['status']=result2[1][i].status;
                                response['semesters'].push(obj);
                            }

                            response['fees']=[];
                            for (let i=0;i<result2[2].length;i++) {
                                let obj={};
                                obj['id']=result2[2][i].id;
                                obj['name']=result2[2][i].name;
                                obj['fees']=result2[2][i].fees;
                                response['fees'].push(obj);
                            }
                            resolve(JSON.stringify(response));
                        }
                    });
                }
            })
        }).catch(function (err) {
            response['code']=-1;
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
                        response['code']= -1;
                        response['info']= "Oops! looks like we have some problem with our database. Please try again";
                        reject(JSON.stringify(response));
                    }else {
                        const dateTime = require('node-datetime');
                        const dt = dateTime.create().format('Y-m-d H:M:S');
                        if (result[1].length===1) {
                            //user is a admin
                            //update lastlogin and other information
                            connection.query(`update Admin set lastlogin='`+dt+`', name='`+params['name']+`', picture='`+params['picture']+`' where email='`+params['email']+`';`, function (err, result2) {
                                connection.end();
                                if (err) {
                                    //update failed
                                    console.log(err);
                                    response['code']= -1;
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
                                    response['code']= -1;
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
                                    response['code']= -1;
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
                response['code']= -1;
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
        const client= new OAuth2Client("254987550321-ej72qqgf14aukermqq3aeass0br4vf3n.apps.googleusercontent.com");      //gapi client id
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: "254987550321-ej72qqgf14aukermqq3aeass0br4vf3n.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
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
            password: "lvhOrLSbsl",
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
