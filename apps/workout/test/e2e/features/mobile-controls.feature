@mobile
Feature: Mobile training controls
  Scenario: Numeric confirmation remains reachable on a short phone
    Given I have a workout on a short phone
    Then I can confirm a number with full-sized keypad controls

  Scenario: Logged sets have a separate undo action
    Given I have a workout on a short phone
    Then logging a set offers an explicit undo in its options

  Scenario: Adding and choosing the next set manage focus
    Given I have a workout on a short phone
    Then I can add a set and return to the next unfinished set
