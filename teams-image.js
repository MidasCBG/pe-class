"use strict";
const TeamImage = (() => {
  const margin = 48, gap = 22, header = 154, rowHeight = 37;
  const font = (size,bold = false) => (bold ? "700 " : "")+size+'px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';

  function wrap(ctx,value,width,bold = false) {
    ctx.font = font(25,bold);
    const lines = [];
    let line = "";
    for (const character of value.trim()) {
      if (line && ctx.measureText(line+character).width > width) {
        lines.push(line.trimEnd()); line = "";
      }
      if (line || character !== " ") line += character;
    }
    if (line) lines.push(line);
    return lines;
  }
  function pageSize(page) {
    const {width,height} = page;
    const scale = Math.min(Math.max(1,1920/width),8192/width,8192/height,Math.sqrt(16000000/(width*height)));
    return {...page,scale,pixels:[Math.floor(width*scale),Math.floor(height*scale)]};
  }
  function arrange(source,paged) {
    const ctx = document.createElement("canvas").getContext("2d");
    const count = source.cards.reduce((n,card) => n+card.lines.length,0);
    const columns = paged ? 2 : Math.max(2,Math.min(16,Math.ceil(Math.sqrt(count / 19))));
    const cardWidth = paged ? 900 : 615;
    const cards = [];
    for (const card of source.cards) {
      const lines = card.lines.flatMap(line => wrap(ctx,line.text,cardWidth-48,line.heading).map(text => ({...line,text})));
      const size = paged ? 23 : 21;
      for (let i=0; i<Math.max(1,lines.length); i+=size) {
        const title = card.title+(i ? " (계속)" : "");
        const titleLines = wrap(ctx,title,cardWidth-48,true);
        const chunk = lines.slice(i,i+size);
        cards.push({titleLines,lines:chunk,height:26+(titleLines.length+chunk.length)*rowHeight});
      }
    }
    const batches = [];
    const perPage = paged ? columns*2 : cards.length;
    for (let i=0; i<cards.length; i+=perPage) batches.push(cards.slice(i,i+perPage));
    const pages = batches.map(batch => {
      const width = margin*2+columns*cardWidth+(columns-1)*gap;
      let y = header;
      const items = [];
      for (let i=0; i<batch.length; i+=columns) {
        const strip = batch.slice(i,i+columns);
        strip.forEach((card,j) => items.push({...card,x:margin+j*(cardWidth+gap),y}));
        y += Math.max(...strip.map(card => card.height))+gap;
      }
      const height = y+margin;
      return {width,height,items,cardWidth};
    });
    if (!source.diagrams?.length) return pages.map(pageSize);
    if (!paged) {
      const page = pages[0];
      page.width = Math.max(page.width,...source.diagrams.map(diagram => diagram.width+margin*2));
      page.diagrams = source.diagrams.map(diagram => {
        const y = page.height;
        page.height += diagram.height+64;
        return {diagram,y,offset:0,height:diagram.height};
      });
      return [pageSize(page)];
    }
    const diagramPages = source.diagrams.flatMap(diagram => {
      const overlap = diagram.cardHeight+12;
      const viewHeight = Math.max(1180,overlap+360);
      const slices = [];
      for (let offset = 0; offset < diagram.height; offset += viewHeight-overlap) {
        const height = Math.min(viewHeight,diagram.height-offset);
        slices.push({width:Math.max(1000,diagram.width+margin*2),height:header+height+92,items:[],
          diagrams:[{diagram,y:header,offset,height}]});
        if (offset+height === diagram.height) break;
      }
      return slices;
    });
    return [...diagramPages,...pages].map(pageSize);
  }

  function drawDiagram(ctx,page,entry) {
    const {diagram,y,offset,height} = entry;
    const x = (page.width-diagram.width)/2;
    ctx.fillStyle = "#34385c";
    ctx.font = font(27,true);
    ctx.fillText(diagram.title+(offset ? " (계속)" : ""),margin,y+18);
    ctx.save();
    ctx.beginPath(); ctx.rect(x,y+40,diagram.width,height); ctx.clip();
    ctx.translate(x,y+40-offset);
    ctx.strokeStyle = "#66708d"; ctx.lineWidth = 2;
    for (const [start,...points] of diagram.lines) {
      ctx.beginPath(); ctx.moveTo(...start);
      for (const point of points) ctx.lineTo(...point);
      ctx.stroke();
    }
    const {cardWidth,cardHeight,slotHeight} = diagram;
    for (const node of diagram.nodes) {
      ctx.fillStyle = node.final ? "#f3f4fb" : "#fff";
      ctx.strokeStyle = node.final ? "#696f99" : "#c3c9db";
      ctx.beginPath(); ctx.roundRect(node.x,node.y,cardWidth,cardHeight,10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#454b6b"; ctx.font = font(14,true);
      ctx.fillText(node.caption ?? node.id+"경기",node.x+10,node.y+16,cardWidth-20);
      node.slots.forEach(({titleLines,memberLines,won},index) => {
        const rowY = node.y+42+index*(slotHeight+4);
        ctx.fillStyle = won ? "#e5eee8" : "#f3f4f8";
        ctx.beginPath(); ctx.roundRect(node.x+8,rowY,cardWidth-16,slotHeight,6); ctx.fill();
        ctx.fillStyle = won ? "#275134" : "#252a40";
        ctx.font = font(14,true);
        titleLines.forEach((line,i) => ctx.fillText(line,node.x+14,rowY+15+i*16,cardWidth-36));
        if (won) ctx.fillText("✓",node.x+cardWidth-23,rowY+15);
        ctx.font = font(11);
        memberLines.forEach((line,i) => ctx.fillText(line,node.x+14,rowY+14+titleLines.length*16+i*13,cardWidth-28));
      });
    }
    ctx.restore();
  }

  function draw(source,page,index,total) {
    const canvas = document.createElement("canvas");
    [canvas.width,canvas.height] = page.pixels;
    const ctx = canvas.getContext("2d",{alpha:false});
    ctx.scale(page.scale,page.scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,page.width+1,page.height+1);
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#252a40";
    ctx.font = font(53,true);
    ctx.fillText(source.title,margin,57);
    ctx.fillStyle = "#505c70";
    ctx.font = font(28);
    ctx.fillText(source.subtitle+(total > 1 ? " · "+(index+1)+"/"+total+"쪽" : ""),margin,110);
    for (const {titleLines,lines,x,y,height} of page.items) {
      ctx.strokeStyle = "#cfd4df"; ctx.lineWidth = 2;
      ctx.strokeRect(x,y,page.cardWidth,height);
      ctx.fillStyle = "#f0f1f7";
      ctx.fillRect(x+1,y+1,page.cardWidth-2,titleLines.length*rowHeight+14);
      ctx.font = font(25,true);
      ctx.fillStyle = "#363b62";
      titleLines.forEach((title,j) => ctx.fillText(title,x+20,y+26+j*rowHeight));
      lines.forEach((line,j) => {
        const center = y+26+(j+titleLines.length)*rowHeight;
        if (line.color) {
          ctx.fillStyle = line.color === "male" ? "#eaf2fd" : "#f2ebfa";
          ctx.fillRect(x+8,center-16,page.cardWidth-16,32);
        }
        ctx.fillStyle = line.color === "male" ? "#244f81" : line.color === "female" ? "#69458b" : "#252a40";
        ctx.font = font(25,line.heading);
        ctx.fillText(line.text,x+20,center);
      });
    }
    for (const entry of page.diagrams ?? []) drawDiagram(ctx,page,entry);
    return canvas;
  }

  function init(get) {
    let source, pages = [], generation = 0, saving = false;
    const dialog = get("image-dialog"), pageSelect = get("image-page");
    const status = value => { get("image-status").textContent = value; };
    function describe() {
      const page = pages[Number(pageSelect.value)];
      get("image-size").textContent = page ? "흰색 배경 · "+page.pixels.join(" × ")+" px"+
        (page.scale < 1 ? " · 전체 내용을 한 장에 맞추기 위해 축소합니다." : "")+
        (pages.length > 1 ? " · 페이지마다 저장 위치를 선택합니다." : "") : "";
    }
    function update() {
      if (!source) return;
      const paged = get("image-layout").value === "pages";
      pages = arrange(source,paged);
      pageSelect.replaceChildren(...pages.map((_,index) => new Option((index+1)+" / "+pages.length+"쪽",index)));
      get("image-page-label").hidden = !paged;
      describe(); status("");
    }
    function open(payload) {
      if (!payload.cards.length) return;
      source = payload; generation++;
      get("image-privacy").textContent = payload.private ?
        "학생 이름이 포함된 이미지입니다. 저장 위치와 파일을 열람할 사람을 확인해 주세요." :
        "대진표를 흰색 배경의 이미지로 저장합니다.";
      update(); dialog.showModal();
    }
    function clear() {
      generation++; source = undefined; pages = [];
      if (dialog.open) dialog.close();
    }
    get("image-layout").addEventListener("change",update);
    pageSelect.addEventListener("change", () => { describe(); status(""); });
    get("image-close").addEventListener("click",clear);
    dialog.addEventListener("cancel",clear);
    get("image-save").addEventListener("click",async () => {
      if (!source || saving) return;
      if (!window.showSaveFilePicker) {
        status("저장 위치를 선택할 수 있는 PC Chrome 또는 Edge에서 열어 주세요.");
        return;
      }
      const index = Number(pageSelect.value), format = get("image-format").value;
      const mime = format === "jpg" ? "image/jpeg" : "image/png", current = generation;
      saving = true;
      const controls = ["image-save","image-layout","image-format","image-page"].map(get);
      controls.forEach(control => { control.disabled = true; });
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName:source.title.replaceAll(" ","_")+(pages.length > 1 ? "_"+(index+1)+"쪽" : "")+"."+format,
          types:[{description:format.toUpperCase()+" 이미지",accept:{[mime]:["."+format]}}]
        });
        if (current !== generation) return;
        const canvas = draw(source,pages[index],index,pages.length);
        const blob = await new Promise(resolve => canvas.toBlob(resolve,mime,0.95));
        canvas.width = canvas.height = 1;
        if (!blob) throw new Error("encode");
        if (current !== generation) return;
        const file = await handle.createWritable();
        if (current !== generation) { await file.abort(); return; }
        await file.write(blob);
        if (current !== generation) { await file.abort(); return; }
        await file.close();
        status(pages.length > 1 ? (index+1)+"쪽을 저장했습니다. 다른 쪽은 목록에서 선택하세요." : "이미지를 저장했습니다.");
      } catch (error) {
        if (current === generation && error.name !== "AbortError")
          status("이미지를 저장하지 못했습니다. PC Chrome 또는 Edge에서 저장 위치를 확인해 주세요.");
      } finally {
        saving = false; controls.forEach(control => { control.disabled = false; });
      }
    });
    return {open,clear};
  }
  return {init};
})();
