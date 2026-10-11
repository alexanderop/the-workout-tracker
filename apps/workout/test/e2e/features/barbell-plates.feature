@mobile
Feature: Barbell plates in the weight keypad
  A barbell exercise's weight keypad shows the plates for each side of the bar.
  The bar weight and the plates a lifter owns come from Training preferences.

  Scenario: Typing a weight shows the plates and a listed value confirms at once
    Given I have a fresh workout journal
    When I start a workout with Bench press
    And I type "80" in the set 1 weight keypad
    Then the keypad shows the plates "Per side: 20 kg, 10 kg on a 20 kg bar"
    When I choose "100 kg" from the keypad values
    Then the set 1 weight shows "100"

  Scenario: The plates follow the plates I own
    Given I have a fresh workout journal
    When I open the Settings hub
    And I open the "Training preferences" settings page
    And I turn off the "10 kg plate"
    And I return to my workouts
    And I start a workout with Bench press
    And I type "80" in the set 1 weight keypad
    Then the keypad shows the plates "Per side: 20 kg, 5 kg, 5 kg on a 20 kg bar"
