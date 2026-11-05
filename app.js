(function () {
  "use strict";
  let POLICY = null;

  function drawSpark(canvas, series) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 640;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 40, r: 10, t: 12, b: 28 };
    const vals = series.map((p) => p.v);
    const minV = Math.min(...vals) - 0.2;
    const maxV = Math.max(...vals) + 0.2;
    const t0 = new Date(series[0].d).getTime();
    const t1 = new Date(series[series.length - 1].d).getTime();
    const x = (d) => pad.l + ((new Date(d).getTime() - t0) / (t1 - t0)) * (w - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - minV) / (maxV - minV)) * (h - pad.t - pad.b);
    ctx.strokeStyle = "#d7dde8";
    ctx.fillStyle = "#445066";
    ctx.font = "12px system-ui,sans-serif";
    for (let i = 0; i <= 3; i++) {
      const v = minV + ((maxV - minV) * i) / 3;
      const yy = y(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(w - pad.r, yy);
      ctx.stroke();
      ctx.fillText(v.toFixed(1) + "%", 4, yy + 4);
    }
    ctx.beginPath();
    ctx.strokeStyle = "#011F5B";
    ctx.lineWidth = 2.5;
    series.forEach((p, i) => {
      const xx = x(p.d);
      const yy = y(p.v);
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    });
    ctx.stroke();
  }

  function renderAnalysis(a) {
    document.getElementById("class-label").textContent = a.classification.label;
    document.getElementById("confidence").textContent = `Confidence ${a.confidence}%`;
    document.getElementById("hits").textContent = a.classification.hits.join(" · ") || "No rule hits";
    document.getElementById("entities").innerHTML = `
      <li><strong>Dates:</strong> ${a.dates.map((d) => d.raw).join("; ") || "—"}</li>
      <li><strong>Money:</strong> ${a.money.map((m) => m.raw).join("; ") || "—"}</li>
      <li><strong>Rates:</strong> ${a.rates.map((r) => r.raw).join("; ") || "—"}</li>
      <li><strong>Phones:</strong> ${a.phones.join("; ") || "—"}</li>
    `;
    document.getElementById("summary").innerHTML = a.summary.length
      ? a.summary.map((s) => `<li>${s}</li>`).join("")
      : "<li>No strong summary sentences found.</li>";
    document.getElementById("checklist").innerHTML = a.checklist.map((s) => `<li>${s}</li>`).join("");
  }

  function run() {
    const text = document.getElementById("notice").value;
    const a = window.RenewalNLP.analyze(text);
    renderAnalysis(a);
  }

  async function loadSample(name) {
    const res = await fetch(`samples/${name}.txt`);
    document.getElementById("notice").value = await res.text();
    run();
  }

  async function init() {
    POLICY = await (await fetch("data/policy-rate.json")).json();
    const last = POLICY.observations[POLICY.observations.length - 1];
    document.getElementById("policy-now").textContent = `${last.v.toFixed(2)}% as of ${last.d}`;
    drawSpark(document.getElementById("chart"), POLICY.observations);
    window.addEventListener("resize", () => drawSpark(document.getElementById("chart"), POLICY.observations));
    document.getElementById("btn-analyze").addEventListener("click", run);
    document.getElementById("notice").addEventListener("input", run);
    document.getElementById("btn-clear").addEventListener("click", () => loadSample("notice-clear"));
    document.getElementById("btn-messy").addEventListener("click", () => loadSample("notice-messy"));
    document.getElementById("btn-fail").addEventListener("click", () => loadSample("notice-failure"));
    await loadSample("notice-clear");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
