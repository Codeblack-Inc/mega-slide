// 주소에 ?pptx 가 붙으면 슬라이드마다 글줄·선·그림의 위치를 재서 #pptx-layout 에 JSON으로 남긴다.
// slide.mjs의 --pptx가 headless Chrome으로 이 페이지를 열어 읽는다. 좌표는 1920×1080 무대 기준 px.
if (location.search.includes("pptx")) document.fonts.ready.then(() => {
  const TEXT = "h1,h2,h3,p,li,.ev,.au,.sub,.cap,.lab,.val,.no,.note,.pg,.hd span";
  const hex = (c) => (c.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("").toUpperCase();

  const out = [...document.querySelectorAll(".slide")].map((slide) => {
    const base = slide.getBoundingClientRect(), k = base.width / 1920;     // 창이 1920이 아니면 보정
    const X = (v) => (v - base.left) / k, Y = (v) => (v - base.top) / k;
    const res = { texts: [], lines: [], images: [] };

    // 글: 요소마다 글자 하나씩 위치를 재서 줄로 묶는다 (줄바꿈 위치가 화면과 똑같이 남는다)
    for (const e of slide.querySelectorAll(TEXT)) {
      if (e.parentElement.closest(TEXT)) continue;
      const cs = getComputedStyle(e);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, ls = parseFloat(cs.letterSpacing) || 0;
      const lines = [], tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), rg = document.createRange();
      for (let n; (n = tw.nextNode()); ) {
        const ps = getComputedStyle(n.parentElement);
        const st = { fw: +ps.fontWeight, fs: parseFloat(ps.fontSize), color: hex(ps.color), ff: ps.fontFamily.split(",")[0].replace(/["']/g, "").trim() };
        for (let i = 0; i < n.data.length; i++) {
          rg.setStart(n, i); rg.setEnd(n, i + 1);
          const b = rg.getClientRects()[0];
          if (!b || !b.height) continue;                                       // 접힌 공백
          const cy = (b.top + b.bottom) / 2;
          let ln = lines[lines.length - 1];
          if (!ln || Math.abs(cy - ln.cy) > lh * 0.5) lines.push((ln = { cy, left: b.left, right: b.right, runs: [] }));
          const last = ln.runs[ln.runs.length - 1];
          if (last && last.fw === st.fw && last.fs === st.fs && last.color === st.color && last.ff === st.ff) last.t += n.data[i];
          else ln.runs.push({ ...st, t: n.data[i] });
          ln.right = Math.max(ln.right, b.right);
        }
      }
      for (const ln of lines) {                                                // 줄 앞뒤 공백 제거
        if (ln.runs.length) { ln.runs[0].t = ln.runs[0].t.trimStart(); ln.runs[ln.runs.length - 1].t = ln.runs[ln.runs.length - 1].t.trimEnd(); }
        ln.runs = ln.runs.filter((r) => r.t);
      }
      const ok = lines.filter((l) => l.runs.length);
      if (!ok.length) continue;
      const x1 = Math.min(...ok.map((l) => l.left)), x2 = Math.max(...ok.map((l) => l.right));
      res.texts.push({ x: X(x1), y: Y(ok[0].cy) - lh / 2, w: (x2 - x1) / k, lh, ls, lines: ok.map((l) => l.runs) });
    }

    // 선: 요소의 위·아래 테두리, 그리고 ::before로 그은 맨 위 선
    for (const el of [slide, ...slide.querySelectorAll("*")]) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const cs = getComputedStyle(el);
      for (const side of ["Top", "Bottom"]) {
        const w = parseFloat(cs["border" + side + "Width"]);
        if (w > 0 && cs["border" + side + "Style"] !== "none")
          res.lines.push({ x1: X(r.left), x2: X(r.right), y: Y(side === "Top" ? r.top : r.bottom) + (side === "Top" ? w : -w) / 2, w, color: hex(cs["border" + side + "Color"]) });
      }
    }
    const pb = getComputedStyle(slide, "::before"), pw = parseFloat(pb.borderTopWidth);
    if (pb.content !== "none" && pw > 0)
      res.lines.push({ x1: parseFloat(pb.left), x2: 1920 - parseFloat(pb.right), y: parseFloat(pb.top) + pw / 2, w: pw, color: hex(pb.borderTopColor) });

    // 그림: object-fit: contain 으로 실제 그려지는 영역만 PNG로 굽는다 (SVG는 비율을 viewBox에서 읽는다)
    for (const img of slide.querySelectorAll("img")) {
      const r = img.getBoundingClientRect(), W = r.width / k, H = r.height / k;
      let nw = img.naturalWidth, nh = img.naturalHeight;
      const m = /^data:image\/svg/.test(img.src) && atob(img.src.split(",")[1]).match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([-\d.]+)[\s,]+([-\d.]+)/);
      if (m) { nw = +m[1]; nh = +m[2]; }
      if (!nw || !nh) continue;
      const s = Math.min(W / nw, H / nh), w = nw * s, h = nh * s, sc = Math.min(2, 2400 / w);
      const c = document.createElement("canvas");
      c.width = Math.round(w * sc); c.height = Math.round(h * sc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res.images.push({ x: X(r.left) + (W - w) / 2, y: Y(r.top) + (H - h) / 2, w, h, alt: img.alt, png: c.toDataURL("image/png").split(",")[1] });
    }
    return res;
  });

  const el = document.createElement("script");
  el.type = "application/json"; el.id = "pptx-layout";
  el.textContent = JSON.stringify(out).replace(/</g, "\\u003c");
  document.body.append(el);
});
