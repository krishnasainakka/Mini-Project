const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const mongoose = require("mongoose");
const schedule = require('node-schedule');

const session = require('express-session');

app.use(session({
  secret: 'project', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // Set the session expiration time (24 hours in this example)
  },
}));


require("./db/conn");
const SignupUser = require("./models/signup");
const NewsSignupUser = require("./models/newssignup");
const Article = require("./models/publish")
const { json } = require("express");

const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );

app.use(express.urlencoded({extended:false}));

app.use(express.json());

app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// Route to render the article page
app.get('/vote', async (req, res) => {
    try {
      const currentChannel = req.session.tvchannel;

      // Find all articles except those published by the current channel
      const articles = await Article.find({ tvchannel: { $ne: currentChannel }, published: false  });
      res.render('vote', { articles });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });  


  app.get('/dashboard', async (req, res) => {
    try {
      const tvchannel = req.session.tvchannel; // Retrieve the tvchannel from the session
      const filterDate = req.query.filterDate; // Retrieve the filter date from the query string
  
      let filterQuery = { tvchannel }; // Default query to retrieve articles for the given tv channel
  
      if (filterDate) {
        // If filterDate is provided, add the filter condition to the query
        filterQuery = {
          ...filterQuery,
          publishDate: {
            $gte: new Date(filterDate),
            $lt: new Date(new Date(filterDate).getTime() + 24 * 60 * 60 * 1000), // Add one day to include articles up to the end of the filterDate
          },
        };
      }
  
      // Find articles based on the filter query
      const articles = await Article.find(filterQuery);
  
      // Render the dashboard page with the articles data
      res.render('dashboard', { articles });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/displayarticles", async(req, res) => {
    
    res.render("displayarticles");
})


app.get('/newschannels', async (req, res) => {
    try {
      const newsChannels = await NewsSignupUser.find();
      res.render('newschannels', { newsChannels });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  
  // Render articles for a specific news channel whose upvotes are greater than downvotes in a table format
app.get('/newschannels/:id/articles', async (req, res) => {
    try {
      const id = req.params.id;
      const channel = await NewsSignupUser.findById(id);
      const tvchannel = channel.tvchannel;
      const articles = await Article.find({ tvchannel });
      
      const filterDate = req.query.filterDate; // Retrieve the filter date from the query string
  
      let filterQuery = { tvchannel, published:true }; // Default query to retrieve articles for the given tv channel
  
      if (filterDate) {
        // If filterDate is provided, add the filter condition to the query
        filterQuery = {
          ...filterQuery,
          publishDate: {
            $gte: new Date(filterDate),
            $lt: new Date(new Date(filterDate).getTime() + 24 * 60 * 60 * 1000), // Add one day to include articles up to the end of the filterDate
          },
        };
      }
  
      // Find articles based on the filter query
      const filteredArticles = await Article.find(filterQuery);

      res.render('displayarticles', { filteredArticles });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  

  app.get('/user', async (req, res) => {
    try {
      const newschannels = await NewsSignupUser.find();
      const articles = await Article.find({ published: true })
        .sort({ publishDate: -1 }) // Sort by publishDate field in descending order
        .limit(5); // Limit the result to 5 documents
      res.render('user', { newschannels, articles });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.get("/publisharticle", (req, res) => {;
     res.render("publisharticle");
});


app.post("/signup", async (req, res) => {
      try {
        const password = req.body.signuppassword;
        const cpassword = req.body.signupconfirmpassword;
        
        if(password == cpassword){
            const registerUser = new SignupUser({
                signupname: req.body.signupname,
                signupemail: req.body.signupemail,
                signuppassword: req.body.signuppassword,
                signupconfirmpassword: req.body.signupconfirmpassword
            });
       
            const registered = await registerUser.save();
            res.status(201).render("index");
        }
        else{
            res.send("password are not matching");
        }
       
    } catch (error) {
        res.status(400).send(error);
    }    
});

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/newssignup", async (req, res) => {
  try {
    const password = req.body.newssignuppassword;
    const cpassword = req.body.newssignupconfirmpassword;
    if (password == cpassword) {
      const newsSignup = new NewsSignupUser({
        newssignupname: req.body.newssignupname,
        tvchannel: req.body.tvchannel,
        newssignupemail: req.body.newssignupemail,
        newssignuppassword: req.body.newssignuppassword,
        newssignupconfirmpassword: req.body.newssignupconfirmpassword,
        // photo: {
        //   data: req.file.buffer,
        //   contentType: req.file.mimetype
        // }
      });

      const savedSignup = await newsSignup.save();
      res.status(201).render("index");
    } else {
      res.send('Passwords do not match.');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/index", async(req, res) => {
    try {
        const email = req.body.loginemail;
        const password = req.body.loginpassword;

        const useremail = await SignupUser.findOne({signupemail:email});
        
        if(useremail.signuppassword === password){
            res.redirect('/user');
        }
        else{
            req.send("invalid login Details");
        }
        
    } catch (error) {
        res.status(400).send("Invalid login Details")
    }
});

app.post("/newsindex", async(req, res) => {
    try {
        const email = req.body.newsloginemail;
        const password = req.body.newsloginpassword;
        const tvchannel = req.body.tvchannel;

        const useremail = await NewsSignupUser.findOne({newssignupemail:email});
        
        if(useremail.newssignuppassword === password && useremail.tvchannel === tvchannel){
            req.session.tvchannel = tvchannel;
            res.redirect('/dashboard');
        }
        else{
            req.send("invalid login Details");
        }
        
    } catch (error) {
        res.status(400).send("Invalid login Details")
    }
});


app.post("/publisharticle", async (req, res) => {
  try {
    const id = req.body.id;
    const title = req.body.title;
    const tvchannelFromSession = req.session.tvchannel;
    const tvchannelFromForm = req.body.tvchannel;
    const url = req.body.url;

    // Validate that the tvchannel from the session matches the one submitted in the form
    if (tvchannelFromSession !== tvchannelFromForm) {
      alert("Entered Wrong TvChannel ");
      res.status(403).send('Invalid tvchannel');
      return;
    }

    //const publishDate = new Date(); // Create a new Date object with the current date and time
    const article = new Article({ id, title, tvchannel: tvchannelFromSession, url });

    await article.save();
    console.log('Article saved to database:', article);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

  
  app.post('/vote/:id/upvote', async (req, res) => {
    const articleId = req.params.id;
    console.log(articleId);
    try {
      const article = await Article.findById(new mongoose.Types.ObjectId(articleId));
      if (!article) {
        res.sendStatus(404);
        return;
      }
      console.log(article);
      article.upVotes++; // Increment the upVotes count
      const updatedArticle = await article.save();
      res.redirect('/vote');
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.post('/vote/:id/downvote', async (req, res) => {
    const articleId = req.params.id;
    console.log(articleId);
    try {
      const article = await Article.findById(new mongoose.Types.ObjectId(articleId));
      if (!article) {
        res.sendStatus(404);
        return;
      }
      console.log(article);
      article.downVotes++; // Increment the downVotes count
      const updatedArticle = await article.save();
      res.redirect('/vote');
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });


(() => {
  schedule.scheduleJob('*/1 * * * *', async () => {
    try {
      const thresholdUpvotes = 5; // Define the minimum number of upvotes required to publish an article
      const thresholdDownvotes = 3; // Define the maximum number of downvotes allowed to publish an article
      const publishDelay = 60 * 60 * 1000; // Define the delay in milliseconds after which an article can be published
  
      const articles = await Article.find({ published: false });
  
      for (const article of articles) {
        const elapsedMilliseconds = Date.now() - article.publishDate.getTime();
  
        if (
          article.upVotes >= thresholdUpvotes &&
          article.downVotes <= thresholdDownvotes &&
          elapsedMilliseconds >= publishDelay
        ) {
          article.published = true;
          await article.save();
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
})();


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})