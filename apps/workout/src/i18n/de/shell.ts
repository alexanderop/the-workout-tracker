import type { Catalog } from "../index";

export const deShell: Catalog["shell"] = {
  appName: "The Workout Tracker",
  skipToContent: "Zum Inhalt springen",
  brand: {
    home: "The Workout Tracker, Startseite",
    first: "The Workout",
    second: "Tracker",
  },
  workspaceLabel: "DEIN TRAININGSBEREICH",
  yourWorkspace: "Dein Bereich",
  nav: {
    main: "Hauptnavigation",
    mobile: "Mobile Navigation",
    footer: "Fußnavigation",
    workouts: "Trainings",
    exercises: "Übungen",
    progress: "Fortschritt",
    settings: "Einstellungen",
    session: "Aktives Training",
  },
  workoutInProgress: "Training läuft",
  installApp: "The Workout Tracker installieren",
  localNote: "Deins. Auf diesem Gerät.",
  offline: "Offline · lokal gespeichert",
  previewError: "Dieses Beispiel konnte nicht geöffnet werden.",
  loading: "Dein Trainingstagebuch wird geöffnet",
  saving: "Speichern…",
  loadFailure: {
    title: "Deine Daten brauchen Aufmerksamkeit",
    export: "Wiederherstellungsdaten exportieren",
    tryAgain: "Erneut versuchen",
  },
  notice: {
    reload: "Neu laden",
    dismiss: "Fehler schließen",
    updateReady: "Eine neue Version von The Workout Tracker ist bereit.",
    updateApp: "App aktualisieren",
    updated: "Aktualisiert – lade neu, wenn du bereit bist.",
    reloadApp: "App neu laden",
    pageNotOpened:
      "Diese Seite konnte nicht geöffnet werden. Versuche es erneut oder lade neu.",
  },
  install: {
    title: "The Workout Tracker installieren",
    unavailable:
      "Die Installation ist in diesem Design-Beispiel nicht verfügbar.",
    accepted:
      "Installation angefordert. Folge deinem Browser, um sie abzuschließen.",
    cancelled:
      "Installation abgebrochen. Du kannst die App hier weiter nutzen.",
    failed:
      "Das Installationsfenster ließ sich nicht öffnen. Nutze die Browser-Anleitung unten.",
    settings: {
      home: "The Workout Tracker auf deinem Home-Bildschirm",
      hint: "Öffne dein Tagebuch wie jede andere App.",
      installed: "Installiert",
      install: "App installieren",
      offlineReady: "Bereit für die Offline-Nutzung.",
      offlineLater:
        "Offline verfügbar ist die App nach dem ersten vollständigen Laden.",
      privacy: "Kein Konto. Keine Cloud-Synchronisierung.",
    },
  },
  errorBoundary: {
    title: "Etwas ist schiefgelaufen",
    body: "Deine gespeicherten Trainings bleiben auf diesem Gerät. Lade neu, um es erneut zu versuchen. Alles, was du noch nicht gespeichert hast, kann verloren gehen.",
    reload: "App neu laden",
    copy: "Diagnose kopieren",
    copied:
      "Diagnose kopiert. Sie enthält keine Trainings und keine persönlichen Daten.",
    copyUnavailable:
      "Kopieren ist nicht verfügbar. Markiere stattdessen die Diagnose unten.",
    diagnostics: "Diagnose",
  },
  appearance: {
    help: "Folge deinem Gerät oder wähle ein Design und eine Akzentfarbe. Die Auswahl bleibt auf diesem Gerät.",
    theme: "Design",
    accent: "Akzentfarbe",
    themes: {
      system: "System",
      light: "Hell",
      dark: "Dunkel",
    },
    accents: {
      blue: "Blau",
      teal: "Petrol",
      violet: "Violett",
      pink: "Pink",
      sand: "Sand",
    },
  },
  language: {
    legend: "App-Sprache",
    help: "Folge deinem Browser oder wähle eine Sprache. Die Auswahl bleibt auf diesem Gerät.",
    system: "System",
    loadFailed:
      "Die Sprache konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.",
  },
};
