import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';  // Import ChakraProvider
import App from './App.jsx'
import theme from './theme';  // Import your custom theme
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
      <App />
    </ChakraProvider>
  </StrictMode>,
)
