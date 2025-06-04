import moment from 'moment';

/**
 * Hilfsfunktionen für Datum- und Zeit-Operationen
 * Vereinfacht die Arbeit mit Daten in der App
 */

// Lokalisierung für deutsche Wochentage und Monate
moment.locale('de');

// Formatiert ein Datum in lesbarer Form
export const formatDate = (date, format = 'DD.MM.YYYY') => {
  return moment(date).format(format);
};

// Formatiert ein Datum relativ (z.B. "vor 2 Stunden")
export const formatRelativeDate = (date) => {
  return moment(date).fromNow();
};

// Prüft, ob ein Datum heute ist
export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

// Prüft, ob ein Datum in der aktuellen Woche liegt
export const isThisWeek = (date) => {
  return moment(date).isSame(moment(), 'week');
};

// Gibt den Wochentag zurück
export const getWeekday = (date) => {
  return moment(date).format('dddd');
};

// Berechnet die Anzahl Tage zwischen zwei Daten
export const getDaysBetween = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

// Gibt das Start- und Enddatum der aktuellen Woche zurück
export const getCurrentWeekRange = () => {
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment().endOf('week');
  
  return {
    start: startOfWeek.toDate(),
    end: endOfWeek.toDate()
  };
};

// Generiert ein Array der letzten N Tage
export const getLastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(moment().subtract(i, 'days').toDate());
  }
  return days;
};