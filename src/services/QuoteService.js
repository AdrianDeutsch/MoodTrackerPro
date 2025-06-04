/**
 * Service für motivierende Zitate und Affirmationen
 * Stellt täglich wechselnde, inspirierende Inhalte bereit
 */
class QuoteService {
  static quotes = [
    {
      text: "Jeder Tag ist eine neue Chance, glücklich zu sein.",
      author: "Unbekannt"
    },
    {
      text: "Deine Stimmung bestimmt deinen Tag. Wähle weise.",
      author: "Motivational"
    },
    {
      text: "Kleine Schritte führen zu großen Veränderungen.",
      author: "Wellness Wisdom"
    },
    {
      text: "Achte auf dich selbst - du bist es wert.",
      author: "Self Care"
    },
    {
      text: "Fortschritt ist wichtiger als Perfektion.",
      author: "Growth Mindset"
    },
    {
      text: "Deine mentale Gesundheit ist genauso wichtig wie deine körperliche.",
      author: "Health First"
    },
    {
      text: "Heute ist ein guter Tag, um ein guter Tag zu sein.",
      author: "Positive Vibes"
    }
  ];

  static tips = [
    "Trinke ausreichend Wasser für bessere Stimmung",
    "5 Minuten tiefes Atmen kann Wunder bewirken",
    "Ein kurzer Spaziergang an der frischen Luft hilft",
    "Schreibe 3 Dinge auf, für die du dankbar bist",
    "Höre deine Lieblingsmusik",
    "Rufe einen Freund an und rede über schöne Dinge",
    "Mache eine kleine Meditation oder Entspannung"
  ];

  // Gibt ein zufälliges Zitat zurück
  static getDailyQuote() {
    const today = new Date().getDate();
    const index = today % this.quotes.length;
    return this.quotes[index];
  }

  // Gibt einen zufälligen Wellness-Tipp zurück
  static getRandomTip() {
    const randomIndex = Math.floor(Math.random() * this.tips.length);
    return this.tips[randomIndex];
  }

  // Gibt personalisierte Empfehlungen basierend auf der Stimmung
  static getPersonalizedTip(mood) {
    const moodBasedTips = {
      happy: [
        "Teile deine gute Stimmung mit anderen!",
        "Nutze diese positive Energie für ein neues Projekt",
        "Dokumentiere, was dich heute glücklich gemacht hat"
      ],
      good: [
        "Du bist auf einem guten Weg - weiter so!",
        "Belohne dich für diesen positiven Tag",
        "Reflektiere über die guten Momente heute"
      ],
      neutral: [
        "Auch neutrale Tage sind völlig normal",
        "Vielleicht ist heute ein Tag für Entspannung",
        "Kleine Aktivitäten können große Unterschiede machen"
      ],
      sad: [
        "Es ist okay, traurig zu sein - deine Gefühle sind valid",
        "Versuche eine beruhigende Aktivität wie Lesen oder Musik",
        "Denke daran: schlechte Zeiten gehen vorbei"
      ],
      angry: [
        "Tiefes Atmen kann helfen, Ärger zu reduzieren",
        "Sport oder Bewegung kann frustrierte Energie umwandeln",
        "Sprich mit jemandem über deine Gefühle"
      ]
    };

    const tips = moodBasedTips[mood] || moodBasedTips.neutral;
    return tips[Math.floor(Math.random() * tips.length)];
  }
}

export default QuoteService;