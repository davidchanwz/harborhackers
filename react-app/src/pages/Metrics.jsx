// src/pages/Metrics.jsx
import React from 'react';
import Dashboard from '../components/Dashboard';
import { Box, Heading, Text, Alert, AlertIcon,AlertTitle,AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext'; // Import the AuthContext to get the logged-in user


function Metrics() {
    const { user, loading } = useAuth(); // Get the logged-in user from the AuthContext
    if (!user) {
      // Display a warning alert if the user is not logged in
      return (
        <Box p={8}>
          <Alert status="warning">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                You need to log in to view metrics.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      );
    }
    return (
        <Box p={8}>
            <Dashboard />
        </Box>
    );
}

export default Metrics;