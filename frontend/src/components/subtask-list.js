import React, { useState, useEffect } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography
} from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import CustomAppBar from './appbar';
const SubtaskPage = () => {
  const [subtasks, setSubtasks] = useState([]);
  const { taskId } = useParams();
  const [openStatusModal, setOpenStatusModal] = useState(false);
const [currentSubtask, setCurrentSubtask] = useState({ id: '', status: 0 });

  useEffect(() => {
    const fetchSubtasks = async () => {
      const response = await fetch(`http://localhost:5000/subtasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include this if your API requires authentication
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubtasks(data);
      } else {
        // Handle errors or show an alert/notification
        console.error('Failed to fetch subtasks.');
      }
    };

    fetchSubtasks();
  }, [taskId]);

  const handleEditStatus = (subtaskId) => {
    // Implement the logic to edit the status of a subtask
    console.log('Edit status for subtask:', subtaskId);
  };

  const handleOpenStatusModal = (subtask) => {
    setCurrentSubtask(subtask);
    setOpenStatusModal(true);
  };
  
  const handleCloseStatusModal = () => {
    setOpenStatusModal(false);
  };
  
  const handleStatusChange = (event) => {
    setCurrentSubtask(prev => ({ ...prev, status: event.target.value }));
  };
  
  const handleSubmitStatusChange = async () => {
    try {
      const response = await fetch(`http://localhost:5000/edit-subtask-status/${currentSubtask._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include this if your API requires authentication
        },
        body: JSON.stringify({ status: currentSubtask.status }),
      });
  
      if (response.ok) {
        handleCloseStatusModal();
        window.location.reload();
        // Optionally, display a success message
      } else {
        throw new Error('Failed to update the subtask status.');
      }
    } catch (error) {
      console.error(error);
      // Optionally, display an error message
    }
  };
  
  const handleDeleteSubtask = async (subtaskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this subtask?");
    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/delete-subtasks/${subtaskId}`, {
          method: 'PATCH', // Changed from DELETE to PATCH
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        if (response.ok) {
          window.location.reload(); // Reload the page to reflect changes
          // Alternatively, filter out the soft-deleted subtask from state instead of reloading
        } else {
          throw new Error('Failed to delete the subtask.');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to delete the subtask. Please try again.');
      }
    }
  };
  
  

  
  return (
    <>
      <CustomAppBar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Subtasks</Typography>
        {subtasks.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Edit Status</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subtasks.map((subtask) => (
                  <TableRow key={subtask._id}>
                    <TableCell>{subtask.title}</TableCell>
                    <TableCell>{subtask.status === 0 ? 'Incomplete' : 'Complete'}</TableCell>
                    <TableCell>
                    <IconButton onClick={() => handleOpenStatusModal(subtask)}><EditIcon /></IconButton>

                    </TableCell>
                    <TableCell>
                    <IconButton onClick={() => handleDeleteSubtask(subtask._id)}><DeleteIcon /></IconButton>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )  : (
          <TableRow>
            <TableCell colSpan={4} align="center">No subtasks created</TableCell>
          </TableRow>
        )}
      </Container>
      <Dialog  open={openStatusModal} onClose={handleCloseStatusModal}>
  <DialogTitle>Change Subtask Status</DialogTitle>
  <DialogContent style={{ overflow: "visible" }}>
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select
        value={currentSubtask.status}
        label="Status"
        onChange={handleStatusChange}
      >
        <MenuItem value={0}>Incomplete</MenuItem>
        <MenuItem value={1}>Complete</MenuItem>
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseStatusModal}>Cancel</Button>
    <Button onClick={handleSubmitStatusChange}>Submit</Button>
  </DialogActions>
</Dialog>

    </>
  );
};


export default SubtaskPage;
