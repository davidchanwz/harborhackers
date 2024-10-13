import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
} from '@chakra-ui/react';
import CourseCard from './CourseCard'; // Import CourseCard component
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext'; // Import AuthContext to get user data

const CourseList = () => {
  const [courses, setCourses] = useState([]); // State to store the fetched courses
  const { user, loading } = useAuth(); // Get logged-in user and loading status from AuthContext
  const [isLoading, setIsLoading] = useState(true); // Local loading state for course fetching

  // Fetch the suggested courses for the logged-in user from the relational table
  const fetchCourses = async () => {
    if (!user) {
      console.error('No user is logged in.');
      return;
    }

    console.log('Fetching courses for user:', user.id);

    // Join employees, employee_courses (relational table), and courses
    const { data, error } = await supabase
      .from('employee_suggested_courses')
      .select(`
      courses (
        Title,
        Provider,
        "Upcoming Date",
        "Course Fee"
      )
    `)
      .eq('employee_id', user.id); // Use the user's id to get the related courses

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    const coursesData = data.map(entry => entry.courses); // Extract course info

    console.log('Fetched courses:', coursesData);
    setCourses(coursesData || []); // Set the fetched courses into state
    setIsLoading(false); // Update loading state
  };

  // Fetch courses on component mount and when user or loading state changes
  useEffect(() => {
    if (!loading) {
      fetchCourses();
    }
  }, [loading, user]);

  if (loading || isLoading) {
    // Display a spinner while data is loading
    return (
      <Box p={8}>
        <Spinner size="xl" />
        <Heading mt={4}>Loading Courses...</Heading>
      </Box>
    );
  }

  if (!user) {
    // Display a warning if no user is logged in
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Login Required</AlertTitle>
            <AlertDescription>
              You need to log in to view your courses.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={4}>
        Suggested Courses
      </Heading>

      {courses.length === 0 ? (
        // Display an alert if no courses are available
        <Alert status="info">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>No Courses Available</AlertTitle>
            <AlertDescription>
              You currently have no suggested courses.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        // Render a list of CourseCard components
        <Stack spacing={4}>
          {courses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CourseList;
