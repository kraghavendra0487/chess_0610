import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  Container,
} from '@chakra-ui/react';

const HomePage = ({ onNavigate }) => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const FeatureCard = ({ title, description, buttonText, onButtonClick, icon }) => (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={8}
      boxShadow="xl"
      border="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '2xl',
        bg: hoverBg,
      }}
      transition="all 0.3s ease"
      cursor="pointer"
      onClick={onButtonClick}
      minH="300px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack spacing={4} align="center" textAlign="center">
        <Box fontSize="4xl" color="teal.500">
          {icon}
        </Box>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          {title}
        </Text>
        <Text color={subTextColor} fontSize="lg" lineHeight="1.6">
          {description}
        </Text>
      </VStack>
      
      <Button
        colorScheme="teal"
        size="lg"
        width="100%"
        onClick={(e) => {
          e.stopPropagation();
          onButtonClick();
        }}
        _hover={{
          transform: 'scale(1.02)',
        }}
        transition="transform 0.2s ease"
      >
        {buttonText}
      </Button>
    </Box>
  );

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="1200px" px={4}>
        <VStack spacing={12} align="center">
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color={textColor}>
              Welcome to Chess Application
            </Text>
            <Text fontSize="xl" color={subTextColor} maxW="600px">
              Choose your chess experience below. Play against AI or analyze positions with our powerful engine.
            </Text>
          </VStack>

          {/* Feature Cards */}
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={8}
            w="100%"
            maxW="1000px"
            justify="center"
            align="stretch"
          >
            <FeatureCard
              title="Chess Game"
              description="Play chess against our AI opponent. Choose your color, adjust difficulty, and enjoy a challenging game with move history and analysis."
              buttonText="Start Playing"
              onButtonClick={() => onNavigate('chess')}
              icon="♟️"
            />
            
            <FeatureCard
              title="Position Analysis"
              description="Analyze chess positions using our Stockfish engine. Import FEN positions, explore variations, and get detailed evaluations."
              buttonText="Start Analysis"
              onButtonClick={() => onNavigate('analysis')}
              icon="🔍"
            />
          </Flex>

          {/* Additional Info */}
          <Box
            bg={cardBg}
            borderRadius="lg"
            p={6}
            border="1px"
            borderColor={borderColor}
            textAlign="center"
            maxW="600px"
          >
            <Text color={subTextColor} fontSize="md">
              Both features use the same powerful chess engine for consistent analysis and gameplay. 
              Switch between modes anytime using the navigation menu.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
