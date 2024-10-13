import React, { useEffect, useState } from 'react';
import { Box, Progress, Text, VStack, HStack } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';

const Milestones = () => {
    const { user, loading } = useAuth(); // Get the logged-in user from the AuthContext
    const [userPoints, setUserPoints] = useState(0);

    const milestones = [
        { threshold: 10, reward: '$10 GV Voucher' },
        { threshold: 20, reward: '$10 Fairprice Voucher' },
        { threshold: 30, reward: '$15 Grab Voucher' },
        { threshold: 40, reward: '$30 Haidilao Voucher' },
    ];

    // Fetch tasks for the logged-in user from Supabase
    const fetchTasks = async () => {
        if (!user) {
            console.error('No user is logged in.');
            return [];
        }

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id); // Filter tasks by the user's id

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        return data;
    };

    // Fetch tasks and calculate total points when the component mounts
    useEffect(() => {
        const getTasksAndCalculatePoints = async () => {
            if (loading) return; // Wait for loading to finish before fetching tasks

            const fetchedTasks = await fetchTasks();
            calculateTotalPoints(fetchedTasks);
        };

        getTasksAndCalculatePoints();
    }, [user, loading]);

    const calculateTotalPoints = (taskList) => {
        const total = taskList.reduce((acc, task) => {
            return task.completed ? acc + task.points : acc;
        }, 0);
        setUserPoints(total);
    };

    return (
        <Box
            p={4}
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            backgroundColor="gray.50" // Light background color
        >
            <Text fontSize="xl" fontWeight="bold" mb={4}>Rewards Progress</Text>
            {/* <Text fontSize="lg" mb={2}>Total Points: {userPoints}</Text> */}
            <HStack spacing={4} width="100%" mt={4} alignItems="center">
                {milestones.map((milestone, index) => {
                    const isAchieved = userPoints >= milestone.threshold;

                    // Calculate the progress based on previous milestone thresholds
                    const previousThreshold = index === 0 ? 0 : milestones[index - 1].threshold;
                    const progressValue = isAchieved
                        ? 100
                        : userPoints > previousThreshold
                        ? ((userPoints - previousThreshold) / (milestone.threshold - previousThreshold)) * 100
                        : 0;

                    return (
                        <React.Fragment key={index}>
                            <Box flex="1" minWidth="120px" textAlign="center">
                                <Text fontWeight="bold">{milestone.reward}</Text>
                                <Progress 
                                    value={progressValue} 
                                    colorScheme={isAchieved ? 'green' : 'yellow'} 
                                    size="lg"
                                />
                                <Text mt={1}>
                                    {isAchieved ? 'Redeemed' : `${milestone.threshold - userPoints > 0 ? milestone.threshold - userPoints : 0} points to redeem`}
                                </Text>
                            </Box>
                            {/* Render the icon between the progress bars */}
                            {index < milestones.length - 1 && (
                                <Box textAlign="center">
                                    {isAchieved ? (
                                        <CheckIcon color="green.500" boxSize={6} />
                                    ) : (
                                        <SmallCloseIcon color="gray.500" boxSize={6} />
                                    )}
                                </Box>
                            )}
                        </React.Fragment>
                    );
                })}
            </HStack>
            {/* <VStack spacing={2} mt={4} align="start">
                <Text fontWeight="bold" fontSize="lg">Milestone Achievements:</Text>
                {milestones.map((milestone, index) => (
                    <Text key={index} color={userPoints >= milestone.threshold ? 'green.500' : 'gray.500'}>
                        {userPoints >= milestone.threshold ? `✓ ${milestone.reward} earned!` : `❏ ${milestone.reward}`}
                    </Text>
                ))}
            </VStack> */}
        </Box>
    );
};

export default Milestones;
