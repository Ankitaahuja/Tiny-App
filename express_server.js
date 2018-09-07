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

var updatedDatabase = {
  "b2xVn2" : { shortURL: "b2xVn2",
                longURL: "http://www.lighthouselabs.ca",
                user_id: "userRandomID" // hardcorded 
                },
  "9sm5xK": {  shortURL: "9sm5xK",
               longURL: "http://www.google.com",
                user_id: "uasfvzzdf" // hardcorded
            }
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
// this function adds the new user into DB
 const addNewUser = function(userEmail, password){
  const generatedId = generateRandomString(6);
    const newUser = {
      id: generatedId,
      email: userEmail,
      password: password
    };
    usersDB[generatedId] = newUser
    return newUser;
 }
// this function will check if the user exists in DB
 const findUserByEmail = function (email) {

   for (let record in usersDB) {
     const user = usersDB[record]
     if (user.email === email) {
        return user; //returns the whole record of that user 
     }
   }
   return null;
 }
 const findUserByID = function (id) {

  for (let record in usersDB) {
    const user = usersDB[record]
    if (user.id === id) {
       return user; 
    }
  return null;
  } 
 }

 const findUrlsByID = function (id) {

  for (let urlsRecord in updatedDatabase) {
    // const user = usersDB[record]
    if (updatedDatabase[urlsRecord].user_id === id) {
       return urlsRecord; 
    }
  return null;
  } 
 }

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  if(req.cookies.user_id){
    let templateVars = { 
      username: req.cookies["user_id"],
   //changed username to user id by looking the user id from cookies, not using this now -->username:req.cookies.username,
      urls: updatedDatabase // DB has been updated with new id, shortURL and longURL from app.post
     };
    
    res.render("urls_index", templateVars);

    }else {
      res.redirect('/login')
    }
  });
  
//   let templateVars = {  
//     users: usersDB,
//     username: req.cookies["user_id"],
//     urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); 
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) { 
  let templateVars = {
    users: usersDB,
    username: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
} else{
  res.redirect("/login")
  }
});


// console.log(urlDatabase);
app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    users: usersDB, 
    username: findUserByEmail(req.cookies["user_id"]).email, 
    shortURL: req.params.id, urls: urlDatabase };
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
 
app.get("/login", (req, res) => {
  
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  if (!findUserByEmail(req.body.email)) {
    res.send("Email doesn't exist. Please register first");
    res.status(400);
  } else {
    if (findUserByEmail(req.body.email).password !== req.body.password){
      res.send("Email and Password doesn't match");
      res.status(400);
    }else{
  res.cookie('user_id', findUserByEmail(req.body.email).id);
  
  res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  
  res.render("urls_register");
});

app.post("/register", (req, res) => {
 
  const userEmail = req.body.email;
  const password = req.body.password;

   if (password !== req.body.confirmPassword || !password || !userEmail ) {
    res.send("Please provide valid email and password. Please make sure to match the passwords!")
    res.status(400);
   } 
   else if (findUserByEmail(userEmail)) {
     res.send("email already exists");
     res.status(400); 
   } else {
  const newUser = addNewUser(userEmail, password);
  res.cookie("user_id", findUserByEmail(userEmail).id);
  res.redirect("/");
  }
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
