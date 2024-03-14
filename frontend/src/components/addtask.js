// In src/components/AddTask.js
import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem,Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomAppBar from './appbar';

const AddTask = () => {
    const navigate = useNavigate();
    const [taskData, setTaskData] = useState({
      title: '',
      description: '',
      dueDate: '',
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
    const handleChange = (event) => {
      const { name, value } = event.target;
      setTaskData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      // Check all fields are filled
      if (!taskData.title || !taskData.description || !taskData.dueDate) {
        setSnackbarSeverity('error');
        setSnackbarMessage('All fields are required');
        setOpenSnackbar(true);
        return;
      }
  
      try {
        // API call to add the task
        const response = await fetch('http://localhost:5000/addtask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // assuming the token is stored in localStorage
          },
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (response.ok) {
            setSnackbarSeverity('success');
            setSnackbarMessage('Task submitted successfully');
            setOpenSnackbar(true);
      
            // Wait for 2 seconds before navigating to allow the user to read the message
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
        } else {
        setSnackbarSeverity('error');
        setSnackbarMessage(data.message || 'Failed to create task'); // Use the backend's error message
        setOpenSnackbar(true);
        }
      } catch (error) {
        setSnackbarSeverity('error');
        setSnackbarMessage(error.message || 'An error occurred');
        setOpenSnackbar(true);
      }
    };
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
      };

  return (
    <>
    <CustomAppBar/>
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Add New Task
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Task Title"
            name="title"
            autoFocus
            value={taskData.title}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="description"
            label="Description"
            id="description"
            multiline
            rows={4}
            value={taskData.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="dueDate"
            label="Due Date"
            type="date"
            name="dueDate"
            InputLabelProps={{ shrink: true }}
            value={taskData.dueDate}
            onChange={handleChange}
          />
         
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Add Task
          </Button>
        </Box>
      </Box>
    </Container>
    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTask;
