const encoder = new TextEncoder();

const STYLE_IDS = {
  default: 0,
  title: 1,
  header: 2,
  date: 3,
  currency: 4,
  number: 5,
  total: 6,
  wrap: 7,
  percent: 8,
  pending: 9,
  subtitle: 10,
};

function xml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function columnName(index) {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function normalizeCell(input) {
  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    Object.prototype.hasOwnProperty.call(input, "value")
  ) {
    return input;
  }
  return { value: input };
}

function cellXml(input, rowIndex, columnIndex) {
  const cell = normalizeCell(input);
  if (cell.value === null || cell.value === undefined || cell.value === "") return "";
  const reference = `${columnName(columnIndex)}${rowIndex}`;
  const style = STYLE_IDS[cell.style] ?? STYLE_IDS.default;
  const styleAttribute = style ? ` s="${style}"` : "";
  if (typeof cell.value === "number" && Number.isFinite(cell.value)) {
    return `<c r="${reference}"${styleAttribute}><v>${cell.value}</v></c>`;
  }
  if (typeof cell.value === "boolean") {
    return `<c r="${reference}" t="b"${styleAttribute}><v>${cell.value ? 1 : 0}</v></c>`;
  }
  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${xml(cell.value)}</t></is></c>`;
}

function sheetXml(sheet) {
  const rows = sheet.rows ?? [];
  const columnCount = Math.max(
    sheet.columns?.length ?? 0,
    ...rows.map((row) => row.length),
    1,
  );
  const rowCount = Math.max(rows.length, 1);
  const dimension = `A1:${columnName(columnCount - 1)}${rowCount}`;
  const columns = (sheet.columns ?? [])
    .map((column, index) => {
      const width = Math.min(60, Math.max(8, Number(column.width ?? 14)));
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    })
    .join("");
  const renderedRows = rows
    .map((row, rowOffset) => {
      const rowIndex = rowOffset + 1;
      const cells = row
        .map((cell, columnIndex) => cellXml(cell, rowIndex, columnIndex))
        .join("");
      const height = row.some((cell) => normalizeCell(cell).style === "title")
        ? ' ht="26" customHeight="1"'
        : "";
      return `<row r="${rowIndex}"${height}>${cells}</row>`;
    })
    .join("");
  const merges = sheet.merges?.length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges
        .map((reference) => `<mergeCell ref="${xml(reference)}"/>`)
        .join("")}</mergeCells>`
    : "";
  const freezeRows = Math.max(0, Number(sheet.freezeRows ?? 0));
  const sheetViews = freezeRows
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${freezeRows}" topLeftCell="A${freezeRows + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
  const autoFilter = sheet.autoFilter
    ? `<autoFilter ref="${xml(sheet.autoFilter)}"/>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  ${sheetViews}
  <sheetFormatPr defaultRowHeight="18"/>
  ${columns ? `<cols>${columns}</cols>` : ""}
  <sheetData>${renderedRows}</sheetData>
  ${merges}
  ${autoFilter}
  <pageMargins left="0.35" right="0.35" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="3">
    <numFmt numFmtId="164" formatCode="€#,##0.00;[Red]-€#,##0.00"/>
    <numFmt numFmtId="165" formatCode="0.0%"/>
    <numFmt numFmtId="166" formatCode="yyyy-mm-dd"/>
  </numFmts>
  <fonts count="4">
    <font><sz val="10"/><name val="Aptos"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="16"/><name val="Aptos Display"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos"/></font>
    <font><i/><color rgb="FF666666"/><sz val="9"/><name val="Aptos"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE51F2A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF171717"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFE8B2"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left/><right/><top/><bottom style="thin"><color rgb="FFD9D9D9"/></bottom><diagonal/></border>
    <border><left/><right/><top style="medium"><color rgb="FF171717"/></top><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="11">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="164" fontId="2" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment wrapText="1" vertical="top"/></xf>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function contentTypesXml(sheetCount) {
  const sheets = Array.from(
    { length: sheetCount },
    (_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${sheets}
</Types>`;
}

function workbookXml(sheets) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets>${sheets
    .map((sheet, index) => `<sheet name="${xml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("")}</sheets>
  <calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>`;
}

function workbookRelationshipsXml(sheetCount) {
  const sheetRelationships = Array.from(
    { length: sheetCount },
    (_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelationships}
  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  return Uint8Array.of(value & 0xff, (value >>> 8) & 0xff);
}

function u32(value) {
  return Uint8Array.of(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  );
}

function joinBytes(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function zip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  for (const [name, content] of files) {
    const nameBytes = encoder.encode(name);
    const data = typeof content === "string" ? encoder.encode(content) : content;
    const checksum = crc32(data);
    const localHeader = joinBytes([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(checksum), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes,
    ]);
    localParts.push(localHeader, data);
    const centralHeader = joinBytes([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(checksum), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), nameBytes,
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }
  const centralDirectory = joinBytes(centralParts);
  const end = joinBytes([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralDirectory.length), u32(offset), u16(0),
  ]);
  return joinBytes([...localParts, centralDirectory, end]);
}

function safeSheetName(name, index) {
  const cleaned = String(name || `Sheet ${index + 1}`).replace(/[\\/*?:[\]]/g, " ").trim();
  return (cleaned || `Sheet ${index + 1}`).slice(0, 31);
}

export function excelDate(value) {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return value;
  return timestamp / 86_400_000 + 25569;
}

export function createXlsxWorkbook({ title, sheets, creator = "BARBERS HUB Booking OS" }) {
  const normalizedSheets = sheets.map((sheet, index) => ({
    ...sheet,
    name: safeSheetName(sheet.name, index),
  }));
  const createdAt = new Date().toISOString();
  const files = [
    ["[Content_Types].xml", contentTypesXml(normalizedSheets.length)],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`],
    ["docProps/core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xml(title)}</dc:title><dc:creator>${xml(creator)}</dc:creator><cp:lastModifiedBy>${xml(creator)}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`],
    ["docProps/app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>BARBERS HUB Booking OS</Application></Properties>`],
    ["xl/workbook.xml", workbookXml(normalizedSheets)],
    ["xl/_rels/workbook.xml.rels", workbookRelationshipsXml(normalizedSheets.length)],
    ["xl/styles.xml", stylesXml()],
    ...normalizedSheets.map((sheet, index) => [
      `xl/worksheets/sheet${index + 1}.xml`,
      sheetXml(sheet),
    ]),
  ];
  return zip(files);
}
