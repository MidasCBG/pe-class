"use strict";
const FixtureView = (() => {
  const modes = {
    knockout: [
      ["single","한 번 지면 탈락","승리한 팀만 다음 라운드에 올라갑니다. 경기마다 승리 팀을 선택하세요."],
      ["placement","패자조 포함 · 전체 순위","첫 패배 후에도 순위 결정전을 합니다. 각 경기의 승리 팀을 선택하면 1위부터 마지막 순위까지 채워집니다."]
    ],
    league: [
      ["full","풀리그","모든 팀이 다른 모든 팀과 한 번씩 경기합니다."],
      ["partial","부분 리그","정한 라운드 수까지만 진행합니다. 팀이 홀수면 라운드마다 한 팀이 쉽니다."],
      ["groups","조별 리그","팀을 여러 조로 나누고 조 안에서 한 번씩 경기합니다."],
      ["split","스플릿 리그","1차 풀리그 뒤 상위조와 하위조에서 다시 경기합니다. 1차 성적을 반영하려면 수동으로 배정하세요."]
    ]
  };
  const storageKey = "pe-class.fixtures.v1";
  const mixedGenderMessage = "혼성팀이 포함되어 성별로 진행할 수 없습니다. 성별로 진행하려면 팀편성에서 남녀 분리를 선택해 주세요.";
  function init(get, el, teamCards, readTeams, editing) {
    let teams = [], assignments = [], bracket = null, diagrams = [], leagueCards = [], rankLines = [];
    let picks = new Map(), leaguePicks = new Map(), schedule = null;
    let shared = [], playRounds = [], roundOfMatch = new Map();
    const setup = () => get("fixture-mode").value;
    const groupMode = () => ["groups","split"].includes(setup());
    const manual = () => groupMode() && get("fixture-assignment").value === "manual";
    const groupsCount = () => setup() === "split" ? 2 : Number(get("fixture-group-count").value);
    const teamName = id => (id+1)+"팀";
    const groupName = id => setup() === "split" ? ["상위조","하위조"][id] : (id+1)+"조";
    const status = value => { get("fixture-status").textContent = value; };
    const splitMessage = value => { get("split-message").textContent = value; };
    const pressed = id => get(id).getAttribute("aria-pressed") === "true";
    const setPressed = (id,value) => get(id).setAttribute("aria-pressed",String(Boolean(value)));
    const hasMixedGender = () => teams.some(team => new Set(team.map(student => student.gender)).size > 1);
    const rows = get("fixture-schedule");
    const presentation = get("fixture-presentation");
    const board = rows.parentElement;
    function persist() {
      try {
        if (!teams.length) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey,JSON.stringify({
          version:1,teams,schedule,picks:[...picks],leaguePicks:[...leaguePicks]
        }));
        return true;
      } catch {
        status("이 브라우저에 저장할 수 없습니다. 현재 탭에서만 결과가 유지됩니다.");
        return false;
      }
    }
    function closePresentation() {
      if (presentation.open) presentation.close();
      board.append(rows);
      window.frameElement?.classList.remove("fixture-expanded");
    }
    get("expand-fixtures").addEventListener("click", () => {
      get("presentation-mode").textContent = schedule.name+" · "+teams.length+"팀";
      window.frameElement?.classList.add("fixture-expanded");
      get("presentation-body").append(rows);
      presentation.showModal();
    });
    get("close-presentation").addEventListener("click",closePresentation);
    presentation.addEventListener("cancel",event => { event.preventDefault(); closePresentation(); });
    function resetSchedule() {
      closePresentation();
      bracket = null; picks.clear(); leaguePicks.clear(); schedule = null;
      diagrams = []; leagueCards = []; rankLines = [];
      playRounds = []; roundOfMatch = new Map();
      rows.replaceChildren(el("p","empty",teams.length ? "경기 방식을 고른 뒤 ‘대진표 만들기’를 눌러 주세요." : "왼쪽에서 편성된 팀을 가져오세요."));
      get("save-fixtures-image").disabled = true;
      get("expand-fixtures").disabled = true;
    }
    function renderTeams() {
      get("fixture-count").textContent = teams.length+"팀";
      get("fixture-team-list").replaceChildren(...(teams.length ? teamCards(teams, index => {
        if (!manual()) return;
        const label = el("label","group-picker","배정할 조 ");
        const select = el("select");
        select.setAttribute("aria-label",teamName(index)+" 배정할 조");
        select.add(new Option("조 선택",""));
        const count = Math.min(50,Math.max(0,Math.floor(groupsCount())));
        for (let i=0; i<count; i++) select.add(new Option(groupName(i),i));
        select.value = assignments[index] ?? "";
        select.addEventListener("change", () => {
          assignments[index] = select.value === "" ? undefined : Number(select.value);
        });
        label.append(select);
        return label;
      }) : [el("p","empty","팀편성을 마친 뒤 ‘팀편성 가져오기’를 눌러 주세요.")]));
    }
    function clear() {
      teams = []; assignments = [];
      get("parallel-games").value = "";
      for (const id of ["same-class","split-by-class","split-by-gender"]) setPressed(id,false);
      splitMessage("");
      resetSchedule(); renderTeams(); status("");
      return persist();
    }
    function updateOptions() {
      get("fixture-hint").textContent = modes[get("fixture-family").value].find(([id]) => id === setup())[2];
      get("partial-options").hidden = setup() !== "partial";
      get("group-options").hidden = !groupMode();
      get("group-count-label").hidden = setup() === "split";
      get("split-options").hidden = setup() !== "split";
      splitMessage("");
      assignments = []; renderTeams();
    }
    function updateModes() {
      get("fixture-mode").replaceChildren(...modes[get("fixture-family").value].map(([id,label]) => new Option(label,id)));
      updateOptions();
    }
    function groupTeams(ids, label = "") {
      const count = groupsCount();
      if (label && ids.length < 4) {
        throw new Error(label+"에 "+ids.length+"팀이 있습니다. 상위조와 하위조에 두 팀씩 배정하려면 최소 네 팀이 필요합니다.");
      }
      if (!Number.isInteger(count) || count < 2 || count > Math.floor(ids.length / 2))
        throw new Error("조마다 두 팀 이상이 필요합니다. 참가 팀이나 조 수를 확인해 주세요.");
      const groups = Array.from({length:count}, () => []);
      if (manual()) {
        if (ids.some(id => !groups[assignments[id]])) throw new Error("왼쪽 참가 팀 목록에서 모든 팀의 조를 선택해 주세요.");
        ids.forEach(id => groups[assignments[id]].push(id));
        if (groups.some(group => group.length < 2)) {
          throw new Error((label ? label+"의 " : "")+"각 조에 최소 두 팀을 배정해 주세요.");
        }
      } else TeamFixtures.shuffle(ids).forEach((id,i) => groups[i % count].push(id));
      return groups;
    }
    function splitLeagueSets(ids) {
      const byClass = pressed("split-by-class"), byGender = pressed("split-by-gender");
      if (byGender && hasMixedGender()) throw new Error(mixedGenderMessage);
      const sections = new Map();
      for (const id of ids) {
        const team = teams[id];
        const className = team[0].class;
        if (byClass && team.some(student => student.class !== className)) {
          throw new Error(teamName(id)+"에 여러 반이 섞여 있어 반별로 진행할 수 없습니다. 팀편성에서 반별로 팀을 구성해 주세요.");
        }
        const labels = [];
        if (byClass) labels.push(className+"반");
        if (byGender) labels.push(team[0].gender === "남" ? "남자" : "여자");
        const label = labels.join(" ");
        if (!sections.has(label)) sections.set(label,[]);
        sections.get(label).push(id);
      }
      return [...sections].sort(([a],[b]) => a.localeCompare(b,"ko",{numeric:true})).flatMap(([label,members]) => {
        const prefix = label ? label+" · " : "";
        const groups = groupTeams(members,label);
        return [
          {title:prefix+"1차 · "+(label ? "풀리그" : "전체 풀리그"),ids:members,phase:1},
          ...groups.map((group,index) => ({title:prefix+"2차 · "+groupName(index),ids:group,phase:2}))
        ];
      });
    }
    function leagueSets(ids) {
      const mode = setup();
      if (mode === "full") return [{title:"풀리그",ids}];
      if (mode === "split") return splitLeagueSets(ids);
      if (mode === "groups") return groupTeams(ids).map((members,index) => ({title:groupName(index),ids:members}));
      const limit = Number(get("partial-rounds").value);
      if (!Number.isInteger(limit) || limit < 1 || limit > 99) throw new Error("라운드 수를 1~99 사이 숫자로 입력해 주세요.");
      if (!pressed("same-class")) return [{title:"부분 리그",ids,limit}];
      const byClass = new Map(), excluded = [];
      for (const id of ids) {
        const members = teams[id], group = members[0].class;
        if (!members.every(student => student.class === group)) { excluded.push(id); continue; }
        if (!byClass.has(group)) byClass.set(group,[]);
        byClass.get(group).push(id);
      }
      const sets = [];
      for (const [group,members] of [...byClass].sort(([a],[b]) => Number(a)-Number(b))) {
        if (members.length < 2) excluded.push(...members);
        else sets.push({title:group+"반 · 부분 리그",ids:members,limit});
      }
      if (!sets.length) throw new Error("같은 반 학생만으로 구성된 팀이 한 반에 두 팀 이상 필요합니다. 팀편성에서 ‘반별’로 편성해 보세요.");
      if (excluded.length) status(excluded.map(teamName).join(", ")+" 제외: 여러 반이 섞였거나 같은 반에 상대 팀이 없습니다.");
      return sets;
    }
    function standings(card, cardIndex) {
      const totals = new Map(card.ids.map(team => [team,{team,wins:0,losses:0}]));
      card.rounds.forEach((round,roundIndex) => round.games.forEach(([a,b],gameIndex) => {
        const winner = leaguePicks.get([cardIndex,roundIndex,gameIndex].join(":"));
        if (winner !== a && winner !== b) return;
        totals.get(winner).wins++;
        totals.get(winner === a ? b : a).losses++;
      }));
      return [...totals.values()].map(row => {
        const played = row.wins+row.losses;
        return {...row,rate:played ? (100*row.wins/played).toLocaleString("ko",{maximumFractionDigits:1})+"%" : "—"};
      });
    }
    const sharedMatchWarning = "중복 학생은 이 경기에서 한 팀으로만 출전해야 합니다.";
    function samePlayerOnBothTeams(a,b) {
      return a !== undefined && b !== undefined && shared[a].some(player => shared[b].includes(player));
    }
    function displayLeagueRounds(card,cardIndex) {
      if (card.playRounds) return card.playRounds;
      return card.rounds.map(({games,idle},index) => ({
        number:index+1,idle,games:games.map(([a,b],gameIndex) => ({a,b,key:[cardIndex,index,gameIndex].join(":")}))
      }));
    }
    function showOrder(labelGame) {
      if (!playRounds.length) return;
      const order = el("details","fixture-play-order");
      order.append(el("summary","","경기 진행 순서 · "+playRounds.length+"라운드"));
      const note = schedule.options.capacity ? "라운드마다 최대 "+schedule.options.capacity+"경기" : "동시 경기 수 제한 없음";
      order.append(el("p","small",note+" · 같은 라운드의 경기만 동시에 진행하세요."));
      const list = el("ol");
      for (const round of playRounds) list.append(el("li","",round.map(labelGame).join(" / ")));
      order.append(list);
      rows.prepend(order);
      return order;
    }
    function renderLeague() {
      const grid = el("div","league-grid");
      for (const [cardIndex,card] of leagueCards.entries()) {
        const section = el("section","league-card");
        const heading = el("header","league-heading");
        const count = card.rounds.reduce((total,round) => total+round.games.length,0);
        heading.append(el("h3","",card.title),el("span","",count+"경기"));
        const participants = el("ul","league-teams");
        for (const team of card.ids) participants.append(el("li","",teamName(team)));
        const table = el("table","league-standings");
        const head = el("thead"), headings = el("tr");
        for (const label of ["팀","승","패","승률"]) {
          const cell = el("th","",label); cell.scope = "col"; headings.append(cell);
        }
        head.append(headings);
        const body = el("tbody");
        table.append(head,body);
        function refreshStandings() {
          body.replaceChildren(...standings(card,cardIndex).map(({team,wins,losses,rate}) => {
            const row = el("tr"), label = el("th","",teamName(team));
            label.scope = "row";
            row.append(label,el("td","",wins),el("td","",losses),el("td","",rate));
            return row;
          }));
        }
        refreshStandings();
        const rounds = el("div","league-rounds");
        for (const round of displayLeagueRounds(card,cardIndex)) {
          const roundCard = el("section","league-round");
          roundCard.append(el("h4","schedule-round",round.number+"라운드"));
          for (const {a,b,key} of round.games) {
            const match = el("div","league-match");
            const buttons = [a,b].map(team => {
              const button = el("button","match-side",teamName(team));
              button.type = "button";
              button.setAttribute("aria-label",round.number+"라운드 "+teamName(team)+" 승리");
              button.addEventListener("click", () => {
                if (leaguePicks.get(key) === team) leaguePicks.delete(key);
                else leaguePicks.set(key,team);
                refreshMatch(); refreshStandings(); persist();
              });
              return button;
            });
            function refreshMatch() {
              [a,b].forEach((team,index) => buttons[index].setAttribute("aria-pressed",String(leaguePicks.get(key) === team)));
            }
            refreshMatch();
            match.append(buttons[0],el("span","","vs"),buttons[1]);
            roundCard.append(match);
            if (samePlayerOnBothTeams(a,b)) roundCard.append(el("p","match-note fixture-player-warning",sharedMatchWarning));
          }
          if (round.idle.length) roundCard.append(el("p","match-note","쉬는 팀 · "+round.idle.map(teamName).join(", ")));
          rounds.append(roundCard);
        }
        section.append(heading,participants,table,rounds);
        grid.append(section);
      }
      rows.replaceChildren(grid);
      showOrder(({a,b}) => teamName(a)+" vs "+teamName(b)+(samePlayerOnBothTeams(a,b) ? " (출전 팀 확인)" : ""));
    }
    function renderBracket(focusMatch,focusTeam) {
      const resolved = TeamFixtures.resolve(bracket,picks);
      diagrams = TeamBracket.diagrams(bracket,resolved,teamName);
      rankLines = bracket.ranks.map((ref,i) => {
        const team = resolved.teamOf(ref);
        return (i+1)+"위 · "+(team === undefined ? "미정" : teamName(team));
      });
      const horizontal = [...rows.querySelectorAll(".bracket-scroll")].map(element => element.scrollLeft);
      const orderWasOpen = rows.querySelector(".fixture-play-order")?.open;
      const scrollTop = rows.scrollTop;
      rows.replaceChildren();
      let focus;
      const svgNS = "http://www.w3.org/2000/svg";
      for (const [index,diagram] of diagrams.entries()) {
        const section = el("section","bracket-section");
        section.append(el("h3","bracket-title",diagram.title));
        const viewport = el("div","bracket-scroll");
        viewport.tabIndex = 0;
        viewport.setAttribute("aria-label",diagram.title+" 가로로 이동할 수 있는 영역");
        const chart = el("div","bracket-chart");
        chart.style.width = diagram.width+"px";
        chart.style.height = diagram.height+"px";
        const svg = document.createElementNS(svgNS,"svg");
        svg.setAttribute("viewBox","0 0 "+diagram.width+" "+diagram.height);
        svg.setAttribute("aria-hidden","true");
        for (const line of diagram.lines) {
          const connector = document.createElementNS(svgNS,"polyline");
          connector.setAttribute("points",line.map(point => point.join(",")).join(" "));
          svg.append(connector);
        }
        chart.append(svg);
        for (const node of diagram.nodes) {
          const {id,participants:[left,right]} = node;
          const card = el("div",node.final ? "bracket-game bracket-final" : "bracket-game");
          card.style.left = node.x+"px"; card.style.top = node.y+"px";
          card.style.width = TeamBracket.cardWidth+"px";
          card.style.height = TeamBracket.cardHeight+"px";
          const round = roundOfMatch.get(id);
          const collision = samePlayerOnBothTeams(left,right);
          node.caption = (round ? round+"R · " : "")+id+"경기"+(node.final && index === 0 ? " · 결승" : "")+(collision ? " ⚠" : "");
          const caption = el("span","match-id",node.caption);
          if (collision) caption.title = sharedMatchWarning;
          card.append(caption);
          for (const [slot,{label,won}] of node.slots.entries()) {
            const team = node.participants[slot];
            const button = el("button","match-side",label);
            button.type = "button"; button.disabled = left === undefined || right === undefined;
            button.title = label;
            button.setAttribute("aria-pressed",String(won));
            button.setAttribute("aria-label",id+"경기 "+label+" 승리");
            button.addEventListener("click", () => {
              if (won) picks.delete(id);
              else picks.set(id,{left,right,winner:team});
              renderBracket(id,team); persist();
            });
            if (id === focusMatch && team === focusTeam) focus = button;
            card.append(button);
          }
          chart.append(card);
        }
        viewport.append(chart); section.append(viewport); rows.append(section);
        viewport.scrollLeft = horizontal[index] ?? Math.max(0,(viewport.scrollWidth-viewport.clientWidth)/2);
      }
      const ranks = el("section","bracket-ranks");
      ranks.append(el("h3","",schedule.mode === "single" ? "우승 팀" : "전체 순위"));
      const list = el("ul");
      for (const line of rankLines) list.append(el("li","",line));
      ranks.append(list);
      rows.prepend(ranks);
      const order = showOrder(({id}) => {
        const match = bracket.matches[id-1];
        return id+"경기"+(samePlayerOnBothTeams(resolved.teamOf(match.a),resolved.teamOf(match.b)) ? " (출전 팀 확인)" : "");
      });
      if (order) {
        order.open = Boolean(orderWasOpen);
        if (bracket.matches.some(({a,b}) => samePlayerOnBothTeams(resolved.teamOf(a),resolved.teamOf(b)))) {
          order.after(el("p","match-note fixture-player-warning",sharedMatchWarning));
        }
      }
      rows.scrollTop = scrollTop;
      focus?.focus({preventScroll:true});
    }
    const teamPage = document.querySelector("main.team-page");
    const routeWindow = window.parent;
    function syncView() {
      const showFixtures = routeWindow.location.hash.split("/")[0] === "#fixtures";
      if (!showFixtures && presentation.open) closePresentation();
      teamPage.hidden = showFixtures;
      get("fixture-page").hidden = !showFixtures;
    }
    addEventListener("team-view-change",syncView);
    addEventListener("hashchange",syncView);
    syncView();
    get("back-to-teams").addEventListener("click", () => {
      routeWindow.location.hash = "teams";
      routeWindow.document.getElementById("pick-teams")?.focus();
    });
    get("import-teams").addEventListener("click", () => {
      if (editing()) { status("팀편성으로 돌아가 명단 편집을 마쳐 주세요."); return; }
      if (!readTeams().length) { status("팀편성 화면에서 먼저 팀을 편성해 주세요."); return; }
      const incoming = readTeams().map(team => team.map(({name,number,gender,class:className,duplicate}) => ({
        name,number,gender,class:className,...(duplicate ? {duplicate:true} : {})
      })));
      if (JSON.stringify(teams) === JSON.stringify(incoming)) { status("현재 편성된 팀을 이미 가져왔습니다."); return; }
      teams = incoming; assignments = [];
      splitMessage("");
      if (pressed("split-by-gender") && hasMixedGender()) {
        setPressed("split-by-gender",false);
        splitMessage(mixedGenderMessage);
      }
      renderTeams(); resetSchedule();
      if (persist()) status(teams.length+"팀을 기존 팀 번호 그대로 가져왔습니다.");
    });
    get("fixture-family").addEventListener("change",updateModes);
    get("fixture-mode").addEventListener("change",updateOptions);
    get("fixture-assignment").addEventListener("change",updateOptions);
    get("fixture-group-count").addEventListener("change",updateOptions);
    for (const id of ["same-class","split-by-class","split-by-gender"]) {
      get(id).addEventListener("click", () => {
        splitMessage("");
        if (id === "split-by-gender" && !pressed(id) && hasMixedGender()) {
          splitMessage(mixedGenderMessage);
          return;
        }
        setPressed(id,!pressed(id));
      });
    }
    function renderSchedule() {
      shared = TeamFixtures.sharedPlayers(teams);
      const capacity = schedule.options.capacity ?? Infinity;
      const scheduleRounds = Number.isFinite(capacity) || shared.some(players => players.length);
      if (schedule.family === "knockout") {
        bracket = TeamFixtures.tournament(teams.map((_,index) => index),schedule.mode === "placement");
        if (scheduleRounds) {
          playRounds = TeamFixtures.tournamentOrder(bracket,shared,capacity);
          playRounds.forEach((round,index) => round.forEach(({id}) => roundOfMatch.set(id,index+1)));
        }
        renderBracket();
      } else {
        leagueCards = schedule.sets.map(set => ({
          ...set,rounds:TeamFixtures.league(set.ids,set.limit ?? Infinity)
        }));
        if (scheduleRounds) {
          playRounds = TeamFixtures.leagueOrder(leagueCards,shared,capacity);
          for (const card of leagueCards) card.playRounds = [];
          for (const [index,round] of playRounds.entries()) {
            const gamesByCard = new Map();
            for (const game of round) {
              if (!gamesByCard.has(game.cardIndex)) gamesByCard.set(game.cardIndex,[]);
              gamesByCard.get(game.cardIndex).push(game);
            }
            for (const [cardIndex,games] of gamesByCard) {
              leagueCards[cardIndex].playRounds.push({number:index+1,games,idle:[]});
            }
          }
        }
        renderLeague();
      }
      get("save-fixtures-image").disabled = false;
      get("expand-fixtures").disabled = false;
    }
    get("make-fixtures").addEventListener("click", () => {
      status("");
      try {
        if (teams.length < 2) throw new Error("대진을 만들려면 편성된 팀을 두 팀 이상 가져와 주세요.");
        const input = get("parallel-games");
        if (!input.validity.valid) throw new Error("동시 진행 경기 수를 1~50 사이 정수로 입력하거나 비워 두세요.");
        const capacity = input.value === "" ? null : Number(input.value);
        const ids = teams.map((_,index) => index);
        const family = get("fixture-family").value;
        const next = {family,mode:setup(),name:get("fixture-mode").selectedOptions[0].textContent,
          sets:family === "league" ? leagueSets(ids) : [],
          options:{capacity,rounds:get("partial-rounds").value,sameClass:pressed("same-class"),
            splitByClass:pressed("split-by-class"),splitByGender:pressed("split-by-gender"),
            groups:get("fixture-group-count").value,assignment:get("fixture-assignment").value,assignments:[...assignments]}};
        resetSchedule(); schedule = next;
        renderSchedule(); persist();
      } catch (error) { status(error.message); }
    });
    const resetDialog = get("fixture-reset-dialog");
    get("reset-fixtures").addEventListener("click", () => resetDialog.showModal());
    get("cancel-fixture-reset").addEventListener("click", () => resetDialog.close());
    get("confirm-fixture-reset").addEventListener("click", () => {
      if (clear()) status("참가 팀과 대진표를 초기화했습니다.");
      resetDialog.close();
    });
    function restore() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        resetSchedule();
        teams = saved?.version === 1 && Array.isArray(saved.teams) ? saved.teams : [];
        assignments = [];
        get("parallel-games").value = "";
        for (const id of ["same-class","split-by-class","split-by-gender"]) setPressed(id,false);
        if (saved?.schedule && teams.length >= 2) {
          schedule = saved.schedule;
          get("fixture-family").value = schedule.family;
          updateModes();
          get("fixture-mode").value = schedule.mode;
          const options = schedule.options;
          get("parallel-games").value = options.capacity ?? "";
          get("partial-rounds").value = options.rounds;
          setPressed("same-class",options.sameClass);
          setPressed("split-by-class",options.splitByClass);
          setPressed("split-by-gender",options.splitByGender);
          get("fixture-group-count").value = options.groups;
          get("fixture-assignment").value = options.assignment;
          updateOptions();
          assignments = options.assignments.map(value => value ?? undefined);
          picks = new Map(saved.picks);
          leaguePicks = new Map(saved.leaguePicks);
          renderSchedule();
        }
        renderTeams();
      } catch {
        teams = []; assignments = []; resetSchedule(); renderTeams();
        status("저장된 대진표를 읽을 수 없습니다. 초기화한 뒤 다시 만들어 주세요.");
      }
    }
    addEventListener("storage",event => {
      if (event.key === storageKey || event.key === null) restore();
    });
    function exportSchedule() {
      return {
        title:"대진표", subtitle:schedule.name+" · "+teams.length+"팀",
        diagrams,
        cards:bracket ? [
          {title:schedule.mode === "single" ? "우승 팀" : "전체 순위",lines:rankLines.map(text => ({text}))},
          ...(playRounds.length ? [{title:"경기 진행 순서",lines:playRounds.map((round,index) =>
            ({text:(index+1)+"라운드 · "+round.map(({id}) => id+"경기").join(" / ")}))}] : [])
        ] :
          leagueCards.map((card,cardIndex) => ({
            title:card.title,
            lines:[...standings(card,cardIndex).map(({team,wins,losses,rate}) => ({text:teamName(team)+" · "+wins+"승 "+losses+"패 · "+rate})),...displayLeagueRounds(card,cardIndex).flatMap(round => [
              {text:round.number+"라운드",heading:true},
              ...round.games.map(({a,b,key}) => {
                const winner = leaguePicks.get(key);
                return {text:teamName(a)+" vs "+teamName(b)+(winner === undefined ? "" : " · "+teamName(winner)+" 승")+
                  (samePlayerOnBothTeams(a,b) ? " · 출전 팀 확인" : "")};
              }),
              ...round.idle.map(team => ({text:"쉬는 팀 · "+teamName(team)}))
            ])]
          }))
      };
    }
    updateModes();
    restore();
    return {clear,exportSchedule};
  }
  return {init};
})();
