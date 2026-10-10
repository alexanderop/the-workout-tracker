Feature: Pages have no detectable accessibility violations
  axe-core scans each rendered page. It finds a subset of problems and does not
  replace keyboard or screen reader testing.

  Scenario Outline: The <page> page has no axe violations
    Given my journal contains a previous workout at 65 kilograms
    When I open the "<page>" page
    Then the page has no accessibility violations

    Examples:
      | page     |
      | Progress |
      | Settings |

  # Known issue: these controls have an accessible name that does not contain
  # their visible text (WCAG 2.5.3 Label in Name). Fixing them renames controls
  # that other journeys select by name, so the change is made separately.
  Scenario: The Workouts page has only the known label-in-name issue
    Given my journal contains a previous workout at 65 kilograms
    When I open the "Workouts" page
    Then the page has no accessibility violations except "label-content-name-mismatch"

  Scenario: The Exercises page has only the known label-in-name issue
    Given my journal contains a previous workout at 65 kilograms
    When I open the "Exercises" page
    Then the page has no accessibility violations except "label-content-name-mismatch"

  Scenario: The active workout page has no axe violations
    Given I have a fresh workout journal
    When I start a workout with Bench press
    Then the page has no accessibility violations
