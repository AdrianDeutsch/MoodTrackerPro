// HomeScreen.js - KOMPLETT FUNKTIONIERENDE VERSION
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert
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
import { calculateAverageMood, getMoodInsight, MOOD_TYPES } from '../utils/moodUtils';
import { formatDate, isToday } from '../utils/dateUtils';

/**
 * Home Screen - KOMPLETT FUNKTIONIERENDE VERSION
 */
const HomeScreen = ({ navigation }) => {
  const [todaysMood, setTodaysMood] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [wellnessTip, setWellnessTip] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [moodHeatmap, setMoodHeatmap] = useState([]);

  // Animation values
  const scaleValue = new Animated.Value(1);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    loadHomeData();
    startAnimations();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHomeData();
    });
    return unsubscribe;
  }, [navigation]);

  // Animationen starten
  const startAnimations = () => {
    Animated.sequence([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Get current time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Gute Nacht', emoji: '🌙' };
    if (hour < 12) return { text: 'Guten Morgen', emoji: '🌅' };
    if (hour < 17) return { text: 'Guten Tag', emoji: '☀️' };
    if (hour < 22) return { text: 'Guten Abend', emoji: '🌆' };
    return { text: 'Gute Nacht', emoji: '🌙' };
  };

  // Erweiterte Daten laden
  const loadHomeData = async () => {
    try {
      const moodHistory = await StorageService.getMoodHistory();
      const recent = await StorageService.getRecentMoods(7);
      
      // Heutige Stimmung
      const today = moodHistory.find(entry => isToday(entry.date));
      setTodaysMood(today);
      setRecentMoods(recent);
      
      // Gamification Daten berechnen
      setStreak(calculateStreak(moodHistory));
      setLevel(calculateLevel(moodHistory.length));
      setPoints(calculatePoints(moodHistory));
      setAchievements(checkAchievements(moodHistory));
      
      // Mood Heatmap für die letzten 30 Tage
      setMoodHeatmap(generateMoodHeatmap(moodHistory));
      
      // Zitate und Tipps
      setDailyQuote(QuoteService.getDailyQuote());
      setWellnessTip(QuoteService.getRandomTip());
      
    } catch (error) {
      console.error('Fehler beim Laden der Home-Daten:', error);
    }
  };

  // Streak berechnen
  const calculateStreak = (history) => {
    if (history.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = history.find(entry => 
        new Date(entry.date).toDateString() === checkDate.toDateString()
      );
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  // Level berechnen
  const calculateLevel = (totalEntries) => {
    return Math.floor(totalEntries / 5) + 1;
  };

  // Punkte berechnen
  const calculatePoints = (history) => {
    let points = 0;
    points += history.length * 10;
    points += streak * 50;
    return points;
  };

  // Achievements prüfen
  const checkAchievements = (history) => {
    const achievements = [];
    
    if (history.length >= 1) achievements.push({ id: 'first', name: 'Erste Schritte', icon: '🎯' });
    if (history.length >= 7) achievements.push({ id: 'week', name: 'Eine Woche', icon: '📅' });
    if (history.length >= 30) achievements.push({ id: 'month', name: 'Ein Monat', icon: '🗓️' });
    if (streak >= 3) achievements.push({ id: 'streak3', name: '3 Tage Streak', icon: '🔥' });
    if (streak >= 7) achievements.push({ id: 'streak7', name: 'Streak Master', icon: '🏆' });
    if (calculateAverageMood(history.slice(0, 7)) >= 4) achievements.push({ id: 'positive', name: 'Positive Woche', icon: '✨' });
    
    return achievements;
  };

  // Mood Heatmap generieren
  const generateMoodHeatmap = (history) => {
    const heatmap = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const entry = history.find(h => 
        new Date(h.date).toDateString() === date.toDateString()
      );
      
      heatmap.push({
        date: date.toISOString(),
        mood: entry ? entry.mood : null,
        value: entry ? MOOD_TYPES[entry.mood].value : 0
      });
    }
    
    return heatmap;
  };

  const handleQuickMoodPress = (mood) => {
    Vibration.vibrate(50);
    navigation.navigate('Track', { quickMood: mood });
  };

  // Coming Soon Funktionen
  const showComingSoon = (feature) => {
    Alert.alert(
      '🚀 Coming Soon!',
      `${feature} wird in einem zukünftigen Update verfügbar sein!`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // Stats berechnen
  const getStatsData = () => {
    const averageMood = calculateAverageMood(recentMoods);
    const insight = getMoodInsight(averageMood);
    
    return {
      averageMood: averageMood || 0,
      insight: insight || { text: 'Noch keine Daten', color: colors.textLight },
      totalEntries: recentMoods.length,
      streakDays: streak
    };
  };

  const stats = getStatsData();
  const greeting = getTimeBasedGreeting();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* VERBESSERTER HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { opacity: fadeValue, transform: [{ scale: scaleValue }] }
          ]}
        >
          {/* Top Row */}
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.timeGreeting}>
                {greeting.text} {greeting.emoji}
              </Text>
              <Text style={styles.userName}>
                Adrian! 👋
              </Text>
              <Text style={styles.dateText}>
                {formatDate(new Date(), 'dddd, DD. MMMM')}
              </Text>
            </View>
            
            <View style={styles.profileSection}>
              <TouchableOpacity style={styles.profileAvatar}>
                <Text style={styles.avatarText}>A</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.headerStatsRow}>
            <View style={styles.headerStatCard}>
              <Icon name="trophy" size={16} color="#FFD93D" />
              <Text style={styles.headerStatValue}>{level}</Text>
              <Text style={styles.headerStatLabel}>Level</Text>
            </View>
            
            <View style={styles.headerStatCard}>
              <Icon name="diamond" size={16} color="#FF6B6B" />
              <Text style={styles.headerStatValue}>{points}</Text>
              <Text style={styles.headerStatLabel}>Punkte</Text>
            </View>
            
            <View style={styles.headerStatCard}>
              <Icon name="flame" size={16} color="#FFD93D" />
              <Text style={styles.headerStatValue}>{streak}</Text>
              <Text style={styles.headerStatLabel}>Streak</Text>
            </View>
          </View>

          {/* Streak Banner */}
          {streak > 0 && (
            <View style={styles.streakBanner}>
              <Icon name="flame" size={16} color="#FFD93D" />
              <Text style={styles.streakText}>
                {streak} Tage Streak! 🔥
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Quick Mood Buttons */}
      <Animatable.View animation="slideInUp" duration={800} delay={200}>
        <Card style={styles.quickMoodCard}>
          <View style={styles.quickMoodHeader}>
            <Text style={styles.sectionTitle}>Schnell-Mood</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Track')}
              style={styles.moreButton}
            >
              <Text style={styles.moreText}>Mehr</Text>
              <Icon name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickMoodGrid}>
            {Object.entries(MOOD_TYPES).map(([key, mood]) => (
              <TouchableOpacity
                key={key}
                style={[styles.quickMoodButton, { backgroundColor: mood.color }]}
                onPress={() => handleQuickMoodPress(key)}
              >
                <Icon name={mood.icon} size={20} color="white" />
                <Text style={styles.quickMoodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.quickMoodHint}>Tap für schnelles Mood-Tracking</Text>
        </Card>
      </Animatable.View>

      {/* Heutige Stimmung */}
      <Animatable.View animation="fadeInUp" duration={800} delay={400}>
        <Card style={styles.todayCard}>
          {todaysMood ? (
            <View style={styles.moodStatus}>
              <View style={styles.moodInfo}>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                  <Icon 
                    name={MOOD_TYPES[todaysMood.mood]?.icon || 'help-circle'} 
                    size={50} 
                    color={MOOD_TYPES[todaysMood.mood]?.color || colors.textLight}
                  />
                </Animatable.View>
                <View style={styles.moodText}>
                  <Text style={styles.moodTitle}>Heutige Stimmung</Text>
                  <Text style={[styles.moodValue, { color: MOOD_TYPES[todaysMood.mood]?.color || colors.textLight }]}>
                    {MOOD_TYPES[todaysMood.mood]?.label || 'Unbekannt'}
                  </Text>
                  <Text style={styles.moodTime}>
                    {new Date(todaysMood.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              {todaysMood.note && (
                <Text style={styles.moodNote}>"{todaysMood.note}"</Text>
              )}
            </View>
          ) : (
            <View style={styles.noMoodStatus}>
              <Animatable.View animation="bounce" iterationCount="infinite" duration={2000}>
                <Icon name="add-circle-outline" size={50} color={colors.primary} />
              </Animatable.View>
              <Text style={styles.noMoodText}>
                Noch keine Stimmung heute eingetragen
              </Text>
              <Button
                title="Stimmung eintragen"
                onPress={() => navigation.navigate('Track')}
                variant="primary"
                style={styles.trackButton}
              />
            </View>
          )}
        </Card>
      </Animatable.View>

      {/* Mood Heatmap */}
      <Animatable.View animation="fadeInUp" duration={800} delay={600}>
        <Card>
          <Text style={styles.sectionTitle}>Mood Heatmap (30 Tage)</Text>
          <View style={styles.heatmapContainer}>
            {moodHeatmap.map((day, index) => (
              <View
                key={index}
                style={[
                  styles.heatmapDay,
                  {
                    backgroundColor: day.mood 
                      ? MOOD_TYPES[day.mood].color + '80'
                      : colors.background
                  }
                ]}
              />
            ))}
          </View>
          <Text style={styles.heatmapLegend}>
            Letzte 30 Tage • Farbe = Stimmung
          </Text>
        </Card>
      </Animatable.View>

      {/* Diese Woche Statistiken */}
      <Animatable.View animation="fadeInUp" duration={800} delay={800}>
        <Card>
          <Text style={styles.sectionTitle}>Diese Woche</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.statValue}>{stats.averageMood}</Text>
              <Text style={styles.statLabel}>Durchschnitt</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar" size={20} color={colors.accent} />
              <Text style={styles.statValue}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Einträge</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="flame" size={20} color="#FFD93D" />
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#FFD93D" />
              <Text style={styles.statValue}>{level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
          <Text style={[styles.insightText, { color: stats.insight.color }]}>
            {stats.insight.text}
          </Text>
        </Card>
      </Animatable.View>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={800} delay={1000}>
          <Card>
            <Text style={styles.sectionTitle}>Erfolge 🏆</Text>
            <View style={styles.achievementsGrid}>
              {achievements.slice(0, 4).map((achievement, index) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                </View>
              ))}
            </View>
            {achievements.length > 4 && (
              <Text style={styles.moreAchievements}>
                +{achievements.length - 4} weitere Erfolge
              </Text>
            )}
          </Card>
        </Animatable.View>
      )}

      {/* Tägliches Zitat */}
      <Animatable.View animation="fadeInUp" duration={800} delay={1200}>
        <Card style={styles.quoteCard}>
          <View style={styles.quoteContent}>
            <Icon name="chatbubble-ellipses" size={24} color={colors.primary} />
            <Text style={styles.quoteText}>"{dailyQuote?.text || 'Lade Zitat...'}"</Text>
            <Text style={styles.quoteAuthor}>- {dailyQuote?.author || ''}</Text>
          </View>
        </Card>
      </Animatable.View>

      {/* Tipp des Tages */}
      <Animatable.View animation="fadeInUp" duration={800} delay={1400}>
        <Card style={styles.tipCard}>
          <View style={styles.tipContent}>
            <View style={styles.tipHeader}>
              <Icon name="bulb" size={20} color={colors.accent} />
              <Text style={styles.tipTitle}>Tipp des Tages</Text>
            </View>
            <Text style={styles.tipText}>{wellnessTip || 'Lade Tipp...'}</Text>
          </View>
        </Card>
      </Animatable.View>

      {/* Action Cards */}
      <Animatable.View animation="fadeInUp" duration={800} delay={1600}>
        <Card>
          <Text style={styles.sectionTitle}>Aktionen</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Track')}
            >
              <Icon name="happy" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Mood tracken</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Icon name="analytics" size={24} color={colors.accent} />
              <Text style={styles.actionText}>Analyse</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => showComingSoon('Challenges')}
            >
              <Icon name="trophy" size={24} color="#FFD93D" />
              <Text style={styles.actionText}>Challenges</Text>
              <Text style={styles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => showComingSoon('Social Features')}
            >
              <Icon name="people" size={24} color={colors.secondary} />
              <Text style={styles.actionText}>Social</Text>
              <Text style={styles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animatable.View>

    </ScrollView>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  timeGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  headerStatValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickMoodCard: {
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
  },
  quickMoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 0,
    color: colors.text,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  quickMoodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickMoodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickMoodLabel: {
    fontSize: 8,
    color: 'white',
    fontWeight: '600',
    marginTop: 2,
  },
  quickMoodHint: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
  },
  todayCard: {
    marginHorizontal: 16,
  },
  moodStatus: {
    alignItems: 'center',
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodText: {
    marginLeft: 20,
    flex: 1,
  },
  moodTitle: {
    ...typography.body,
    color: colors.textLight,
  },
  moodValue: {
    ...typography.h3,
    marginTop: 4,
    fontWeight: 'bold',
  },
  moodTime: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  moodNote: {
    ...typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.textLight,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  noMoodStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noMoodText: {
    ...typography.body,
    color: colors.textLight,
    marginVertical: 12,
    textAlign: 'center',
  },
  trackButton: {
    marginTop: 8,
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 12,
  },
  heatmapDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
    margin: 1,
    borderWidth: 1,
    borderColor: colors.background,
  },
  heatmapLegend: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginTop: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  insightText: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '500',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600',
  },
  moreAchievements: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 8,
  },
  quoteCard: {
    marginHorizontal: 16,
    backgroundColor: colors.primary + '10',
  },
  quoteContent: {
    padding: 16,
    alignItems: 'center',
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.text,
    marginVertical: 12,
    lineHeight: 24,
  },
  quoteAuthor: {
    ...typography.caption,
    textAlign: 'right',
    color: colors.textLight,
    alignSelf: 'flex-end',
  },
  tipCard: {
    marginHorizontal: 16,
    backgroundColor: colors.accent + '10',
  },
  tipContent: {
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    ...typography.h3,
    fontSize: 16,
    marginLeft: 8,
    color: colors.text,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    ...typography.caption,
    marginTop: 8,
    color: colors.text,
    fontWeight: '600',
  },
  comingSoon: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default HomeScreen;