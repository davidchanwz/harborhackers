// src/pages/Page1.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

function Home() {
    return (
        <Box p={8}>
            <Heading>Home</Heading>
            <Text mt={4}>This is the content for Home.</Text>
        </Box>
    );
}

export default Home;