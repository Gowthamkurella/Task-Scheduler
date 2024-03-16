import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import CustomAppBar from './appbar';
import { Navigate } from 'react-router-dom';
export default function AdminCallsPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsersWithOverdueTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/admincalls', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
    });

        if (!response.ok) {
          // If server response wasn't ok, throw an error
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users with overdue tasks:', error);
      }
    };

    fetchUsersWithOverdueTasks();
  }, []);

  const handleMakeCalls = async () => {
    try {
        const topUser = users[0];

    if (!topUser) {
      console.error('No users with overdue tasks.');
      return;
    }
    const confirmCall = window.confirm(`Do you want to make a call to ${topUser.username}?`);
    if (confirmCall) {
      const response = await fetch('http://localhost:5000/start-calling-process', {
        method: 'POST', // Assuming a POST request to initiate the process
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user: users[0] })
      });
    
      if (response.ok) {
        console.log('Call process initiated successfully');
        window.location.reload();
        // Optionally, update the UI or notify the admin that calls are being made
      } else {
        console.error('Failed to initiate call process');
        // Handle errors, such as displaying an error message to the admin
      }
    }
    } catch (error) {
      console.error('Error initiating calls:', error);
      Navigate('/calls');
      // Handle any fetch errors
    }
  };
  

  return (
    <>
      <CustomAppBar />
      <Container style={{ marginTop: '100px' }}>
        <Button variant="contained" color="primary" onClick={handleMakeCalls} style={{ marginBottom: '20px' }}>
          Make Calls
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell >Task Title</TableCell>
                <TableCell >Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell > {user.tasks.map(task => task.title).join(", ")}</TableCell>
                  <TableCell>{user.userPriority}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
