import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StorageService from '../services/StorageService';
import QuoteService from '../services/QuoteService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { MOOD_TYPES } from '../utils/moodUtils';

const { width, height } = Dimensions.get('window');

/**
 * Track Mood Screen - MEGA UI UPGRADE 🎨
 * Beautiful, interactive, and engaging mood tracking experience
 */
const TrackMoodScreen = ({ navigation, route }) => {
  const [selectedMood, setSelectedMood] = useState(route?.params?.quickMood || null);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const scaleAnims = useRef(Object.keys(MOOD_TYPES).reduce((acc, key) => {
    acc[key] = new Animated.Value(1);
    return acc;
  }, {})).current;

  const progressAnim = useRef(new Animated.Value(0.33)).current;

  // Enhanced activity options with icons
  const activityOptions = [
    { name: 'Sport', icon: 'fitness', color: '#FF6B6B' },
    { name: 'Lesen', icon: 'book', color: '#4ECDC4' },
    { name: 'Musik', icon: 'musical-notes', color: '#45B7D1' },
    { name: 'Freunde', icon: 'people', color: '#96CEB4' },
    { name: 'Arbeit', icon: 'briefcase', color: '#FECA57' },
    { name: 'Entspannung', icon: 'leaf', color: '#6C5CE7' },
    { name: 'Natur', icon: 'sunny', color: '#A0E7E5' },
    { name: 'Kochen', icon: 'restaurant', color: '#FFB8B8' },
    { name: 'Familie', icon: 'home', color: '#C7ECEE' },
    { name: 'Gaming', icon: 'game-controller', color: '#FF9AA2' },
    { name: 'Shopping', icon: 'bag', color: '#FFD93D' },
    { name: 'Film', icon: 'videocam', color: '#6BCF7F' }
  ];

  // Mood selection with animation
  const handleMoodSelect = (moodKey) => {
    Vibration.vibrate(50);
    setSelectedMood(moodKey);
    
    // Animate selected mood
    Animated.sequence([
      Animated.timing(scaleAnims[moodKey], {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[moodKey], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Reset other moods
    Object.keys(MOOD_TYPES).forEach(key => {
      if (key !== moodKey) {
        Animated.timing(scaleAnims[key], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });

    // Auto-advance to next step
    setTimeout(() => {
      setCurrentStep(2);
      Animated.timing(progressAnim, {
        toValue: 0.66,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, 1000);
  };

  // Activity toggle with animation
  const toggleActivity = (activity) => {
    Vibration.vibrate(30);
    setActivities(prev => 
      prev.includes(activity.name)
        ? prev.filter(a => a !== activity.name)
        : [...prev, activity.name]
    );
  };

  // Save mood entry with enhanced feedback
  const saveMoodEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Fehler', 'Bitte wähle eine Stimmung aus.');
      return;
    }

    setIsLoading(true);
    Vibration.vibrate([100, 50, 100]);
    
    try {
      const moodData = {
        mood: selectedMood,
        note: note.trim(),
        activities,
        timestamp: new Date().toISOString()
      };

      const success = await StorageService.saveMoodEntry(moodData);
      
      if (success) {
        // Update progress to complete
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();

        const tip = QuoteService.getPersonalizedTip(selectedMood);
        const moodEmoji = MOOD_TYPES[selectedMood].icon === 'happy' ? '😊' : 
                         MOOD_TYPES[selectedMood].icon === 'happy-outline' ? '🙂' :
                         MOOD_TYPES[selectedMood].icon === 'remove-circle-outline' ? '😐' :
                         MOOD_TYPES[selectedMood].icon === 'sad-outline' ? '😢' : '😠';
        
        Alert.alert(
          `Gespeichert! ${moodEmoji}`,
          `Deine ${MOOD_TYPES[selectedMood].label.toLowerCase()}e Stimmung wurde erfasst.\n\n💡 ${tip}`,
          [
            {
              text: 'Großartig! 🎉',
              onPress: () => {
                navigation.navigate('Home');
              }
            }
          ]
        );

        // Reset form
        setSelectedMood(null);
        setNote('');
        setActivities([]);
        setCurrentStep(1);
        progressAnim.setValue(0.33);
      } else {
        Alert.alert('Fehler', 'Beim Speichern ist ein Fehler aufgetreten.');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Beim Speichern ist ein Fehler aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  // Next step handler
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      const newProgress = currentStep === 1 ? 0.66 : 1;
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  // Previous step handler
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      const newProgress = currentStep === 3 ? 0.66 : 0.33;
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Enhanced Header with Progress */}
      <LinearGradient
        colors={selectedMood ? [MOOD_TYPES[selectedMood].color + '40', colors.primary] : colors.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Stimmung tracken</Text>
            <Text style={styles.headerSubtitle}>Schritt {currentStep} von 3</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        {/* Animated Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: selectedMood ? MOOD_TYPES[selectedMood].color : colors.accent
                }
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Step 1: Mood Selection */}
        {currentStep === 1 && (
          <Animatable.View animation="fadeInRight" duration={600}>
            <Card style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepTitle}>Wie fühlst du dich heute?</Text>
              </View>
              <Text style={styles.stepDescription}>
                Wähle die Stimmung, die am besten zu dir passt
              </Text>
              
              <View style={styles.moodGrid}>
                {Object.entries(MOOD_TYPES).map(([key, mood]) => (
                  <Animated.View
                    key={key}
                    style={{ transform: [{ scale: scaleAnims[key] }] }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.moodButton,
                        { backgroundColor: mood.color },
                        selectedMood === key && styles.selectedMood
                      ]}
                      onPress={() => handleMoodSelect(key)}
                      activeOpacity={0.8}
                    >
                      <Icon 
                        name={mood.icon} 
                        size={40} 
                        color="white"
                      />
                      <Text style={styles.moodLabel}>
                        {mood.label}
                      </Text>
                      {selectedMood === key && (
                        <Animatable.View 
                          animation="bounceIn" 
                          style={styles.selectedIndicator}
                        >
                          <Icon name="checkmark-circle" size={24} color="white" />
                        </Animatable.View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              {selectedMood && (
                <Animatable.View animation="fadeInUp" delay={500}>
                  <LinearGradient
                    colors={[MOOD_TYPES[selectedMood].color + '20', 'transparent']}
                    style={styles.moodFeedback}
                  >
                    <Icon 
                      name={MOOD_TYPES[selectedMood].icon} 
                      size={30} 
                      color={MOOD_TYPES[selectedMood].color} 
                    />
                    <Text style={[styles.feedbackText, { color: MOOD_TYPES[selectedMood].color }]}>
                      Du fühlst dich {MOOD_TYPES[selectedMood].label.toLowerCase()}! 
                    </Text>
                  </LinearGradient>
                </Animatable.View>
              )}
            </Card>
          </Animatable.View>
        )}

        {/* Step 2: Activities */}
        {currentStep === 2 && selectedMood && (
          <Animatable.View animation="fadeInLeft" duration={600}>
            <Card style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepTitle}>Was hast du heute gemacht?</Text>
              </View>
              <Text style={styles.stepDescription}>
                Wähle alle Aktivitäten, die du heute gemacht hast
              </Text>
              
              <View style={styles.activitiesGrid}>
                {activityOptions.map((activity, index) => (
                  <Animatable.View
                    key={activity.name}
                    animation="bounceIn"
                    delay={index * 50}
                  >
                    <TouchableOpacity
                      style={[
                        styles.activityButton,
                        { backgroundColor: activity.color + '20' },
                        activities.includes(activity.name) && {
                          backgroundColor: activity.color,
                          transform: [{ scale: 1.05 }]
                        }
                      ]}
                      onPress={() => toggleActivity(activity)}
                    >
                      <Icon 
                        name={activity.icon} 
                        size={24} 
                        color={activities.includes(activity.name) ? 'white' : activity.color}
                      />
                      <Text style={[
                        styles.activityText,
                        { color: activities.includes(activity.name) ? 'white' : activity.color }
                      ]}>
                        {activity.name}
                      </Text>
                      {activities.includes(activity.name) && (
                        <Icon name="checkmark" size={16} color="white" style={styles.activityCheck} />
                      )}
                    </TouchableOpacity>
                  </Animatable.View>
                ))}
              </View>

              <View style={styles.stepNavigation}>
                <Button
                  title="Zurück"
                  onPress={prevStep}
                  variant="secondary"
                  style={styles.navButton}
                />
                <Button
                  title="Weiter"
                  onPress={nextStep}
                  variant="primary"
                  style={styles.navButton}
                />
              </View>
            </Card>
          </Animatable.View>
        )}

        {/* Step 3: Notes */}
        {currentStep === 3 && selectedMood && (
          <Animatable.View animation="fadeInUp" duration={600}>
            <Card style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepTitle}>Möchtest du eine Notiz hinzufügen?</Text>
              </View>
              <Text style={styles.stepDescription}>
                Teile deine Gedanken oder beschreibe, was deine Stimmung beeinflusst hat
              </Text>
              
              <View style={styles.noteContainer}>
                <LinearGradient
                  colors={[colors.background, colors.surface]}
                  style={styles.noteInputContainer}
                >
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Z.B. 'Hatte einen tollen Tag mit Freunden' oder 'Arbeit war stressig heute'"
                    placeholderTextColor={colors.textLight}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                </LinearGradient>
                
                <View style={styles.noteFooter}>
                  <Text style={styles.characterCount}>
                    {note.length}/500 Zeichen
                  </Text>
                  <Icon name="create-outline" size={16} color={colors.textLight} />
                </View>
              </View>

              <View style={styles.stepNavigation}>
                <Button
                  title="Zurück"
                  onPress={prevStep}
                  variant="secondary"
                  style={styles.navButton}
                />
                <Button
                  title={isLoading ? "Speichere..." : "Speichern 🎉"}
                  onPress={saveMoodEntry}
                  variant="primary"
                  disabled={isLoading}
                  style={[styles.navButton, styles.saveButton]}
                />
              </View>
            </Card>
          </Animatable.View>
        )}

        {/* Summary Card (Always visible when mood selected) */}
        {selectedMood && (
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Card style={styles.summaryCard}>
              <LinearGradient
                colors={[MOOD_TYPES[selectedMood].color + '10', 'transparent']}
                style={styles.summaryGradient}
              >
                <Text style={styles.summaryTitle}>Zusammenfassung</Text>
                
                <View style={styles.summaryRow}>
                  <Icon name={MOOD_TYPES[selectedMood].icon} size={20} color={MOOD_TYPES[selectedMood].color} />
                  <Text style={styles.summaryText}>
                    Stimmung: {MOOD_TYPES[selectedMood].label}
                  </Text>
                </View>

                {activities.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Icon name="list" size={20} color={colors.primary} />
                    <Text style={styles.summaryText}>
                      {activities.length} Aktivität{activities.length > 1 ? 'en' : ''} ausgewählt
                    </Text>
                  </View>
                )}

                {note.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Icon name="create" size={20} color={colors.accent} />
                    <Text style={styles.summaryText}>
                      Notiz hinzugefügt ({note.length} Zeichen)
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </Card>
          </Animatable.View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  stepCard: {
    marginBottom: 20,
    padding: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: 24,
    lineHeight: 22,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodButton: {
    width: (width - 80) / 2.5,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  selectedMood: {
    borderWidth: 3,
    borderColor: 'white',
  },
  moodLabel: {
    ...typography.caption,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  moodFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackText: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: 12,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityButton: {
    width: (width - 80) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  activityText: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  activityCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 0.48,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  noteContainer: {
    marginBottom: 24,
  },
  noteInputContainer: {
    borderRadius: 16,
    padding: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  characterCount: {
    ...typography.caption,
    color: colors.textLight,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 12,
  },
});

export default TrackMoodScreen;