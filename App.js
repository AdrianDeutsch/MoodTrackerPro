import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Haupt-App-Komponente
 * Konfiguriert die Navigation und globale Einstellungen
 */
const App = () => {
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#6C63FF" 
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;