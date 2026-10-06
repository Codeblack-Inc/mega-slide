// 측정한 레이아웃(assets/extract.js의 JSON) → 편집 가능한 .pptx.  의존성 없음 (ZIP·OOXML을 직접 쓴다)
// 글은 텍스트 상자(줄바꿈 위치 고정), 선은 선, 그림은 그림으로 들어간다. 1920px 무대 = 13.333in 슬라이드 → 1px = 6350 EMU = 0.5pt
import { deflateRawSync } from "node:zlib";

// ── ZIP ──────────────────────────────────────────────────────────────────────────
const CRC = Uint32Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
export const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

export function zip(files) {                                  // files: [[이름, Buffer], …]
  const parts = [], central = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nm = Buffer.from(name, "utf8"), comp = deflateRawSync(data), crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0x21, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nm.length, 26);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0x0800, 8); cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0x21, 14); cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(data.length, 24); cd.writeUInt16LE(nm.length, 28); cd.writeUInt32LE(offset, 42);
    parts.push(lh, nm, comp); central.push(cd, nm);
    offset += 30 + nm.length + comp.length;
  }
  const cdBuf = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cdBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cdBuf, end]);
}

// ── OOXML ────────────────────────────────────────────────────────────────────────
const esc = (t) => String(t).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const E = (px) => Math.round(px * 6350);                       // px → EMU
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const rels = (items) => XML + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${type}" Target="${target}"/>`).join("") + "</Relationships>";

// 서체: 한글은 Noto Sans KR, 영문 머리글·쪽 번호는 Space Grotesk. 굵기는 서체 이름(Light, Medium …)으로 고른다 — 설치돼 있어야 그대로 보인다
const WEIGHT = { 100: "Thin", 200: "ExtraLight", 300: "Light", 500: "Medium", 600: "SemiBold", 800: "ExtraBold", 900: "Black" };
function face(ff, fw, font) {
  if (font) return { latin: font, ea: font, bold: fw >= 700 };       // --font: 한 서체로 통일 (굵기는 굵게/보통만)
  const fam = /Space Grotesk/.test(ff) ? "Space Grotesk" : /Plex Mono/.test(ff) ? "IBM Plex Mono" : "Noto Sans KR";
  const w = WEIGHT[fw], name = (f) => (w ? `${f} ${w}` : f);
  return { latin: name(fam), ea: name("Noto Sans KR"), bold: fw >= 700 && fw < 800 };
}

function textShape(t, id, font) {
  const sz = (px) => Math.round(px * 50);                     // px → 1/100pt
  const run = (r) => {
    const f = face(r.ff, r.fw, font);
    return `<a:r><a:rPr lang="ko-KR" sz="${sz(r.fs)}" b="${f.bold ? 1 : 0}" spc="${Math.round(t.ls * 50)}" dirty="0"><a:solidFill><a:srgbClr val="${r.color}"/></a:solidFill><a:latin typeface="${esc(f.latin)}"/><a:ea typeface="${esc(f.ea)}"/></a:rPr><a:t>${esc(r.t)}</a:t></a:r>`;
  };
  const body = t.lines.map((runs) => runs.map(run).join("")).join(`<a:br><a:rPr lang="ko-KR" sz="${sz(t.lines[0][0].fs)}"/></a:br>`);
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="텍스트 ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>` +
    `<p:spPr><a:xfrm><a:off x="${E(t.x)}" y="${E(t.y)}"/><a:ext cx="${E(Math.max(t.w * 1.6 + 40, 1920 - t.x))}" cy="${E(t.lh * t.lines.length)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>` +
    `<p:txBody><a:bodyPr wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:noAutofit/></a:bodyPr><a:lstStyle/>` +
    `<a:p><a:pPr algn="l"><a:lnSpc><a:spcPts val="${Math.round(t.lh * 50)}"/></a:lnSpc><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft></a:pPr>${body}</a:p></p:txBody></p:sp>`;
}

const lineShape = (l, id) =>
  `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="선 ${id}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm><a:off x="${E(l.x1)}" y="${E(l.y)}"/><a:ext cx="${E(l.x2 - l.x1)}" cy="0"/></a:xfrm>` +
  `<a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="${E(l.w)}"><a:solidFill><a:srgbClr val="${l.color}"/></a:solidFill></a:ln></p:spPr></p:cxnSp>`;

