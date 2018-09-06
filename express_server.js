const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString(length) {
  var randomString = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for( var i=0; i < length; i++ )
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  return randomString; 
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDB = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "simple"
  }
}
 const addNewUser = function(id, userEmail, password){
    newRecord = {
      "id": id,
      "userEmail": userEmail,
      "password": password
    };
    return newRecord;
 }



app.get("/", (req, res) => {
  res.send("Hello from new Location!");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {  username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); 
  urlDatabase[generateRandomString()] = req.body.longURL;
  
  res.redirect("/urls")
});
// console.log(urlDatabase);
app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
}); 
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params)
 delete urlDatabase[req.params.id]
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  console.log(req.body)
  urlDatabase[req.params.id]= req.body.longURL
  res.redirect("/urls");
});
 
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  //clear.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  // let templateVars = {  username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const generatedId = generateRandomString(6); 
  const userEmail = req.body.email;
  const password = req.body.password;


  const newUser = addNewUser(generatedId, userEmail, password); //calling this function
  usersDB[generatedId] = newUser // adding the new user to DB, everytime we send POST request
  console.log(JSON.stringify(usersDB));
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
