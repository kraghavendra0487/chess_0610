import React, { useState } from 'react';
import Navigation from './Navigation';
import HomePage from './HomePage';
import ChessGame from './ChessGame';
import AnalysisBoard from './AnalysisBoard';

const AppRouter = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handlePageChange} />;
      case 'chess':
        return <ChessGame />;
      case 'analysis':
        return <AnalysisBoard />;
      default:
        return <HomePage onNavigate={handlePageChange} />;
    }
  };

  return (
    <>
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      {renderCurrentPage()}
    </>
  );
};

export default AppRouter;
