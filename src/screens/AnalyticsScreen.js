import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';

import Card from '../components/common/Card';
import StorageService from '../services/StorageService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { 
  calculateAverageMood, 
  getMostFrequentMood, 
  formatMoodDataForChart,
  MOOD_TYPES,
  getMoodInsight
} from '../utils/moodUtils';
import { formatDate } from '../utils/dateUtils';

const screenWidth = Dimensions.get('window').width;

/**
 * Analytics Screen - Auswertungen und Statistiken
 * Zeigt detaillierte Analysen der Stimmungsentwicklung
 */
const AnalyticsScreen = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Lädt alle Daten für die Analyse
  const loadAnalyticsData = async () => {
    try {
      const history = await StorageService.getMoodHistory();
      const recentWeek = await StorageService.getRecentMoods(7);
      const recentMonth = await StorageService.getRecentMoods(30);
      
      setMoodHistory(history);
      
      // Bereite Daten für Charts vor
      const chartData = formatMoodDataForChart(recentWeek);
      setWeeklyData(chartData);
      
      // Berechne monatliche Statistiken
      const monthStats = {
        totalEntries: recentMonth.length,
        averageMood: calculateAverageMood(recentMonth),
        mostFrequent: getMostFrequentMood(recentMonth),
        insight: getMoodInsight(calculateAverageMood(recentMonth))
      };
      setMonthlyStats(monthStats);
      
    } catch (error) {
      console.error('Fehler beim Laden der Analytics:', error);
    }
  };

  // Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  // Chart-Konfiguration
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary
    }
  };

  // Bereite Daten für Mood-Verteilung vor
  const getMoodDistributionData = () => {
    const moodCounts = {};
    Object.keys(MOOD_TYPES).forEach(mood => {
      moodCounts[mood] = 0;
    });

    moodHistory.slice(0, 30).forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });

    return {
      labels: Object.keys(moodCounts).map(mood => MOOD_TYPES[mood].label),
      datasets: [{
        data: Object.values(moodCounts)
      }]
    };
  };

  const distributionData = getMoodDistributionData();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      
      {/* Übersichts-Statistiken */}
      <Animatable.View animation="fadeInUp" duration={600}>
        <Card>
          <Text style={styles.sectionTitle}>Monatlicher Überblick</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{monthlyStats.totalEntries || 0}</Text>
              <Text style={styles.statLabel}>Einträge</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{monthlyStats.averageMood || 0}</Text>
              <Text style={styles.statLabel}>Ø Stimmung</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[
                styles.statValue, 
                { color: monthlyStats.mostFrequent ? MOOD_TYPES[monthlyStats.mostFrequent].color : colors.text }
              ]}>
                {monthlyStats.mostFrequent ? MOOD_TYPES[monthlyStats.mostFrequent].label : '-'}
              </Text>
              <Text style={styles.statLabel}>Häufigste</Text>
            </View>
          </View>
          
          {monthlyStats.insight && (
            <Text style={[styles.insightText, { color: monthlyStats.insight.color }]}>
              {monthlyStats.insight.text}
            </Text>
          )}
        </Card>
      </Animatable.View>

      {/* Wöchentlicher Verlauf */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Card>
          <Text style={styles.sectionTitle}>Verlauf der letzten 7 Tage</Text>
          
          {weeklyData.length > 0 ? (
            <LineChart
              data={{
                labels: weeklyData.map(d => d.date),
                datasets: [{
                  data: weeklyData.map(d => d.value || 0)
                }]
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>
              Nicht genügend Daten für den Verlauf
            </Text>
          )}
        </Card>
      </Animatable.View>

      {/* Stimmungsverteilung */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <Card>
          <Text style={styles.sectionTitle}>Stimmungsverteilung (30 Tage)</Text>
          
          {distributionData.datasets[0].data.some(val => val > 0) ? (
            <BarChart
              data={distributionData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 205, 196, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.noDataText}>
              Noch keine Daten verfügbar
            </Text>
          )}
        </Card>
      </Animatable.View>

      {/* Insights und Trends */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Card>
          <Text style={styles.sectionTitle}>Persönliche Insights</Text>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>📈 Trend</Text>
            <Text style={styles.insightDescription}>
              {monthlyStats.averageMood >= 3.5 
                ? "Deine Stimmung zeigt einen positiven Trend!"
                : "Es gab einige schwierige Tage. Das ist völlig normal."
              }
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>🎯 Empfehlung</Text>
            <Text style={styles.insightDescription}>
              {monthlyStats.totalEntries >= 20
                ? "Großartig! Du trackst regelmäßig deine Stimmung."
                : "Versuche täglich deine Stimmung zu tracken für bessere Insights."
              }
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>💡 Erkenntnisse</Text>
            <Text style={styles.insightDescription}>
              Kontinuierliches Tracking hilft dir, Muster zu erkennen und 
              bewusster mit deinen Emotionen umzugehen.
            </Text>
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
    padding: 16,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
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
    marginTop: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textLight,
    paddingVertical: 40,
  },
  insightItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.textLight + '20',
  },
  insightTitle: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  insightDescription: {
    ...typography.body,
    color: colors.textLight,
    lineHeight: 22,
  }
});

export default AnalyticsScreen;