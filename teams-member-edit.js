"use strict";
const TeamMemberEdit = (() => {
  const key = student => student.class+":"+student.number;
  const label = student => student.class+"반 "+student.number+"번 "+student.name;
  function assignments(teams) {
    const byStudent = new Map();
    teams.forEach((team,index) => {
      for (const student of team) {
        const id = key(student);
        if (!byStudent.has(id)) byStudent.set(id,new Set());
        byStudent.get(id).add(index);
      }
    });
    return byStudent;
  }
  function markDuplicates(next) {
    const placed = assignments(next);
    return next.map(team => team.map(student => {
      const {duplicate,...member} = student;
      return placed.get(key(student)).size > 1 ? {...member,duplicate:true} : member;
    }));
  }
  function init(get) {
    const dialog = get("member-edit-dialog"), choice = get("member-edit-choice"), picker = get("member-edit-picker");
    const classSelect = get("member-edit-class"), studentSelect = get("member-edit-student");
    const studentField = get("member-edit-student-field"), confirm = get("member-edit-confirm");
    const note = get("member-edit-note"), change = get("member-edit-replace");
    const swap = get("member-edit-swap"), emptyChoice = get("member-edit-empty-choice");
    const teamChoice = get("team-edit-choice");
    let current;
    const slotLabel = (index,individual) => (index+1)+(individual ? "번 참가 자리" : "팀");
    function swapCandidates(teams,teamIndex,student) {
      const own = new Set(teams[teamIndex].map(key));
      return teams.flatMap((team,index) => index === teamIndex || team.some(member => key(member) === key(student)) ? [] :
        team.flatMap((member,memberIndex) => own.has(key(member)) ? [] : [{student:member,teamIndex:index,memberIndex}]));
    }
    function open({teams,teamIndex,memberIndex,teamActions,roster,individual,resetNotice,apply}) {
      const team = teams[teamIndex], student = team[memberIndex];
      const sameTeam = new Set(team.map(key));
      const all = new Map([...roster,...teams.flat()].map(candidate => [key(candidate),candidate]));
      const candidates = [...all.values()].filter(candidate => !sameTeam.has(key(candidate))).map(student => ({student}));
      const swaps = student ? swapCandidates(teams,teamIndex,student) : [];
      current = {teams,teamIndex,memberIndex,candidates,swaps,individual,resetNotice,apply};
      const teamLabel = slotLabel(teamIndex,individual);
      get("member-edit-title").textContent = student ? label(student) : teamActions ? teamLabel+" 관리" : teamLabel+"에 학생 추가";
      note.textContent = "";
      choice.hidden = !student;
      teamChoice.hidden = !teamActions;
      picker.hidden = confirm.hidden = emptyChoice.hidden = true;
      change.disabled = !candidates.length;
      swap.disabled = !swaps.length;
      dialog.showModal();
      if (!student && !teamActions) showPicker("추가",candidates);
    }
    function commit(next) {
      dialog.close();
      current.apply(markDuplicates(next));
    }
    function review(next,action,question = "") {
      const notice = current.resetNotice?.(next);
      if (!notice && !question) {
        commit(next);
        return;
      }
      note.textContent = [question,notice].filter(Boolean).join(" ");
      current.next = next;
      choice.hidden = picker.hidden = emptyChoice.hidden = teamChoice.hidden = true;
      confirm.hidden = false;
      confirm.textContent = action;
      get("member-edit-cancel").focus();
    }
    function removeMember(removeTeam = false, question = "") {
      const {teams,teamIndex,memberIndex} = current;
      const next = teams.map(team => [...team]);
      if (removeTeam) next.splice(teamIndex,1);
      else next[teamIndex].splice(memberIndex,1);
      review(next,removeTeam ? "팀 삭제 확인" : "삭제 확인",question);
    }
    get("member-edit-delete").addEventListener("click", () => {
      if (current.teams[current.teamIndex].length > 1) {
        removeMember();
        return;
      }
      choice.hidden = true;
      emptyChoice.hidden = false;
      note.textContent = current.individual ? "마지막 학생입니다. 참가 자리를 지우거나 공석으로 남겨 나중에 학생을 추가할 수 있습니다." :
        "팀의 마지막 학생입니다. 팀을 삭제하거나 공석으로 남겨 나중에 학생을 추가할 수 있습니다.";
      get("member-edit-remove-team").textContent = current.individual ? "참가 자리 삭제" : "팀 삭제";
      get("member-edit-keep-team").focus();
    });
    get("member-edit-remove-team").addEventListener("click", () => removeMember(true));
    get("member-edit-keep-team").addEventListener("click", () => removeMember());
    get("team-edit-add").addEventListener("click", () => showPicker("추가",current.candidates));
    get("team-edit-delete").addEventListener("click", () =>
      removeMember(true,slotLabel(current.teamIndex,current.individual)+"을 삭제할까요?"));
    function showPicker(action,choices) {
      current.action = action;
      current.choices = choices;
      const classes = [...new Set(choices.map(({student}) => student.class))].sort((a,b) => Number(a)-Number(b));
      classSelect.replaceChildren(new Option("반 선택",""),...classes.map(value => new Option(value+"반",value)));
      studentField.hidden = true;
      studentSelect.replaceChildren();
      choice.hidden = teamChoice.hidden = true;
      picker.hidden = false;
      note.textContent = choices.length ? "" : "추가할 수 있는 학생이 없습니다.";
      get("member-edit-pick").textContent = action+"하기";
      get("member-edit-pick").disabled = true;
      classSelect.focus();
    }
    change.addEventListener("click", () => showPicker("교체",current.candidates));
    swap.addEventListener("click", () => showPicker("맞교환",current.swaps));
    classSelect.addEventListener("change", () => {
      const students = current.choices.map((candidate,index) => ({...candidate,index}))
        .filter(({student}) => student.class === classSelect.value)
        .sort((a,b) => a.student.number-b.student.number);
      studentSelect.replaceChildren(new Option("학생 선택",""),
        ...students.map(({student,teamIndex,index}) => new Option(student.number+"번 "+student.name+
          (teamIndex === undefined ? "" : " · "+slotLabel(teamIndex,current.individual)),index)));
      studentField.hidden = !classSelect.value;
      get("member-edit-pick").disabled = true;
    });
    studentSelect.addEventListener("change", () => { get("member-edit-pick").disabled = !studentSelect.value; });
    get("member-edit-pick").addEventListener("click", () => {
      if (studentSelect.value === "") return;
      const {teams,teamIndex,memberIndex,individual,action,choices} = current;
      const target = choices[Number(studentSelect.value)];
      const next = teams.map(team => [...team]);
      if (action === "맞교환") {
        const otherTeam = next[target.teamIndex];
        [next[teamIndex][memberIndex],otherTeam[target.memberIndex]] =
          [otherTeam[target.memberIndex],next[teamIndex][memberIndex]];
        review(next,"맞교환 확인");
        return;
      }
      const {student} = target;
      next[teamIndex].splice(memberIndex ?? next[teamIndex].length,action === "추가" ? 0 : 1,student);
      const occupied = assignments(teams).get(key(student));
      const question = occupied?.size ? label(student)+" 학생은 이미 "+[...occupied].map(index => slotLabel(index,individual)).join(", ")+
        "에 배정되어 있습니다. "+(individual ? "이 자리에도" : "이 팀에도")+" 중복 배정할까요?" : "";
      review(next,question ? "중복 배정" : action+" 확인",question);
    });
    confirm.addEventListener("click", () => commit(current.next));
    get("member-edit-cancel").addEventListener("click", () => dialog.close());
    return {open,close:() => { if (dialog.open) dialog.close(); }};
  }
  return {key,assignments,init};
})();
