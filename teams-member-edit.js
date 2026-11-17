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
  function edit(teams,teamIndex,memberIndex,replacement) {
    const next = teams.map((team,index) => {
      if (index !== teamIndex) return team;
      const members = [...team];
      if (replacement) members[memberIndex] = replacement;
      else members.splice(memberIndex,1);
      return members;
    }).filter(team => team.length);
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
    let current;
    function open({teams,teamIndex,memberIndex,roster,individual,resetNotice,apply}) {
      const team = teams[teamIndex], student = team[memberIndex];
      const sameTeam = new Set(team.map(key));
      const all = new Map([...roster,...teams.flat()].map(candidate => [key(candidate),candidate]));
      const candidates = [...all.values()].filter(candidate => !sameTeam.has(key(candidate)));
      current = {teams,teamIndex,memberIndex,candidates,individual,resetNotice,apply};
      get("member-edit-title").textContent = label(student);
      note.textContent = "";
      choice.hidden = false;
      picker.hidden = confirm.hidden = true;
      change.disabled = !candidates.length;
      dialog.showModal();
    }
    function commit(replacement) {
      const {teams,teamIndex,memberIndex,apply} = current;
      const next = edit(teams,teamIndex,memberIndex,replacement);
      dialog.close();
      apply(next);
    }
    function review(replacement,teamNumbers = []) {
      const notice = current.resetNotice?.(replacement);
      if (!notice && !teamNumbers.length) {
        commit(replacement);
        return;
      }
      const duplicate = teamNumbers.length ? label(replacement)+" 학생은 이미 "+teamNumbers.join(", ")+
        "에 배정되어 있습니다. "+(current.individual ? "이 자리에도" : "이 팀에도")+" 중복 배정할까요?" : "";
      note.textContent = [duplicate,notice].filter(Boolean).join(" ");
      current.replacement = replacement;
      choice.hidden = picker.hidden = true;
      confirm.hidden = false;
      confirm.textContent = teamNumbers.length ? "중복 배정" : replacement ? "교체 확인" : "삭제 확인";
      get("member-edit-cancel").focus();
    }
    get("member-edit-delete").addEventListener("click", () => review(null));
    change.addEventListener("click", () => {
      const classes = [...new Set(current.candidates.map(student => student.class))].sort((a,b) => Number(a)-Number(b));
      classSelect.replaceChildren(new Option("반 선택",""),...classes.map(value => new Option(value+"반",value)));
      studentField.hidden = true;
      studentSelect.replaceChildren();
      choice.hidden = true;
      picker.hidden = false;
      get("member-edit-pick").disabled = true;
      classSelect.focus();
    });
    classSelect.addEventListener("change", () => {
      const students = current.candidates.filter(student => student.class === classSelect.value)
        .sort((a,b) => a.number-b.number);
      studentSelect.replaceChildren(new Option("학생 선택",""),
        ...students.map(student => new Option(student.number+"번 "+student.name,key(student))));
      studentField.hidden = !classSelect.value;
      get("member-edit-pick").disabled = true;
    });
    studentSelect.addEventListener("change", () => { get("member-edit-pick").disabled = !studentSelect.value; });
    get("member-edit-pick").addEventListener("click", () => {
      const student = current.candidates.find(candidate => key(candidate) === studentSelect.value);
      if (!student) return;
      const occupied = assignments(current.teams).get(key(student)) ?? [];
      review(student,[...occupied].map(index => current.individual ? (index+1)+"번 참가 자리" : (index+1)+"팀"));
    });
    confirm.addEventListener("click", () => commit(current.replacement));
    get("member-edit-cancel").addEventListener("click", () => dialog.close());
    return {open,close:() => { if (dialog.open) dialog.close(); }};
  }
  return {key,assignments,init};
})();
