const express = require("express");
const mongoose =  require("mongoose");
const cors = require("cors");
require('dotenv').config()
const app = express();

app.use(express.json());

app.use(cors());


// connecting DB
// mongoose.connect(process.env.MONGODB_URI+"/mern-app")
mongoose.connect(process.env.MONGODB_URI + "/mern-app")

.then(() => {
    console.log("DB connected");
})
.catch((err) => {
    console.log(err);
})

// creating todoschema
const todoSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: String
});

// creating model
const todoModel = mongoose.model("Todos", todoSchema); 

// sample memory storage for todo items
let = todos = [];

// creat new todos items 
app.post("/todos" , async (req, res) => {
    const {title , description } = req.body;
    try {
    const newTodo = new todoModel({title ,  description});
     await newTodo.save();
    res.status(201).json(newTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
})

app.get("/" , async (req , res) => {
    try {
      res.send("welcome")
    } catch (error) {
         console.log(error);
         res.status(500).json({message:error.message});
    }
 })

// get all items 
app.get("/todos" , async (req , res) => {
   try {
     const todos = await todoModel.find();
     res.json(todos)
   } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
   }
})

// update todo items 
app.put("/todos/:id" , async (req , res) => {
    try { 
    const {title , description } = req.body;
    const id = req.params.id;
      const updatedTodo =  await todoModel.findByIdAndUpdate(
        id,
        {title , description},
        {new : true}
    )
    if(!updatedTodo){
        return res.status(404).json({ message:"Todo not found"})
    }
    res.json(updatedTodo)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
})

// delete todo items 
app.delete("/todos/:id" , async (req , res) => {
    try {
    const id = req.params.id;
    await todoModel.findByIdAndDelete(id);
    res.status(204).end();  
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log("server listeing on "  + port );
})