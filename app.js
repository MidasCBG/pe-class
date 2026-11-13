"use strict";

const pages = {
  court: {label:"코트와 선", visual:"코트 위에서", title:"어느 선을 볼까요?", lead:"랠리에서는 단식과 복식이 서로 다른 옆선을 써요.", cases:[
    ["선 안","선 안에 떨어지면 어느 쪽이 이길까요?",470,180,"인","코트 안에 떨어졌어요."],
    ["선 위","경계선에 닿아도 인일까요?",460,76,"인","사용하는 경계선 위에 떨어졌어요."],
    ["선 밖","바깥 옆선을 지나 떨어지면 어떻게 될까요?",440,32,"아웃","적용하는 옆선 밖에 떨어졌어요."],
    ["두 옆선 사이","같은 지점을 단식과 복식에서 비교해 보세요.",475,65,"아웃","단식 옆선 바깥이에요."]]},
  serve: {label:"서브", visual:"대각선으로 보내기", title:"서브는 어디로?", lead:"내 점수가 짝수면 오른쪽, 홀수면 왼쪽. 상대편 대각선으로 보내요.", cases:[
    ["대각선 안","색이 칠해진 대각선 구역을 살펴보세요.",445,118,"인","대각선의 서브 구역 안에 떨어졌어요."],
    ["대각선 밖","네트를 넘어도 받는 구역이 다르면 어떻게 될까요?",442,254,"아웃","대각선의 반대 구역으로 갔어요."],
    ["앞선에 못 미침","네트와 앞쪽 서브선 사이에 떨어지는 장면이에요.",362,125,"아웃","앞쪽 서브선에 못 미쳤어요."],
    ["긴 서브 비교","같은 곳에 떨어져도 단식과 복식의 결과가 다를까요?",537,125,"인","단식은 뒤쪽 끝선까지 써요."],
    ["받는 구역 선 위","셔틀콕이 앞쪽 서브선에 딱 닿으면 어떻게 될까요?",386,125,"인","서브 구역 경계선도 구역에 들어가요."]]},
  score: {label:"점수와 서브권", visual:"경기 점수판", title:"다음 서브는 누구?", lead:"랠리에서 이긴 쪽이 1점을 얻고 다음 서브를 해요.", cases:[
    ["서브하는 쪽 득점"],["받는 쪽 득점"],["동점 이후"],["마지막 한 점"],["경기 승리"]]},
  faults: {label:"자주 나오는 상황", visual:"랠리 판정", title:"이럴 때는 어떻게 판정할까요?", lead:"셔틀콕이 어디에 닿았는지, 같은 편이 연달아 쳤는지 살펴봐요.", cases:[
    ["네트를 못 넘김","네트에 닿은 뒤 어느 쪽으로 떨어질까요?",286,202,"상대방의 득점","내가 친 셔틀콕이 네트를 넘지 못했어요."],
    ["랠리 중 네트 스침","서브를 받은 뒤 랠리 중에 셔틀콕이 네트를 스쳤어요. 어디에 떨어질까요?",398,176,"나의 득점","네트를 스쳐도 상대 코트 안에 떨어지면 인이에요.","rally-net"],
    ["서브할 때 네트 스침","0점에서 넣은 서브가 네트를 스쳤어요. 색칠한 대각선 서브 구역에 떨어지는지 보세요.",416,118,"나의 득점","네트를 스쳐도 대각선 서브 구역 안에 떨어지면 정상 서브예요.","serve-net"],
    ["몸·옷에 닿음","라켓 대신 몸이나 옷에 닿는 순간을 보세요.",433,164,"나의 득점","내가 친 셔틀콕이 상대 선수의 몸이나 옷에 닿았어요."],
    ["복식에서 연달아 침","A가 친 셔틀콕을 A′가 어디에서 다시 치는지 보세요.",470,218,"상대방의 득점","셔틀콕이 상대 코트로 넘어갔지만 우리 편 A와 A′가 연달아 쳤어요."]]},
  skills: {label:"기술 시범", visual:"동작 시범", title:"라켓을 어떻게 쓸까요?", lead:"시범 영상에서 라켓을 잡는 손, 발의 위치, 셔틀콕의 움직임을 살펴봐요."}
};

