Feature: Correct completed workouts
  Background:
    Given I have a completed workout and an independent active workout
    When I edit the completed workout

  Scenario: Save corrections together and keep the active workout
    When I correct the completed name to "Corrected workout" and weight to "55"
    And I save the completed corrections
    Then the corrected workout survives reload and the active workout stays unchanged

  Scenario: A conflicting save retains input until an explicit reload
    When I correct the completed name to "Local correction" and weight to "55"
    And another tab renames the completed workout to "Remote correction"
    Then my completed corrections remain visible with a conflict
    When I reload saved completed values and confirm discarding my corrections
    Then the completed editor shows "Remote correction" and weight "40"

  Scenario: Escape cannot silently discard corrections
    When I correct the completed name to "Keep this correction" and weight to "55"
    And I dismiss the completed editor with Escape and keep editing
    Then the completed editor shows "Keep this correction" and weight "55"

  Scenario: Browser Back requires explicit discard
    When I correct the completed name to "Keep this correction" and weight to "55"
    And I press browser Back from the completed editor
    And I keep the completed corrections
    Then the completed editor shows "Keep this correction" and weight "55"
    When I press browser Back from the completed editor
    And I discard the completed corrections
    Then the completed editor and review are closed

  Scenario: Browser Back preserves unconfirmed keypad input
    When I type "63" in the completed weight keypad without confirming
    And I press browser Back from the completed editor
    Then the completed weight keypad still contains "63"
    When I cancel the completed weight keypad
    Then the completed editor shows "Previous workout" and weight "40"
    When I type "57" in the completed weight keypad without confirming
    And I confirm the completed weight keypad
    Then the completed editor shows "Previous workout" and weight "57"
