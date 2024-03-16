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
const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
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


app.post('/login', async (req, res) => {
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
      { expiresIn: '3h' }
    );
    console.log(token);
    // Sending JWT token back to the client
    res.json({ message: 'Login successful', token,username: user1.username });
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
      user: req.user.userId,
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
    const tasks = await task.find({ user:req.user.userId, deletedAt: null }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch tasks.', error: error.toString() });
  }
});

app.patch('/editstatus/:id', auth, async (req, res) => {
  try {
    const { status, dueDate } = req.body;
    const taskId = req.params.id;
    const task1 = await task.findById(taskId);
    if (!task1) {
      return res.status(404).send({ message: 'Task not found' });
    }

    if (status) task1.status = status;
    if (dueDate) {
      task1.dueDate = dueDate;
      task1.priority = calculatePriority(dueDate);
    };

    await task1.save();
    
    if (status === 'DONE') {
      await subtask.updateMany({ task: taskId }, { status: 1 });
    }

    res.status(200).json(task1); 
  } catch (error) {
    res.status(400).send({ message: 'Failed to update the task', error: error.toString() });
  }
});

app.post('/addsubtask', auth, async (req, res) => {
  try {
    const { task1, title, status } = req.body;
    const taskid = task1;
    const subTask1 = new subtask({ task:task1, title, status });
    await subTask1.save();
    const subtasks = await subtask.find({ task:taskid });
    console.log(subtasks);
    const allComplete = subtasks.every(st => st.status === 1);
    const anyComplete = subtasks.some(st => st.status === 1);

    let parentTaskStatus = 'TODO';
    if (allComplete) {
      parentTaskStatus = 'DONE';
    } else if (anyComplete) {
      parentTaskStatus = 'IN_PROGRESS';
    }

    await task.findByIdAndUpdate(taskid, { status: parentTaskStatus });
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

app.get('/subtasks/:taskId', auth, async (req, res) => {
  try {
    const subtasks = await subtask.find({
      task: req.params.taskId,
      deletedAt: null
    });

    if (!subtasks) {
      return res.status(404).send({ message: 'Subtasks not found' });
    }

    res.send(subtasks);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch subtasks', error: error.toString() });
  }
});

app.patch('/edit-subtask-status/:subtaskId', async (req, res) => {
  const { subtaskId } = req.params;
  const { status } = req.body;
  try {
    // Update the specified subtask
    const subtask1 = await subtask.findByIdAndUpdate(subtaskId, { status }, { new: true });
    if (!subtask1) {
      return res.status(404).send({ message: 'Subtask not found' });
    }

    // Fetch all subtasks for the parent task to check their statuses
    const subtasks = await subtask.find({ task: subtask1.task });
    const parentTask = await task.findById(subtask1.task);

    if (!parentTask) {
      return res.status(404).send({ message: 'Parent task not found' });
    }

    // Determine the parent task's status based on its subtasks
    const allComplete = subtasks.every(st => st.status === 1);
    const anyComplete = subtasks.some(st => st.status === 1);

    if (allComplete) {
      parentTask.status = 'DONE';
    } else if (anyComplete) {
      parentTask.status = 'IN_PROGRESS';
    } else {
      parentTask.status = 'TODO';
    }

    await parentTask.save();
    res.send({ subtask1, parentTask });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update subtask status', error: error.toString() });
  }
});

app.patch('/delete-subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const deletedAt = new Date(); // Capture the current timestamp

    const subtask1 = await subtask.findByIdAndUpdate(subtaskId, { deletedAt }, { new: true });

    if (!subtask1) {
      return res.status(404).send({ message: 'Subtask not found' });
    }

    res.send({ message: 'Subtask deleted successfully', subtask1 });
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete subtask', error: error.toString() });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token'); // Assuming your token is stored in a cookie named 'token'
  res.send({ message: 'Logged out successfully' });
});

app.get('/admincalls',auth, async (req, res) => {
  try {
    const now = new Date();
    const usersWithOverdueTasks = await task.aggregate([
      { $match: { dueDate: { $lt: now }, deletedAt: null,status : {$ne : "DONE"} } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } },
      { $unwind: '$userData' },
      { $sort: { 'userData.priority': 1 } },
      {
        $group: {
          _id: '$user',
          priority: { $first: '$userData.priority' },
          phoneNumber: { $first: '$userData.phoneNumber' },
          username: { $first: '$userData.username' },
          tasks: {
            $push: {
              taskId: '$_id',
              title: '$title',
              dueDate: '$dueDate',
              taskPriority: '$priority' // Renamed to avoid confusion with user's priority
            }
          }
        }
      },
      // Optionally, if you need further details from the user document, you can do another $lookup here
      { 
        $project: {
          _id: 0,
          username: 1,
          phoneNumber: 1,
          userPriority: '$priority', // Renamed to clarify this is the user's priority
          tasks: 1
        } 
      },
      { $sort: { userPriority: 1 } }
    ]);
    
   console.log(usersWithOverdueTasks);
    res.json(usersWithOverdueTasks);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching users with overdue tasks', error: error.toString() });
  }
});


app.post('/start-calling-process', async (req, res) => {
  const { user } = req.body; 
  console.log("test",user);
  try {

    const message = `Hello ${user.username}, you are behind on your task.`;
    twilioClient.calls.create({
    statusCallback: 'https://5145-103-159-192-66.ngrok-free.app/histcalls',
    statusCallbackMethod: 'POST',
         url: 'http://demo.twilio.com/docs/voice.xml',
         to: `+91${user.phoneNumber}`,
         from:  process.env.TWILIO_PHONE_NUMBER
       }).then(call => console.log(call));
   
       setTimeout(() => {
        res.send({ message: 'Call initiated and task due date updated.' });
      }, 40000); // 40000 milliseconds = 40 seconds
  } catch (error) {
    console.error('Failed to initiate call and update task:', error);
    res.status(500).send({ message: 'An error occurred.' });
  }
});

app.post('/histcalls',async(req,res)=>{
  console.log(req.body.CallStatus);
  if(req.body.CallStatus==="completed"){
    const number1 = req.body.To.substring(3);
    console.log(number1);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of the day

    // Find the user by phone number
    const user1 = await user.findOne({ phoneNumber: number1 });
    console.log(user1);
    if (!user1) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Find the highest priority task that's due before today for this user
    const task1 = await task.findOne({ 
      user: user1._id, 
      dueDate: { // Greater than or equal to start of yesterday
        $lt: today       // But less than today (start of today)
      }
    }) // Sort by highest priority, then earliest due date
    .limit(1);
    const newDueDate = new Date(task1.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 2);
    const updatedTask = await task.findByIdAndUpdate(task1._id, { dueDate: newDueDate }, { new: true });
    console.log(updatedTask);
    console.log(task1);
  }

})
