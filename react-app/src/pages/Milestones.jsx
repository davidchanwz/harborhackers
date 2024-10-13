import React from 'react';
import { Box } from '@chakra-ui/react';
import MilestoneTracker from '../components/MilestoneTracker'; 

function Milestones({ userPoints }) {
    return (
        <Box p={8}>
            <MilestoneTracker userPoints={userPoints} />
        </Box>
    );
}

export default Milestones;