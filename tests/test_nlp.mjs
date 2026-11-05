import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const code = readFileSync(join(root, "nlp.js"), "utf8");
const sandbox = { console, globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(code, sandbox);
const NLP = sandbox.RenewalNLP;

const clear = readFileSync(join(root, "samples/notice-clear.txt"), "utf8");
const fail = readFileSync(join(root, "samples/notice-failure.txt"), "utf8");

const a = NLP.analyze(clear);
assert.equal(a.classification.label, "likely renewal notice");
assert.ok(a.money.some((m) => m.value === 412500));
assert.ok(a.rates.some((r) => r.value === 3.15));
assert.ok(a.dates.length >= 2);
assert.ok(a.checklist.length >= 4);

const f = NLP.analyze(fail);
assert.equal(f.classification.label, "not a renewal notice");

const policy = JSON.parse(readFileSync(join(root, "data/policy-rate.json"), "utf8"));
assert.equal(policy.observations.at(-1).v, 2.5);

console.log("Renewal Coach tests passed.");
