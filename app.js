const express = require("express");
const app = express();
const bodyParser=require("body-parser");
//DB configuration
const mysql      = require('mysql');
let config = require('./config.js');
let connection = mysql.createConnection(config);

//App Config
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


//Checking if databse is connected
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");  
    } else {
    console.log(err);  
    }
});




//Routes    ===============Don't refactor untill you do Authentication =========
app.get("/",(req,res)=>{
    res.send("MOshi Moshi to our service portal");
});


//===========================================TAXI ROUTES================================================

// let createTaxi=`create table if not exists taxi(
//     id int primary key auto_increment
//     ,model varchar(255)
//     ,numberplate varchar(10)
//     ,brand varchar(50)
//     ,yearOfPur varchar(6));`

// connection.query(createTaxi,(err,result,fields)=>{
//     if(err)
//         console.log(err);
//     else
//         console.log("bana diya re Taxi table");
//     connection.end();
// });



//New Taxi addition 
app.get("/taxi/new",(req,res)=>{
    res.render("./taxi/Newtaxi.ejs");
});
app.post("/taxi",(req,res)=>{
    let model=req.body.model;
    let numberplate=req.body.numberplate;
    let brand= req.body.brand;
    let yearOfPur=req.body.yearOfPur;
    let params=[model,numberplate,brand,yearOfPur];
    //adding data
    let createTaxi=`insert into taxi(model,numberplate,brand,yearOfPur) values (?,?,?,?);`
    
    connection.query(createTaxi,params,(err,result,fields)=>{
        if(err)
            console.log(err.message+"ye model bananne wla hai");
        else
        {
            console.log(result);
            console.log("Ye new  taxi post karne wala route hai");
        }
            
        // connection.end();
    });
       res.redirect("/taxi");
    //connection.end();
    
});

//List of all taxis
app.get("/taxi",(req,res)=>{
    connection.query(`select * from taxi;`,(err,result)=>{
        if(err){console.log(err.message+"Ye listing wala hai");}
        else
        {
            res.render("./taxi/taxi.ejs",{taxis:result});
        }
    });
    
});

//deleting the data from database
app.post("/taxi/delete/:id",(req,res)=>{
    connection.query(`delete from taxi where id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log("ye toh gaya bhau");
            res.redirect("/taxi");
        }
    });
})
//Edit form
app.get("/taxi/:id/edit",(req,res)=>{
    connection.query(`select * from taxi where id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log(result[0]);
            res.render("./taxi/edit.ejs",{taxi:result[0]});
        }
    });
});

app.post("/taxi/edit/:id",(req,res)=>{
    let model=req.body.model;
    let numberplate=req.body.numberplate;
    let brand= req.body.brand;
    let yearOfPur=req.body.yearOfPur;
    let val=[model,numberplate,brand,yearOfPur,req.params.id];
    console.log(val);
    connection.query(`update taxi set model=?,numberplate=?,brand=?,yearOfPur=? where id=?;`,val,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            res.redirect("/taxi");
        }
    });
})
//===========================================Driver Routes=======================

// let createDriver=`create table if not exists driver(
//     id int primary key auto_increment
//     ,name varchar(255)
//     ,age int
//     ,experiance varchar(50)
//     ,rating int
//     ,address varchar(255)
//     ,taxiid int
//     , FOREIGN KEY(taxiid) REFERENCES taxi(id)
//         ON UPDATE CASCADE
//         ON DELETE CASCADE);`

// connection.query(createDriver,(err,result,fields)=>{
//     if(err)
//         console.log(err.message);
//     else
//         console.log("bana diya re driver table");
//     connection.end();
// });

//List all the drivers
app.get("/driver",(req,res)=>{
    connection.query(`select driver.id,driver.name,driver.age,driver.experiance,driver.rating,driver.address ,taxi.model as model from taxi join driver where driver.taxiid=taxi.id;`,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            res.render("./driver/driver.ejs",{drivers:result});
        }
    });
    
});

//Add new Driver-- Form
app.get("/driver/new",(req,res)=>{
    res.render("./driver/newDriver.ejs");
});

