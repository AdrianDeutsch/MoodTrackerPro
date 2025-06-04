import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { MOOD_TYPES } from '../../utils/moodUtils';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

/**
 * Mood-Auswahl Komponente
 * Ermöglicht Benutzern die Auswahl ihrer aktuellen Stimmung
 */
const MoodSelector = ({ selectedMood, onMoodSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wie fühlst du dich heute?</Text>
      
      <View style={styles.moodGrid}>
        {Object.entries(MOOD_TYPES).map(([key, mood]) => (
          <Animatable.View
            key={key}
            animation={selectedMood === key ? "pulse" : undefined}
            duration={1000}
            iterationCount="infinite"
          >
            <TouchableOpacity
              style={[
                styles.moodButton,
                { backgroundColor: mood.color },
                selectedMood === key && styles.selectedMood
              ]}
              onPress={() => onMoodSelect(key)}
              activeOpacity={0.8}
            >
              <Icon 
                name={mood.icon} 
                size={32} 
                color={colors.surface}
              />
              <Text style={styles.moodLabel}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedMood: {
    borderWidth: 3,
    borderColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },
  moodLabel: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    marginTop: 8,
  }
});

export default MoodSelector;