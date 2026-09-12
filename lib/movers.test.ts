import assert from "node:assert/strict";
import { test } from "node:test";
import {
  annualEquivalentMonthly,
  annualMonthsPaid,
  annualSaving,
  formatUsd,
  formatUsdPrecise,
  moverPlans,
} from "./movers.ts";

const standard = moverPlans.find((plan) => plan.id === "standard")!;
const growth = moverPlans.find((plan) => plan.id === "growth")!;

test("standard is $197 monthly or $1,970 annually", () => {
  assert.equal(standard.monthlyPrice, 197);
  assert.equal(standard.annualPrice, 1970);
});

test("growth is $297 monthly or $2,970 annually", () => {
  assert.equal(growth.monthlyPrice, 297);
  assert.equal(growth.annualPrice, 2970);
});

test("annual payment covers ten months for twelve months of service", () => {
  for (const plan of moverPlans) {
    assert.equal(annualMonthsPaid(plan), 10);
  }
});

test("annual saving equals two months of the monthly price", () => {
  assert.equal(annualSaving(standard), 394);
  assert.equal(annualSaving(growth), 594);
  for (const plan of moverPlans) {
    assert.equal(annualSaving(plan), plan.monthlyPrice * 2);
  }
});

test("monthly equivalent divides the annual charge across twelve months", () => {
  assert.equal(annualEquivalentMonthly(standard), 164.17);
  assert.equal(annualEquivalentMonthly(growth), 247.5);
});

test("the monthly equivalent is always lower than the monthly price", () => {
  for (const plan of moverPlans) {
    assert.ok(annualEquivalentMonthly(plan) < plan.monthlyPrice);
  }
});

test("currency formatting", () => {
  assert.equal(formatUsd(197), "$197");
  assert.equal(formatUsd(1970), "$1,970");
  assert.equal(formatUsd(2970), "$2,970");
  assert.equal(formatUsdPrecise(annualEquivalentMonthly(standard)), "$164.17");
  assert.equal(formatUsdPrecise(annualEquivalentMonthly(growth)), "$247.50");
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
