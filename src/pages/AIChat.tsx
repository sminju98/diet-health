import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          text: '건강 관련 질문에 답변드리겠습니다. 어떤 도움이 필요하신가요?',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LocalHospitalIcon sx={{ mr: 2, fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          AI 약사 상담
        </Typography>
      </Box>
      <Paper
        elevation={3}
        sx={{
          height: '60vh',
          overflow: 'auto',
          mb: 2,
          p: 2,
          bgcolor: '#f5f5f5',
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {message.sender === 'ai' && (
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <LocalHospitalIcon />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <ListItemText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                    secondaryTypographyProps={{
                      color: message.sender === 'user' ? 'white' : 'text.secondary',
                    }}
                  />
                </Paper>
                {message.sender === 'user' && (
                  <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                    U
                  </Avatar>
                )}
              </ListItem>
              {index < messages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="건강 관련 질문을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          endIcon={<SendIcon />}
        >
          전송
        </Button>
      </Box>
    </Box>
  );
};

export default AIChat; 