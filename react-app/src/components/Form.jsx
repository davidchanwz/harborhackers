import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Box, Button, FormControl, FormLabel, Input, Stack, Textarea, Select } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

export default function EmployeeForm() {
    const { user } = useAuth() // Assuming you already have AuthContext to get the logged-in user
    const [fullName, setFullName] = useState('')
    const [department, setDepartment] = useState('')
    const [experienceLevel, setExperienceLevel] = useState('')
    const [skills, setSkills] = useState('')
    const [hobbies, setHobbies] = useState('')
    const [isExistingEmployee, setIsExistingEmployee] = useState(false) // Flag to check if the user already has data

    useEffect(() => {
        // Fetch employee data when the component mounts
        const fetchEmployeeData = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    // Pre-fill the form with existing data
                    setFullName(data.full_name)
                    setDepartment(data.department)
                    setExperienceLevel(data.experience_level)
                    setSkills(data.skills)
                    setHobbies(data.hobbies)
                    setIsExistingEmployee(true) // Set flag to true as the user has existing data
                } else if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching employee data:', error.message)
                }
            }
        }

        fetchEmployeeData()
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            console.error('No user is logged in')
            return
        }

        if (isExistingEmployee) {
            // Update existing employee data
            const { data, error } = await supabase
                .from('employees')
                .update({
                    full_name: fullName,
                    department: department,
                    experience_level: experienceLevel,
                    skills: skills,
                    hobbies: hobbies,
                    email: user.email
                })
                .eq('user_id', user.id)

            if (error) {
                console.error('Error updating data: ', error.message)
            } else {
                console.log('Employee information updated successfully!', data)
            }
        } else {
            // Insert new employee data
            const { data, error } = await supabase
                .from('employees')
                .insert([
                    {
                        user_id: user.id, // Use the ID from Supabase Auth
                        full_name: fullName,
                        department: department,
                        experience_level: experienceLevel,
                        skills: skills,
                        hobbies: hobbies,
                        email: user.email
                    },
                ])

            if (error) {
                console.error('Error inserting data: ', error.message)
            } else {
                console.log('Employee information saved successfully!', data)
                setIsExistingEmployee(true) // Mark the user as an existing employee after insert
            }
        }
    }

    return (
        <Box p={4} bg="white" maxW="lg" borderWidth={1} borderRadius="lg">
            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    <FormControl id="fullName" isRequired>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </FormControl>

                    <FormControl id="department" isRequired>
                        <FormLabel>Department</FormLabel>
                        <Input
                            type="text"
                            placeholder="Enter your department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </FormControl>

                    <FormControl id="experienceLevel" isRequired>
                        <FormLabel>Experience Level</FormLabel>
                        <Select
                            placeholder="Select experience level"
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                            <option value="Junior">Junior</option>
                            <option value="Mid">Mid</option>
                            <option value="Senior">Senior</option>
                        </Select>
                    </FormControl>

                    <FormControl id="skills" isRequired>
                        <FormLabel>Skills</FormLabel>
                        <Textarea
                            placeholder="List your skills separated by commas"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </FormControl>

                    <FormControl id="hobbies" isRequired>
                        <FormLabel>Hobbies</FormLabel>
                        <Textarea
                            placeholder="List your hobbies separated by commas"
                            value={hobbies}
                            onChange={(e) => setHobbies(e.target.value)}
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue">
                        {isExistingEmployee ? 'Update' : 'Submit'}
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}