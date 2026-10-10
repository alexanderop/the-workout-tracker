@updates
Feature: An app update never interrupts a workout
  A new version waits while a workout is active and reloads the app only when
  the user chooses it. Input that is not yet logged stays on this device.

  Background:
    Given version 1 of the app is installed

  Scenario: An update waits while a workout has an unlogged draft
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And version 2 is deployed
    Then no update is offered
    And the page has not reloaded
    And the 50 kilogram input is an unlogged draft
    When I discard the workout
    Then the update is offered

  Scenario: An unlogged draft survives a reload while an update waits
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And version 2 is deployed
    And I reload the workout
    Then the app runs version 1
    And no update is offered
    And the 50 kilogram input is an unlogged draft

  Scenario: Accepting the update after finishing keeps the logged set
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And I log the first set
    And version 2 is deployed
    Then no update is offered
    When I finish my workout
    Then the update is offered
    When I accept the update
    Then the app runs version 2
    When I open my workout history
    Then my history contains one logged set with 400 kilograms of volume

  Scenario: Another tab activating the update keeps an unlogged draft
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And version 2 is deployed
    And another tab activates version 2
    Then the 50 kilogram input is an unlogged draft
    When I reload the workout
    Then the app runs version 2
    And the 50 kilogram input is an unlogged draft
    When I log the first set and finish my workout
    And I open my workout history
    Then my history contains one logged set with 400 kilograms of volume

  Scenario: Updating in another tab keeps an unsaved template
    Given I am editing a new template called "Keep this draft"
    And a second tab shows the workouts without an active workout
    When version 2 is deployed
    Then this tab knows an update is waiting
    When I accept the update in the second tab
    And I dismiss the template using "Escape"
    Then I can keep editing the template "Keep this draft"
