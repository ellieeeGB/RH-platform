import test from "node:test";
import assert from "node:assert/strict";
import { normalizePathname } from "../src/lib/route-path";
import { navigation } from "../src/lib/navigation";

test("all exported routes retain exactly one active navigation item with trailing slashes", () => {
  const routes = navigation.flatMap(group => group.items).flatMap(item => item.href ? [item.href] : []);
  for (const route of routes) {
    for (const path of [route, `${route}/`]) {
      assert.deepEqual(routes.filter(href => href === normalizePathname(path)), [route]);
    }
  }
});

test("root fallbacks remain root and route prefixes cannot activate a different section", () => {
  for (const path of [null, undefined, "", "/", "//"]) assert.equal(normalizePathname(path), "/");
  assert.notEqual(normalizePathname("/agenda-extra/"), "/agenda");
  assert.equal(normalizePathname("/agenda/"), normalizePathname("/agenda"));
});
