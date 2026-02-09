import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackRoutes from './AthleteDailyFocusSrc/navigation/StackRoutes';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StackRoutes />
    </NavigationContainer>
  );
};

export default App;
