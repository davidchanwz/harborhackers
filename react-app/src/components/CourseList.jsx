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
import { supabase } from '../supabaseClient'; // Import Supabase client
import { useAuth } from '../context/AuthContext'; // Import AuthContext for user data

const CourseList = () => {
  const [courses, setCourses] = useState([]); // Store fetched courses
  const { user, loading } = useAuth(); // Get user data and loading status
  const [isLoading, setIsLoading] = useState(true); // Local loading state

  // Extract titles and providers from the 'suggested_courses' field
  const fetchCourseTitlesAndProviders = async () => {
    const { data, error } = await supabase
      .from('employee_suggested_courses')
      .select('suggested_courses')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching suggested courses:', error);
      return [];
    }

    const rawCourses = JSON.parse(data[0]?.suggested_courses || '[]');
    console.log('Raw fetched course titles:', rawCourses);

    // Split each entry into title and provider
    const courses = rawCourses.map(entry => {
      const [title, provider] = entry.split(' by ');
      return { title: title.trim(), provider: provider.trim() };
    });

    console.log('Parsed courses:', courses);
    return courses;
  };

  // Fetch details from the 'courses' table based on title and provider
  const fetchCourseDetails = async (courses) => {
    if (courses.length === 0) return [];

    const courseDetails = [];

    try {
      for (const { title, provider } of courses) {
        const { data, error } = await supabase
          .from('courses')
          .select('Title, Provider, "Upcoming Date", "Course Fee"')
          .eq('Title', title)
          .eq('Provider', provider); // Match title and provider

        if (error) {
          console.error(`Error fetching details for "${title}":`, error);
          continue;
        }

        if (data.length > 0) {
          courseDetails.push(data[0]); // Add the matched course
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }

    console.log('Fetched course details:', courseDetails);
    return courseDetails;
  };

  // Main function to fetch and set courses for the logged-in user
  const fetchCourses = async () => {
    if (!user) {
      console.error('No user is logged in.');
      return;
    }

    try {
      const courses = await fetchCourseTitlesAndProviders(); // Extract titles and providers
      const courseDetails = await fetchCourseDetails(courses); // Fetch course details
      setCourses(courseDetails); // Store the results
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  // Fetch courses on component mount and when user or loading state changes
  useEffect(() => {
    if (!loading) {
      fetchCourses();
    }
  }, [loading, user]);

  if (loading || isLoading) {
    return (
      <Box p={8}>
        <Spinner size="xl" />
        <Heading mt={4}>Loading Courses...</Heading>
      </Box>
    );
  }

  if (!user) {
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
