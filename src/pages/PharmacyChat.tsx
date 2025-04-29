import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Grid,
} from '@mui/material';
import { Send as SendIcon, LocalPharmacy as PharmacyIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import OpenAI from 'openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: any;
}

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const PharmacyChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  useEffect(() => {
    const q = query(collection(db, 'pharmacyChats'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingResponse('약사가 답변을 준비중입니다...');

    try {
      // 사용자 메시지 저장
      await addDoc(collection(db, 'pharmacyChats'), {
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // 스트리밍 응답 생성
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `당신은 친근하고 따뜻한 성격의 전문 약사입니다. 사용자의 건강 관련 질문에 다음과 같은 방식으로 답변해주세요:

1. 모든 답변은 2-3문장으로 간단명료하게 해주세요. 불필요한 설명은 생략해주세요.

2. 친근한 톤을 유지하되, "~하시네요", "~하셨군요"와 같이 존댓말을 사용해주세요.

3. 사용자의 상황에 간단히 공감해주세요. 예: "힘드셨겠어요"

4. 전문적인 내용은 쉽고 간단하게 설명해주세요.

5. 약물 복용법, 부작용, 약물 상호작용 등 핵심 정보만 간단히 전달해주세요.

6. 가끔 이모지를 사용해 친근감을 표현해주세요.

7. 진단이나 처방은 절대 하지 마세요. 필요한 경우 병원 방문을 권유해주세요.

예시 답변:
"두통이 심하시군요 😔 휴식을 취하시고 물을 충분히 마셔보세요. 계속되면 병원에 가보시는 게 좋아요!"

"감기 기운이 있으시네요! 따뜻한 물을 자주 마시고 푹 쉬어보세요. 열이 나면 해열제를 복용하실 수 있어요."`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        setStreamingResponse(fullResponse);
      }

      // 최종 응답 저장
      await addDoc(collection(db, 'pharmacyChats'), {
        text: fullResponse,
        sender: 'ai',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // 에러 메시지 저장
      await addDoc(collection(db, 'pharmacyChats'), {
        text: "죄송합니다. 응답을 생성하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        sender: 'ai',
        timestamp: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
      setStreamingResponse('');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PharmacyIcon color="primary" />
          AI 약사 상담
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PharmacyIcon />
                    </Avatar>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {message.sender === 'user' ? '나' : 'AI 약사'}
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          {isLoading && (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PharmacyIcon />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    AI 약사
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 2
                  }}
                >
                  <Typography>{streamingResponse}</Typography>
                </Paper>
              </Box>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <form onSubmit={handleSend}>
          <Grid container spacing={1}>
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!input.trim() || isLoading}
                sx={{ height: '100%' }}
              >
                <SendIcon />
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default PharmacyChat; 