import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem,
  Container, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import CustomAppBar from './appbar'; // Adjust the import path as needed
import { TablePagination } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select } from '@mui/material';


const Dashboard = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Adjust rows per page as needed
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState({ id: '', dueDate: '', status: '' });
  const [openSubtaskDialog, setOpenSubtaskDialog] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null); // To keep track of which task we're adding a subtask to

  const navigate = useNavigate();

  // Fetch tasks initially
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('http://localhost:5000/dashboard', { // Adjust API endpoint as needed
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllTasks(data.map(task => ({
          ...task,
          id: task._id.$oid,
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
        })));
      } else {
        navigate('/');
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks client-side based on filters
  useEffect(() => {
    setTasks(allTasks.filter(task => 
      (priorityFilter === "" || (priorityFilter === "1,2" ? [1, 2].includes(task.priority) : task.priority.toString() === priorityFilter)) &&
      (dueDateFilter === "" || new Date(task.dueDate).setHours(0,0,0,0) === new Date(dueDateFilter).setHours(0,0,0,0))
    ));
  }, [allTasks, priorityFilter, dueDateFilter]);
  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };
  
  const handleDueDateFilterChange = (event) => {
    setDueDateFilter(event.target.value);
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = (task) => {
    console.log(task);
    setEditingTask({ ...task });
    setOpenDialog(true);
  };
  
  const handleClose = () => {
    setOpenDialog(false);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({ ...prev, [name]: value }));
  };
  const handleUpdateTask = async () => {
    // Example API call to update the task
    // Adjust the URL, method, and body as per your API
    console.log(editingTask);
    const response = await fetch(`http://localhost:5000/editstatus/${editingTask._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ dueDate: editingTask.dueDate, status: editingTask.status }),
    });
  
    if (response.ok) {
      // Close the dialog and refresh the tasks list
      handleClose();
      window.location.reload();
    } else {
      // Handle errors
      console.error('Failed to update the task');
    }
  };
  
  const handleOpenSubtaskDialog = (taskId) => {
    setSelectedTaskId(taskId);
    console.log(taskId);
    setOpenSubtaskDialog(true);
  };
  
  const handleCloseSubtaskDialog = () => {
    setOpenSubtaskDialog(false);
    setNewSubtaskTitle('');
  };
  
  const handleSubtaskTitleChange = (event) => {
    setNewSubtaskTitle(event.target.value);
  };
  
  const handleSubmitSubtask = async () => {
    // Assuming the API expects the task ID to which the subtask belongs, and the title
    const body = { task1: selectedTaskId, title: newSubtaskTitle, status: 0 };
    const response = await fetch('http://localhost:5000/addsubtask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });
  
    if (response.ok) {
      // Optionally, fetch the tasks (or subtasks) again to update the list or update the state directly as appropriate
      handleCloseSubtaskDialog();
      window.location.reload();
    } else {
      console.error('Failed to create the subtask. Please try again.');
      // Handle error (e.g., show an error message)
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    
    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/taskdelete/${taskId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          window.location.reload();
          console.log('Task deleted successfully');
        } else {
          throw new Error('Failed to delete the task.');
        }
      } catch (error) {
        console.error('Error deleting the task:', error);
        // Handle error state or display error message as needed
      }
    }
  };
  
  

  return (
    <>
      <CustomAppBar />
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <TextField
              select
              label="Priority"
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              helperText="Filter by priority"
              size="small"
              sx={{ mr: 1 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">High</MenuItem>
              <MenuItem value="1,2">Medium</MenuItem>
              <MenuItem value="3">Low</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Due Date"
              value={dueDateFilter}
              onChange={handleDueDateFilterChange}
              helperText="Filter by due date"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/add-task')}>Add Task</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Change Status</TableCell>
                <TableCell>View Subtasks</TableCell>
                <TableCell>Add Subtask</TableCell>
                <TableCell>Delete Task</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() =>handleClickOpen(task)}><EditIcon /></IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/subtaskslist/${task._id}`)}><VisibilityIcon /></IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => {handleOpenSubtaskDialog(task._id)}}><AddIcon /></IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteTask(task._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
  component="div"
  count={tasks.length}
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
/>
<Dialog open={openDialog} onClose={handleClose}>
  <DialogTitle>Update Task</DialogTitle>
  <DialogContent>
    <FormControl fullWidth margin="normal">
      <TextField
        label="Due Date"
        type="date"
        name="dueDate"
        value={editingTask.dueDate}
        onChange={handleEditChange}
        InputLabelProps={{ shrink: true }}
      />
    </FormControl>
    <FormControl fullWidth margin="normal">
      <InputLabel>Status</InputLabel>
      <Select
        name="status"
        value={editingTask.status}
        label="Status"
        onChange={handleEditChange}
      >
        <MenuItem value="TODO">TODO</MenuItem>
        <MenuItem value="DONE">DONE</MenuItem>
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleUpdateTask}>Update</Button>
  </DialogActions>
</Dialog>

<Dialog open={openSubtaskDialog} onClose={handleCloseSubtaskDialog}>
  <DialogTitle>Add Subtask</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      id="subtaskTitle"
      label="Subtask Title"
      type="text"
      fullWidth
      variant="outlined"
      value={newSubtaskTitle}
      onChange={handleSubtaskTitleChange}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseSubtaskDialog}>Cancel</Button>
    <Button onClick={handleSubmitSubtask}>Submit</Button>
  </DialogActions>
</Dialog>

      </Container>
    </>
  );
};

export default Dashboard;
