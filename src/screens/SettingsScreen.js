import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StorageService from '../services/StorageService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

/**
 * Settings Screen - App-Einstellungen
 * Ermöglicht Anpassung von Benachrichtigungen und anderen Optionen
 */
const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminder: true,
    reminderTime: '20:00',
    darkMode: false,
    exportData: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // Lädt gespeicherte Einstellungen
  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
    }
  };

  // Speichert Einstellungen
  const saveSettings = async (newSettings) => {
    try {
      await StorageService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      Alert.alert('Fehler', 'Einstellungen konnten nicht gespeichert werden.');
    }
  };

  // Toggle für Einstellungen
  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  // Daten exportieren
  const exportData = async () => {
    try {
      const moodHistory = await StorageService.getMoodHistory();
      
      if (moodHistory.length === 0) {
        Alert.alert('Info', 'Keine Daten zum Exportieren vorhanden.');
        return;
      }

      Alert.alert(
        'Export erfolgreich',
        `${moodHistory.length} Einträge wurden exportiert.`
      );
    } catch (error) {
      console.error('Fehler beim Export:', error);
      Alert.alert('Fehler', 'Daten konnten nicht exportiert werden.');
    }
  };

  // Alle Daten löschen
  const clearAllData = () => {
    Alert.alert(
      'Alle Daten löschen?',
      'Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Erfolg', 'Alle Daten wurden gelöscht.');
            } catch (error) {
              Alert.alert('Fehler', 'Daten konnten nicht gelöscht werden.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Benachrichtigungen */}
      <Animatable.View animation="fadeInUp" duration={600}>
        <Card>
          <Text style={styles.sectionTitle}>Benachrichtigungen</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={20} color={colors.primary} />
              <Text style={styles.settingText}>Push-Benachrichtigungen</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: colors.textLight, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="alarm" size={20} color={colors.primary} />
              <Text style={styles.settingText}>Tägliche Erinnerung</Text>
            </View>
            <Switch
              value={settings.dailyReminder}
              onValueChange={() => toggleSetting('dailyReminder')}
              trackColor={{ false: colors.textLight, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>
      </Animatable.View>

      {/* Daten-Management */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <Card>
          <Text style={styles.sectionTitle}>Daten-Management</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={exportData}>
            <Icon name="download" size={20} color={colors.accent} />
            <Text style={styles.actionText}>Daten exportieren</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={clearAllData}>
            <Icon name="trash" size={20} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>
              Alle Daten löschen
            </Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </Card>
      </Animatable.View>

      {/* App-Informationen */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Card>
          <Text style={styles.sectionTitle}>Über die App</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Entwickelt mit</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Datenschutz</Text>
            <Text style={styles.infoValue}>Alle Daten werden lokal gespeichert</Text>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textLight + '20',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    ...typography.body,
    marginLeft: 12,
    color: colors.text,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.textLight + '20',
  },
  actionText: {
    ...typography.body,
    marginLeft: 12,
    flex: 1,
    color: colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textLight + '20',
  },
  infoLabel: {
    ...typography.body,
    color: colors.textLight,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  }
});

export default SettingsScreen;