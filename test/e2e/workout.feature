Feature: A private training journal
  Scenario: Log and recover a workout offline
    Given a new training journal
    When I start the upper body workout and log two edited sets
    Then my logged sets and rest survive a reload
    When I finish the workout offline
    Then history and progress show only my logged work

  Scenario: Make a routine and move a backup to a fresh browser
    Given a new training journal
    When I create and edit my own routine
    And I export a backup and import it in a fresh browser
    Then my routine is restored with its edited targets

  Scenario: Discard a workout without inventing history
    Given a new training journal
    When I discard an empty free workout
    Then I can start a different routine with empty history

  Scenario: A stale draft cannot overwrite another tab
    Given a new training journal
    When two tabs edit the same set
    Then the stale draft is preserved and the saved set is not overwritten

  Scenario: Train with a custom exercise entirely offline
    Given a new training journal
    When I start and log a custom exercise offline
    Then that custom workout survives an offline reload
