Feature: Keep edits visible when leaving an editor
  Scenario Outline: Template dismissal asks before discarding changes
    Given I am editing a new template called "Keep this draft"
    When I dismiss the template using "<dismissal>"
    Then I can keep editing the template "Keep this draft"
    When I dismiss the template using "Cancel"
    And I discard my template changes
    Then the template editor is closed

    Examples:
      | dismissal |
      | Escape    |
      | Cancel    |
      | Close     |
      | Outside   |

  Scenario: An unchanged template closes without confirmation
    Given I opened a new template without making changes
    When I dismiss the template using "Escape"
    Then the template editor is closed

  Scenario: Review my sets reveals and focuses a hidden input draft
    Given my active workout contains Bench press and Back squat
    When I confirm a Back squat weight of 55 kilograms
    And I switch to Bench press and review my input drafts
    Then the Back squat draft is visible and focused

  Scenario: Reload selects recovered input ahead of other unfinished exercises
    Given my active workout contains Bench press and Back squat
    When I confirm a Back squat weight of 55 kilograms
    And I reload the workout
    Then the Back squat input draft is visible

  Scenario: Reload resumes unfinished exercise without advancing on its last log
    Given Bench press is logged and Back squat is unfinished
    When I reload the workout
    Then Back squat is selected
    When I log my final Back squat set
    Then Back squat is selected
