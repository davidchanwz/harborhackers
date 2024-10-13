// src/pages/Page2.jsx
import React from 'react';
import ChatbotPage from '../components/Chatbox';
import { Box, Heading, Text } from '@chakra-ui/react';

function PortPal() {
  return (
    <Box p={8}>
      <ChatbotPage />
    </Box>
  );
}

export default PortPal;