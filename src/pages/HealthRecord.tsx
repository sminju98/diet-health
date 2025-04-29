import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { LocalHospital, FitnessCenter, Restaurant, MonitorHeart, Timeline } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, limit, query, where } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface HealthRecord {
  id: string;
  weight: string;
  bloodPressure: string;
  bloodSugar: string;
  exercise: string;
  diet: string;
  createdAt: any;
}

const HealthRecord: React.FC = () => {
  const [formData, setFormData] = useState({
    weight: '',
    bloodPressure: '',
    bloodSugar: '',
    exercise: '',
    diet: '',
  });
  const [recentRecord, setRecentRecord] = useState<HealthRecord | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchRecentRecord();
    fetchRecords();
  }, []);

  const fetchRecentRecord = async () => {
    try {
      const healthRecordsRef = collection(db, 'healthRecords');
      const q = query(healthRecordsRef, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setRecentRecord({
          id: doc.id,
          ...doc.data()
        } as HealthRecord);
      }
    } catch (error) {
      console.error('Error fetching recent record:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const healthRecordsRef = collection(db, 'healthRecords');
      const q = query(healthRecordsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const recordsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const healthRecordRef = collection(db, 'healthRecords');
      await addDoc(healthRecordRef, {
        ...formData,
        createdAt: serverTimestamp(),
      });
      
      setFormData({
        weight: '',
        bloodPressure: '',
        bloodSugar: '',
        exercise: '',
        diet: '',
      });
      
      await fetchRecentRecord();
      await fetchRecords();
      
      setSnackbar({
        open: true,
        message: '건강 기록이 성공적으로 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving health record:', error);
      setSnackbar({
        open: true,
        message: '건강 기록 저장 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const chartData = records.map(record => ({
    date: formatDate(record.createdAt),
    체중: parseFloat(record.weight) || 0,
    혈당: parseFloat(record.bloodSugar) || 0,
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        건강 기록
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="오늘의 기록" icon={<MonitorHeart />} />
        <Tab label="변화 추이" icon={<Timeline />} />
      </Tabs>

      {tabValue === 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="체중 (kg)"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="혈압 (mmHg)"
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="혈당 (mg/dL)"
                      name="bloodSugar"
                      value={formData.bloodSugar}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="운동 기록"
                      name="exercise"
                      value={formData.exercise}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="식단 기록"
                      name="diet"
                      value={formData.diet}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      기록 저장
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} component="div">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MonitorHeart sx={{ mr: 1 }} />
                      <Typography variant="h6">최근 건강 상태</Typography>
                    </Box>
                    {recentRecord ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          체중: {recentRecord.weight}kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          혈압: {recentRecord.bloodPressure}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          혈당: {recentRecord.bloodSugar}mg/dL
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        최근 기록이 없습니다.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FitnessCenter sx={{ mr: 1 }} />
                      <Typography variant="h6">운동 기록</Typography>
                    </Box>
                    {recentRecord?.exercise ? (
                      <Typography variant="body2" color="text.secondary">
                        {recentRecord.exercise}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        최근 운동 기록이 없습니다.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Restaurant sx={{ mr: 1 }} />
                      <Typography variant="h6">식단 기록</Typography>
                    </Box>
                    {recentRecord?.diet ? (
                      <Typography variant="body2" color="text.secondary">
                        {recentRecord.diet}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        최근 식단 기록이 없습니다.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            체중 및 혈당 변화 추이
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="체중"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="혈당"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthRecord; 