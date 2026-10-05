Feature: Training rhythm reflects the saved journal
  Scenario: Browse a day with two workouts and open its review
    Given my calendar contains two completed workouts today
    When I select today in my training rhythm
    Then the calendar lists both of today's workouts
    When I open "Evening strength" from the calendar
    Then its review offers repeating and saving a template
    When I close the calendar workout review
    Then focus returns to the training calendar action
