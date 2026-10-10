Feature: The workout journal works without a network
  Once the app has opened online, training and saving need no connection.

  Background:
    Given I have opened the app and it is ready for offline use

  Scenario: A workout started online is continued, reloaded and finished offline
    When I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And I go offline
    Then the app says it is offline
    When I log the first set
    And I reload the workout
    Then the app says it is offline
    And 1 set is logged
    When I finish my workout
    And I open my workout history
    Then my history contains one logged set with 400 kilograms of volume
    When I reload the workout
    Then my history contains one logged set with 400 kilograms of volume

  Scenario: A workout started offline is kept when the connection returns
    When I go offline
    And I reload the workout
    And I start a workout with Bench press
    And I confirm a weight of 50 kilograms
    And I log the first set
    And I go online
    And I reload the workout
    Then 1 set is logged
    When I finish my workout
    And I open my workout history
    Then my history contains one logged set with 400 kilograms of volume
