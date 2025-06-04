import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service für lokale Datenspeicherung
 * Verwaltet alle Mood-Daten und App-Einstellungen
 */
class StorageService {
  
  // Speichert einen neuen Mood-Eintrag
  static async saveMoodEntry(moodData) {
    try {
      const existingData = await this.getMoodHistory();
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...moodData
      };
      
      const updatedData = [newEntry, ...existingData];
      await AsyncStorage.setItem('moodHistory', JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der Stimmung:', error);
      return false;
    }
  }

  // In StorageService.js hinzufügen
static async getUserStats() {
  try {
    const stats = await AsyncStorage.getItem('userStats');
    return stats ? JSON.parse(stats) : {
      streak: 0,
      totalEntries: 0,
      achievements: [],
      level: 1,
      points: 0
    };
  } catch (error) {
    console.error('Fehler beim Laden der User Stats:', error);
    return {
      streak: 0,
      totalEntries: 0,
      achievements: [],
      level: 1,
      points: 0
    };
  }
}

static async saveUserStats(stats) {
  try {
    await AsyncStorage.setItem('userStats', JSON.stringify(stats));
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der User Stats:', error);
    return false;
  }
}

  // Lädt die komplette Mood-Historie
  static async getMoodHistory() {
    try {
      const data = await AsyncStorage.getItem('moodHistory');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Fehler beim Laden der Historie:', error);
      return [];
    }
  }

  // Lädt die Mood-Einträge der letzten 7 Tage
  static async getRecentMoods(days = 7) {
    try {
      const allMoods = await this.getMoodHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allMoods.filter(mood => 
        new Date(mood.date) >= cutoffDate
      );
    } catch (error) {
      console.error('Fehler beim Laden aktueller Stimmungen:', error);
      return [];
    }
  }

  // Speichert App-Einstellungen
  static async saveSettings(settings) {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      return false;
    }
  }

  // Lädt App-Einstellungen
  static async getSettings() {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      return settings ? JSON.parse(settings) : {
        notifications: true,
        dailyReminder: true,
        reminderTime: '20:00'
      };
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
      return {};
    }
  }

  // Löscht alle Daten
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove(['moodHistory', 'appSettings']);
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen aller Daten:', error);
      return false;
    }
  }
}

export default StorageService;