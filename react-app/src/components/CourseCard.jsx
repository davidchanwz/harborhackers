import React from 'react';
import { Box, Text, Badge, Stack } from '@chakra-ui/react';

const CourseCard = ({ course }) => {
  // Use optional chaining to avoid crashing if fields are missing
  const { Title, Provider, "Upcoming Date": date, "Course Fee": fee } = course || {};

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4} bg="white">
      <Stack spacing={3}>
        {/* Title */}
        <Text fontSize="lg" fontWeight="bold">
          {Title || 'No Title Provided'}
        </Text>

        {/* Provider */}
        <Text fontSize="md" color="gray.500">
          Provider: {Provider || 'Unknown Provider'}
        </Text>

        {/* Fee */}
        <Text fontSize="md" color="gray.500">
          Fee: {fee || 'Not Provided'}
        </Text>

        {/* Date */}
        <Text fontSize="md" color="gray.500">
          Date: {date || 'NA'}
        </Text>
      </Stack>
    </Box>
  );
};

export default CourseCard;