// Official footage plays from its publisher. Reviewed AI clips can use local files.
const families = [
  ["준비", [
    {id:"shuttle-grip", name:"셔틀콕 잡기", youtube:"ZlPxYx7VRGA", focus:"라켓을 잡지 않은 왼손 엄지와 검지로 깃 부분을 가볍게 잡고, 코르크를 라켓 면 쪽으로 향하게 해요."},
    {id:"forehand-grip", name:"포핸드 그립", youtube:"toQ7tOx7Tvs", start:13, focus:"오른손 엄지와 검지가 라켓 손잡이 위에서 V자 모양을 만드는지 살펴봐요."},
    {id:"backhand-grip", name:"백핸드 엄지 그립", youtube:"toQ7tOx7Tvs", start:63, focus:"오른손 엄지를 라켓 손잡이의 넓은 면에 가볍게 대요."}
  ]],
  ["서브", [
    {id:"backhand-serve", name:"백핸드 짧은 서브", youtube:"ZlPxYx7VRGA", focus:"왼손으로 셔틀콕을 들고, 오른손 라켓으로 몸 앞에서 짧게 밀어 대각선 앞쪽에 보내요."},
    {id:"forehand-serve", name:"포핸드 높은 서브", youtube:"Q5AY-sNovX4", source:"Badminton Insight", focus:"왼손으로 셔틀콕을 놓고, 오른손 라켓을 아래에서 앞으로 휘둘러 대각선 깊은 곳으로 보내요."}
  ]],
  ["머리 위 타구", [
    {id:"clear", name:"클리어", youtube:"xRv1JLg4NMM", focus:"오른손 라켓으로 머리 위에서 쳐 셔틀콕을 상대 코트 뒤쪽으로 높고 길게 보내요."},
    {id:"drop", name:"드롭", youtube:"u--taRfMoTs", focus:"오른손 라켓을 머리 위로 올려 쳐서 셔틀콕을 상대 코트 앞쪽에 떨어뜨려요."},
    {id:"smash", name:"스매시", youtube:"c_siA4X1BLE", focus:"오른손 라켓으로 머리 앞쪽 높은 곳에서 쳐 셔틀콕을 빠르게 아래로 보내요."}
  ]],
  ["네트 앞·중간", [
    {id:"net-shot", name:"헤어핀", youtube:"5VNL43j0-XI", focus:"오른손 쪽 발을 네트 앞으로 내딛고, 라켓 면으로 셔틀콕을 부드럽게 보내요."},
    {id:"lift", name:"리프트", youtube:"wSJlO5EAwg4", source:"Badminton with Ajay Jayaram", focus:"네트 앞 낮은 위치에서 오른손 라켓을 아래에서 위로 움직여 상대 코트 뒤쪽으로 보내요."},
    {id:"drive", name:"드라이브", youtube:"_6hffa-Jmpk", source:"Badminton Insight", focus:"오른손 라켓을 몸 앞에서 짧게 움직여 셔틀콕을 낮고 빠르게 보내요."}
  ]]
];

const state = {page:"court", match:"single", case:0, odd:false, scoreStep:0, family:1, skill:0, progress:null, sound:false, yearMode: todayMode()};
const $ = id => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const playIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M5 3l12 7-12 7z"/></svg>';
const firstContact = .20;
const partnerContact = .64;
const isDoubleHit = () => state.page === "faults" && state.case === 4 && isDouble();
let frame = 0;
let audio;

