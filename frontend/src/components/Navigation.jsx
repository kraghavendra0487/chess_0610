import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  HStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Navigation = ({ currentPage, onPageChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const navItems = [
    { id: 'home', label: 'Home', page: 'home' },
    { id: 'chess', label: 'Chess Game', page: 'chess' },
    { id: 'analysis', label: 'Analysis', page: 'analysis' },
  ];

  const NavButton = ({ item, isMobile = false }) => (
    <Button
      variant={currentPage === item.page ? 'solid' : 'ghost'}
      colorScheme={currentPage === item.page ? 'teal' : 'gray'}
      onClick={() => {
        onPageChange(item.page);
        if (isMobile) onClose();
      }}
      size={isMobile ? 'md' : 'sm'}
      width={isMobile ? '100%' : 'auto'}
      justifyContent={isMobile ? 'flex-start' : 'center'}
    >
      {item.label}
    </Button>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <Box
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        px={4}
        py={2}
        position="sticky"
        top={0}
        zIndex={1000}
        display={{ base: 'none', md: 'block' }}
      >
        <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Chess Application
          </Text>
          <HStack spacing={4}>
            {navItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Navigation */}
      <Box
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        px={4}
        py={2}
        position="sticky"
        top={0}
        zIndex={1000}
        display={{ base: 'block', md: 'none' }}
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Chess App
          </Text>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
          />
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigation</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navItems.map((item) => (
                <NavButton key={item.id} item={item} isMobile={true} />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navigation;
