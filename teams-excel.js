"use strict";
// XLSX files are created and read entirely in this document, without network requests.
const TeamExcel = (() => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");
  const headers = ["반", "번호", "성별", "이름", "키", "운동 능력", "적극성"];
  const spreadsheetNS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const crcTable = Array.from({length:256}, (_, value) => {
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    return value >>> 0;
  });
  function checksum(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
    return (crc ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const chunks = [], directory = [];
    let offset = 0, directorySize = 0;
    for (const [name, text] of Object.entries(files)) {
      const fileName = encoder.encode(name), bytes = encoder.encode(text), crc = checksum(bytes);
      const local = new Uint8Array(30 + fileName.length), lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true); lv.setUint16(6, 0x800, true);
      lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true);
      lv.setUint16(26, fileName.length, true); local.set(fileName, 30);
      const central = new Uint8Array(46 + fileName.length), cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x800, true); cv.setUint32(16, crc, true);
      cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true);
      cv.setUint16(28, fileName.length, true); cv.setUint32(42, offset, true); central.set(fileName, 46);
      chunks.push(local, bytes); directory.push(central);
      offset += local.length + bytes.length; directorySize += central.length;
    }
    const end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, directory.length, true);
    ev.setUint16(10, directory.length, true); ev.setUint32(12, directorySize, true); ev.setUint32(16, offset, true);
    return new Blob([...chunks, ...directory, end], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  }
  function template() {
    const sheet = (rows, validations = "") => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="' + spreadsheetNS + '"><cols><col min="1" max="3" width="12" customWidth="1"/><col min="4" max="7" width="18" customWidth="1"/></cols><sheetData>' +
      rows.map((values, r) => '<row r="' + (r+1) + '">' + values.map((value, c) =>
        '<c r="' + String.fromCharCode(65+c) + (r+1) + '" t="inlineStr"><is><t>' + value + '</t></is></c>').join("") + '</row>').join("") +
      '</sheetData>' + validations + '</worksheet>';
    const validation = '<dataValidations count="4">' + [
      ["C2:C1001", "남,여"], ["E2:E1001", "상,중,하"], ["F2:F1001", "상,중,하"], ["G2:G1001", "상,중,하"]
    ].map(([range, values]) => '<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="' + range + '"><formula1>&quot;' + values + '&quot;</formula1></dataValidation>').join("") + '</dataValidations>';
    return zip({
      "[Content_Types].xml": '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      "_rels/.rels": '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      "xl/workbook.xml": '<?xml version="1.0"?><workbook xmlns="' + spreadsheetNS + '" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="학생 명단" sheetId="1" r:id="rId1"/><sheet name="입력 안내" sheetId="2" r:id="rId2"/></sheets></workbook>',
      "xl/_rels/workbook.xml.rels": '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
      "xl/worksheets/sheet1.xml": sheet([headers], validation),
      "xl/worksheets/sheet2.xml": sheet([
        ["학생 명단 시트의 2행부터 입력하세요. 예시 학생은 포함되어 있지 않습니다."],
        ["반과 번호는 숫자, 성별은 남 또는 여, 이름은 필수입니다."],
        ["키, 운동 능력, 적극성은 상·중·하 중 선택하며 비워 두면 중으로 편성합니다."],
        [".xlsx 형식으로 저장하세요. 처음 4개 열의 제목을 바꾸지 마세요."],
        ["엑셀 파일은 이 기기에서만 읽습니다. 불러온 뒤 확인하고 명단 저장을 눌러 주세요."]
      ])
    });
  }
  async function entries(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error("엑셀 파일은 5 MB 이하로 올려 주세요.");
    const bytes = new Uint8Array(await file.arrayBuffer()), view = new DataView(bytes.buffer);
    let end = bytes.length - 22;
    for (; end >= Math.max(0, bytes.length - 65557); end--) {
      if (view.getUint32(end, true) === 0x06054b50) break;
    }
    if (end < 0 || view.getUint32(end, true) !== 0x06054b50) throw new Error("정상적인 .xlsx 파일을 선택해 주세요.");
    const count = view.getUint16(end+10, true);
    if (count > 500 || view.getUint16(end+4,true) || view.getUint16(end+6,true)) throw new Error("이 엑셀 파일 형식은 지원하지 않습니다.");
    let pos = view.getUint32(end+16,true), total = 0;
    const files = new Map();
    for (let i = 0; i < count; i++) {
      if (pos + 46 > end || view.getUint32(pos,true) !== 0x02014b50) throw new Error("엑셀 압축 정보를 읽을 수 없습니다.");
      const size = view.getUint32(pos+24,true), packed = view.getUint32(pos+20,true);
      const length = view.getUint16(pos+28,true), extra = view.getUint16(pos+30,true), comment = view.getUint16(pos+32,true);
      const name = decoder.decode(bytes.slice(pos+46,pos+46+length));
      total += size;
      if (total > 20*1024*1024) throw new Error("파일이 너무 큽니다. 학생 명단만 있는 파일을 사용해 주세요.");
      files.set(name, {size, packed, method:view.getUint16(pos+10,true), flags:view.getUint16(pos+8,true),
        crc:view.getUint32(pos+16,true), offset:view.getUint32(pos+42,true)});
      pos += 46+length+extra+comment;
    }
    return async name => {
      const entry = files.get(name);
      if (!entry) return null;
      if (entry.size > 3*1024*1024 || entry.offset+30 > bytes.length || entry.flags & 1) throw new Error("지원하지 않는 엑셀 내용입니다.");
      const start = entry.offset;
      if (view.getUint32(start,true) !== 0x04034b50) throw new Error("손상된 엑셀 파일입니다.");
      const dataStart = start+30+view.getUint16(start+26,true)+view.getUint16(start+28,true);
      if (dataStart+entry.packed > bytes.length) throw new Error("손상된 엑셀 파일입니다.");
      let result = bytes.slice(dataStart, dataStart+entry.packed);
      if (entry.method === 8) {
        let stream;
        try { stream = new DecompressionStream("deflate-raw"); }
        catch { throw new Error("이 브라우저에서는 엑셀 압축을 읽을 수 없습니다. 최신 Chrome 또는 Edge를 사용해 주세요."); }
        const reader = new Blob([result]).stream().pipeThrough(stream).getReader();
        const parts = [];
        let length = 0;
        while (true) {
          const {value, done} = await reader.read();
          if (done) break;
          length += value.length;
          if (length > entry.size || length > 3*1024*1024) {
            await reader.cancel();
            throw new Error("엑셀 내용의 크기가 올바르지 않습니다.");
          }
          parts.push(value);
        }
        result = new Uint8Array(await new Blob(parts).arrayBuffer());
      } else if (entry.method !== 0) throw new Error("지원하지 않는 엑셀 압축 형식입니다.");
      if (result.length !== entry.size || checksum(result) !== entry.crc) throw new Error("손상된 엑셀 파일입니다.");
      const text = decoder.decode(result);
      if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error("안전하게 읽을 수 없는 엑셀 파일입니다.");
      const xml = new DOMParser().parseFromString(text, "application/xml");
      if (xml.querySelector("parsererror")) throw new Error("엑셀 내용을 읽을 수 없습니다.");
      return xml;
    };
  }
  const nodes = (parent, name) => [...parent.getElementsByTagNameNS("*", name)];
  async function read(file) {
    if (!/\.xlsx$/i.test(file.name)) throw new Error(".xlsx 형식의 엑셀 파일을 선택해 주세요.");
    const open = await entries(file);
    const book = await open("xl/workbook.xml"), relations = await open("xl/_rels/workbook.xml.rels");
    if (!book || !relations) throw new Error("엑셀 통합 문서를 찾을 수 없습니다.");
    const sheet = nodes(book, "sheet")[0];
    if (!sheet) throw new Error("첫 번째 시트를 찾을 수 없습니다.");
    const relId = sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id");
    const rel = nodes(relations, "Relationship").find(item => item.getAttribute("Id") === relId);
    if (!rel || rel.getAttribute("TargetMode") === "External") throw new Error("외부 연결 시트는 읽을 수 없습니다.");
    const target = rel.getAttribute("Target");
    const sheetPath = target.startsWith("/") ? target.slice(1) : "xl/"+target;
    if (sheetPath.includes("..")) throw new Error("지원하지 않는 시트 경로입니다.");
    const xml = await open(sheetPath), strings = await open("xl/sharedStrings.xml");
    if (!xml) throw new Error("학생 명단 시트를 찾을 수 없습니다.");
    const shared = strings ? nodes(strings,"si").map(item => nodes(item,"t").map(t => t.textContent).join("")) : [];
    const rows = nodes(xml,"row");
    if (rows.length > 1001) throw new Error("학생은 한 번에 최대 1,000명까지 입력해 주세요.");
    const values = rows.map(row => {
      const line = Array(7).fill("");
      for (const cell of nodes(row,"c")) {
        const column = cell.getAttribute("r")?.match(/^([A-Z]+)/)?.[1];
        if (!column) continue;
        let index = 0;
        for (const char of column) index = index*26+char.charCodeAt(0)-64;
        if (index > 7) continue;
        if (nodes(cell,"f").length) throw new Error("명단에는 수식 대신 값만 입력해 주세요.");
        const value = nodes(cell,"v")[0]?.textContent || "";
        line[index-1] = (cell.getAttribute("t")==="s" ? shared[Number(value)] || "" :
          cell.getAttribute("t")==="inlineStr" ? nodes(cell,"t").map(t => t.textContent).join("") : value).trim();
      }
      return line;
    }).filter(row => row.some(Boolean));
    const first = values.shift();
    if (!first || headers.slice(0,4).some((name,i) => first[i] !== name)) throw new Error("첫 행의 열 순서를 반, 번호, 성별, 이름으로 맞춰 주세요.");
    if (headers.slice(4).some((name,i) => first[i+4] && first[i+4].replace(/\s/g,"") !== name.replace(/\s/g,""))) {
      throw new Error("선택 항목의 열 순서는 키, 운동 능력, 적극성입니다.");
    }
    return values.map(row => ({class:row[0],number:row[1],gender:row[2],name:row[3],
      height:row[4],ability:row[5],initiative:row[6]}));
  }
  return {template, read};
})();
