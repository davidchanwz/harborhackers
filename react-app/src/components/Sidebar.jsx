'use client';

import React from 'react';
import {
    IconButton,
    Box,
    CloseButton,
    Flex,
    Icon,
    useColorModeValue,
    Text,
    Drawer,
    DrawerContent,
    useDisclosure,
} from '@chakra-ui/react';
import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiSettings,
    FiMenu,
    FiCheckSquare,
    FiLogIn,
    FiUser,

} from 'react-icons/fi';
import {
    IoChatboxEllipses
} from "react-icons/io5";
import { MdOutlineChecklist } from "react-icons/md";
import { Link, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Trending from '../pages/PortPal';
import Explore from '../pages/Compass';
import Favourites from '../pages/DockWorks';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext'; // Import your AuthContext
import { useNavigate } from 'react-router-dom'; // To handle navigation

// Sidebar link items
const LinkItems = [
    { name: 'Home', icon: FiHome, path: '/' },
    { name: 'PortPal', icon: IoChatboxEllipses, path: '/portpal' },
    { name: 'Compass', icon: FiCompass, path: '/compass' },
    { name: 'DockWorks', icon: MdOutlineChecklist, path: '/dockworks' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
];

const Sidebar = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />

            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
            >
                <DrawerContent>
                    <SidebarContent onClose={onClose} />

                </DrawerContent>
            </Drawer>

            <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />

            <Box ml={{ base: 0, md: 60 }} p="0">
                {children}
            </Box>
        </Box>
    );
}

const SidebarContent = ({ onClose, ...rest }) => {
    const { user } = useAuth(); // Get the user from AuthContext
    const navigate = useNavigate();
    const handleLoginNavigation = () => {
        console.log('handleloginnav called')
        if (user) {
            console.log('navigating to user')
            navigate('/user'); // Navigate to the user page if the user is logged in
        } else {
            console.log('navigating to login')
            navigate('/login'); // Navigate to the login page if no user is logged in
        }
    }
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}
        >
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    CrewMate
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon} path={link.path}>
                    {link.name}
                </NavItem>
            ))}
            {user ? (
                <NavItem icon={FiUser} path={'/user'}>
                    Profile
                </NavItem>
            ) : (
                <NavItem icon={FiLogIn} path={'/login'}>
                    Login
                </NavItem>
            )}
        </Box>
    );
};

const NavItem = ({ icon, children, path, ...rest }) => {
    return (
        <Link to={path} style={{ textDecoration: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.400',
                    color: 'white',
                }}
                {...rest}
            >
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Link>
    );
};

const MobileNav = ({ onOpen, ...rest }) => {
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 24 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent="flex-start"
            {...rest}
        >
            <IconButton variant="outline" onClick={onOpen} aria-label="open menu" icon={<FiMenu />} />

            <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
                CrewMate
            </Text>
        </Flex>
    );
};
export default Sidebar;