"use strict";
(function (root) {
  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function partitionRoster(students, conditions) {
    const groups = new Map();
    for (const student of students) {
      const key = ["class", "gender", "height"].filter(field => conditions[field] === "separate")
        .map(field => student[field]).join("|");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(student);
    }
    return [...groups.values()];
  }
  // Hard separation may prevent a one-person size difference. Find the smallest feasible range.
  function allocate(groups, teamCount) {
    const total = groups.reduce((sum, group) => sum + group.length, 0);
    for (let spread = 0; spread < total; spread++) {
      for (let low = Math.max(1, Math.ceil(total / teamCount) - spread); low <= Math.floor(total / teamCount); low++) {
        const ranges = groups.map(group => ({
          min: Math.ceil(group.length / (low + spread)), max: Math.floor(group.length / low)
        }));
        if (ranges.some(range => range.min > range.max)) continue;
        const counts = ranges.map(range => range.min);
        if (counts.reduce((a, b) => a + b, 0) > teamCount ||
            ranges.reduce((sum, range) => sum + range.max, 0) < teamCount) continue;
        while (counts.reduce((a, b) => a + b, 0) < teamCount) {
          const candidates = counts.map((count, index) => ({index, size:groups[index].length / count}))
            .filter(({index}) => counts[index] < ranges[index].max).sort((a, b) => b.size - a.size);
          counts[candidates[0].index]++;
        }
        return counts;
      }
    }
    throw new Error("이 조건과 팀 수로 편성할 수 없습니다.");
  }
  function balanceGroup(group, count, conditions) {
    const fields = ["height", "ability", "initiative"].filter(field =>
      conditions[field] === "mix" || conditions[field] === true);
    const categories = ["class", "gender"].filter(field => conditions[field] === "mix");
    const dimensions = [
      ...fields.map(field => student => ({상:3, 중:2, 하:1})[student[field]] || 2),
      ...categories.flatMap(field => [...new Set(group.map(student => student[field]))]
        .map(value => student => Number(student[field] === value) * 2))
    ];
    const averages = dimensions.map(fn => group.reduce((sum, student) => sum + fn(student), 0) / group.length);
    const sizes = Array.from({length:count}, (_, i) =>
      Math.floor(group.length / count) + Number(i < group.length % count));
    let best, bestCost = Infinity;
    const genderIndex = categories.includes("gender") && new Set(group.map(s => s.gender)).size === 2 ?
      fields.length + (categories.includes("class") ? new Set(group.map(s => s.class)).size : 0) : -1;
    const teamCost = (sums, capacity) => sums.reduce((cost, sum, i) =>
      cost + (sum - averages[i] * capacity) ** 2 / capacity, 0) +
      (genderIndex >= 0 && capacity >= 2 && [0,capacity*2].includes(sums[genderIndex]) ? 1e6 : 0);
    for (let attempt = 0; attempt < (dimensions.length ? 5 : 1); attempt++) {
      const teams = sizes.map(() => []);
      let pool = shuffled(group);
      if (genderIndex >= 0) {
        const a = pool.filter(student => student.gender === pool[0].gender);
        const b = pool.filter(student => student.gender !== pool[0].gender);
        const eligible = shuffled(sizes.flatMap((size,i) => size >= 2 ? [i] : []));
        for (const i of eligible) {
          if (!a.length || !b.length) break;
          teams[i].push(a.pop(),b.pop());
        }
        pool = shuffled([...a,...b]);
      }
      for (const [i,capacity] of sizes.entries()) {
        while (teams[i].length < capacity) teams[i].push(pool.pop());
      }
      const sums = teams.map(members => dimensions.map(fn =>
        members.reduce((sum, student) => sum + fn(student), 0)));
      for (let turn = 0; dimensions.length && count > 1 && turn < Math.min(12000, group.length * 100); turn++) {
        const first = Math.floor(Math.random() * count);
        const second = (first + 1 + Math.floor(Math.random() * (count - 1))) % count;
        const a = Math.floor(Math.random() * teams[first].length);
        const b = Math.floor(Math.random() * teams[second].length);
        const delta = dimensions.map(fn => fn(teams[second][b]) - fn(teams[first][a]));
        const nextA = sums[first].map((sum, i) => sum + delta[i]);
        const nextB = sums[second].map((sum, i) => sum - delta[i]);
        const previous = teamCost(sums[first], sizes[first]) + teamCost(sums[second], sizes[second]);
        const next = teamCost(nextA, sizes[first]) + teamCost(nextB, sizes[second]);
        if (next < previous - 0.00001) {
          [teams[first][a], teams[second][b]] = [teams[second][b], teams[first][a]];
          sums[first] = nextA;
          sums[second] = nextB;
        }
      }
      const cost = teams.reduce((sum, team, i) => sum + teamCost(sums[i], team.length), 0);
      if (cost < bestCost) { bestCost = cost; best = teams; }
    }
    return best;
  }
  function makeTeams(students, teamCount, conditions, sizeMode = false) {
    if (!students.length) throw new Error("편성할 반과 학생 명단을 선택해 주세요.");
    const groups = partitionRoster(students, conditions);
    let counts;
    if (sizeMode) {
      if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > 1000)
        throw new Error("팀당 인원수는 1~1,000 사이의 정수로 입력해 주세요.");
      counts = groups.map(group => Math.ceil(group.length / teamCount));
      if (counts.reduce((a,b) => a+b,0) > 100)
        throw new Error("100팀을 넘습니다. 팀당 인원수를 늘리거나 분리 조건을 줄여 주세요.");
    } else {
      if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > Math.min(100, students.length))
        throw new Error("팀 수는 선택한 학생 수 이하의 1~100 사이 정수로 입력해 주세요.");
      if (groups.length > teamCount) throw new Error("분리 조건으로 " + groups.length +
        "개 그룹이 생깁니다. 팀 수를 " + groups.length + " 이상으로 늘리거나 분리 조건을 줄여 주세요.");
      counts = allocate(groups, teamCount);
    }
    return shuffled(groups.flatMap((group, index) => balanceGroup(group, counts[index], conditions)))
      .map(team => team.sort((a, b) => a.class.localeCompare(b.class, "ko", {numeric:true}) || a.number - b.number));
  }
  function singletonCandidates(teams, index, conditions) {
    const [student] = teams[index];
    const separate = ["class","gender","height"].filter(field => conditions[field] === "separate");
    return teams.flatMap((members,teamIndex) => teamIndex === index ? [] : members)
      .filter(candidate => separate.every(field => candidate[field] === student[field]));
  }
  function chooseDuplicate(student, candidates, conditions, uses) {
    const score = candidate =>
      Number(conditions.gender === "mix" && candidate.gender === student.gender)*2 +
      Number(conditions.class === "mix" && candidate.class === student.class);
    return shuffled(candidates).sort((a,b) =>
      score(a)-score(b) || (uses.get(a) ?? 0)-(uses.get(b) ?? 0))[0];
  }
  root.TeamBalance = {makeTeams,singletonCandidates,chooseDuplicate};
  if (typeof module !== "undefined" && module.exports) module.exports = root.TeamBalance;
})(globalThis);
