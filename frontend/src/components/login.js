import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar } from '@mui/material';


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook for navigation
  
    const handleLogin = async (e) => {
      e.preventDefault();
      // Simple client-side validation
      if (!username || !password) {
        setError('Username and password are required');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials : 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          localStorage.setItem('token', data.token); // Store the username in local storage
          if (data.username === 'admin') {
            navigate('/calls'); // Navigate to the admin calls page
          } else {
            navigate('/dashboard'); // Navigate to the regular user dashboard
          } // Navigate to the dashboard
        } else {
          setError('Failed to login. Please check your credentials.');
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
      }
    };

    return (
        <>
          <AppBar position="static">
            <Toolbar>
              <img src="/opeinapp.jpg" alt="Logo" style={{ maxHeight: '50px' }} />
              {/* Add additional items to the AppBar here if needed */}
            </Toolbar>
          </AppBar>
          <Container component="main" maxWidth="xs" style={{ marginTop: '20px' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Dashboard Login
              </Typography>
              <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                {error && <Typography color="error">{error}</Typography>}
              </Box>
            </Box>
          </Container>
        </>
      );
    }  
export default Login;
