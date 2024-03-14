const conn = require("./connect");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');
const user = require('./models/user');
const task = require('./models/task');
const subtask = require('./models/subtask');

app.use(cors({
    origin: 'http://localhost:3000', // Assuming your React app runs on port 3000
    credentials: true, // Allowing sending cookies from the frontend
  }));

const PORT = 5000;
const ObjectId = mongoose.Types.ObjectId;
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const auth = (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Add the decoded user ID to the request object
      next();
    } catch (error) {
      res.status(401).send({ error: 'Please authenticate.' });
    }
  };
  

app.post('/login', async(req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    try {
      // Attempt to find the user by username
      const user1 = await user.findOne({ username: username });
      if (!user1) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Check if the passwords match
      // NOTE: In real applications, always hash passwords. This is for demonstration only.
      if (user1.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user1._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log(token);
      // Sending JWT token back to the client
      res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred during the login process.' });
    }
  });

  const calculatePriority = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const differenceInDays = (due - today) / (1000 * 3600 * 24);
  
    if (differenceInDays <= 0) return 0; // Due today
    if (differenceInDays <= 2) return 1; // Due tomorrow or day after
    if (differenceInDays <= 4) return 2; // Due in 3-4 days
    return 3; // Due in 5 or more days
  };

app.post('/addtask', auth, async (req, res) => {
    const { title, description, dueDate } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).send({ message: 'Title, description, and due date are required.' });
    }
  
    try {
      const priority = calculatePriority(dueDate);
  
      const newTask = new task({
        user : req.user.userId,
        title,
        description,
        dueDate,
        priority,
        status: 'TODO', // Initial status
      });
      await newTask.save();
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create the task.', error: error.message });
    }
  });


  app.get('/dashboard', auth, async (req, res) => {
    try {
        // Fetch tasks where 'deletedAt' is null and sort by 'createdAt' in descending order
        const tasks = await task.find({ deletedAt: null }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).send({ message: 'Failed to fetch tasks.', error: error.toString() });
      }
  });
  
  app.patch('/editstatus/:id', auth, async (req, res) => {
    try {
        const { status, dueDate } = req.body; 
        const taskId = req.params.id; 
        console.log(req.body,taskId);
        const task1 = await task.findById(taskId);
        console.log(task1);
        if (!task1) {
          return res.status(404).send({ message: 'Task not found' });
        }
    
        if (status) task1.status = status;
        if (dueDate) task1.dueDate = dueDate;
    
        await task1.save(); // Save the task document with updated fields
    
        res.status(200).json(task1); // Send back the updated task document
      } catch (error) {
        res.status(400).send({ message: 'Failed to update the task', error: error.toString() });
      }
    });

    app.post('/addsubtask',auth,async (req, res) => {
        try {
        const { task, title, status } = req.body;
        const subTask1 = new subtask({ task, title, status });
          await subTask1.save();
          res.status(201).send(subTask1);
        } catch (error) {
          res.status(400).send(error);
        }
      });

      app.delete('/taskdelete/:id', auth, async (req, res) => {
        try {
            const taskid = req.params.id;
            const update = { deletedAt: new Date() };
            const task1 = await task.findByIdAndUpdate(
                taskid,
                update, 
                { new: true } 
              );
              await subtask.updateMany({ task: taskid }, update);
          if (!task1) {
            return res.status(404).send({ message: 'Task not found.' });
          }
      
          res.send({ message: 'Task deleted successfully.', task1 });
        } catch (error) {
          res.status(500).send({ message: 'Failed to delete the task.', error: error.toString() });
        }
      });
      