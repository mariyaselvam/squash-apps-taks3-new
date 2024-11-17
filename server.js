const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(`${process.env.MONGODB_URI}/mern-app`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    socketTimeoutMS: 45000,         // Close sockets after 45 seconds
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit if unable to connect
  });

// Enable Mongoose Debugging (Optional, for development purposes)
mongoose.set("debug", true);

// Define Todo Schema
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

// Create Todo Model
const Todo = mongoose.model("Todo", todoSchema);

// Routes

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Todo API");
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
    // Check MongoDB connection state
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database connection error" });
    }

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

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Todo ID" });
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
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

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Todo ID" });
  }

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
