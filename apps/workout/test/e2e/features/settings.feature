Feature: Settings hub and detail pages
  Settings is a hub of rows with a current value each. A row opens its own page;
  Back returns to the hub and to the row that was opened.

  Scenario: The hub lists every section with its current value
    Given I have a fresh workout journal
    When I open the Settings hub
    Then the hub lists these rows
      | row                  | value            |
      | Training preferences | Rest 90 sec      |
      | Appearance           | System · Blue    |
      | Language             | System           |
      | Install app          |                  |
      | Export backup        |                  |
      | Import backup        |                  |
      | Delete all data      |                  |

  Scenario: A detail page takes focus and Back returns to its row
    Given I have a fresh workout journal
    When I open the Settings hub
    And I open the "Appearance" settings page
    Then the heading "Appearance" has focus
    When I go back to the Settings hub
    Then the "Appearance" row has focus

  Scenario: The Settings tab stays selected on a detail page and returns to the hub
    Given I have a fresh workout journal
    When I open the Settings hub
    And I open the "Language" settings page
    Then the Settings tab is the current page
    When I open the Settings hub
    Then the Settings hub is shown

  Scenario: The browser Back button returns to the hub
    Given I have a fresh workout journal
    When I open the Settings hub
    And I open the "Export backup" settings page
    And I press the browser Back button
    Then the Settings hub is shown
    And the "Export backup" row has focus

  Scenario: A deep link opens a detail page
    Given I have a fresh workout journal
    When I open the address "/#/settings/training"
    Then the heading "Training preferences" has focus

  Scenario: An unknown settings address does not open a page
    Given I have a fresh workout journal
    When I open the address "/#/settings/unknown"
    Then I see the Workouts page

  Scenario Outline: The <section> page has no axe violations in the <scheme> theme
    Given my device prefers a "<scheme>" color scheme
    And I have a fresh workout journal
    When I open the Settings hub
    And I open the "<section>" settings page
    Then the page has no accessibility violations

    Examples:
      | section              | scheme |
      | Training preferences | light  |
      | Appearance           | dark   |
      | Language             | light  |
      | Install app          | dark   |
      | Export backup        | light  |
      | Import backup        | dark   |
      | Delete all data      | light  |
