const express = require("express");
const app = express();
const body_parser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

mongoose.connect('mongodb://localhost:27017/blog_app_demo', { //accessing "hard drive"
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(express.static("public"));
app.use(body_parser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(expressSanitizer());

let blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

let	Blog_post = mongoose.model("blog", blogSchema);

mongoose.set('useFindAndModify', false);

app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.get("/blogs", function(req, res){
	Blog_post.find({}, function(err, all_blog_posts){
		if(err){
			console.log("error. watch out");
			console.log(err);
		} else {
			res.render("index", {blogs: all_blog_posts});
		}
	});
});

app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog_post.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id", function(req, res){
	Blog_post.findById(req.params.id, function(err, found_blog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: found_blog});
		}
	});
});

app.get("/blogs/:id/edit", function(req, res){
	Blog_post.findById(req.params.id, function(err, found_blog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: found_blog});
		}
	});
});

app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog_post.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updated_blog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", function(req, res){
	Blog_post.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});


app.listen(3000, function() { 
  console.log('Server listening on port 3000'); 
});