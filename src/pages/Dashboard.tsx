import React from 'react';
import { HeroSection, StatCards } from '../components/dashboard/HeroSection';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatCards />
    </div>
  );
};

export default Dashboard;
