import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar,styled } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const UserHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)' // Light border for separation
});

const UserInfo = styled('div')({
  marginLeft: '10px'
});

const CustomAppBar = ({ username }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
 
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include', // Important for including cookies in the request
      });
  
      if (response.ok) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src="/opeinapp.jpg" alt="Logo" style={{ maxHeight: '50px', marginRight: '20px' }} />
          <Button color="inherit" component={Link} to="/dashboard" sx={{ marginX: 1 }}>Home</Button>
        </Box>
        <IconButton
          onClick={handleMenu}
          size="large"
          edge="end"
          color="inherit"
        >
          <Avatar src="/public/assets/admin/img/profiles/avatar-01.jpg" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <UserHeader>
            <Avatar src="/public/assets/admin/img/profiles/avatar-01.jpg" />
            <UserInfo>
              <Typography variant="subtitle1">{username || 'Admin'}</Typography>
              <Typography variant="body2" color="textSecondary">Administrator</Typography>
            </UserInfo>
          </UserHeader>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
