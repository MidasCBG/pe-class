"use strict";
(() => {
  const storageKey = "pe-class.teams.roster.v1";
  const get = id => document.getElementById(id);
  const fields = ["class","number","gender","name","height","ability","initiative"];
  const conditions = {class:null,gender:null,height:null,ability:false,initiative:false};
  let roster = [], selectedClasses = new Set(), result = [], revision = 0;
  let singletonPlan = null;
  let pendingAction = null, storageProblem = false;
  const mobile = navigator.userAgentData?.mobile ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  get("excel-tools").hidden = Boolean(mobile);
  get("mobile-note").hidden = !mobile;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function message(text = "") { get("notice").textContent = text; }
  function normalize(rows) {
    if (!Array.isArray(rows) || rows.length > 1000) throw new Error("명단은 최대 1,000명까지 입력할 수 있습니다.");
    const identifiers = new Set();
    return rows.map((row, index) => {
      const student = Object.fromEntries(fields.map(field => [field,String(row[field] ?? "").trim()]));
      if (row.excluded === true) student.excluded = true;
      student.class = student.class.replace(/반$/, "").trim();
      if (!/^\d{1,2}$/.test(student.class) || Number(student.class) < 1) throw new Error((index+1)+"번째 학생의 반을 1~99 사이 숫자로 입력해 주세요.");
      student.class = String(Number(student.class));
      if (!/^\d{1,3}$/.test(student.number) || Number(student.number) < 1) throw new Error((index+1)+"번째 학생의 번호를 1~999 사이 숫자로 입력해 주세요.");
      student.number = Number(student.number);
      const genders = {남:"남",여:"여",남자:"남",여자:"여",M:"남",F:"여"};
      student.gender = genders[student.gender.toUpperCase()];
      if (!student.gender) throw new Error((index+1)+"번째 학생의 성별을 선택해 주세요.");
      if (!student.name || student.name.length > 30) throw new Error((index+1)+"번째 학생의 이름을 30자 이내로 입력해 주세요.");
      for (const field of ["height","ability","initiative"]) {
        student[field] ||= "중";
        if (!["상","중","하"].includes(student[field])) throw new Error((index+1)+"번째 학생의 특성은 상·중·하 중 선택해 주세요.");
      }
      const key = student.class + ":" + student.number;
      if (identifiers.has(key)) throw new Error(student.class+"반 "+student.number+"번이 중복됩니다. 번호를 확인해 주세요.");
      identifiers.add(key);
      return student;
    }).sort((a,b) => Number(a.class)-Number(b.class) || a.number-b.number);
  }
  function readSaved() {
    storageProblem = false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const saved = JSON.parse(raw);
      if (saved.schema !== 1) throw new Error("schema");
      return normalize(saved.students);
    } catch {
      storageProblem = true;
      message("저장 명단을 읽을 수 없거나 브라우저 저장이 차단되었습니다. 브라우저 설정을 확인해 주세요. 손상된 명단은 ‘명단 삭제’ 후 다시 입력할 수 있습니다.");
      return [];
    }
  }
  function visibleStudents() { return roster.filter(student => selectedClasses.has(student.class)); }
  function chosen() { return visibleStudents().filter(student => !student.excluded); }
  function updateSelectedCount() {
    const visible = visibleStudents();
    const excluded = visible.filter(student => student.excluded).length;
    get("selected-count").textContent = "선택 "+(visible.length-excluded)+"명"+(excluded ? " · 제외 "+excluded+"명" : "");
  }
  function clearResults() {
    if (get("singleton-dialog").open) get("singleton-dialog").close();
    singletonPlan = null;
    result = [];
    images.clear();
    get("save-teams-image").disabled = true;
    get("team-results").replaceChildren(element("div","empty results-empty","반과 조건을 선택한 뒤 팀편성하기를 눌러 주세요."));
    get("result-summary").textContent = "선택한 학생으로 인원수를 고르게 나눕니다.";
  }
  function renderClasses() {
    const classes = [...new Set(roster.map(student => student.class))];
    const labels = classes.map(value => {
      const label = element("label","class-label");
      const check = document.createElement("input");
      check.type = "checkbox"; check.value = value; check.checked = selectedClasses.has(value);
      check.addEventListener("change", () => {
        if (check.checked) selectedClasses.add(value);
        else selectedClasses.delete(value);
        clearResults(); renderRoster();
      });
      label.append(check, value+"반");
      return label;
    });
    if (classes.length) {
      const all = element("button","subtle",selectedClasses.size === classes.length ? "전체 해제" : "전체 선택");
      all.type = "button";
      all.addEventListener("click", () => {
        selectedClasses = new Set(selectedClasses.size === classes.length ? [] : classes);
        clearResults(); renderClasses(); renderRoster();
      });
      labels.push(all);
    } else labels.push(element("span","small","명단을 저장하면 반을 선택할 수 있습니다."));
    get("class-filters").replaceChildren(...labels);
  }
  function renderRoster() {
    get("roster-count").textContent = roster.length+"명";
    updateSelectedCount();
    get("edit").textContent = roster.length ? "편집" : "명단 입력";
    if (!roster.length) {
      get("roster-view").replaceChildren(element("p","empty","명단을 입력하고 함께할 반을 선택하세요."));
      return;
    }
    const table = element("table");
    const header = document.createElement("thead"), row = document.createElement("tr");
    for (const title of ["반","번호","성별","이름"]) {
      const cell = element("th","",title); cell.scope = "col"; row.append(cell);
    }
    header.append(row);
    const body = document.createElement("tbody");
    for (const student of visibleStudents()) {
      const line = element("tr",student.gender === "남" ? "male" : "female");
      for (const text of [student.class+"반",student.number,student.gender]) line.append(element("td","",text));
      const cell = element("td");
      const actions = element("div","roster-name-actions");
      const toggle = element("button","roster-exclude");
      toggle.type = "button";
      function updateToggle() {
        const excluded = Boolean(student.excluded);
        line.classList.toggle("roster-excluded",excluded);
        toggle.textContent = excluded ? "다시 포함" : "제외";
        toggle.setAttribute("aria-label",student.name+" 팀편성 제외");
        toggle.setAttribute("aria-pressed",String(excluded));
        toggle.title = excluded ? "팀편성에 다시 포함" : "팀편성에서 제외";
      }
      toggle.addEventListener("click", () => {
        const wasExcluded = student.excluded;
        student.excluded = !wasExcluded;
        try {
          localStorage.setItem(storageKey,JSON.stringify({schema:1,students:roster}));
        } catch {
          student.excluded = wasExcluded;
          message("브라우저에 제외 상태를 저장할 수 없습니다.");
          return;
        }
        clearResults(); updateToggle(); updateSelectedCount(); message();
      });
      updateToggle();
      actions.append(element("span","roster-student-name",student.name),toggle);
      cell.append(actions); line.append(cell);
      body.append(line);
    }
    table.append(header,body); get("roster-view").replaceChildren(table);
    // Keep the select-all label in sync without changing checkbox focus.
    const all = get("class-filters").querySelector("button");
    if (all) all.textContent = selectedClasses.size === new Set(roster.map(s => s.class)).size ? "전체 해제" : "전체 선택";
  }
  function addRow(student = {}) {
    if (get("student-rows").children.length >= 1000) { message("학생은 최대 1,000명까지 입력할 수 있습니다."); return; }
    const row = element("div","student-row");
    const titles = ["반","번호","성별","이름","키","운동 능력","적극성"];
    fields.forEach((field,index) => {
      const label = element("label",index >= 4 ? "trait" : field === "name" ? "name" : "");
      label.append(titles[index]);
      let input;
      if (field === "gender" || index >= 4) {
        input = document.createElement("select");
        const choices = field === "gender" ? [["","선택"],["남","남"],["여","여"]] :
          [["","미입력 · 중"],["상","상"],["중","중"],["하","하"]];
        for (const [value,text] of choices) input.add(new Option(text,value));
      } else {
        input = document.createElement("input");
        input.type = "text"; input.autocomplete = "off";
        input.maxLength = field === "name" ? 30 : 3;
        if (field !== "name") input.inputMode = "numeric";
      }
      input.dataset.field = field; input.value = student[field] ?? "";
      label.append(input); row.append(label);
      if (field === "name") {
        const remove = element("button","row-remove","×");
        remove.type = "button"; remove.setAttribute("aria-label","이 학생 입력 행 삭제");
        remove.addEventListener("click", () => row.remove());
        row.append(remove);
      }
    });
    get("student-rows").append(row);
  }
  function startEditor(students = roster) {
    get("student-rows").replaceChildren();
    (students.length ? students : [{}]).forEach(addRow);
    get("editor").hidden = false; get("roster-view").hidden = true;
    get("edit").disabled = true; get("import").disabled = true; get("generate").disabled = true;
    get("editor").querySelector("input").focus({preventScroll:true});
  }
  function closeEditor() {
    get("editor").hidden = true; get("student-rows").replaceChildren();
    get("roster-view").hidden = false;
    get("edit").disabled = false; get("import").disabled = false; get("generate").disabled = false;
    get("excel-file").value = "";
  }
  function privacy(action) {
    pendingAction = action;
    get("privacy-dialog").showModal();
  }
  function saveRoster() {
    try {
      const rows = [...get("student-rows").children].map(row =>
        Object.fromEntries([...row.querySelectorAll("[data-field]")].map(input => [input.dataset.field,input.value])));
      const students = normalize(rows.filter(row => fields.some(field => row[field])));
      if (!students.length) throw new Error("학생을 입력해 주세요. 명단 전체 삭제는 ‘명단 삭제’를 이용해 주세요.");
      if (storageProblem && localStorage.getItem(storageKey)) throw new Error("기존 저장 명단을 확인할 수 없습니다. ‘명단 삭제’ 후 다시 저장해 주세요.");
      const excludedStudents = new Set(roster.filter(student => student.excluded)
        .map(student => JSON.stringify([student.class,student.number,student.name])));
      for (const student of students) {
        if (excludedStudents.has(JSON.stringify([student.class,student.number,student.name]))) student.excluded = true;
      }
      const payload = JSON.stringify({schema:1,students});
      localStorage.setItem(storageKey,payload);
      if (localStorage.getItem(storageKey) !== payload) throw new Error("명단 저장을 확인할 수 없습니다. 다른 탭의 편집 여부를 확인해 주세요.");
      roster = students; revision++;
      selectedClasses = new Set(students.map(student => student.class));
      closeEditor(); clearResults(); renderClasses(); renderRoster();
      message("명단을 이 브라우저에 저장했습니다. 학생 특성은 감춰졌습니다.");
    } catch (error) {
      message(error.name === "QuotaExceededError" || error.name === "SecurityError" ?
        "브라우저 저장 공간을 사용할 수 없습니다. 명단은 저장되지 않았습니다." : error.message);
    }
  }
  function teamCards(teams, groupPicker) {
    return teams.map((members,index) => {
      const box = element("section","team-box"), header = document.createElement("header");
      const title = element("div","team-card-title");
      title.append(element("span","team-number",String(index+1)),element("strong","",(index+1)+"팀"));
      header.append(title,element("span","",members.length+"명"));
      const list = element("ul",members.length >= 3 ? "team-members team-members-columns" : "team-members");
      for (const student of members) {
        const row = element("li",student.gender === "남" ? "male" : "female");
        row.append(element("span","student-tag",student.class+"반 "+student.number+"번"),
          element("span","member-name",student.name));
        if (student.duplicate) row.append(element("span","duplicate-badge","중복"));
        list.append(row);
      }
      box.append(header);
      const picker = groupPicker?.(index);
      if (picker) box.append(picker);
      box.append(list); return box;
    });
  }
  function renderResults() {
    get("team-results").replaceChildren(...teamCards(result));
  }
  function finishTeams(teams, studentCount) {
    result = teams;
    images.clear();
    get("save-teams-image").disabled = false;
    const sizes = result.map(team => team.length);
    const duplicates = result.flat().filter(student => student.duplicate).length;
    const unmixed = conditions.gender === "mix" && result.some(team => new Set(team.map(s => s.gender)).size < 2);
    get("result-summary").textContent = studentCount+"명 · "+result.length+"팀 · 팀별 "+sizes.join(" / ")+"명"+
      (duplicates ? " · 중복 배정 "+duplicates+"건" : "")+
      (Math.max(...sizes)-Math.min(...sizes) > 1 ? " · 분리 조건을 지키며 배분했습니다." : "")+
      (unmixed ? " · 일부 팀은 혼성이 아닙니다." : "");
    renderResults(); message();
  }
  const singletonDialog = get("singleton-dialog");
  function askAboutSingletons(teams, indexes, studentCount) {
    const choices = indexes.map(index => {
      const [student] = teams[index];
      const candidates = TeamBalance.singletonCandidates(teams,index,conditions);
      const panel = element("section","singleton-option");
      panel.append(element("strong","",(index+1)+"팀 · "+student.name));
      const label = element("label","","편성 방법");
      const mode = element("select");
      mode.add(new Option("1인 팀 그대로 두기","keep"));
      const auto = new Option("자동 중복 배정","auto"), manual = new Option("추가 학생 직접 선택","manual");
      auto.disabled = manual.disabled = !candidates.length;
      mode.add(auto); mode.add(manual);
      label.append(mode); panel.append(label);
      const candidateLabel = element("label","","중복 배정할 학생");
      const select = element("select");
      candidateLabel.append(select); candidateLabel.hidden = true;
      panel.append(candidateLabel);
      if (!candidates.length) panel.append(element("p","small","같은 편성 조건을 충족하는 다른 학생이 없습니다."));
      mode.addEventListener("change", () => {
        candidateLabel.hidden = mode.value !== "manual";
        if (!candidateLabel.hidden && !select.options.length) {
          select.add(new Option("학생을 선택하세요",""));
          for (const [candidateIndex,candidate] of candidates.entries()) {
            select.add(new Option(candidate.class+"반 "+candidate.number+"번 "+candidate.name,candidateIndex));
          }
        }
        get("singleton-status").textContent = "";
      });
      return {index,candidates,mode,select,panel};
    });
    singletonPlan = {teams,studentCount,choices};
    get("singleton-teams").replaceChildren(...choices.map(choice => choice.panel));
    get("singleton-status").textContent = "";
    singletonDialog.showModal();
  }
  get("cancel-singletons").addEventListener("click", () => singletonDialog.close());
  singletonDialog.addEventListener("close", () => {
    if (singletonDialog.open) return;
    singletonPlan = null;
    get("singleton-teams").replaceChildren();
  });
  get("confirm-singletons").addEventListener("click", () => {
    if (!singletonPlan) return;
    const {teams,studentCount,choices} = singletonPlan;
    const missing = choices.find(({mode,select}) => mode.value === "manual" && select.value === "");
    if (missing) {
      get("singleton-status").textContent = (missing.index+1)+"팀에 중복 배정할 학생을 선택해 주세요.";
      missing.select.focus();
      return;
    }
    const uses = new Map();
    const add = (index,candidate) => {
      teams[index].push({...candidate,duplicate:true});
      uses.set(candidate,(uses.get(candidate) ?? 0)+1);
    };
    for (const {index,candidates,mode,select} of choices) {
      if (mode.value === "manual") add(index,candidates[Number(select.value)]);
    }
    for (const {index,candidates,mode} of choices) {
      if (mode.value === "auto") add(index,TeamBalance.chooseDuplicate(teams[index][0],candidates,conditions,uses));
    }
    singletonDialog.close();
    finishTeams(teams,studentCount);
  });
  function generate() {
    try {
      const students = chosen();
      const sizeMode = document.querySelector('input[name="size-mode"]:checked').value === "size";
      const target = Number(get(sizeMode ? "team-capacity" : "team-count").value);
      const teams = TeamBalance.makeTeams(students,target,conditions,sizeMode);
      const singletons = teams.flatMap((team,index) => team.length === 1 ? [index] : []);
      if (singletons.length && (!sizeMode || target > 1)) {
        askAboutSingletons(teams,singletons,students.length);
        return;
      }
      finishTeams(teams,students.length);
    } catch (error) { message(error.message); }
  }
  document.querySelector(".condition-groups").addEventListener("click", event => {
    const button = event.target.closest("[data-condition]");
    if (!button) return;
    const key = button.dataset.condition, value = button.dataset.value || true;
    conditions[key] = conditions[key] === value ? (typeof value === "boolean" ? false : null) : value;
    updateConditions(); clearResults();
  });
  function updateConditions() {
    for (const button of document.querySelectorAll("[data-condition]")) {
      button.setAttribute("aria-pressed",String(conditions[button.dataset.condition] === (button.dataset.value || true)));
    }
  }
  get("reset-conditions").addEventListener("click", () => {
    Object.assign(conditions,{class:null,gender:null,height:null,ability:false,initiative:false});
    updateConditions(); clearResults(); message("편성 조건을 초기화했습니다.");
  });
  for (const id of ["team-count","team-capacity"]) get(id).addEventListener("input", clearResults);
  for (const radio of document.querySelectorAll('input[name="size-mode"]')) radio.addEventListener("change", () => {
    const sizeMode = radio.value === "size";
    for (const id of ["team-count","team-count-label","team-count-unit"]) get(id).hidden = sizeMode;
    for (const id of ["team-capacity","team-capacity-label","team-capacity-unit"]) get(id).hidden = !sizeMode;
    clearResults();
  });
  get("generate").addEventListener("click",generate);
  const genderColorButtons = [get("gender-colors"),get("fixture-colors")];
  let showGenderColors = true;
  function updateGenderColors() {
    document.body.dataset.genderColors = String(showGenderColors);
    for (const button of genderColorButtons) {
      button.setAttribute("aria-pressed",String(showGenderColors));
      button.querySelector(".gender-color-state").textContent = showGenderColors ? "켜짐" : "꺼짐";
    }
  }
  for (const button of genderColorButtons) button.addEventListener("click", () => {
    showGenderColors = !showGenderColors;
    updateGenderColors();
  });
  updateGenderColors();
  get("edit").addEventListener("click", () => {
    if (roster.length) privacy(() => startEditor());
    else startEditor();
  });
  get("privacy-confirm").addEventListener("click", () => {
    get("privacy-dialog").close();
    const action = pendingAction; pendingAction = null; action?.();
  });
  get("privacy-cancel").addEventListener("click", () => { pendingAction = null; get("privacy-dialog").close(); });
  get("privacy-dialog").addEventListener("cancel", () => { pendingAction = null; });
  get("add-student").addEventListener("click", () => {
    const last = get("student-rows").lastElementChild;
    const classValue = last?.querySelector('[data-field="class"]').value || "";
    const lastNumber = Number(last?.querySelector('[data-field="number"]').value);
    addRow({class:classValue,number:lastNumber ? lastNumber+1 : ""});
    get("student-rows").lastElementChild.scrollIntoView({block:"nearest"});
  });
  get("cancel-edit").addEventListener("click", () => { revision++; closeEditor(); message(); get("edit").focus(); });
  get("save-roster").addEventListener("click",saveRoster);
  get("erase").addEventListener("click", () => get("delete-dialog").showModal());
  get("delete-cancel").addEventListener("click", () => get("delete-dialog").close());
  get("delete-confirm").addEventListener("click", () => {
    try {
      localStorage.removeItem(storageKey);
      if (localStorage.getItem(storageKey) !== null) throw new Error("delete");
      const fixturesCleared = fixtures.clear();
      revision++; roster = []; selectedClasses.clear(); storageProblem = false; pendingAction = null;
      closeEditor(); clearResults(); renderClasses(); renderRoster();
      get("delete-dialog").close();
      message(fixturesCleared ? "이 앱의 저장 명단과 학생 특성, 편성 결과를 삭제했습니다." : "명단을 삭제했습니다. 저장된 대진표는 브라우저 설정에서 지워 주세요.");
    } catch { message("저장 명단을 삭제하지 못했습니다. 브라우저의 사이트 데이터 설정을 확인해 주세요."); }
  });
  get("import").addEventListener("click", () => privacy(() => get("excel-file").click()));
  get("excel-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    const currentRevision = ++revision;
    try {
      const students = normalize(await TeamExcel.read(file));
      if (currentRevision !== revision) return;
      if (!students.length) throw new Error("엑셀에 입력된 학생이 없습니다.");
      startEditor(students);
      message(students.length+"명의 명단을 기기에서 읽었습니다. 기존 명단을 대체할 내용을 확인한 뒤 ‘명단 저장’을 눌러 주세요.");
    } catch (error) { if (currentRevision === revision) message(error.message); }
    finally { event.target.value = ""; }
  });
  get("template").addEventListener("click", async () => {
    try {
      if (!window.showSaveFilePicker) throw new Error("엑셀 양식 저장은 PC의 최신 Chrome 또는 Edge에서 이용해 주세요.");
      const file = await window.showSaveFilePicker({suggestedName:"체육_팀편성_학생명단.xlsx",
        types:[{description:"Excel 통합 문서",accept:{"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"]}}]});
      const output = await file.createWritable();
      await output.write(TeamExcel.template()); await output.close();
      message("엑셀 양식을 저장했습니다. 학생 명단 시트에 입력한 뒤 불러와 주세요.");
    } catch (error) { if (error.name !== "AbortError") message(error.message); }
  });
  addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    revision++; pendingAction = null;
    get("privacy-dialog").close(); get("delete-dialog").close();
    closeEditor(); roster = readSaved();
    selectedClasses = new Set(roster.map(student => student.class));
    clearResults(); renderClasses(); renderRoster();
    if (!storageProblem) message("다른 탭에서 변경한 저장 명단을 반영했습니다.");
  });
  const fixtures = FixtureView.init(get,element,teamCards,() => result, () => !get("editor").hidden);
  const images = TeamImage.init(get);
  get("save-teams-image").addEventListener("click", () => images.open({
    title:"팀편성 결과", subtitle:result.length+"팀 · "+result.flat().length+"명", private:true,
    cards:result.map((members,index) => ({title:(index+1)+"팀 · "+members.length+"명",
      lines:members.map(student => ({text:student.class+"반 "+student.number+"번  "+student.name+(student.duplicate ? " (중복)" : ""),
        color:showGenderColors ? (student.gender === "남" ? "male" : "female") : ""}))}))
  }));
  get("save-fixtures-image").addEventListener("click", () => images.open(fixtures.exportSchedule()));
  roster = readSaved(); selectedClasses = new Set(roster.map(student => student.class));
  renderClasses(); renderRoster();
})();
