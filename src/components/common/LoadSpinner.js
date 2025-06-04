import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/**
 * Loading Spinner Komponente
 * Zeigt Ladeindikator mit optionalem Text
 */
const LoadingSpinner = ({ 
  size = 'large', 
  text = 'Lädt...', 
  showText = true,
  color = colors.primary 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {showText && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    ...typography.body,
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  }
});

export default LoadingSpinner;