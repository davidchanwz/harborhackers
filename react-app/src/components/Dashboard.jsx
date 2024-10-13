import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Spinner, Flex } from '@chakra-ui/react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, TimeScale } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, TimeScale);

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks data from Supabase
    const fetchTasks = async () => {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
        return data;
    };

    // Fetch data on component mount
    useEffect(() => {
        const getTasks = async () => {
            const fetchedTasks = await fetchTasks();
            setTasks(fetchedTasks);
            setLoading(false);
        };

        getTasks();
    }, []);

    // Helper function to calculate the week number of a date
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Calculate engagement metrics
    const calculateMetrics = () => {
        const completedTasks = tasks.filter(task => task.completed);
        const totalTasks = tasks.length;
        const completionRate = (completedTasks.length / totalTasks) * 100;

        const taskTypeCounts = tasks.reduce(
            (acc, task) => {
                acc[task.task_type] = (acc[task.task_type] || 0) + 1;
                return acc;
            },
            { single_fun: 0, pair_fun: 0, pair_work: 0 }
        );

        const taskDifficultyCounts = tasks.reduce(
            (acc, task) => {
                acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
                return acc;
            },
            { easy: 0, medium: 0, hard: 0 }
        );

        return { completionRate, taskTypeCounts, taskDifficultyCounts };
    };

    // Calculate weekly completion rate
    const calculateWeeklyCompletion = () => {
        const taskByWeek = {};

        tasks.forEach((task) => {
            const taskDate = new Date(task.created_at);
            const week = getWeekNumber(taskDate);

            if (!taskByWeek[week]) {
                taskByWeek[week] = { completed: 0, total: 0 };
            }

            taskByWeek[week].total += 1;
            if (task.completed) {
                taskByWeek[week].completed += 1;
            }
        });

        const weeks = Object.keys(taskByWeek).sort();
        const completedData = weeks.map((week) => taskByWeek[week].completed);
        const totalData = weeks.map((week) => taskByWeek[week].total);

        return { weeks, completedData, totalData };
    };

    // Generate chart data
    const getChartData = () => {
        const { completionRate, taskTypeCounts, taskDifficultyCounts } = calculateMetrics();

        // Pie chart for task completion rate
        const completionData = {
            labels: ['Completed', 'Uncompleted'],
            datasets: [
                {
                    label: 'Task Completion',
                    data: [completionRate, 100 - completionRate],
                    backgroundColor: ['#36A2EB', '#FF6384']
                }
            ]
        };

        // Bar chart for task type distribution
        const taskTypeData = {
            labels: ['Single Fun', 'Pair Fun', 'Pair Work'],
            datasets: [
                {
                    label: 'Tasks by Type',
                    data: [
                        taskTypeCounts.single_fun,
                        taskTypeCounts.pair_fun,
                        taskTypeCounts.pair_work
                    ],
                    backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
                }
            ]
        };

        // Bar chart for task difficulty distribution
        const taskDifficultyData = {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [
                {
                    label: 'Tasks by Difficulty',
                    data: [taskDifficultyCounts.easy, taskDifficultyCounts.medium, taskDifficultyCounts.hard],
                    backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384']
                }
            ]
        };

        // Weekly completion rate (Line chart)
        const { weeks, completedData, totalData } = calculateWeeklyCompletion();
        const weeklyCompletionData = {
            labels: weeks,
            datasets: [
                {
                    label: 'Completed Tasks',
                    data: completedData,
                    borderColor: '#36A2EB',
                    fill: false
                },
                {
                    label: 'Total Tasks',
                    data: totalData,
                    borderColor: '#FF6384',
                    fill: false
                }
            ]
        };

        return { completionData, taskTypeData, taskDifficultyData, weeklyCompletionData };
    };

    // Loading state
    if (loading) {
        return (
            <Box p={8}>
                <Spinner size="xl" />
                <Text>Loading dashboard...</Text>
            </Box>
        );
    }

    // Get the chart data
    const { completionData, taskTypeData, taskDifficultyData, weeklyCompletionData } = getChartData();

    return (
        <Box p={8}>
            <Heading mb={4}>Employee Engagement Dashboard</Heading>

            {/* Completion Rate Pie Chart */}
            <Box width="30%" marginBottom={6} padding={2} bg={'gray.200'} borderWidth='1px' borderRadius='lg'>
                <Heading size="md" mb={4}>Task Completion Rate</Heading>
                <Pie data={completionData} />
            </Box>

            <Flex justify="space-between" mb={8}>
                {/* Task Type Bar Chart */}
                <Box width="45%" padding={2} bg={'gray.200'} borderWidth='1px' borderRadius='lg'>
                    <Heading size="md" mb={4}>Task Distribution by Type</Heading>
                    <Bar data={taskTypeData} />
                </Box>

                {/* Task Difficulty Bar Chart */}
                <Box width="45%" padding={2} bg={'gray.200'} borderWidth='1px' borderRadius='lg'>
                    <Heading size="md" mb={4}>Task Distribution by Difficulty</Heading>
                    <Bar data={taskDifficultyData} />
                </Box>
            </Flex>

            {/* Weekly Task Completion Line Chart */}
            <Box width="100%" padding={2} bg={'gray.200'} borderWidth='1px' borderRadius='lg'>
                <Heading size="md" mb={4}>Weekly Task Completion</Heading>
                <Line data={weeklyCompletionData} />
            </Box>
        </Box>
    );
};

export default Dashboard;