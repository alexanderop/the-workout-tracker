import type { Catalog } from "../index";

export const deCommon: Catalog["common"] = {
  ui: {
    close: "Schließen",
    closeDialog: "Dialog schließen",
    sheetOptions: "Optionen für {title}",
    numeric: {
      cancel: "Abbrechen",
      suggestions: "Vorgeschlagene Werte",
      quickPick: "Schnellwahl",
      tapToUse: "Tippen zum Übernehmen",
      editor: "Zahleneingabe",
      keypad: "Zifferntastatur",
      decimalPoint: "Dezimalpunkt",
      backspace: "Letzte Ziffer löschen",
      empty: "leer",
      confirm: "{title} übernehmen",
      announce: "{title} auf {value} gesetzt",
      announceUnit: "{title} auf {value} {unit} gesetzt",
      trigger: "{label}: {value}",
      triggerUnit: "{label}: {value} {unit}",
      usePreset: "{value} verwenden",
      usePresetUnit: "{value} {unit} verwenden",
      replace: "Gib einen neuen Wert ein, um diesen zu ersetzen.",
      ready: "Bereit zum Übernehmen.",
      range: "von {min} bis {max}",
      rangeUnit: "von {min} bis {max} {unit}",
      wholeNumber: "Gib eine ganze Zahl {range} ein.",
      fewerDecimals:
        "Gib einen Wert mit bis zu {n} Nachkommastelle {range} ein. | Gib einen Wert mit bis zu {n} Nachkommastellen {range} ein.",
      value: "Gib einen Wert {range} ein.",
      pasteWhole: "Füge eine ganze Zahl von {min} bis {max} ein.",
      pasteDecimal:
        "Füge eine Zahl mit bis zu {decimals} Nachkommastellen von {min} bis {max} ein.",
    },
    install: {
      installed: "Die App ist auf diesem Gerät installiert.",
      intro:
        "Halte dein Tagebuch griffbereit. Öffne es vom Home-Bildschirm und trainiere offline, sobald es einmal vollständig geladen wurde.",
      install: "App installieren",
      opening: "Installationsfenster wird geöffnet…",
      ios: {
        step1: "Öffne diese Seite in Safari.",
        step2: "Öffne „Teilen“ und wähle „Zum Home-Bildschirm“.",
        step3: "Bestätige mit „Hinzufügen“.",
      },
      android: {
        step1: "Öffne das Browsermenü.",
        step2:
          "Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“, falls verfügbar.",
        step3: "Folge den Anweisungen des Browsers.",
      },
      browser: {
        step1:
          "Suche in der Adressleiste oder im Browsermenü nach „Installieren“.",
        step2:
          "Ist das nicht möglich, nutze einen Browser, der die App-Installation unterstützt.",
      },
      note: "Deine Daten bleiben in diesem Browser. Eine Installation ist kein Backup.",
    },
    muscleMap: {
      label: "Muskelkarte",
      primary: "Primär",
      supporting: "Unterstützend",
      notHighlighted: "Nicht hervorgehoben",
      hint: "Wähle unten einen Muskel, um ihn auf der Karte zu finden.",
      front: "Vorne",
      back: "Hinten",
      regions: {
        chest: "Brust",
        shoulders: "Schultern",
        biceps: "Bizeps",
        triceps: "Trizeps",
        forearms: "Unterarme",
        abs: "Rumpf",
        upperBack: "Oberer Rücken",
        lowerBack: "Unterer Rücken",
        glutes: "Gesäß",
        quads: "Quadrizeps",
        hamstrings: "Beinbeuger",
        calves: "Waden",
      },
    },
  },
};
