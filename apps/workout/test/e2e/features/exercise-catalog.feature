Feature: Browsing exercises without losing a workout selection
  Scenario: Visual filters combine and nested dismissal preserves selection
    Given my exercise catalog includes a custom barbell press
    When I select Bench press in the exercise picker
    And I browse illustrated equipment and muscle filters
    Then only matching custom exercises appear
    When I reset catalog filters while searching
    Then the search remains and the selected exercise is preserved
    When I clear a search with no results
    Then the search receives focus and the full catalog returns
    And alphabetical ordering can be reversed
    And dismissing nested filters returns focus to the workout picker
    And the original exercise can start a workout

  Scenario: Selected exercises and applied filters stay available outside search results
    Given my exercise catalog includes a custom barbell press
    When I select Bench press in the exercise picker
    And I browse illustrated equipment and muscle filters
    Then only matching custom exercises appear
    And the hidden selection and named active filters remain visible
    And I can remove each filter without losing my search sort or selection
    And I can remove a hidden selection on a short phone
