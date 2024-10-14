import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react'
import {
    FcAbout,
    FcAssistant,
    FcCollaboration,
    FcDonate,
    FcManager,
} from 'react-icons/fc'
import {
    IoChatboxEllipses
} from "react-icons/io5";
import { MdOutlineChecklist } from "react-icons/md";
import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiSettings,
    FiMenu,
    FiLogIn,

} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';



const Card = ({ heading, description, icon, href }) => {
    const navigate = useNavigate();

    return (
        <Box
            maxW={{ base: 'full', md: '275px' }}
            w={'full'}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={5}
            bg={useColorModeValue('gray.200', 'gray.700')}>
            <Stack align={'start'} spacing={2}>
                <Flex
                    w={16}
                    h={16}
                    align={'center'}
                    justify={'center'}
                    color={'white'}
                    rounded={'full'}
                    bg={useColorModeValue('gray.200', 'gray.700')}>
                    {icon}
                </Flex>
                <Box mt={-1}>
                    <Heading size="md">{heading}</Heading>
                    <Text mt={1} fontSize={'sm'}>
                        {description}
                    </Text>
                </Box>
                <Button variant={'link'} colorScheme={'blue'} size={'sm'} onClick={() => navigate(href)}>
                    Go to feature
                </Button>
            </Stack>
        </Box>
    )
}

export default function Features() {
    return (
        <Box p={4}>
            <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
                <Heading fontSize={{ base: '2xl', sm: '4xl' }} fontWeight={'bold'}>
                    Home
                </Heading>
                <Text color={'gray.600'} fontSize={{ base: 'sm', sm: 'lg' }}>
                    Welcome to CrewMate.
                </Text>
            </Stack>

            <Container maxW={'5xl'} mt={12}>
                <Flex flexWrap="wrap" gridGap={6} justify="center">
                    <Card
                        heading={'PortPal'}
                        icon={<Icon as={IoChatboxEllipses} fill='black' w={10} h={10} />}
                        description={'Clarify your workplace doubts.'}
                        href={'/portpal'}
                    />
                    <Card
                        heading={'Compass'}
                        icon={<Icon as={FiCompass} color='black' w={10} h={10} />}
                        description={'Navigate your future career.'}
                        href={'/compass'}
                    />
                    <Card
                        heading={'DockWorks'}
                        icon={<Icon as={MdOutlineChecklist} fill='black' w={10} h={10} />}
                        description={'Earn amazing rewards.'}
                        href={'/dockworks'}
                    />
                </Flex>
            </Container>
        </Box>
    )
}