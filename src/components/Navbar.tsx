import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatIcon from '@mui/icons-material/Chat';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <LocalHospitalIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          건강 관리 시스템
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<LocalHospitalIcon />}
          >
            건강 기록
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/ai-chat"
            startIcon={<ChatIcon />}
          >
            AI 약사 상담
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 