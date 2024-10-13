// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#e0f2fe',
            100: '#bae6fd',
            200: '#7dd3fc',
            300: '#38bdf8',
            400: '#0ea5e9',
            500: '#0284c7', // PSA brand primary color
            600: '#0369a1',
            700: '#075985',
            800: '#0c4a6e',
            900: '#0a3759',
        },
    },
    fonts: {
        heading: 'Roboto, sans-serif',
        body: 'Open Sans, sans-serif',
    },
    components: {
        Button: {
            variants: {
                solid: (props) => ({
                    bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
                    color: 'white',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
                    },
                }),
            },
        },
    },
});

export default theme;