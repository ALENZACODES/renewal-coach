# Devpost copy · Renewal Coach · AI OpenBuild

## Tagline
On-device NLP that turns a renewal notice into a plain checklist.

## Inspiration
Renewal letters bury dates and rates. Cloud AI needs keys and uploads. I wanted an assistant that runs in the browser, shows its work, and admits when the text is not a renewal notice.

## What it does
Paste notice text or load a synthetic sample. The local NLP layer classifies the document, extracts dates, money, rates and phones, writes an extractive summary and a plain checklist, and charts the Bank of Canada policy rate for context. A lunch-menu failure case is included on purpose.

## How we built it
Vanilla JS NLP module, static UI, cached Valet series, Node tests for the clear sample and the failure case.

## Challenges we ran into
Making AI meaningful without a paid API. Keeping language general so the page never pretends to quote a lender.

## Accomplishments that we're proud of
Working entity extraction, honest failure handling, cited public rates, tests.

## What we learned
Testing and communication are part of the product when AI can be wrong.

## What's next
Richer date parsing and optional live Valet refresh.

## Built with
HTML, CSS, JavaScript, Bank of Canada Valet API
