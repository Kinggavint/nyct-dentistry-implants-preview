# CloudFront redirect function (nyctdentistry.com)

Deploy-only files. Never uploaded to S3 (`deploy/` is in the upload exclude list).

- `nyct-dentistry-implants-redirects.js`: source of CloudFront Function `apex-site-nyct-dentistry-redirects`
  (cloudfront-js-2.0, viewer-request on distribution E2LKHEBRXQX771). Must stay under 10 KB.
  - www.nyctdentistry.com -> https://nyctdentistry.com (path + query kept)
  - mapped old WordPress URLs (nyctdentistry.com / kentdentistryct.com / clearsmiledentalstudio.com) -> 301 to new pages
  - any other kentdentistryct.com path -> https://nyctdentistry.com/kent/ (query kept)
  - any other clearsmiledentalstudio.com path -> https://nyctdentistry.com/stamford/ (query kept)
  - everything else passes through to S3 (real 404 for missing pages)
- `gen_fn.py`: generator. `cd deploy/cloudfront && python3 gen_fn.py REDIRECTS-preview-retargeted.csv`
  (writes the .js and gen-report.json to the current directory).
- `REDIRECTS-preview-retargeted.csv`: the old->new redirect map the generator reads.

Publish: update-function (DEVELOPMENT) -> test-function -> publish-function (LIVE).