function todayMode(){
  const date = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const parts = Object.fromEntries(date.map(part => [part.type,part.value]));
  return Number(parts.year + parts.month + parts.day) >= 20270104 ? 15 : 21;
}
function currentPage(){return pages[state.page];}
function isDouble(){return state.match === "double";}
function matchName(){return isDouble() ? "복식" : "단식";}
function technique(){return families[state.family][1][state.skill];}
function cases(){return state.page === "faults" && !isDouble() ? currentPage().cases.slice(0,-1) : currentPage().cases;}
function button(label,key,value,active,cls=""){
  return '<button type="button" data-key="'+key+'" data-value="'+value+'"'+ (active === undefined ? "" : ' aria-pressed="'+active+'"') + (cls ? ' class="'+cls+'"' : "") +'>'+label+'</button>';
}
function optionGroup(label,items,key,selected){
  return '<fieldset class="option-group"><legend>'+label+'</legend><div class="options">'+items.map(([value,name])=>button(name,key,value,value===selected)).join("")+'</div></fieldset>';
}
function segments(items,key){
  return items.map(([value,label])=>button(label,key,value,state[key]===value)).join("");
}
function go(){
  const [route, techniqueId] = location.hash.slice(1).split("/");
  if(route === "ultimate" || route === "dodgeball" || route === "teams" || route === "fixtures"){
    reset();
    renderVisual();
    return;
  }
  const page = Object.hasOwn(pages,route) ? route : "court";
  if(page !== state.page){reset();state.page=page;state.case=0;}
  if(page === "skills" && techniqueId){
    const family = families.findIndex(([,items])=>items.some(item=>item.id===techniqueId));
    if(family!==-1){
      state.family=family;
      state.skill=families[family][1].findIndex(item=>item.id===techniqueId);
    }
  }
  render();
}
function reset(){
  cancelAnimationFrame(frame);
  state.progress=null;
  state.scoreStep=0;
}
function hit(){
  if(!state.sound || !audio || audio.state!=="running")return;
  const source=audio.createBufferSource(), gain=audio.createGain(), filter=audio.createBiquadFilter();
  const sampleCount=Math.round(audio.sampleRate*.085);
  const buffer=audio.createBuffer(1,sampleCount,audio.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<sampleCount;i++) samples[i]=(Math.random()*2-1)*Math.exp(-i/(sampleCount*.16));
  filter.type="bandpass";filter.frequency.value=1750;filter.Q.value=.75;
  source.buffer=buffer;gain.gain.value=.34;
  source.connect(filter).connect(gain).connect(audio.destination);source.start();
}
function scenario(){
  const [name,prompt,x,baseY,result,message,kind]=cases()[state.case];
  const serve=state.page==="serve";
  let y=serve&&state.odd ? 400-baseY : baseY;
  let end=result, detail=message;
  if(state.page==="court"&&state.case===1)y=isDouble()?54:76;
  if(state.page==="court"&&state.case===3&&isDouble()){end="인";detail="복식 바깥 옆선 안쪽이에요.";}
  if(serve&&state.case===3&&isDouble()){end="아웃";detail="복식 뒤쪽 서브선을 넘었어요.";}
  return {name,prompt,x,y,end,detail,kind};
}
function court({shot,serve=false,progress=null,fault=false}={}){
  const odd=state.page==="serve"&&state.odd;
  const double=isDouble(), top=double?54:76, bottom=double?346:324;
  const targetY=odd?200:top, targetH=odd?bottom-200:200-top;
  const startY=serve?(odd?143:257):242;
  const strikeX=serve?244:186, strikeY=startY+12;
  const x=shot?.x??435,y=shot?.y??145;
  const blocked=fault&&state.case===0;
  const serveBrush=shot?.kind==="serve-net";
  const brushing=serveBrush||shot?.kind==="rally-net";
  const netY=blocked?187:serveBrush?185:176;
  const doubleHit=fault&&isDoubleHit();
  const phase=progress??0;
  const partnerSwing=doubleHit&&phase>=partnerContact;
  const partnerMove=doubleHit?Math.max(0,Math.min(1,(phase-firstContact)/(partnerContact-firstContact))):0;
  const partnerX=170+48*partnerMove, partnerY=141+35*partnerMove;
  const contactX=242, contactY=188;
  const firstLeg=`M ${strikeX} ${strikeY} Q 207 214 ${contactX} ${contactY}`;
  const secondLeg=`M ${contactX} ${contactY} Q 326 145 ${x} ${y}`;
  const d=doubleHit?firstLeg:brushing ? `M ${strikeX} ${strikeY} Q 281 ${netY-4} 320 ${netY} Q 350 ${netY-12} ${x} ${y}` : blocked ? `M ${strikeX} ${strikeY} Q 280 170 320 187 Q 310 185 ${x} ${y}` :
    `M ${strikeX} ${strikeY} Q ${(strikeX+x)/2} ${Math.min(strikeY,y)-34} ${x} ${y}`;
  const showEnd=progress===1;
  const swing=progress!==null && progress<.22 ? 44*Math.sin(progress/.22*Math.PI) : 0;
  const swingAngle=swing;
  const player=(x,y,label,secondary=false)=>`<g transform="translate(${x} ${y})"><circle r="13" fill="${secondary?"#659485":"#203a2d"}" stroke="${secondary?"#b8d1c3":"#e0f9aa"}" stroke-width="2"/><text y="4.5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">${label}</text></g>`;
  const target=serve?`<rect x="386" y="${targetY}" width="${(double?524:550)-386}" height="${targetH}" rx="3" fill="#d5ee8b" fill-opacity=".26" stroke="#d5ee8b" stroke-width="2" stroke-dasharray="6 5"/>`:"";
  const netContact=(blocked||brushing) && progress!==null && progress>(serveBrush?.60:.48) ? `<circle cx="320" cy="${netY}" r="8" fill="#ffc281" opacity=".85"/>` : "";
  const landing=showEnd?`<circle cx="${x}" cy="${y}" r="12" fill="#ffc281" fill-opacity=".25"/><circle cx="${x}" cy="${y}" r="6" fill="#ffc281" stroke="#362717" stroke-width="1.5"/>`:"";
  const path=progress!==null?`<path id="flight" d="${d}" fill="none" stroke="#ffe4ad" stroke-width="2.5" stroke-dasharray="6 7" opacity="${showEnd?.96:.48}"/><g id="shuttle" opacity="${showEnd?0:1}"><circle r="9" fill="#e8f5da" fill-opacity=".18"/><path d="M-9-5-2-3v6l-7 3z" fill="#eef4e9"/><circle r="3.4" fill="#ffc281"/></g>`:"";
  const partnerFlight=partnerSwing?`<path id="partner-flight" d="${secondLeg}" fill="none" stroke="#ffe4ad" stroke-width="2.5" stroke-dasharray="6 7" opacity="${showEnd?.96:.48}"/>`:"";
  const racket=(x,y,angle)=>`<g transform="translate(${x-2} ${y}) rotate(${angle})" stroke="#f5f6d8" stroke-width="2.5" fill="none"><path d="M-13 8-5 3"/><ellipse rx="8" ry="5" transform="rotate(-25)"/><path d="M-5 0H5M0-4V4" stroke-width="1"/></g>`;
  const secondSwing=partnerSwing&&phase<partnerContact+.14?44*Math.sin((phase-partnerContact)/.14*Math.PI):0;
  const hits=doubleHit&&phase>=firstContact?`<g fill="#ffe4ad" font-size="14" font-weight="800"><text x="${strikeX-2}" y="${strikeY+24}">① A</text>${partnerSwing?`<text x="${contactX+10}" y="${contactY+24}">② A′</text>`:""}</g>`:"";
  const svg=`<svg viewBox="0 0 640 400" role="img" aria-label="${matchName()} 코트, ${serve?"대각선 서브 구역":"랠리 경계"}"><rect x="66" y="36" width="508" height="328" rx="19" fill="#21463a"/><rect x="90" y="54" width="460" height="292" rx="2" fill="#306b54"/><rect x="90" y="54" width="230" height="292" fill="#ffffff06"/><g fill="none" stroke="#d4e8d4" stroke-width="1.7" opacity=".64"><rect x="90" y="54" width="460" height="292"/><path d="M90 76H550M90 324H550M116 54V346M524 54V346M254 54V346M386 54V346M90 200H254M386 200H550"/></g><rect x="90" y="${top}" width="460" height="${bottom-top}" fill="none" stroke="#d9f398" stroke-width="3"/>${target}<path d="M320 43V357" stroke="#c5ddd2" stroke-width="3"/><circle cx="320" cy="43" r="4" fill="#c5ddd2"/><circle cx="320" cy="357" r="4" fill="#c5ddd2"/><g fill="#cfdfd7" font-size="15" font-weight="700" text-anchor="middle"><text x="194" y="25">${serve?"서브하는 쪽":"우리 쪽"}</text><text x="446" y="25">${serve?"받는 쪽":"상대 쪽"}</text></g>${player(serve?226:163,startY,"A")}${player(433,serve?(odd?255:145):164,"B")}${double?player(partnerX,serve?(odd?248:142):partnerY,"A′",true)+player(482,serve?(odd?143:256):263,"B′",true):""}${racket(strikeX,strikeY,swingAngle)}${doubleHit?racket(partnerX+24,partnerY+12,secondSwing):""}${partnerFlight}${path}${hits}${netContact}${landing}</svg>`;
  return svg;
}
function placeShuttle(progress){
  const partnerFlight=$("partner-flight");
  const path=partnerFlight||$("flight"), shuttle=$("shuttle");
  if(!path||!shuttle||progress===null)return;
  const distance=path.getTotalLength();
  const start=partnerFlight?partnerContact:firstContact;
  const end=isDoubleHit()&&!partnerFlight?partnerContact:1;
  const t=Math.max(0,Math.min(1,(progress-start)/(end-start)));
  const point=path.getPointAtLength(t*distance);
  const next=path.getPointAtLength(Math.min(distance,t*distance+1));
  const angle=Math.atan2(next.y-point.y,next.x-point.x)*180/Math.PI;
  shuttle.setAttribute("transform",`translate(${point.x} ${point.y}) rotate(${angle})`);
}
function scoreData(step=state.scoreStep){
  const max=state.yearMode, index=state.case;
  if(index===2)return {a:max-1+step,b:max-1,tag:step===0?"동점 · 두 점 차가 필요해요":step===1?"한 점 차 · 랠리를 계속해요":"두 점 차 · 게임이 끝났어요",small:`한 게임 ${max}점제`};
  if(index===3)return {a:(max===21?29:20)+(step?1:0),b:max===21?29:20,tag:step?"다음 한 점으로 게임이 끝났어요":"다음 점수를 얻는 쪽이 이겨요",small:"점수 상한"};
  if(index===4)return {a:step,b:0,tag:step===2?"두 게임을 먼저 이겨 경기 승리!":"두 게임을 먼저 이기면 경기 승리",small:"이긴 게임 수"};
  return {a:4+(index===0&&step?1:0),b:2+(index===1&&step?1:0),tag:step===0?"A가 오른쪽에서 서브":index===0?"A가 왼쪽에서 다시 서브":isDouble()?"B팀 왼쪽 구역 선수가 서브":"B가 왼쪽에서 서브",small:step?"다음 서브":"현재 서브"};
}
function scoreVisual(){
  const {a,b,tag,small}=scoreData();
  return `<div class="scoreboard"><div class="score-pair"><div class="score-team"><small>A${isDouble()?"팀":""}</small><strong>${a}</strong></div><span aria-hidden="true">:</span><div class="score-team"><small>B${isDouble()?"팀":""}</small><strong>${b}</strong></div></div><p>${tag}</p><small>${small}</small></div>`;
}
function skillVideo(){
  const item=technique();
  const clip=item.clip;
  if(clip){
    return `<video class="skill-film" id="skill-film" controls playsinline preload="metadata"${state.sound?"":" muted"} src="${clip}" aria-label="오른손잡이 ${item.name} AI 시범"></video>`;
  }
  return `<div class="film-cover"><div class="film-cover-icon">${playIcon}</div><div><p>${item.source ?? "Badminton Insight"} 실사 시범</p><h2>${item.name}</h2></div>${button("실사 시범 재생","watch","",undefined,"primary film-play")}</div>`;
}
function watchSource(){
  const item=technique();
  $("visual").innerHTML=`<iframe class="skill-film" title="${item.name} 공개 시범" src="https://www.youtube-nocookie.com/embed/${item.youtube}?autoplay=1&mute=${state.sound?0:1}&rel=0&start=${item.start ?? 0}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
}
function renderInsight(){
  const container=$("insight");
  container.dataset.result="";
  if(state.page==="skills"){
    renderNotes(container,[["따라 할 때",technique().focus]],0);
    return;
  }
  if(state.page==="score"){
    const lead=state.case===1&&isDouble()?"새 점수에 맞는 위치의 선수가 서브해요.":state.case===2?"동점 이후에는 한 점을 앞서도 계속해요.":"버튼을 눌러 점수와 서브권을 바꿔 보세요.";
    const notes=[lead,scoreData(1).tag];
    if([2,4].includes(state.case))notes.push(scoreData(2).tag);
    renderNotes(container,notes.map(text=>["관찰하기",text]),state.scoreStep);
    return;
  }
  const shot=scenario();
  const finished=state.progress===1;
  container.dataset.result=finished&&["아웃","상대방의 득점"].includes(shot.end)?"out":"";
  renderNotes(container,[["관찰하기",shot.prompt],[shot.end,shot.detail]],Number(finished));
}
function renderVisual(){
  if(state.page==="score")$("visual").innerHTML=scoreVisual();
  else if(state.page==="skills")$("visual").innerHTML=skillVideo();
  else{
    const shot=scenario();
    $("visual").innerHTML=court({shot,serve:state.page==="serve"||shot.kind==="serve-net",progress:state.progress,fault:state.page==="faults"});
  }
  if(state.page!=="skills")placeShuttle(state.progress);
}
function render(){
  const page=currentPage();
  const index=Object.keys(pages).indexOf(state.page)+1;
  $("nav").innerHTML=Object.entries(pages).map(([key,value],i)=>`<a href="#${key}"${key===state.page?' aria-current="page"':""}><span>0${i+1}</span>${value.label}</a>`).join("");
  $("match").innerHTML=segments([["single","단식"],["double","복식"]],"match");
  renderSoundButton($("sound"),state.sound);
  $("demo-index").textContent="0"+index+" / "+page.visual;
  $("demo-note").textContent=state.page==="score"?state.yearMode+"점제":state.page==="skills"?"오른손잡이 기준":matchName();
  $("lesson").dataset.page=state.page;
  $("heading").textContent=page.title;
  $("lead").textContent=page.lead;
  $("demo-footer").innerHTML=state.page==="score"?"랠리를 이긴 쪽에 1점":state.page==="skills"?(technique().clip?"AI로 만든 시범 영상":captionGuide):'<span class="legend"><i></i>적용 경계선</span><span class="legend"><i class="net"></i>네트</span><span class="legend"><i class="landing"></i>착지점</span>';
  let controls="",actions="";
  if(state.page==="skills"){
    const item=technique();
    controls=families.map(([name,items],family)=>
      optionGroup(name,items.map(({name},skill)=>[family+":"+skill,name]),"technique",state.family+":"+state.skill)
    ).join("");
    actions=`<a class="minor" href="https://www.youtube.com/watch?v=${item.youtube}${item.start?"&amp;t="+item.start+"s":""}" target="_blank" rel="noopener noreferrer">유튜브 원본 ↗</a>`;
    if(state.family===1)actions+='<a class="minor" href="#serve">서브 규칙 보기</a>';
  }else{
    const examples=cases().map(([label],i)=>[i,label]);
    if(state.page==="serve"){
      controls=[[0,"0점·짝수"],[1,"홀수"]].map(([odd,label])=>
        optionGroup(label,examples.map(([i,name])=>[odd+":"+i,name]),"serve-case",Number(state.odd)+":"+state.case)
      ).join("");
    }
    if(state.page==="score"){
      controls=[21,15].map(points=>
        optionGroup(points+"점제",examples.map(([i,name])=>[points+":"+i,name]),"score-case",state.yearMode+":"+state.case)
      ).join("");
      actions=button("점수 변화 보기","advance","",undefined,"primary");
      $("demo-footer").textContent=state.yearMode===15?"2027년 1월 4일부터 · 15점제":"2027년 1월 3일까지 · 21점제";
    }else{
      if(state.page!=="serve")controls=optionGroup("사례",examples,"case",state.case);
      actions=button(playIcon+"보기","play","",undefined,"primary");
    }
  }
  $("controls").innerHTML=controls;
  $("actions").innerHTML=actions;
  renderVisual();
  renderInsight();
}
function play(){
  reset();
  if(reduced.matches){
    state.progress=1;
    render();
    return;
  }
  const started=performance.now();
  const doubleHit=isDoubleHit();
  const duration=doubleHit?3200:2100;
  let strikes=0;
  render();
  function tick(now){
    state.progress=Math.min(1,(now-started)/duration);
    if(state.progress>=firstContact&&!strikes){hit();strikes++;}
    if(doubleHit&&state.progress>=partnerContact&&strikes===1){hit();strikes++;}
    if(state.progress===1){render();return;}
    renderVisual();
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
}
document.addEventListener("click",event=>{
  if(event.target.closest("#sound")){
    state.sound=!state.sound;
    if(state.sound&&window.AudioContext){
      audio??=new AudioContext();
      audio.resume().catch(()=>{});
    }
    renderSoundButton($("sound"),state.sound);
    if($("skill-film"))$("skill-film").muted=!state.sound;
    return;
  }
  const control=event.target.closest("[data-key]");
  if(!control)return;
  const {key,value}=control.dataset;
  if(key==="watch"){watchSource();return;}
  if(key==="play"){play();$("actions").querySelector('[data-key="play"]')?.focus({preventScroll:true});return;}
  if(key==="advance")state.scoreStep=(state.scoreStep+1)%([2,4].includes(state.case)?3:2);
  else{
    reset();
    if(key==="technique"){
      [state.family,state.skill]=value.split(":").map(Number);
      history.replaceState(null,"","#skills/"+technique().id);
    }else if(key==="serve-case"){
      const [odd,index]=value.split(":").map(Number);
      state.odd=Boolean(odd);
      state.case=index;
    }else if(key==="score-case"){
      [state.yearMode,state.case]=value.split(":").map(Number);
    }else{
      state[key]=key==="match"?value:Number(value);
    }
    if(state.page==="faults"&&state.case>=cases().length)state.case=0;
  }
  render();
  document.querySelector(`[data-key="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});
});
addEventListener("hashchange",go);
go();
