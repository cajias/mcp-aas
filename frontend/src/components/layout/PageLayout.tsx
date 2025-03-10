import React, { ReactNode } from 'react';
import MainNav from '../navigation/MainNav';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div>
      <MainNav />
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;