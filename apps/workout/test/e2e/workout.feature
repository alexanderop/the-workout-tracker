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

  Scenario: Install the app from its published project path
    Given a new training journal
    Then the app has its published name and installable assets

  Scenario: Recover unfinished inputs without logging them
    Given a new training journal
    When I leave an unfinished draft and return to training
    Then my draft survives reload and reopening without counting as logged

  Scenario: Complete and undo a set from the mobile training controls
    Given a new training journal
    When I use the compact training controls and set options
    Then undo and reload keep the set open without resurrecting a draft

  Scenario: Recovered drafts require review after another tab changes the workout
    Given a new training journal
    When an older draft is reopened after a completion and undo
    Then I must explicitly discard the stale draft before logging

  Scenario: Training controls distinguish an empty and a completed workout
    Given a new training journal
    When I build and complete a one-set free workout
    Then training controls offer to finish and normal navigation returns
