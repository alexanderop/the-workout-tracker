import { describe, expect, it } from "vitest";
import { computed, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { Result } from "@form/result";
import "@form/ui/tokens.css";
import "@form/ui/styles.css";
import WorkoutSettingsDelete from "../../src/features/workouts/ui/WorkoutSettingsDelete.vue";
import WorkoutSettingsImport from "../../src/features/workouts/ui/WorkoutSettingsImport.vue";
import WorkoutSettingsTraining from "../../src/features/workouts/ui/WorkoutSettingsTraining.vue";
import {
  Conflict,
  initialSnapshot,
  type Snapshot,
} from "../../src/features/workouts/domain";
import { createAppI18n, t } from "../../src/i18n/testing";
import { expectNoAxeViolations } from "../support/axe";

const global = { plugins: [createAppI18n("en")] };

const snapshotAt = (revision: number): Snapshot => ({
  ...initialSnapshot(),
  revision,
});
type Reply = Result<Snapshot, Conflict>;
const saved = (revision: number): Reply => Result.ok(snapshotAt(revision));
const conflicting = (revision: number): Reply =>
  Result.err(new Conflict({ snapshot: snapshotAt(revision) }));

/** The read-only refs the workspace hands to its pages. */
function workspaceState(revision: number) {
  const snapshot = ref<Snapshot | null>(snapshotAt(revision));
  return {
    snapshot,
    view: {
      snapshot: computed(() => snapshot.value),
      saving: computed(() => false),
    },
  };
}

const deleteButton = () =>
  page.getByRole("button", { name: t("settings.deleteData.button") });
const deleteDialog = () =>
  page.getByRole("dialog", { name: t("settings.deleteData.sheetTitle") });

function mountDelete(reply: Reply = saved(4), revision = 3) {
  const deletedAt: number[] = [];
  const view = render(WorkoutSettingsDelete, {
    global,
    props: {
      busy: false,
      workspace: {
        ...workspaceState(revision).view,
        deleteAllData: (expected: number) => {
          deletedAt.push(expected);
          return Promise.resolve(reply);
        },
      },
    },
  });
  return { view, deletedAt };
}

describe("given the Delete all data page", () => {
  it("should explain the deletion and stay accessible", async () => {
    const { view } = mountDelete();
    await expect
      .element(page.getByText(t("settings.deleteData.intro")))
      .toBeVisible();
    await expectNoAxeViolations((await view).container);
  });

  describe("when the button is pressed", () => {
    it("should ask for confirmation without deleting anything", async () => {
      const { deletedAt } = mountDelete();
      await deleteButton().click();
      await expect.element(deleteDialog()).toBeVisible();
      expect(deletedAt).toEqual([]);
    });

    it("should keep the data when the dialog is cancelled", async () => {
      const { deletedAt } = mountDelete();
      await deleteButton().click();
      await page
        .getByRole("button", { name: t("settings.deleteData.cancel") })
        .click();
      await expect.element(deleteDialog()).not.toBeInTheDocument();
      expect(deletedAt).toEqual([]);
    });

    it("should return focus to the button when the dialog closes", async () => {
      mountDelete();
      await deleteButton().click();
      await userEvent.keyboard("{Escape}");
      await expect.element(deleteButton()).toHaveFocus();
    });
  });

  describe("when the deletion is confirmed", () => {
    it("should delete at the revision the dialog opened with and say so", async () => {
      const { deletedAt } = mountDelete(saved(8), 7);
      await deleteButton().click();
      await deleteDialog()
        .getByRole("button", { name: t("settings.deleteData.button") })
        .click();
      await expect.element(deleteDialog()).not.toBeInTheDocument();
      expect(deletedAt).toEqual([7]);
      await expect
        .element(page.getByRole("status"))
        .toHaveTextContent(t("settings.deleteData.done"));
    });

    it("should require another review after a conflict", async () => {
      mountDelete(conflicting(9));
      await deleteButton().click();
      await deleteDialog()
        .getByRole("button", { name: t("settings.deleteData.button") })
        .click();
      await expect
        .element(page.getByRole("alert"))
        .toHaveTextContent(t("settings.deleteData.conflict"));
      await expect
        .element(
          deleteDialog().getByRole("button", {
            name: t("settings.deleteData.button"),
          }),
        )
        .toBeDisabled();
    });
  });
});

const fileInput = () => page.getByLabelText(t("settings.backup.fileLabel"));
const chooseFile = (name: string) =>
  fileInput().upload(new File(["{}"], name, { type: "application/json" }));
const pendingFile = () => page.getByText("week.json");

function mountImport(reply: Reply = saved(2)) {
  const state = workspaceState(1);
  const imported: { json: string; revision: number }[] = [];
  const view = render(WorkoutSettingsImport, {
    global,
    props: {
      busy: false,
      onBusyChange: () => undefined,
      workspace: {
        ...state.view,
        importBackup: (json: string, revision: number) => {
          imported.push({ json, revision });
          return Promise.resolve(reply);
        },
      },
    },
  });
  return { view, imported, snapshot: state.snapshot };
}

describe("given the Import backup page", () => {
  it("should import the chosen file at the revision it was read at", async () => {
    const { imported, snapshot } = mountImport();
    await chooseFile("week.json");
    await expect.element(pendingFile()).toBeVisible();
    // The journal moves on before the reader confirms.
    snapshot.value = snapshotAt(5);
    await page
      .getByRole("button", { name: t("settings.backup.importThis") })
      .click();
    await expect
      .element(page.getByRole("status"))
      .toHaveTextContent(t("settings.backup.imported"));
    expect(imported).toEqual([{ json: "{}", revision: 1 }]);
    await expect.element(pendingFile()).not.toBeInTheDocument();
  });

  it("should drop the pending file when it is cancelled", async () => {
    mountImport();
    await chooseFile("week.json");
    await page
      .getByRole("button", { name: t("settings.backup.cancelImport") })
      .click();
    await expect.element(pendingFile()).not.toBeInTheDocument();
  });

  it("should not carry the pending file to a new visit of the page", async () => {
    const first = mountImport();
    await chooseFile("week.json");
    await expect.element(pendingFile()).toBeVisible();
    await (await first.view).unmount();
    mountImport();
    await expect
      .element(page.getByRole("button", { name: t("settings.backup.import") }))
      .toBeVisible();
    await expect.element(pendingFile()).not.toBeInTheDocument();
  });

  it("should report that the data changed when the import conflicts", async () => {
    mountImport(conflicting(8));
    await chooseFile("week.json");
    await page
      .getByRole("button", { name: t("settings.backup.importThis") })
      .click();
    await expect
      .element(page.getByRole("status"))
      .toHaveTextContent(t("settings.backup.changed"));
    await expect.element(pendingFile()).not.toBeInTheDocument();
  });
});

describe("given the Training preferences page", () => {
  it("should save the rest timer choice through the workspace command", async () => {
    const commands: unknown[] = [];
    await render(WorkoutSettingsTraining, {
      global,
      props: {
        workspace: {
          ...workspaceState(1).view,
          run: (command: unknown) => {
            commands.push(command);
            return Promise.resolve(null);
          },
        },
      },
    });
    const { autoRest } = initialSnapshot().settings;
    await page
      .getByRole("switch", { name: t("settings.training.autoRest.label") })
      .click();
    expect(commands).toEqual([
      {
        type: "settings",
        settings: { ...initialSnapshot().settings, autoRest: !autoRest },
      },
    ]);
  });
});