//ADDING NESTED QUERY IN POST ROUTE
// app.post("/driver",(req,res)=>{
//     let name=req.body.name;
//     let age=req.body.age;
//     let experiance= req.body.experiance;
//     let rating=req.body.rating;
//     let address=req.body.address;
//     let taxiid=req.body.taxiid;

//     let params=[name,age,experiance,rating,address,taxiid];
//     //adding data
//     let createdriver=`insert into driver(name,age,experiance,rating,address,taxiid) values (?,?,?,?,?,?);`

//     connection.query(createdriver,params,(err,result,fields)=>{
//         if(err)
//             console.log(err.message+"ye model bananne wla hai");
//         else
//         {
//             console.log(result);
//             console.log("Ye new driver post karne wala route hai");
//         }
            
//         // connection.end();
//     });
//        res.redirect("/driver");
//     //connection.end();
// });

app.post("/driver",(req,res)=>{
    let name=req.body.name;
    let age=req.body.age;
    let experiance= req.body.experiance;
    let rating=req.body.rating;
    let address=req.body.address;
    let taxiname=req.body.taxiid;
    var taxiid;
    var params;
    //adding data
    let createdriver=`insert into driver(name,age,experiance,rating,address,taxiid) values (?,?,?,?,?,?);`

    //Fetch Data from taxi Table
    //let fetchDriver=`select id from taxi where model = ?;`;
    connection.query(`select id from taxi where model = ?;`,taxiname,(err,result)=>{
        if(err)
            console.log(err.message);
        else
        {
            setValue(result);
            //console.log(taxiid);
        }
    })
    //assigning value to varible and calling the function to add the paramss
    function setValue(value) {
        params= [name,age,experiance,rating,address,value[0].id];
        console.log(params);
        connection.query(createdriver,params,(err,result,fields)=>{
            if(err)
                console.log(err.message+"ye model bananne wla hai");
            else
            {
                console.log(result);
                console.log("Ye new driver post karne wala route hai");
            }
                
            // connection.end();
        });
    }
    

    console.log(params);

       res.redirect("/driver");
    //connection.end();
});

app.get("/driver/:id/edit",(req,res)=>{
    connection.query(`select driver.id,driver.name,driver.age,driver.experiance,driver.rating,driver.address ,taxi.model as model from taxi join driver where taxi.id=driver.taxiid and driver.id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log(result[0].id);
            res.render("./driver/edit.ejs",{driver:result[0]});
        }
    });
});

//Updating the Driver
app.post("/driver/edit/:id",(req,res)=>{
    let name=req.body.name;
    let age=req.body.age;
    let experiance= req.body.experiance;
    let rating=req.body.rating;
    let address=req.body.address;
    let taxiname=req.body.taxiid;
    var taxiid;
    var params;


    // let params=[name,age,experiance,rating,address,taxiid,req.params.id];
    //adding data
    let createdriver=`update driver set name=?,age=?,experiance=?,rating=?,address=?,taxiid=? where id=?;`

    //Fetching the id of taxi from Taxi Name
    connection.query(`select id from taxi where model = ?;`,taxiname,(err,result)=>{
        if(err)
            console.log(err.message);
        else
        {
            setValue(result);
            //console.log(taxiid);
        }
    })

    function setValue(value) {
        params= [name,age,experiance,rating,address,value[0].id,req.params.id];
        console.log(params);
        connection.query(createdriver,params,(err,result,fields)=>{
            if(err)
                console.log(err.message+"ye model bananne wla hai");
            else
            {
                console.log(result);
                console.log("Ye new driver post karne wala route hai");
                res.redirect("/driver");
            }
                
            // connection.end();
        });
    }


    // connection.query(createdriver,params,(err,result,fields)=>{
    //     if(err)
    //         console.log(err.message+"ye model bananne wla hai");
    //     else
    //     {
    //         console.log(result);
    //         res.redirect("/driver");
    //     }
            
    //     // connection.end();
    // });
       
})

//deleting the data from database
app.post("/driver/delete/:id",(req,res)=>{
    connection.query(`delete from driver where id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log("ye toh gaya bhau");
            res.redirect("/driver");
        }
    });
});