const picShape = (im, id, rid) =>
  `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="그림 ${id}" descr="${esc(im.alt)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>` +
  `<p:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${E(im.x)}" y="${E(im.y)}"/><a:ext cx="${E(im.w)}" cy="${E(im.h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;

const EMPTY_TREE = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
const CLRMAP = '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>';
const fill3 = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'.repeat(3);
const THEME = XML + `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="mega-slide"><a:themeElements>` +
  `<a:clrScheme name="mega"><a:dk1><a:srgbClr val="17152B"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="4A4760"/></a:dk2><a:lt2><a:srgbClr val="F6F5FA"/></a:lt2>` +
  `<a:accent1><a:srgbClr val="6043D5"/></a:accent1><a:accent2><a:srgbClr val="F37055"/></a:accent2><a:accent3><a:srgbClr val="2F6FDB"/></a:accent3><a:accent4><a:srgbClr val="1E9E6A"/></a:accent4><a:accent5><a:srgbClr val="D98A00"/></a:accent5><a:accent6><a:srgbClr val="68657B"/></a:accent6>` +
  `<a:hlink><a:srgbClr val="2F6FDB"/></a:hlink><a:folHlink><a:srgbClr val="6043D5"/></a:folHlink></a:clrScheme>` +
  `<a:fontScheme name="mega"><a:majorFont><a:latin typeface="Noto Sans KR"/><a:ea typeface="Noto Sans KR"/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Noto Sans KR"/><a:ea typeface="Noto Sans KR"/><a:cs typeface=""/></a:minorFont></a:fontScheme>` +
  `<a:fmtScheme name="mega"><a:fillStyleLst>${fill3}</a:fillStyleLst><a:lnStyleLst>${'<a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'.repeat(3)}</a:lnStyleLst>` +
  `<a:effectStyleLst>${"<a:effectStyle><a:effectLst/></a:effectStyle>".repeat(3)}</a:effectStyleLst><a:bgFillStyleLst>${fill3}</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
const MASTER = XML + `<p:sldMaster ${NS}><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld>${CLRMAP}` +
  `<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>` +
  `<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr sz="4400"/></a:lvl1pPr></p:titleStyle><p:bodyStyle><a:lvl1pPr><a:defRPr sz="2800"/></a:lvl1pPr></p:bodyStyle><p:otherStyle><a:defPPr><a:defRPr lang="ko-KR"/></a:defPPr></p:otherStyle></p:txStyles></p:sldMaster>`;
const LAYOUT = XML + `<p:sldLayout ${NS} type="blank" preserve="1"><p:cSld name="빈 화면"><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;

// layout = [{texts, lines, images}, …] (extract.js가 잰 값), title = 발표 제목, font = 모든 글자에 쓸 서체(생략하면 Noto Sans KR·Space Grotesk)
export function pptx(layout, title = "mega-slide", font = "") {
  const files = [], types = [];
  const slideRels = [];
  layout.forEach((s, i) => {
    const n = i + 1, r = [["rId1", `${REL}/slideLayout`, "../slideLayouts/slideLayout1.xml"]];
    let id = 2, shapes = "";
    for (const l of s.lines) shapes += lineShape(l, id++);
    s.images.forEach((im, k) => {
      const name = `image${n}_${k + 1}.png`, rid = `rId${k + 2}`;
      files.push([`ppt/media/${name}`, Buffer.from(im.png, "base64")]);
      r.push([rid, `${REL}/image`, `../media/${name}`]);
      shapes += picShape(im, id++, rid);
    });
    for (const t of s.texts) shapes += textShape(t, id++, font);
    files.push([`ppt/slides/slide${n}.xml`, Buffer.from(XML + `<p:sld ${NS}><p:cSld><p:spTree>${EMPTY_TREE}${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`)]);
    files.push([`ppt/slides/_rels/slide${n}.xml.rels`, Buffer.from(rels(r))]);
    types.push(`<Override PartName="/ppt/slides/slide${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`);
    slideRels.push([`rId${i + 2}`, `${REL}/slide`, `slides/slide${n}.xml`]);
  });
  const N = layout.length;
  const ct = XML + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>' +
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>' +
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>' +
    '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${types.join("")}</Types>`;
  const presentation = XML + `<p:presentation ${NS} saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>` +
    `<p:sldIdLst>${layout.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("")}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`;
  return zip([
    ["[Content_Types].xml", Buffer.from(ct)],
    ["_rels/.rels", Buffer.from(rels([["rId1", `${REL}/officeDocument`, "ppt/presentation.xml"], ["rId2", "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", "docProps/core.xml"], ["rId3", `${REL}/extended-properties`, "docProps/app.xml"]]))],
    ["docProps/core.xml", Buffer.from(XML + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title)}</dc:title><dc:creator>mega-slide</dc:creator></cp:coreProperties>`)],
    ["docProps/app.xml", Buffer.from(XML + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>mega-slide</Application><Slides>${N}</Slides></Properties>`)],
    ["ppt/presentation.xml", Buffer.from(presentation)],
    ["ppt/_rels/presentation.xml.rels", Buffer.from(rels([["rId1", `${REL}/slideMaster`, "slideMasters/slideMaster1.xml"], ...slideRels, [`rId${N + 2}`, `${REL}/theme`, "theme/theme1.xml"]]))],
    ["ppt/slideMasters/slideMaster1.xml", Buffer.from(MASTER)],
    ["ppt/slideMasters/_rels/slideMaster1.xml.rels", Buffer.from(rels([["rId1", `${REL}/slideLayout`, "../slideLayouts/slideLayout1.xml"], ["rId2", `${REL}/theme`, "../theme/theme1.xml"]]))],
    ["ppt/slideLayouts/slideLayout1.xml", Buffer.from(LAYOUT)],
    ["ppt/slideLayouts/_rels/slideLayout1.xml.rels", Buffer.from(rels([["rId1", `${REL}/slideMaster`, "../slideMasters/slideMaster1.xml"]]))],
    ["ppt/theme/theme1.xml", Buffer.from(THEME)],
    ...files,
  ]);
}
