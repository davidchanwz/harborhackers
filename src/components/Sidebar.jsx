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
    FiMessageCircle,

} from 'react-icons/fi';
import { Link, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Trending from '../pages/Trending';
import Explore from '../pages/Explore';
import Favourites from '../pages/Favourites';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Chatbot from '../pages/Chatbot';


// Sidebar link items
const LinkItems = [
    { name: 'Home', icon: FiHome, path: '/' },
    { name: 'Trending', icon: FiTrendingUp, path: '/trending' },
    { name: 'Explore', icon: FiCompass, path: '/explore' },
    { name: 'Favourites', icon: FiStar, path: '/favourites' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
    { name: 'Chatbot', icon: FiMessageCircle, path: '/chatbot' },
    { name: 'Login/Signup', icon: FiSettings, path: '/login' },

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
                    Logo
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon} path={link.path}>
                    {link.name}
                </NavItem>
            ))}
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
                Logo
            </Text>
        </Flex>
    );
};
export default Sidebar;