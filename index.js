const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2/promise');
require('dotenv').config();  //read in the .env file
                             //store sensitive information in .env

const app = express();

app.use(express.urlencoded({
    extended: false
})); // enable forms

app.use(express.static('images'));

app.get('/recipes/add', function(req, res){
    res.render("newRecipe");
});

app.post('/recipes', async function(req, res){
    const { name, ingredients, instructions } = req.body;
    await pool.query('INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)', 
                     [name, ingredients, instructions]);
    res.redirect('/recipes_02');
});

// set up a database (create a connection pool)
// initialise the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.set("view engine", "ejs");

app.get("/", function(req,res){
	res.render("home.ejs");
});

app.get("/recipes_01", async function(req, res){
    const [results] = await pool.query ("SELECT * from recipes");

    //with array destructuring
    // const response await poo.query("SELECT * from recipes");
    //const results = response[0];

    res.json(results); //res.json will format the argument as JavaScript object string
});

app.get('/recipes_02', async function(req,res){
    const [results] = await pool.query('SELECT * FROM recipes');
    res.render("recipes", { recipes: results });
});

app.get('/recipes/:id/edit', async function(req, res){
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
    res.render("editRecipe", { recipe: results[0] });
});

app.post('/recipes/:id', async function(req, res){
    const { id } = req.params;
    const { name, ingredients, instructions } = req.body;
    await pool.query('UPDATE recipes SET name = ?, ingredients = ?, instructions = ? WHERE id = ?', [name, ingredients, instructions, id]);
    res.redirect('/recipes_02');
});

app.get('/recipes/:id/delete', async function(req, res){
    const { id } = req.params;
    await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.redirect('/recipes_02');
});

// start server
app.listen(8080, function(){
    console.log("Express server has started");
})