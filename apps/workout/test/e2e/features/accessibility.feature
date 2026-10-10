Feature: Pages have no detectable accessibility violations
  axe-core scans each rendered page in the light and the dark theme. It finds a
  subset of problems and does not replace keyboard or screen reader testing. It
  cannot compute color contrast where the translucent navigation overlaps
  scrolling artwork, so contrast is not established on those pages.

  Scenario Outline: The <page> page has no axe violations in the <scheme> theme
    Given my device prefers a "<scheme>" color scheme
    And my journal contains a previous workout at 65 kilograms
    When I open the "<page>" page
    Then the app uses the "<scheme>" theme and the "blue" accent
    And the page has no accessibility violations

    Examples:
      | page     | scheme |
      | Progress | light  |
      | Progress | dark   |
      | Settings | light  |
      | Settings | dark   |

  # Known issue: these controls have an accessible name that does not contain
  # their visible text (WCAG 2.5.3 Label in Name). Fixing them renames controls
  # that other journeys select by name, so the change is made separately.
  Scenario Outline: The <page> page has only the known label-in-name issue in the <scheme> theme
    Given my device prefers a "<scheme>" color scheme
    And my journal contains a previous workout at 65 kilograms
    When I open the "<page>" page
    Then the app uses the "<scheme>" theme and the "blue" accent
    And the page has no accessibility violations except "label-content-name-mismatch"

    Examples:
      | page      | scheme |
      | Workouts  | light  |
      | Workouts  | dark   |
      | Exercises | light  |
      | Exercises | dark   |

  Scenario Outline: The active workout page has no axe violations in the <scheme> theme
    Given my device prefers a "<scheme>" color scheme
    And I have a fresh workout journal
    When I start a workout with Bench press
    Then the app uses the "<scheme>" theme and the "blue" accent
    And the page has no accessibility violations

    Examples:
      | scheme |
      | light  |
      | dark   |
