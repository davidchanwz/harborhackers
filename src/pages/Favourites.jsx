// src/pages/Page1.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

function Favourites() {
    return (
        <Box p={8}>
            <Heading>Favourites</Heading>
            <Text mt={4}>This is the content for Favourites.</Text>
        </Box>
    );
}

export default Favourites;