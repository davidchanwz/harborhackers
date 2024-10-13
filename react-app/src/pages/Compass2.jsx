// src/pages/Compass.jsx
import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import CourseList from '../components/CourseList'; // Adjust the import path if necessary

function Compass() {
    return (
        <Box p={8}>
            <CourseList />
        </Box>
    );
}

export default Compass;
