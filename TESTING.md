# Verification record

Verified locally on 4 October 2026. No external site was deployed.

## Automated checks

- Django: 13 workflow/security tests passed.
- Django system check: no issues.
- React/TypeScript production build passed.
- Impeccable detector: no reported findings.
- API responses use `Cache-Control: private, no-store`.
- Manifest, icons, service worker and HTML served successfully.

## Browser checks

Using the built React frontend served by Django:

- Filtered to Worship & Music; one correct sample listing appeared.
- Signed in with a fictional candidate account.
- Uploaded `sample-resume.txt`; skill extraction and overlap labels appeared.
- Saved a job, submitted a sample application, and saw Submitted in My applications.
- Signed in with a fictional employer account, published a demonstration role and closed it successfully.
- An employer review fixture was created through Django to exercise the applicant screen; changed its status to Reviewing through the UI.
- Saved two jobs: salary ordering put Associate Pastor before Worship & Creative Arts Director; skill ordering reversed them (67% versus 50%).
- Desktop and mobile layouts captured. Initial mobile check at 390px had no horizontal overflow. Final in-app browser used the user's zoom (355 CSS px); document width remained within viewport.
- Closed mobile sidebar was `visibility:hidden`, absent from accessible navigation, and Tab moved to a visible control.
- An independent Impeccable reviewer found three issues; contrast, mobile sidebar focus, and saved sorting were repaired. Reviewer scored all three resolved.

## Scope limits

Browser checks used local fictional records. No real employers were contacted. PWA assets and service worker delivery were checked, but installation on a physical phone and offline behavior on every platform were not verified. Native screen-reader behavior, production hosting, email delivery, and public-launch operations are outside these checks. The README describes deployment requirements and known MVP boundaries.


## Taste refinement · 4 October 2026

- Production React/TypeScript build passed after the refinement. New hero image is included in the generated service-worker asset list.
- `.venv/bin/python backend/manage.py test jobs`: all 13 tests passed. The app label is required when invoking from the repository root.
- Browser: light and dark discovery pages, mobile sign-in/signup, employer signup field, authenticated candidate profile and résumé upload dialog reviewed. Candidate login and logout succeeded; Worship & Music filtering returned the expected single role.
- Fixed signup dialog title so it switches between Welcome back and Find your place with the form mode.
- Checked 320, 390, 768 and 1440px viewports; no page horizontal overflow at those checks. Final natural browser viewport also fit at 355 CSS pixels with browser zoom.
- Explicit light preference survived page reload. Primary CTA contrast measured 9.37:1; active navigation 6.70:1; introductory secondary text 5.13:1 in light mode. These are targeted checks, not a complete accessibility certification.
- Saved desktop light/dark and mobile screenshots. Restored the signed-out discovery page and reset the temporary viewport override.

## GitHub Pages preparation · 4 October 2026

- Static-preview unit tests: 3 passed, including combined filtering/sorting and rejection of private endpoints/writes.
- Production Pages build passed with `/churchconnect/` base path and static preview enabled.
- Checked generated HTML asset paths, manifest scope/start URL/icons, and service-worker asset scope. API, admin, and unrelated repository paths are not intercepted.
- Local browser at port 4173: nine sample listings rendered; searching technology returned two jobs. Sign-in opened a preview explanation with zero credential inputs.
- Repository publishing/deployment remains pending authentication as the requested GitHub owner. This verification is local, not a claim of a live Pages deployment.
