import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseStoredAttribution,
  pickAttribution,
  readAttribution,
  whatsappHref,
  withUtm,
} from "./leadAttribution.ts";

test("keeps UTM and Meta ad parameters", () => {
  assert.deepEqual(
    readAttribution(
      "?utm_source=facebook&utm_medium=paid_social&utm_campaign=uk-trades&ad_id=120210000000&placement=instagram_reels&site_source_name=ig",
    ),
    {
      utm_source: "facebook",
      utm_medium: "paid_social",
      utm_campaign: "uk-trades",
      ad_id: "120210000000",
      placement: "instagram_reels",
      site_source_name: "ig",
    },
  );
});

test("records that fbclid was present without keeping its value", () => {
  assert.deepEqual(readAttribution("?fbclid=IwAR0abc123"), { has_fbclid: true });
});

test("ignores parameters outside the allowlist", () => {
  assert.deepEqual(
    readAttribution("?name=Dana&email=dana%40example.com&phone=07700900123"),
    {},
  );
});

test("drops a value that looks like an email address", () => {
  assert.deepEqual(readAttribution("?utm_content=dana%40example.com"), {});
});

test("drops a Meta macro that was never expanded", () => {
  assert.deepEqual(readAttribution("?ad_id={{ad.id}}&utm_source=facebook"), {
    utm_source: "facebook",
  });
});

test("trims and caps long values", () => {
  const long = "x".repeat(300);
  assert.equal(readAttribution(`?utm_term=${long}`).utm_term?.length, 100);
  assert.equal(readAttribution("?utm_source=%20facebook%20").utm_source, "facebook");
});

test("a fresh landing replaces stored attribution whole", () => {
  assert.deepEqual(
    pickAttribution({ utm_campaign: "new" }, { utm_campaign: "old", ad_id: "1" }),
    { utm_campaign: "new" },
  );
});

test("falls back to stored attribution when the URL has none", () => {
  assert.deepEqual(pickAttribution({}, { utm_campaign: "old" }), { utm_campaign: "old" });
  assert.deepEqual(pickAttribution({}, null), {});
});

test("stored attribution passes through the same allowlist", () => {
  assert.deepEqual(
    parseStoredAttribution(
      JSON.stringify({ utm_source: "facebook", email: "dana@example.com", has_fbclid: true }),
    ),
    { utm_source: "facebook", has_fbclid: true },
  );
  assert.equal(parseStoredAttribution("not json"), null);
  assert.equal(parseStoredAttribution(null), null);
});

test("carries only utm_* values onto the booking link", () => {
  assert.equal(
    withUtm("https://cal.com/webm8/15min", {
      utm_source: "facebook",
      utm_campaign: "uk-trades",
      ad_id: "120210000000",
      has_fbclid: true,
    }),
    "https://cal.com/webm8/15min?utm_source=facebook&utm_campaign=uk-trades",
  );
});

test("setting UTMs twice does not duplicate them", () => {
  const once = withUtm("https://cal.com/webm8/15min", { utm_source: "facebook" });
  assert.equal(withUtm(once, { utm_source: "facebook" }), once);
});

test("builds a WhatsApp link from any written form of the number", () => {
  assert.equal(
    whatsappHref("+44 7700 900123", "Hi WebM8"),
    "https://wa.me/447700900123?text=Hi%20WebM8",
  );
});

test("an unset WhatsApp number gives no link", () => {
  assert.equal(whatsappHref("", "Hi"), null);
  assert.equal(whatsappHref("123", "Hi"), null);
});