//===========================================User Routes==========================

// let createUser=`create table if not exists user(
//     id int primary key auto_increment
//     ,name varchar(255)
//     ,age int
//     ,address varchar(255));`

// connection.query(createUser,(err,result,fields)=>{
//     if(err)
//         console.log(err.message);
//     else
//         console.log("bana diya re User table");
// });

//List all the drivers
app.get("/user",(req,res)=>{
    connection.query(`select * from user;`,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            res.render("./user/user.ejs",{users:result});
        }
    });
    
});

//Add new User-- Form
app.get("/user/new",(req,res)=>{
    res.render("./user/newUser.ejs");
});

app.post("/user",(req,res)=>{
    let name=req.body.name;
    let age=req.body.age;
    let address=req.body.address;

    let params=[name,age,address];
    //adding data
    let createuser=`insert into user(name,age,address) values (?,?,?);`

    connection.query(createuser,params,(err,result,fields)=>{
        if(err)
            console.log(err.message+"ye model bananne wla hai");
        else
        {
            console.log(result);
            console.log("Ye new driver post karne wala route hai");
        }
            
        // connection.end();
    });
       res.redirect("/user");
    //connection.end();
});

app.get("/user/:id/edit",(req,res)=>{
    connection.query(`select * from user where id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log(result[0].id);
            res.render("./user/edit.ejs",{user:result[0]});
        }
    });
});

//Updating Value of user
app.post("/user/edit/:id",(req,res)=>{
    let name=req.body.name;
    let age=req.body.age;
    let address=req.body.address;

    let params=[name,age,address,req.params.id];
    //adding data
    let createdriver=`update user set name=?,age=?,address=? where id=?;`

    connection.query(createdriver,params,(err,result,fields)=>{
        if(err)
            console.log(err.message+"ye model bananne wla hai");
        else
        {
            console.log(result);
            res.redirect("/user");
        }
            
        // connection.end();
    });
       
});

//deleting the data from database
app.post("/user/delete/:id",(req,res)=>{
    connection.query(`delete from user where id=?;`,req.params.id,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            console.log("ye toh gaya bhau");
            res.redirect("/user");
        }
    });
});

//===============================================Transaction(Cab Booking)==============================

let createtransaction=`create table if not exists ride(
    id int primary key auto_increment
    ,estimateCost int 
    ,startingPoint varchar(24)
    ,endPoint varchar(24)
    ,driverId int
    ,custormerId int
    ,FOREIGN KEY(driverId) REFERENCES driver(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    ,FOREIGN KEY(custormerId) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    );`

connection.query(createtransaction,(err,result,fields)=>{
    if(err)
        console.log(err.message);
    else
        console.log("bana diya re Transaction table");
});

app.get("/book",(req,res)=>{
    res.render("book.ejs");
});

app.post("/ride",(req,res)=>{
    let estimateCost=req.body.estimateCost;
    let startingPoint=req.body.startingPoint;
    let endPoint=req.body.endPoint;
    let driverId=req.body.driverId;
    let custormerId=req.body.custormerId;

    let params=[estimateCost,startingPoint,endPoint,driverId,custormerId];
    //adding data
    let createuser=`insert into ride(estimateCost,startingPoint,endPoint,driverId,custormerId) values (?,?,?,?,?);`

    connection.query(createuser,params,(err,result,fields)=>{
        if(err)
            console.log(err.message+"ye model bananne wla hai");
        else
        {
            console.log(result);
            console.log("Ye new Ride post karne wala route hai");
        }
            
        // connection.end();
    });
       res.redirect("/user");
    //connection.end();
});

//List all the drivers
app.get("/ride",(req,res)=>{
    connection.query(`select ride.estimateCost,ride.startingPoint,ride.endPoint,driver.name as dname,user.name from ride join driver join user where driver.id=ride.driverId and ride.custormerId=user.id;`,(err,result)=>{
        if(err){console.log(err.message);}
        else
        {
            res.render("./rides.ejs",{rides:result});
        }
    });
    
});



app.get("*",(req,res)=>{
    res.render("404page.ejs");
});


//listening to correct port
var listener = app.listen(5000, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888

});