import assert from "node:assert/strict";
import { test } from "node:test";
import { moverPlans } from "./movers.ts";

const standard = moverPlans.find((plan) => plan.id === "standard")!;
const growth = moverPlans.find((plan) => plan.id === "growth")!;

test("no plan publishes a price", () => {
  assert.ok(!/\$\s?\d/.test(JSON.stringify(moverPlans)));
  for (const plan of moverPlans) {
    assert.ok(!Object.keys(plan).some((key) => /price/i.test(key)));
  }
});

test("no plan advertises a minimum contract term", () => {
  const text = JSON.stringify(moverPlans).toLowerCase();
  assert.ok(!text.includes("12-month"));
  assert.ok(!text.includes("12 month"));
  assert.ok(!text.includes("minimum term"));
  assert.ok(!text.includes("setup fee"));
});

test("growth is a superset of standard, not a repeat of it", () => {
  assert.ok(growth.features[0].startsWith("Everything in Standard"));
  const standardOnly = standard.features.filter((feature) =>
    growth.features.includes(feature),
  );
  assert.equal(standardOnly.length, 0);
});
