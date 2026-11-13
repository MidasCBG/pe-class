"use strict";

(() => {
  const play = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M5 3l12 7-12 7z"/></svg>';
  const lessons = {
    field: {
      tab:"경기장", title:"어디에서 경기할까요?", lead:"가운데에서 패스를 주고받고, 양쪽 끝 득점존에서 점수를 얻어요.",
      cases:[
        {name:"필드와 엔드존", prompt:"가운데와 양 끝의 길이를 비교해 보세요.", result:"100 m × 37 m", detail:"정식 야외 경기장은 가운데 64 m, 양쪽 득점존은 각각 18 m예요.", zones:"dimensions"},
        {name:"팀과 경기 방식", prompt:"두 팀은 각각 몇 명이 필드에 설까요?", result:"정식 경기 · 7명씩", detail:"정식 경기는 7명씩 뛰고, 기본 목표는 15점이에요. 득점 뒤나 하프타임에 교체할 수 있어요. 수업에서는 인원과 시간을 조정해요.", zones:"teams"},
        {name:"스피릿", prompt:"심판이 없어도 어떻게 공정하게 경기할까요?", result:"서로 듣고 존중하기", detail:"선수가 직접 파울을 알리고 상대의 설명도 들어요. 수업에서는 필요할 때 선생님이 판정을 도와요.", zones:"spirit"}
      ]
    },
    pass: {
      tab:"패스와 이동", title:"디스크를 잡으면 어떻게 움직일까요?", lead:"한 발을 고정하고 빈 공간으로 움직이는 팀원에게 던져요.",
      cases:[
        {name:"피벗과 패스", prompt:"지수의 고정 발과 빈 곳으로 움직이는 수아를 보세요.", result:"공격 계속", detail:"디스크를 잡으면 멈춰요. 한 발을 고정하고 다른 발로 방향을 바꾼 뒤 공중으로 패스해요. 손에서 손으로 건네면 안 돼요.", path:"M289 242 Q443 105 595 190", players:[[270,252,"지수","blue"],[600,192,"수아","blue",495,298],[329,283,"민준","red"]], pivot:[270,252]},
        {name:"스톨 카운트", prompt:"가까운 수비가 세는 동안 언제 패스해야 할까요?", result:"10을 말하기 전에 패스", detail:"던지는 사람을 맡은 수비가 3 m 안에서 소리 내어 세요. ‘10’을 말하기 시작하기 전에 디스크를 놓아야 해요.", path:"M289 240 Q450 125 620 170", players:[[270,250,"지수","blue"],[625,170,"수아","blue"],[308,279,"민준","red"]], count:8},
        {name:"트래블", prompt:"디스크를 잡은 지수의 두 발을 살펴보세요.", result:"트래블 · 피벗 위치 바로잡기", detail:"디스크를 든 채 달리거나 피벗 발을 옮기면 트래블이에요. 정식 규칙에서는 보통 올바른 피벗 위치로 돌아와 계속해요.", path:"M300 250 L435 250", players:[[420,258,"지수","blue",285,258]], pivot:[285,258]}
      ]
    },
    score: {
      tab:"득점", title:"어디에서 잡아야 1점일까요?", lead:"공격하는 쪽의 득점존 안에서 팀원의 패스를 잡아야 해요.",
      cases:[
        {name:"득점존 안 캐치", prompt:"수아가 어디에서 디스크를 잡는지 보세요.", result:"파랑팀 +1점", detail:"수업에서는 두 발이 득점존 안에 들어온 상태에서 잡는 모습을 연습해요. 정식 경기에서는 첫 지면 접촉과 디스크를 유지했는지도 봐요.", path:"M585 247 Q713 134 850 196", players:[[565,256,"지수","blue"],[854,198,"수아","blue",705,274]], zone:"right"},
        {name:"득점선 앞에서 캐치", prompt:"수아의 발과 득점선을 비교해 보세요.", result:"득점 없이 공격 계속", detail:"득점선은 득점존에 포함되지 않아요. 필드 안에서 받았으므로 그 자리에서 패스를 이어가요.", path:"M555 248 Q661 127 766 185", players:[[535,256,"지수","blue"],[766,187,"수아","blue"]], zone:"right"},
        {name:"득점 뒤 전환", prompt:"득점한 뒤에는 누가 다음 풀을 던질까요?", result:"득점한 팀이 풀", detail:"양 팀이 공격 방향을 바꿔요. 방금 득점한 팀이 수비로 시작하며, 다음 포인트의 풀을 던져요.", path:"M810 225 Q488 68 236 263", players:[[825,230,"득점한 팀","blue"],[230,266,"새 공격팀","red"]], direction:"left"}
      ]
    },
    turnover: {
      tab:"공격권 교체", title:"언제 공격권이 넘어갈까요?", lead:"공격팀이 패스를 이어가지 못하면 상대 팀이 새로 공격해요.",
      cases:[
        {name:"드롭", prompt:"받는 선수가 디스크를 놓치면 어떻게 될까요?", result:"턴오버 · 빨강팀 공격", detail:"땅에 닿으면 공격권이 바뀌어요. 수비가 쳐내도 공격팀이 땅에 닿기 전에 잡으면 계속해요.", path:"M318 240 Q500 90 663 286", players:[[300,246,"지수","blue"],[640,223,"수아","blue"]]},
        {name:"인터셉트", prompt:"공중에 뜬 디스크를 누가 먼저 잡을까요?", result:"턴오버 · 빨강팀 공격", detail:"수비가 패스를 잡으면 잡은 선수가 새 공격을 시작해요. 공격과 수비가 동시에 잡으면 공격팀이 계속해요.", path:"M318 238 Q432 110 568 205", players:[[300,246,"지수","blue"],[676,211,"수아","blue"],[571,205,"민준","red",617,286]]},
        {name:"스톨 아웃", prompt:"디스크를 든 채 수비가 ‘10’을 말하면 어떻게 될까요?", result:"턴오버 · 빨강팀 공격", detail:"수비가 ‘10’을 말하기 시작할 때까지 디스크가 손에 남아 있으면 공격권이 바뀌어요.", players:[[424,241,"지수","blue"],[468,264,"민준","red"]], disc:[443,232], count:10},
        {name:"필드 밖", prompt:"디스크가 사이드라인 안에 떨어지는지 보세요.", result:"턴오버 · 빨강팀 공격", detail:"일반 패스가 아웃되면 수비팀이 공격권을 얻어요. 재개 위치는 디스크가 경계선을 넘은 지점 등을 기준으로 정해요.", path:"M310 212 Q460 82 670 39", players:[[290,222,"지수","blue"],[676,112,"수아","blue"]]}
      ]
    },
    defense: {
      tab:"파울과 수비", title:"접촉 없이 어떻게 막을까요?", lead:"상대의 몸을 밀거나 잡지 않고 위치와 타이밍으로 수비해요.",
      cases:[
        {name:"앞자리에 먼저 서기", prompt:"수비가 먼저 자리를 잡았는지 살펴보세요.", result:"정상 수비", detail:"충돌을 일으키지 않고 먼저 빈 공간을 차지할 수 있어요. 날아오는 디스크도 가로챌 수 있어요.", players:[[562,246,"수아","blue",401,267],[616,246,"민준","red",616,195]]},
        {name:"밀거나 붙잡기", prompt:"수비가 이동 중인 상대를 붙잡는 상황이에요.", result:"파울 · 멈추고 이야기하기", detail:"달리는 상대를 밀거나 잡아서 방해하면 파울이에요. 선수끼리 상황을 확인하고, 수업에서는 선생님이 재개를 안내해요.", players:[[573,240,"수아","blue",409,267],[607,243,"민준","red",630,187]], alert:[590,242]},
        {name:"마킹 거리와 손", prompt:"수비가 너무 바짝 붙거나 손에 든 디스크를 치면 어떨까요?", result:"수비 간격 확인", detail:"손을 올려 패스 길은 막을 수 있어요. 들고 있는 디스크를 치거나 몸을 밀면 안 돼요. 수업에서 한 팔보다 가깝다면 디스크를 머리 위로 들어 선생님께 알려요.", players:[[443,233,"지수","blue"],[475,237,"민준","red",570,240]], disc:[452,208], alert:[459,237]}
      ]
    },
    pull: {
      tab:"경기 시작", title:"풀은 어떻게 던질까요?", lead:"첫 포인트와 득점 뒤에는 수비팀이 반대쪽으로 디스크를 멀리 던져요.",
      cases:[
        {name:"풀과 첫 패스", prompt:"던지는 순간과 받는 팀이 출발하는 순간을 비교해 보세요.", result:"파랑팀 첫 패스", detail:"풀을 던지면 받는 팀이 움직여요. 이 사례에서는 디스크가 필드 안에 떨어진 자리에서 파랑팀이 첫 패스를 시작해요.", path:"M201 237 Q474 30 675 237", players:[[190,250,"풀을 던지는 팀","red"],[675,240,"받는 팀","blue",810,251]], direction:"right"},
        {name:"풀이 필드 밖으로", prompt:"디스크가 어느 경계를 넘는지 보세요.", result:"재개 지점 확인", detail:"수업에서는 사이드라인 가까운 곳에서 재개해요. 정식 규칙에서는 디스크가 필드 안에 먼저 닿았는지에 따라 선택지가 달라져요.", path:"M195 248 Q460 48 714 40", players:[[185,251,"풀을 던지는 팀","red"],[812,248,"받는 팀","blue"]], direction:"right"}
      ]
    },
    skills: {
      tab:"기술 시범", title:"디스크를 어떻게 던지고 잡을까요?", lead:"실사 시범에서 손의 위치와 디스크 각도를 살펴보세요.",
      cases:[
        {name:"백핸드 던지기", youtube:"oN1bzPCKkGE", source:"RISE UP Ultimate", prompt:"엄지를 위에 두고 테두리를 감싸요. 디스크를 평평하게 잡고 목표 쪽으로 손목을 풀어 보세요."},
        {name:"포핸드 던지기", youtube:"nHsSHJBEcRw", source:"RISE UP Ultimate", prompt:"디스크 안쪽 테두리에 손가락을 대고 옆에서 던져요. 팔을 크게 휘두르기보다 손목이 어떻게 움직이는지 보세요."},
        {name:"양손으로 받기", youtube:"jxYNea22doM", source:"Carolina Ultimate", prompt:"디스크가 몸 앞에 오면 양손을 위아래에서 모아 안전하게 잡는 동작을 살펴보세요."}
      ]
    }
  };

  const get = id => document.getElementById("ultimate-" + id);
  const sound = setupLessonSound(get("sound"));
  const tabs = Object.keys(lessons);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let active = "field";
  let example = 0;
  let frame = 0;
  const current = () => lessons[active].cases[example];
  const lesson = get("lesson");
  const visual = get("visual");

  function drawField(item, reveal) {
    const outline = "#e4eee4";
    const label = (x, y, value, size = 24, fill = "#f3faf2") =>
      `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="middle" font-weight="740">${value}</text>`;
    const tags = [[131, "득점존"], [500, "플레잉 필드"], [869, "득점존"]];
    const dimensionLines = [[50,212,"18 m"],[212,788,"64 m"],[788,950,"18 m"]].map(([a,b,m]) =>
      `<path d="M${a} 422H${b}M${a} 415v14M${b} 415v14" fill="none" stroke="#e8e7c6" stroke-width="2"/>${label((a+b)/2,452,m,23)}`).join("");
    const diagramPlayers = item.zones === "teams" && reveal
      ? Array.from({length:7}, (_, i) => [
        [220 + (i % 3)*82, 178 + Math.floor(i/3)*64, "", "blue"],
        [780 - (i % 3)*82, 178 + Math.floor(i/3)*64, "", "red"]
      ]).flat() : item.players || [];
    const athletes = diagramPlayers.map(([x,y,name,team,fromX=x,fromY=y],i) =>
      `<g data-athlete="${i}" data-from-x="${fromX}" data-from-y="${fromY}" data-x="${x}" data-y="${y}" transform="translate(${fromX} ${fromY})">
        <circle r="15" fill="${team === "blue" ? "#3f81c5" : "#bc4f40"}" stroke="#fff" stroke-width="3"/>
        ${name ? label(0,39,name,22) : ""}
      </g>`).join("");
    const initial = item.disc || [0,0];
    return `<svg viewBox="0 0 1000 468" role="img" aria-label="얼티밋 경기장. 양쪽 끝에 득점존이 있습니다.">
      <rect x="50" y="65" width="900" height="333" fill="#395341"/>
      <path d="M50 65h162v333H50z" fill="#586244"/><path class="ultimate-end-zone" d="M788 65h162v333H788z" fill="#586244"/>
      <path d="M50 65h900v333H50zM212 65v333M788 65v333" stroke="${outline}" stroke-width="3" fill="none"/>
      ${tags.map(([x,tag])=>label(x,101,tag,24)).join("")}
      ${item.zones === "dimensions" && reveal ? dimensionLines + label(500,45,"전체 길이 100 m · 너비 37 m",26) : ""}
      ${item.zones === "spirit" && reveal ? label(500,240,"정직하게 말하고, 상대의 이야기를 들어요",32) : ""}
      ${item.direction ? label(500,372,item.direction==="right"?"풀 방향  →":"←  풀 방향",24) : ""}
      ${item.pivot ? `<circle cx="${item.pivot[0]}" cy="${item.pivot[1]}" r="24" fill="none" stroke="#ffe08e" stroke-width="3" stroke-dasharray="4 4"/>` : ""}
      ${item.path ? `<path class="ultimate-path" d="${item.path}" fill="none" stroke="#ffe08e" stroke-width="3" stroke-dasharray="9 8" visibility="hidden"/>` : ""}
      ${athletes}
      ${item.alert ? `<circle class="ultimate-alert" cx="${item.alert[0]}" cy="${item.alert[1]}" r="39" fill="none" stroke="#ffae6c" stroke-width="4" visibility="hidden"/>` : ""}
      ${item.path || item.disc ? `<ellipse class="ultimate-disc" cx="${initial[0]}" cy="${initial[1]}" rx="14" ry="8" fill="#ffe08e" stroke="#34281b" stroke-width="2"/>` : ""}
      ${item.count ? '<text class="ultimate-count" x="500" y="150" fill="#ffe08e" font-size="32" font-weight="800" text-anchor="middle"></text>' : ""}
    </svg>`;
  }

  function updateNote(finished = false) {
    const item = current();
    const notes = active === "field"
      ? lessons.field.cases.map(({result, detail}) => [result, detail])
      : active === "skills"
        ? [["따라 할 때", item.prompt]]
        : [["관찰하기", item.prompt], [item.result, item.detail]];
    renderNotes(get("insight"), notes, active === "field" ? example : Number(finished));
  }

  function render() {
    const topic = lessons[active];
    const item = current();
    const navigation = get("nav");
    const restoreNavFocus = navigation.contains(document.activeElement);
    navigation.innerHTML = tabs.map((key,i) =>
      `<a href="#ultimate/${key}"${key === active ? ' aria-current="page"' : ""}><span>0${i+1}</span>${lessons[key].tab}</a>`).join("");
    if (restoreNavFocus) navigation.querySelector('[aria-current="page"]').focus({preventScroll:true});
    get("heading").textContent = topic.title;
    get("lead").textContent = topic.lead;
    const groupName = active === "field" ? "살펴볼 내용" : active === "skills" ? "기술" : "사례";
    get("controls").innerHTML = `<fieldset class="option-group"><legend>${groupName}</legend><div class="options">${topic.cases.map(({name},i) =>
      `<button type="button" data-example="${i}" aria-pressed="${i===example}">${name}</button>`).join("")}</div></fieldset>`;
    get("demo-index").textContent = `0${tabs.indexOf(active)+1} / ${topic.tab}`;
    get("result").textContent = active === "field" ? item.result : active === "skills" ? "실사 참고 영상" : "플라잉디스크 얼티밋";
    updateNote();
    if (active === "skills") {
      get("actions").innerHTML = `<a class="minor" href="https://www.youtube.com/watch?v=${item.youtube}" target="_blank" rel="noopener noreferrer">유튜브 원본 ↗</a>`;
      get("caption").innerHTML = captionGuide;
      visual.innerHTML = `<div class="film-cover"><div class="film-cover-icon">${play}</div><div><p>${item.source} 실사 시범</p><h2>${item.name}</h2></div><button type="button" class="primary film-play" id="ultimate-watch">실사 시범 재생</button></div>`;
      return;
    }
    get("actions").innerHTML = active === "field" ? "" : `<button type="button" class="primary" id="ultimate-play">${play} 보기</button>`;
    get("caption").innerHTML = active === "field" ? "양쪽 득점존과 가운데 경기 구역" : '<span class="team-key blue">파랑팀</span><span class="team-key red">빨강팀</span><span class="team-key flying-disc">디스크</span>';
    visual.innerHTML = drawField(item, active === "field");
    move(0);
  }

  function move(progress) {
    const item = current();
    const path = visual.querySelector(".ultimate-path");
    const disc = visual.querySelector(".ultimate-disc");
    const alert = visual.querySelector(".ultimate-alert");
    const count = visual.querySelector(".ultimate-count");
    const endZone = visual.querySelector(".ultimate-end-zone");
    for (const player of visual.querySelectorAll("[data-athlete]")) {
      const {fromX, fromY, x, y} = player.dataset;
      player.setAttribute("transform", `translate(${+fromX + (x-fromX)*progress} ${+fromY + (y-fromY)*progress})`);
    }
    if (path) {
      path.setAttribute("visibility", progress ? "visible" : "hidden");
      const release = item.count ? (item.count - 1) / item.count : 0;
      const flight = Math.max(0, (progress - release) / (1 - release));
      const point = path.getPointAtLength(path.getTotalLength() * flight);
      disc.setAttribute("cx", point.x);
      disc.setAttribute("cy", point.y);
    }
    if (alert) alert.setAttribute("visibility", progress >= .9 ? "visible" : "hidden");
    if (item.zone) endZone.setAttribute("fill", progress === 1 ? "#975f36" : "#586244");
    if (count) count.textContent = progress ? `스톨 ${Math.min(item.count, 1 + Math.floor(progress * item.count))}` : "";
  }

  function demonstrate() {
    cancelAnimationFrame(frame);
    const item = current();
    const cue = item.name === "득점존 안 캐치" ? "point"
      : item.name === "드롭" || item.name === "풀과 첫 패스" ? "impact"
      : item.alert || item.name === "트래블" || item.name === "스톨 아웃" || item.name.includes("필드 밖") ? "notice"
      : item.path && item.name !== "득점 뒤 전환" ? "catch" : null;
    const complete = () => {
      move(1);
      sound.play(cue);
      get("result").textContent = item.result;
      updateNote(true);
    };
    if (reducedMotion.matches) {
      complete();
      return;
    }
    get("result").textContent = "시범 진행 중";
    updateNote();
    const start = performance.now();
    const duration = item.count ? item.count * 1000 : 2100;
    const release = item.count ? (item.count - 1) / item.count : 0;
    let released = false;
    function tick(now) {
      const progress = Math.min(1, (now - start)/duration);
      if (!released && item.path && item.name !== "트래블" && progress >= release) {
        released = true;
        sound.play("throw");
      }
      if (progress === 1) complete();
      else {
        move(progress);
        frame = requestAnimationFrame(tick);
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function route() {
    cancelAnimationFrame(frame);
    const [sport, topic] = location.hash.slice(1).split("/");
    if (sport !== "ultimate") {
      visual.replaceChildren();
      return;
    }
    active = Object.hasOwn(lessons, topic) ? topic : "field";
    example = 0;
    render();
  }

  lesson.addEventListener("click", event => {
    const choice = event.target.closest("[data-example]");
    if (choice) {
      cancelAnimationFrame(frame);
      example = Number(choice.dataset.example);
      render();
      lesson.querySelector(`[data-example="${example}"]`).focus({preventScroll:true});
    } else if (event.target.closest("#ultimate-play")) {
      demonstrate();
    } else if (event.target.closest("#ultimate-watch")) {
      const item = current();
      visual.innerHTML = `<iframe class="skill-film" title="${item.name} 공개 시범" src="https://www.youtube-nocookie.com/embed/${item.youtube}?autoplay=1&mute=${sound.enabled ? 0 : 1}&rel=0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      visual.querySelector("iframe").focus({preventScroll:true});
    }
  });
  addEventListener("hashchange", route);
  route();
})();
