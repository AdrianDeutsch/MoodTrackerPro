import { colors } from '../styles/colors';

/**
 * Hilfsfunktionen für Mood-bezogene Operationen
 * Definiert Mood-Typen, Farben und Berechnungen
 */

// Verfügbare Stimmungstypen mit Icons und Farben
export const MOOD_TYPES = {
  happy: {
    label: 'Glücklich',
    icon: 'happy',
    color: colors.mood.happy,
    value: 5
  },
  good: {
    label: 'Gut',
    icon: 'happy-outline',
    color: colors.mood.good,
    value: 4
  },
  neutral: {
    label: 'Neutral',
    icon: 'remove-circle-outline',
    color: colors.mood.neutral,
    value: 3
  },
  sad: {
    label: 'Traurig',
    icon: 'sad-outline',
    color: colors.mood.sad,
    value: 2
  },
  angry: {
    label: 'Wütend',
    icon: 'thunderstorm-outline',
    color: colors.mood.angry,
    value: 1
  }
};

// Berechnet den Durchschnittswert der Stimmungen
export const calculateAverageMood = (moodEntries) => {
  if (!moodEntries || moodEntries.length === 0) return 0;
  
  const total = moodEntries.reduce((sum, entry) => {
    const moodValue = MOOD_TYPES[entry.mood]?.value || 3;
    return sum + moodValue;
  }, 0);
  
  return (total / moodEntries.length).toFixed(1);
};

// Ermittelt die häufigste Stimmung
export const getMostFrequentMood = (moodEntries) => {
  if (!moodEntries || moodEntries.length === 0) return null;
  
  const moodCounts = {};
  moodEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  
  return Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );
};

// Formatiert Mood-Daten für Chart-Darstellung
export const formatMoodDataForChart = (moodEntries) => {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayEntry = moodEntries.find(entry => 
      entry.date.split('T')[0] === dateString
    );
    
    last7Days.push({
      date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      value: dayEntry ? MOOD_TYPES[dayEntry.mood].value : 0
    });
  }
  
  return last7Days;
};

// Gibt eine textuelle Bewertung der Stimmung zurück
export const getMoodInsight = (averageMood) => {
  if (averageMood >= 4.5) {
    return {
      text: "Fantastisch! Deine Stimmung ist sehr positiv.",
      color: colors.mood.happy
    };
  } else if (averageMood >= 3.5) {
    return {
      text: "Gut gemacht! Du hast eine stabile, positive Stimmung.",
      color: colors.mood.good
    };
  } else if (averageMood >= 2.5) {
    return {
      text: "Deine Stimmung ist ausgeglichen. Das ist völlig normal.",
      color: colors.mood.neutral
    };
  } else {
    return {
      text: "Es scheint, als hättest du schwierige Tage. Sei geduldig mit dir.",
      color: colors.mood.sad
    };
  }
};