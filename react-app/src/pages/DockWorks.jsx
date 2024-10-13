// src/pages/Page1.jsx
import React from 'react';
import TaskList from '../components/TaskList'; 
import MilestoneTracker from '../components/MilestoneTracker';
import TaskReward from '../components/TaskReward'
import { Box, Heading, Text, Alert, AlertIcon,AlertTitle,AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
function DockWorks({setUserPoints}) {
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
                You need to log in to view DockWorks.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      );
    }
    return (
        <Box p={8}>
            <TaskReward />

        </Box>
    );
}

export default DockWorks;