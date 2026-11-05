(function (root) {
  "use strict";

  function normalize(text) {
    return String(text || "").replace(/\r/g, "");
  }

  function extractMoney(text) {
    const out = [];
    const re = /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/g;
    let m;
    while ((m = re.exec(text))) {
      out.push({ raw: m[0], value: Number(m[1].replace(/,/g, "")) });
    }
    return out;
  }

  function extractRates(text) {
    const out = [];
    const re = /(\d{1,2}(?:\.\d{1,3})?)\s*%/g;
    let m;
    while ((m = re.exec(text))) {
      out.push({ raw: m[0], value: Number(m[1]) });
    }
    return out;
  }

  function extractDates(text) {
    const out = [];
    const months =
      "January|February|March|April|May|June|July|August|September|October|November|December";
    const re1 = new RegExp(
      `(\\d{1,2}\\s+(?:${months})\\s+\\d{4}|(?:${months})\\s+\\d{1,2},?\\s+\\d{4})`,
      "gi"
    );
    let m;
    while ((m = re1.exec(text))) out.push({ raw: m[0], kind: "long" });
    const re2 = /\b(\d{4}-\d{2}-\d{2})\b/g;
    while ((m = re2.exec(text))) out.push({ raw: m[0], kind: "iso" });
    const re3 = /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g;
    while ((m = re3.exec(text))) out.push({ raw: m[0], kind: "slash" });
    return out;
  }

  function extractPhones(text) {
    const out = [];
    const re = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    let m;
    while ((m = re.exec(text))) out.push(m[0]);
    return out;
  }

  function classify(text) {
    const t = text.toLowerCase();
    let score = 0;
    const hits = [];
    const rules = [
      [/renewal/, 3, "mentions renewal"],
      [/deadline|respond by|response deadline/, 2, "mentions a deadline"],
      [/balance|principal/, 2, "mentions a balance"],
      [/\d(?:\.\d+)?\s*%|interest rate|annual rate/, 2, "mentions a rate"],
      [/term ends|maturity/, 2, "mentions term end"],
      [/month-to-month|variable/, 1, "mentions a fallback product"],
      [/cafeteria|soup|salad|grilled cheese|cookie|vinaigrette/, -6, "looks like unrelated text"],
    ];
    rules.forEach(([re, w, label]) => {
      if (re.test(t)) {
        score += w;
        hits.push(label);
      }
    });
    let label = "unclear";
    if (score >= 5) label = "likely renewal notice";
    else if (score <= 0) label = "not a renewal notice";
    else label = "weak renewal signal";
    return { score, label, hits };
  }

  function summarizeExtractive(text, maxSentences = 3) {
    const sentences = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    if (!sentences.length) return [];
    const keywords = ["renewal", "deadline", "rate", "balance", "respond", "term", "option"];
    const ranked = sentences.map((s) => {
      const lower = s.toLowerCase();
      let score = 0;
      keywords.forEach((k) => {
        if (lower.includes(k)) score += 2;
      });
      if (/\$/.test(s)) score += 1;
      if (/%/.test(s)) score += 1;
      if (/\d{4}/.test(s)) score += 1;
      return { s, score };
    });
    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, maxSentences).filter((r) => r.score > 0).map((r) => r.s);
  }

  function buildChecklist(analysis) {
    const steps = [];
    if (analysis.classification.label === "not a renewal notice") {
      return [
        "This text does not look like a renewal notice. Try pasting the letter body, or use the clear sample.",
        "If you only have a scan, copy the lines that mention dates, balance and rate.",
      ];
    }
    steps.push("Save a copy of the original notice and highlight every date.");
    if (analysis.dates.length) {
      steps.push("Write these dates on a calendar: " + analysis.dates.map((d) => d.raw).join("; ") + ".");
    } else {
      steps.push("No clear date found. Ask the sender to confirm the renewal date and reply-by date in writing.");
    }
    if (analysis.money.length) {
      steps.push("Confirm the balance figure(s) found: " + analysis.money.map((m) => m.raw).join(", ") + ".");
    } else {
      steps.push("No balance found. Ask for the amount used to calculate renewal options.");
    }
    if (analysis.rates.length) {
      steps.push("Note the rate(s) printed: " + analysis.rates.map((r) => r.raw).join(", ") + ". Compare them to public benchmarks on this page.");
    } else {
      steps.push("No percentage rate found. Request the options sheet that lists each rate.");
    }
    if (analysis.phones.length) {
      steps.push("Call the number on the notice if anything is unclear: " + analysis.phones.join(", ") + ".");
    } else {
      steps.push("Find a phone or email on the letterhead and ask for a plain written summary of your options.");
    }
    steps.push("Do not sign until you understand each option. This tool is general information, not advice.");
    return steps;
  }

  function analyze(text) {
    const raw = normalize(text);
    const money = extractMoney(raw);
    const rates = extractRates(raw);
    const dates = extractDates(raw);
    const phones = extractPhones(raw);
    const classification = classify(raw);
    const summary = summarizeExtractive(raw);
    const analysis = { money, rates, dates, phones, classification, summary };
    analysis.checklist = buildChecklist(analysis);
    analysis.confidence = Math.max(
      0,
      Math.min(
        100,
        40 + classification.score * 8 + Math.min(dates.length, 2) * 5 + Math.min(money.length, 1) * 5
      )
    );
    return analysis;
  }

  root.RenewalNLP = {
    analyze,
    classify,
    extractMoney,
    extractRates,
    extractDates,
    summarizeExtractive,
  };
})(typeof window !== "undefined" ? window : globalThis);
