"use strict";
const TeamFixtures = (() => {
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // The circle method gives each pairing once, with one rotating bye if odd.
  function league(ids, limit = Infinity) {
    if (ids.length < 2) return [];
    const ring = [...ids];
    if (ring.length % 2) ring.push(null);
    const count = Math.min(limit,ring.length - 1);
    return Array.from({length:count}, () => {
      const games = [], idle = [];
      for (let i = 0; i < ring.length / 2; i++) {
        const a = ring[i], b = ring[ring.length - 1 - i];
        if (a !== null && b !== null) games.push([a,b]);
        else idle.push(a ?? b);
      }
      ring.splice(1,0,ring.pop());
      return {games,idle};
    });
  }

  // A placement bracket splits each rank band into winners and losers.
  // Byes join the upper band without creating a game or a fake loser.
  function tournament(ids, placement) {
    const stages = [], matches = [], ranks = [];
    const queue = [[ids.map(team => ({team})),1,1]];
    function branch(entries, first, depth) {
      if (entries.length === 1) { ranks[first - 1] = entries[0]; return; }
      const stage = {first,last:first + entries.length - 1,depth,matches:[],idle:[]};
      const upper = [], lower = [];
      const size = 2 ** Math.ceil(Math.log2(entries.length));
      let seeds = [1];
      for (let width = 2; width <= size; width *= 2) seeds = seeds.flatMap(seed => [seed,width + 1 - seed]);
      for (let i = 0; i < seeds.length; i += 2) {
        const a = entries[seeds[i]-1], b = entries[seeds[i+1]-1];
        if (!a || !b) {
          const bye = a ?? b;
          upper.push(bye); stage.idle.push(bye);
          continue;
        }
        const id = matches.length + 1;
        const match = {id,a,b};
        matches.push(match); stage.matches.push(match);
        upper.push({match:id,outcome:"winner"});
        lower.push({match:id,outcome:"loser"});
      }
      stages.push(stage);
      queue.push([upper,first,depth+1]);
      if (placement) queue.push([lower,first+upper.length,depth+1]);
    }
    for (const args of queue) branch(...args);
    return {stages,matches,ranks};
  }
  function resolve(bracket, picks) {
    const outcomes = new Map();
    const teamOf = ref => ref.team ?? outcomes.get(ref.match)?.[ref.outcome];
    for (const {id,a,b} of bracket.matches) {
      const left = teamOf(a), right = teamOf(b), pick = picks.get(id);
      if (left !== undefined && right !== undefined && pick?.left === left && pick?.right === right) {
        outcomes.set(id,{winner:pick.winner,loser:pick.winner === left ? right : left});
      } else picks.delete(id);
    }
    return {outcomes,teamOf};
  }
  function scoreResult(rows, winsNeeded = 1) {
    const scores = [], setWins = [0,0];
    for (const [index,[a,b]] of rows.entries()) {
      if (a === null && b === null) continue;
      if (scores.length !== index || ![a,b].every(value => Number.isSafeInteger(value) && value >= 0)) {
        throw new Error("경기 순서대로 두 팀의 점수를 모두 입력해 주세요.");
      }
      if (a === b) throw new Error("승리 팀을 정할 수 있도록 동점이 아닌 최종 점수를 입력해 주세요.");
      if (setWins.includes(winsNeeded)) throw new Error("승부가 결정된 뒤의 세트는 비워 주세요.");
      scores.push([a,b]);
      setWins[a > b ? 0 : 1]++;
    }
    const winner = setWins.indexOf(winsNeeded);
    if (winner < 0) throw new Error(winsNeeded === 1 ? "두 팀의 최종 점수를 입력해 주세요." :
      "한 팀이 "+winsNeeded+"세트를 이길 때까지 점수를 입력해 주세요.");
    return {winner,scores,...(winsNeeded > 1 ? {setWins} : {})};
  }
  function sharedPlayers(teams) {
    const rosters = teams.map(team => new Set(team.map(student => student.class+":"+student.number)));
    const counts = new Map();
    for (const roster of rosters) {
      for (const student of roster) counts.set(student,(counts.get(student) ?? 0)+1);
    }
    return rosters.map(roster => [...roster].filter(student => counts.get(student) > 1));
  }

  function teamClasses(teams) {
    return teams.map(team => {
      const first = team[0]?.class;
      return first && team.every(student => student.class === first) ? first : undefined;
    });
  }

  function playOrder(phases, capacity = Infinity) {
    const rounds = [], lastClassRound = new Map();
    let previous = new Set();
    for (const phase of phases) {
      const pending = new Set(phase);
      const remainingByClass = new Map(), represented = new Set();
      for (const game of phase) {
        for (const cls of game.classes) remainingByClass.set(cls,(remainingByClass.get(cls) ?? 0)+1);
      }
      while (pending.size) {
        if ([...remainingByClass.keys()].every(cls => represented.has(cls))) represented.clear();
        const round = [], occupied = new Set(), classCounts = new Map();
        const available = [...pending].filter(game => game.players.every(player => !previous.has(player)));
        for (let slot = 0; slot < capacity && available.length; slot++) {
          let bestIndex = -1, bestNewClasses = -1, bestLoad = Infinity, bestRecent = Infinity;
          for (const [index,game] of available.entries()) {
            if (game.resources.some(resource => occupied.has(resource))) continue;
            const newClasses = game.classes.filter(cls => !represented.has(cls)).length;
            if (newClasses < bestNewClasses) continue;
            const load = game.classes.reduce((sum,cls) => sum+(classCounts.get(cls) ?? 0),0);
            const recent = Math.max(-1,...game.classes.map(cls => lastClassRound.get(cls) ?? -1));
            if (newClasses === bestNewClasses) {
              if (load > bestLoad || (load === bestLoad && recent > bestRecent)) continue;
              if (load === bestLoad && recent === bestRecent && game.players.length <= available[bestIndex].players.length) continue;
            }
            bestIndex = index; bestNewClasses = newClasses; bestLoad = load; bestRecent = recent;
          }
          if (bestIndex < 0) break;
          const [game] = available.splice(bestIndex,1);
          pending.delete(game);
          round.push(game);
          for (const resource of game.resources) occupied.add(resource);
          for (const cls of game.classes) {
            represented.add(cls);
            classCounts.set(cls,(classCounts.get(cls) ?? 0)+1);
            const remaining = remainingByClass.get(cls)-1;
            if (remaining) remainingByClass.set(cls,remaining);
            else remainingByClass.delete(cls);
          }
        }
        // If only recently played students remain, leave this round open for rest.
        for (const cls of classCounts.keys()) lastClassRound.set(cls,rounds.length);
        rounds.push(round);
        previous = new Set(round.flatMap(game => game.players));
      }
    }
    return rounds;
  }

  function tournamentOrder(bracket, shared, capacity, classes = []) {
    const possible = new Map(), knownClass = new Map(), phases = [];
    for (const stage of bracket.stages) {
      const phase = phases[stage.depth-1] ??= [];
      for (const {id,a,b} of stage.matches) {
        const playersFor = ref => ref.team === undefined ? possible.get(ref.match) : shared[ref.team];
        const players = [...new Set([...playersFor(a),...playersFor(b)])];
        possible.set(id,players);
        const [left,right] = [a,b].map(ref => ref.team === undefined ? knownClass.get(ref.match) : classes[ref.team]);
        if (left && left === right) knownClass.set(id,left);
        phase.push({id,resources:players,players,classes:[...new Set([left,right].filter(Boolean))]});
      }
    }
    return playOrder(phases,capacity);
  }

  function leagueOrder(cards, shared, capacity, classes = []) {
    const phases = new Map();
    for (const [cardIndex,card] of cards.entries()) {
      const phaseNumber = card.phase ?? (card.title.includes("2차 · ") ? 2 : 1);
      if (!phases.has(phaseNumber)) phases.set(phaseNumber,[]);
      const phase = phases.get(phaseNumber);
      for (const [roundIndex,round] of card.rounds.entries()) {
        for (const [gameIndex,[a,b]] of round.games.entries()) {
          const players = [...new Set([...shared[a],...shared[b]])];
          phase.push({a,b,cardIndex,roundIndex,key:[cardIndex,roundIndex,gameIndex].join(":"),
            players,resources:[a,b,...players],classes:[...new Set([classes[a],classes[b]].filter(Boolean))]});
        }
      }
    }
    const phasesInOrder = [...phases].sort(([a],[b]) => a-b).map(([,games]) =>
      games.sort((a,b) => a.roundIndex-b.roundIndex));
    return playOrder(phasesInOrder,capacity);
  }

  return {shuffle,league,tournament,resolve,scoreResult,sharedPlayers,teamClasses,tournamentOrder,leagueOrder};
})();
