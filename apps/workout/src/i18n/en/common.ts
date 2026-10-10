// Phrases of the shared UI components (@form/ui), which stay free of i18n code.
// src/app/uiText.ts turns them into the package's `UiText`.
export const enCommon = {
  ui: {
    close: "Close",
    closeDialog: "Close dialog",
    sheetOptions: "{title} options",
    numeric: {
      cancel: "Cancel",
      suggestions: "Suggested values",
      quickPick: "Quick pick",
      tapToUse: "Tap to use",
      editor: "Number editor",
      keypad: "Numeric keypad",
      decimalPoint: "Decimal point",
      backspace: "Backspace",
      empty: "empty",
      confirm: "Use {title}",
      announce: "{title} set to {value}{unit}",
      trigger: "{label}: {value}{unit}",
      usePreset: "Use {value}{unit}",
      replace: "Type a new value to replace this one.",
      ready: "Ready when you are.",
      range: "from {min} to {max}{unit}",
      wholeNumber: "Enter a whole number {range}.",
      fewerDecimals:
        "Enter a value with up to {n} decimal place {range}. | Enter a value with up to {n} decimal places {range}.",
      value: "Enter a value {range}.",
      pasteWhole: "Paste a whole number from {min} to {max}.",
      pasteDecimal:
        "Paste a number with up to {decimals} decimal places from {min} to {max}.",
    },
    install: {
      installed: "The app is installed on this device.",
      intro:
        "Keep your journal close. Open it from your home screen and train offline after the first complete load.",
      install: "Install app",
      opening: "Opening installer…",
      ios: {
        step1: "Open this page in Safari.",
        step2: "Open Share, then choose Add to Home Screen.",
        step3: "Confirm with Add.",
      },
      android: {
        step1: "Open your browser menu.",
        step2: "Choose Install app or Add to Home screen, if available.",
        step3: "Follow the browser instructions.",
      },
      browser: {
        step1: "Look for Install in the address bar or browser menu.",
        step2:
          "If it is unavailable, try a browser that supports app installation.",
      },
      note: "Your data stays in this browser. Installation is not a backup.",
    },
    muscleMap: {
      label: "Muscle map",
      primary: "Primary",
      supporting: "Supporting",
      notHighlighted: "Not highlighted",
      hint: "Choose a muscle below to locate it on the map.",
      front: "Front",
      back: "Back",
      regions: {
        chest: "Chest",
        shoulders: "Shoulders",
        biceps: "Biceps",
        triceps: "Triceps",
        forearms: "Forearms",
        abs: "Core",
        upperBack: "Upper back",
        lowerBack: "Lower back",
        glutes: "Glutes",
        quads: "Quads",
        hamstrings: "Hamstrings",
        calves: "Calves",
      },
    },
  },
} as const;
