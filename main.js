const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//const router = express.Router();
require("dotenv").config();
const app = express();
const { Pool } = require('pg');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/CSS'));
app.use(express.static(__dirname + '/CSS/dashboard'));
app.use(express.static(__dirname + '/design'));

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login",  async function (req, res) {
  
    const username = req.body.usrname;
    const password = req.body.password;
  
    if (username != '' && password != '') {
      console.log("Found !");
      const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });
      console.log("Connection Established !");
      await pool.query('SELECT * FROM users WHERE usrname = $1', [req.body.usrname],
        (err, res) => {
          if (!err) {
            if (res.rows[0] != null && req.body.usrname == res.rows[0].usrname) {
              const password = req.body.password;
              const username = req.body.usrname;
              console.log("The entered password is: -" + password);
              const hash = res.rows[0].password;
              console.log("The hashed password is: - " + hash);
              bcrypt.compare(password, hash).then(function (result) {
                //console.log(result);
                if (result == true) {
                  const accessToken = (req, res)=>{
                    const token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET);
                    res.cookie(process.env.ACCESS_TOKEN_SECRET, token);
                  }
                  //console.log(accessToken.token);
                  pool.end();
                } else {
                  console.log("Wrong Password !");
                }
              });
            } else {
              console.log("Not Found !");
            }
          } else {
            console.log(err);
          }
        });

    } else {
      console.log("Please enter required feilds !");
    }
});
app.get('/usr', function (req, res) {
  res.sendFile(__dirname + "/usr.html");
});

app.get("/Signup", function (req, res) {

  res.sendFile(__dirname + "/Signup.html");
});

app.post("/Signup", async function (req, res) {
  try {
    if (req.body.usrname && req.body.password) {
      const username = req.body.usrname;
      const password = req.body.password;

      const hash = await bcrypt.hash(req.body.password, 10);
      const pool = await new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });
      await pool.query('INSERT INTO users (usrname, password) VALUES ($1, $2)', [req.body.usrname, hash],
        (err, res) => {
          console.log(err, res);
          pool.end();
        }
      );
      res.sendFile(__dirname + "/usr.html");
    }
    else {
      res.send("Please enter specific feilds !");
    }
  } catch (e) {
    console.log(e);
  }
});

app.listen(3000, function () {
  console.log("Server started at port 3000");
});