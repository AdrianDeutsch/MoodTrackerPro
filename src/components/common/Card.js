import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

/**
 * Wiederverwendbare Card-Komponente
 * Sorgt für einheitliches Design aller Karten in der App
 */
const Card = ({ children, style, elevated = true }) => {
  return (
    <View style={[
      styles.card, 
      elevated && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  elevated: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});

export default Card;