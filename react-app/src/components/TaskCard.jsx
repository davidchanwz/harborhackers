import React, { useEffect, useState } from 'react';
import { Box, Text, Checkbox, Badge, Stack } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
// Helper function to determine badge color based on difficulty
const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'easy':
            return 'green';
        case 'medium':
            return 'yellow';
        case 'hard':
            return 'red';
        default:
            return 'gray';
    }
};
const getTagColor = (type) => {
    switch (type.trim().toLowerCase()) {
        case 'single':
            return 'yellow';
        case 'pair':
            return 'blue';
        case 'fun':
            return 'purple';
        case 'work':
            return 'orange'
        default:
            return 'gray';
    }
};

const TaskCard = ({ task, onToggle }) => {
    const taskTypes = task.task_type.split('_');
    const [partnerName, setPartnerName] = useState(null); // State to store partner's name
    useEffect(() => {
        // Fetch partner name if partner_id is available
        const fetchPartnerName = async () => {
            if (task.partner_id) {
                // Fetch full_name from the employees table
                const { data: employeeData, error: employeeError } = await supabase
                    .from('employees')
                    .select('full_name')
                    .eq('user_id', task.partner_id)
                    .single(); // Fetch the partner's name
        
                if (employeeError) {
                    console.error('Error fetching partner name:', employeeError);
                    return;
                }
        
                // Fetch email from the auth.users table
                const { data: authData, error: authError } = await supabase
                    .from('employees')
                    .select('email')
                    .eq('user_id', task.partner_id) // Ensure to use the 'id' field for the user in the auth.users table
                    .single(); // Fetch the partner's email
        
                if (authError) {
                    console.error('Error fetching partner email:', authError);
                    return;
                }
        
                // Combine full name and email
                const partnerNameWithEmail = `${employeeData.full_name} (${authData.email})`;
                setPartnerName(partnerNameWithEmail); // Set partner name and email in state
            }
        };

        fetchPartnerName(); // Call the function to fetch partner name
    }, [task.partner_id]);

    
    return (
        <Box p={4} borderWidth="1px" borderRadius="lg" mb={4} bg={task.completed ? 'gray.200' : 'white'}>
            <Stack spacing={3}>
                {/* Task description */}
                <Text fontSize="lg" fontWeight="bold">
                    {task.task_description}
                </Text>

                {/* Points */}
                <Text fontSize="md" color="gray.500">
                    Points: {task.points}
                </Text>

                {/* Difficulty */}
                <Text fontSize="md" color="gray.500">
                    Difficulty: <Badge colorScheme={getDifficultyColor(task.difficulty)}>{task.difficulty}</Badge>
                </Text>

                                 {/* Tags display */}
                                 <Text fontSize="md" color="gray.500">
                    Tags: {taskTypes.map((type, index) => (
                        <Badge key={index} colorScheme={getTagColor(type)} mr={2}>
                            {type.trim()}
                        </Badge>
                    ))}
                </Text>

                {/* Due Date */}
                <Text fontSize="md" color="gray.500">
                    Due by: {new Date(task.due_by).toLocaleDateString()}
                </Text>

                {/* Completion Date if applicable */}
                {task.completed_at && (
                    <Text fontSize="md" color="gray.500">
                        Completed at: {new Date(task.completed_at).toLocaleDateString()}
                    </Text>
                )}

                {/* Partner display if applicable */}
                {partnerName && (
                    <Text fontSize="md" color="gray.500">
                        Partner: {partnerName}
                    </Text>
                )}

                {/* Completion checkbox */}
                <Checkbox
                    isChecked={task.completed}
                    onChange={() => onToggle(task.task_id)}
                >
                    {task.completed ? 'Completed' : 'Mark as Completed'}
                </Checkbox>
            </Stack>
        </Box>
    );
};

export default TaskCard;