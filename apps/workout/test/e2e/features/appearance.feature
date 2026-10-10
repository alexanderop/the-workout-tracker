Feature: Appearance settings
  Scenario: The saved theme and accent apply from the first paint
    Given I open the appearance settings
    When I choose the "Dark" theme and the "Teal" accent
    Then the app uses the "dark" theme and the "teal" accent
    And after reloading the app still uses the "dark" theme and the "teal" accent

  Scenario Outline: The system theme follows the device
    Given my device prefers a "<scheme>" color scheme
    And I open the appearance settings
    Then the app uses the "<scheme>" theme and the "blue" accent
    Examples:
      | scheme |
      | light |
      | dark |
