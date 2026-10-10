Feature: Choose the app language
  Scenario: Switching to German applies at once and is remembered
    Given I open the language settings
    When I switch the language to German
    Then the app is shown in German without reloading
    And after reloading the app is still shown in German

  Scenario: System follows a German browser
    Then a German browser shows the app in German without a stored choice

  Scenario: An explicit English choice beats a German browser
    Then a German browser that chose English sees the app in English

  Scenario: The number editor uses the German decimal comma
    Given my active workout is open in German
    When I type the weight "42,5" in the number editor
    Then the number editor shows "42,5"
    When I confirm the weight
    Then the weight reads "42,5"
    When I log the German first set
    Then the journal stores a weight of 42.5 kilograms
