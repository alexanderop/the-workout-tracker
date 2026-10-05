Feature: A workout journal stays on this device
  Scenario: Confirming a number preserves a draft without logging a set
    Given I have a fresh workout journal
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    Then the 50 kilogram input is an unlogged draft
    When I reload the workout
    Then the 50 kilogram input is an unlogged draft
    When I log the first set and finish my workout
    Then my history contains one logged set with 400 kilograms of volume
    When I reload the workout
    Then my history contains one logged set with 400 kilograms of volume

  Scenario: Repeating a saved workout keeps its weight without logging it
    Given my journal contains a previous workout at 65 kilograms
    When I repeat the previous workout
    Then the first set starts at 65 kilograms without being logged
    When I reload the workout
    Then the first set starts at 65 kilograms without being logged

  Scenario: A custom exercise and edited template survive reopening
    Given I have a fresh workout journal
    When I create the custom exercise "Banded floor press"
    And I create the template "Press day" with "Banded floor press"
    And I rename the template "Press day" to "Home press day"
    And I reload the workout
    Then my only template is "Home press day" with "Banded floor press"
