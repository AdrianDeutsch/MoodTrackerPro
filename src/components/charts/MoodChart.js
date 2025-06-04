import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const screenWidth = Dimensions.get('window').width;

/**
 * Mood Chart Komponente
 * Zeigt Stimmungsverlauf als Liniendiagramm
 */
const MoodChart = ({ data, title, height = 220 }) => {
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

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Keine Daten verfügbar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    ...typography.h3,
    marginBottom: 12,
    color: colors.text,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  noDataText: {
    ...typography.body,
    color: colors.textLight,
  }
});

export default MoodChart;