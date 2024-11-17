const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI+"/mern-app") // Simplified connection string
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit the application if database connection fails
  });

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

// Todo Model
const Todo = mongoose.model("Todo", todoSchema);

// Routes

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Todo API");
});

// Health Check Route
app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ dbConnection: states[state] });
});

// Create a new Todo
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;

  try {
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get all Todos
app.get("/todos", async (req, res) => {
  try {
    // if (mongoose.connection.readyState !== 1) {
    //   return res.status(500).json({ message: "Database connection error" });
    // }

    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update a Todo by ID
app.put("/todos/:id", async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Todo ID" });
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description },
      { new: true } // Return the updated document
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Delete a Todo by ID
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Todo ID" });
  }

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting todo:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
