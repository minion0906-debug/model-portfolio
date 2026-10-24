import assert from "node:assert/strict";
import { test } from "node:test";

import { isConnectionError, shouldSkipDatabaseForBuild } from "./prisma";

test("detects Prisma Neon connection errors from the message text", () => {
  const err = new Error(
    "Can't reach database server at ep-rough-paper-b4jxrq0t-pooler.c-6.us-east-2.aws.neon.tech:5432\nPlease make sure your database server is running."
  );

  assert.equal(isConnectionError(err), true);
});

test("ignores non-connection Prisma errors", () => {
  const err = new Error("Invalid value for argument `email`: Expected a string");

  assert.equal(isConnectionError(err), false);
});

test("build phase skips database queries", () => {
  process.env.NEXT_PHASE = "phase-production-build";

  assert.equal(shouldSkipDatabaseForBuild(), true);

  delete process.env.NEXT_PHASE;
});
