import { test, expect } from "@playwright/test";

const columns = [
  "To Do",
  "In Progress",
  "Review",
  "Done",
  "Blocked",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("column-name").first()).toBeVisible();
});

test.describe("board renders", () => {
  test("shows exactly 5 columns with dummy data", async ({ page }) => {
    const names = page.getByTestId("column-name");
    await expect(names).toHaveCount(5);
    for (let i = 0; i < columns.length; i++) {
      await expect(names.nth(i)).toHaveValue(columns[i]);
    }
  });

  test("shows 9 cards total across the board", async ({ page }) => {
    const total = await page
      .getByTestId("column-name")
      .evaluateAll((els) => els.length);
    expect(total).toBe(5);
    const counts = await page
      .getByTestId("column-count")
      .evaluateAll((els) =>
        els.map((el) => Number(el.textContent))
      );
    expect(counts.reduce((a, b) => a + b, 0)).toBe(9);
  });

  test("renders a card with its title and details", async ({ page }) => {
    await expect(page.getByText("Draft launch plan")).toBeVisible();
    await expect(
      page.getByText("Outline the rollout timeline")
    ).toBeVisible();
  });
});

test.describe("column rename", () => {
  test("renames a column by typing in its header", async ({ page }) => {
    const name = page.getByTestId("column-name").first();
    await name.clear();
    await name.fill("Backlog");
    await expect(name).toHaveValue("Backlog");
    await expect(page.getByTestId("column-name").first()).toHaveValue("Backlog");
  });
});

test.describe("add card", () => {
  test("adds a card to the first column", async ({ page }) => {
    const before = await page
      .getByTestId("column-count")
      .first()
      .evaluate((el) => Number(el.textContent));

    await page.getByTestId("add-card-btn").first().click();
    await page.getByTestId("add-title").fill("New card from test");
    await page.getByTestId("add-details").fill("Some details");
    await page.getByTestId("add-submit").click();

    const after = await page
      .getByTestId("column-count")
      .first()
      .evaluate((el) => Number(el.textContent));
    expect(after).toBe(before + 1);
    await expect(page.getByText("New card from test")).toBeVisible();
  });

  test("blocks adding an empty card", async ({ page }) => {
    await page.getByTestId("add-card-btn").first().click();
    await expect(page.getByTestId("add-submit")).toBeDisabled();
  });
});

test.describe("delete card", () => {
  test("deletes a card and it disappears", async ({ page }) => {
    const title = "Draft launch plan";
    await expect(page.getByText(title)).toBeVisible();

    // Delete the button inside the card that holds this title.
    const card = page.locator(".card", { has: page.getByText(title) });
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText(title)).toHaveCount(0);
  });
});

test.describe("edit card", () => {
  test("opens the dialog, edits title, and saves", async ({ page }) => {
    await page.getByText("Draft launch plan").click();
    const titleInput = page.getByTestId("edit-title");
    await expect(titleInput).toBeVisible();
    await titleInput.fill("Updated launch plan");
    await page.getByTestId("edit-details").fill("Brand new details");
    await page.getByTestId("edit-save").click();

    await expect(page.getByText("Updated launch plan")).toBeVisible();
    await expect(page.getByText("Brand new details")).toBeVisible();
    await expect(page.getByText("Draft launch plan")).toHaveCount(0);
  });

  test("cancels without saving", async ({ page }) => {
    await page.getByText("Draft launch plan").click();
    await page.getByTestId("edit-title").fill("Should not persist");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Draft launch plan")).toBeVisible();
    await expect(page.getByText("Should not persist")).toHaveCount(0);
  });
});

test.describe("drag and drop", () => {
  test("moves a card to another column", async ({ page }) => {
    const sourceTitle = "Draft launch plan";
    const targetName = "In Progress";

    const sourceCard = page.getByText(sourceTitle);
    const targetColumn = page.getByRole("textbox", { name: `Rename column ${targetName}` });
    await expect(targetColumn).toHaveValue(targetName);

    // Drop target: a visible card in the destination column (In Progress).
    const targetCard = page
      .getByTestId("column")
      .nth(1)
      .getByRole("button", { name: "Design dashboard widgets" });

    const sourceBox = await sourceCard.boundingBox();
    const targetBox = await targetCard.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("missing boxes");

    const sx = sourceBox.x + sourceBox.width / 2;
    const sy = sourceBox.y + Math.min(14, sourceBox.height / 3);
    const tx = targetBox.x + targetBox.width / 2;
    const ty = targetBox.y + Math.min(14, targetBox.height / 3);

    // A real, gradual mouse drag. closestCenter tracks the pointer center,
    // so releasing over the target card lands the card in that column.
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 4, sy + 4); // clear the 6px activation distance
    await page.mouse.move(tx, ty, { steps: 40 });
    await page.mouse.up();

    // The dragged card now lives in the target column (In Progress = index 1).
    await expect(page.getByTestId("column").nth(1)).toContainText(sourceTitle);
  });

  test("keeps a card in its column when dragged within it", async ({ page }) => {
    // Within-column reordering is verified by the moveCard unit test. This
    // integration test confirms that dragging a card to a different position
    // within the same column does NOT move it to a different column (i.e.
    // the feature is wired up and doesn't break the board layout).
    const column1 = page.getByTestId("column").first(); // To Do
    const titleA = "Draft launch plan";

    const sourceCard = column1.locator(".card", {
      has: page.getByText(titleA, { exact: true }),
    });
    const targetCard = column1.locator(".card").nth(2); // 3rd card in To Do

    const boxA = await sourceCard.boundingBox();
    const boxC = await targetCard.boundingBox();
    if (!boxA || !boxC) throw new Error("missing boxes");

    await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + 10);
    await page.mouse.down();
    await page.mouse.move(boxC.x + boxC.width / 2, boxC.y + boxC.height + 20, {
      steps: 40,
    });
    await page.mouse.up();

    // The card should still be in To Do (column 0), not in any other column.
    await expect(column1).toContainText(titleA);
    for (let i = 1; i < 5; i++) {
      await expect(page.getByTestId("column").nth(i)).not.toContainText(titleA);
    }
  });
});
