import test from "node:test";
import assert from "node:assert/strict";
import { previewResponse } from "../src/preview.ts";

test("preview exposes only fictional, anonymous public listings", () => {
  assert.deepEqual(previewResponse("session/"), { user: null });
  const result = previewResponse("jobs/");
  assert.equal(result.jobs.length, 9);
  assert.ok(result.jobs.every((job) => job.is_demo && job.is_active));
  assert.deepEqual(result.saved, []);
  assert.equal(result.resume, null);
});
test("preview combines query, location, ministry, work mode and salary sorting", () => {
  assert.equal(
    previewResponse("jobs/?category=Worship+%26+Music").jobs[0].title,
    "Worship & Creative Arts Director",
  );
  assert.equal(
    previewResponse("jobs/?q=technology&work_mode=Remote").jobs[0].title,
    "Communications & Digital Lead",
  );
  assert.equal(
    previewResponse("jobs/?location=Seattle&type=Part-time").jobs.length,
    1,
  );
  assert.equal(previewResponse("jobs/?q=nonexistent").jobs.length, 0);
  assert.equal(
    previewResponse("jobs/?sort=salary").jobs[0].title,
    "Associate Pastor",
  );
});
test("preview rejects private endpoints and all writes", () => {
  assert.throws(() => previewResponse("auth/login/", "POST"), /unavailable/);
  assert.throws(() => previewResponse("resumes/", "POST"), /unavailable/);
  assert.throws(() => previewResponse("applications/"), /full service/);
});
