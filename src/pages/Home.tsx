import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        건강 관리 시스템
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        건강 기록과 AI 약국 상담을 통해 더 나은 건강을 관리하세요
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        <Grid item>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/health-record')}
          >
            건강 기록
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/pharmacy-chat')}
          >
            AI 약국 상담
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 