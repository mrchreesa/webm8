import assert from "node:assert/strict";
import test from "node:test";
import { instantMarket, instantOffer, requestInstantMarket } from "./instantPricing.ts";

test("only a US country selects dollars; missing and other countries retain the UK offer", () => {
  for (const country of ["US", "us", " US "]) assert.equal(instantOffer(instantMarket(country)).price, "$79");
  for (const country of ["GB", "UK", "CA", "AU", "DE", "", null, undefined]) assert.equal(instantOffer(instantMarket(country)).price, "£39");
  assert.equal(requestInstantMarket(new Headers({ "accept-language": "en-US", "x-country": "US" })), "GB");
  assert.equal(requestInstantMarket(new Headers({ "x-vercel-ip-country": "US", "accept-language": "en-GB" })), "US");
});
