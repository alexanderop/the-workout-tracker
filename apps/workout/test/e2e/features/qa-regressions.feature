Feature: Preserve editing intent across tabs and reloads
  Background:
    Given a fresh journal for concurrent editing

  Scenario: Logging requires review of another tab's numeric input
    Given an unlogged Bench press workout
    When two tabs enter 60 and 70 kilograms and the first tab tries to log
    Then the first tab must review the other input
    And reloading the second tab retains its 70 kilogram input

  Scenario: A finish confirmation cannot finish a replacement workout
    Given a logged Bench press workout
    When I open finish and another tab finishes and starts a replacement workout
    Then the old finish confirmation is closed and the replacement remains active

  Scenario: Recover a name after another tab finishes the workout
    Given a logged Bench press workout
    When I type the workout name "Name worth keeping"
    And another tab finishes and starts a replacement workout
    Then I can save the preserved name to the original completed workout
    And the replacement workout keeps its own name

  Scenario: Save a template after unrelated activity in another tab
    Given I edit the description of an existing template
    When another tab renames the active workout
    Then saving the template retains my description

  Scenario: Explicitly resolve concurrent changes to the same template
    Given I edit the description of an existing template
    When another tab edits the same template description
    Then my template input remains until I explicitly keep my changes

  Scenario: Reload warns about a note and stops warning after save
    Given an unlogged Bench press workout
    When I write the unsaved exercise note "Keep shoulders down"
    Then cancelling browser reload retains the note
    And saving the note allows reload without a warning
