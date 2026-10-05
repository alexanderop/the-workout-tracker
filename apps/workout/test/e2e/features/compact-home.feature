Feature: Compact workout home
  Scenario Outline: Essential actions fit a short phone
    Given my compact home is "<state>" on a short phone
    Then the home actions fit above navigation without scrolling
    Examples:
      | state |
      | fresh |
      | returning |
      | active |

  Scenario: History is a separate searchable view
    Given my compact home is "returning" on a short phone
    When I open and search the full workout history
    Then returning home restores the latest workout and calendar

  Scenario: Template editing survives browser Back
    Given my compact home is "fresh" on a short phone
    When I create a template draft and use browser Back
    Then I can keep editing the same template draft

  Scenario: Enlarged home text can scroll
    Given my compact home is "active" on a short phone
    When I enlarge the home text
    Then the home remains vertically scrollable

  Scenario: Templates browse, edit and start in one sheet
    Given my compact home is "fresh" on a short phone
    When I save and rename a template from the template browser
    Then I can start the saved template and return to compact home

  Scenario: A history workout becomes a template without losing modal focus
    Given my compact home is "returning" on a short phone
    When I save a history workout as a template
    Then the template browser retains focus and closes back to home

  Scenario: Saving a template from active Home returns focus without scrolling
    Given my compact home is "active" on a short phone
    When I save the latest home workout as a template
    Then the template browser retains focus and closes back to home
    And focus returns to the Home Templates action
    And the home actions fit above navigation without scrolling
