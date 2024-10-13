// src/pages/Page1.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import TaskList from '../components/TaskList'; 

function DockWorks() {
    return (
        <Box p={8}>
            <TaskList />
        </Box>
    );
}

export default DockWorks;