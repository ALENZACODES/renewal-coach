# Renewal Coach

On-device NLP for a renewal notice: classify, extract, summarize, checklist, plus Bank of Canada policy rate context.

Built for AI OpenBuild (solo entry by John Khan). Build window Nov 5 to Dec 10, 2026. General information only.

## AI role

A local rule-and-feature pipeline (no cloud API) scores renewal language, extracts entities, ranks sentences, and builds a checklist. A disclosed failure case (lunch menu) is classified as not a renewal notice.

## Run

```bash
python3 -m http.server 8083
```

Open `http://localhost:8083/`.

## Tests

```bash
node tests/test_nlp.mjs
```

## Data

- Synthetic samples in `samples/`
- Cached BoC V39079 in `data/policy-rate.json` (retrieved 2026-11-05 ET)

## License

MIT.
