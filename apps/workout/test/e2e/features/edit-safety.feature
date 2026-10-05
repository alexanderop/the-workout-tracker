Feature: Preserve local workout edits
  Background:
    Given I have a fresh workout journal
    When I start a workout with Bench press

  Scenario: Logging responds to the first click while the workout name is edited
    When I type the workout name "My local name"
    And I log a set while the name is unsaved
    Then the workout name remains "My local name"
    When I save the workout name
    Then reloading shows the saved workout name "My local name"

  Scenario: Keep a local name after another tab renames the workout
    When I type the workout name "My local name"
    And another tab saves the workout name "Other name"
    Then the workout name remains "My local name"
    And I can choose which workout name to keep
    When I keep my workout name
    Then reloading shows the saved workout name "My local name"

  Scenario: Use the saved name after another tab renames the workout
    When I type the workout name "My local name"
    And another tab saves the workout name "Other name"
    Then I can choose which workout name to keep
    When I use the saved workout name
    Then the workout name remains "Other name"

  Scenario: Browser Back asks before losing an exercise note
    When I write the unsaved exercise note "Keep my shoulders down"
    And I press browser Back from the workout
    Then keeping the note retains "Keep my shoulders down"
    When I press browser Back from the workout
    And I discard the unsaved exercise note
    Then I have left the workout editor

  Scenario: The workout back link asks before losing a name
    When I type the workout name "My local name"
    And I follow the workout back link
    Then I can keep editing my workout name
    When I follow the workout back link
    And I discard the unsaved workout name
    Then I have left the workout editor
