import { ChakraProvider } from '@chakra-ui/react'
import AppRouter from './components/AppRouter.jsx'

export default function App() {
  return (
    <ChakraProvider>
      <AppRouter />
    </ChakraProvider>
  )
}
