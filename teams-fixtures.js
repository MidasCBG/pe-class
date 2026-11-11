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
  function sharedPlayers(teams) {
    const rosters = teams.map(team => new Set(team.map(student => student.class+":"+student.number)));
    const counts = new Map();
    for (const roster of rosters) {
      for (const student of roster) counts.set(student,(counts.get(student) ?? 0)+1);
    }
    return rosters.map(roster => [...roster].filter(student => counts.get(student) > 1));
  }

  function playOrder(phases, capacity = Infinity) {
    const rounds = [];
    let previous = new Set();
    for (const phase of phases) {
      let shared = phase.filter(game => game.players.length);
      let fillers = phase.filter(game => !game.players.length);
      while (shared.length || fillers.length) {
        const round = [], occupied = new Set();
        function place(game) {
          if (round.length >= capacity || game.resources.some(resource => occupied.has(resource))) return false;
          round.push(game);
          for (const resource of game.resources) occupied.add(resource);
          return true;
        }
        // Prefer teams whose shared students did not play in the previous round.
        shared = shared.filter(game => game.players.some(player => previous.has(player)) || !place(game));
        if (!round.length && shared.length) {
          if (fillers.length) place(fillers.shift());
          else shared = shared.filter(game => !place(game));
        } else {
          // Save some unrelated matches to use as breaks for the remaining shared matches.
          const fillerBudget = Math.max(0,fillers.length-shared.length);
          fillers = fillers.filter((game,index) => index >= fillerBudget || !place(game));
        }
        rounds.push(round);
        previous = new Set(round.flatMap(game => game.players));
      }
    }
    return rounds;
  }

  function tournamentOrder(bracket, shared, capacity) {
    const possible = new Map(), phases = [];
    for (const stage of bracket.stages) {
      const phase = phases[stage.depth-1] ??= [];
      for (const {id,a,b} of stage.matches) {
        const playersFor = ref => ref.team === undefined ? possible.get(ref.match) : shared[ref.team];
        const players = [...new Set([...playersFor(a),...playersFor(b)])];
        possible.set(id,players);
        phase.push({id,resources:players,players});
      }
    }
    return playOrder(phases,capacity);
  }

  function leagueOrder(cards, shared, capacity) {
    const phases = new Map();
    for (const [cardIndex,card] of cards.entries()) {
      const phaseNumber = card.phase ?? (card.title.includes("2차 · ") ? 2 : 1);
      if (!phases.has(phaseNumber)) phases.set(phaseNumber,[]);
      const phase = phases.get(phaseNumber);
      for (const [roundIndex,round] of card.rounds.entries()) {
        for (const [gameIndex,[a,b]] of round.games.entries()) {
          const players = [...new Set([...shared[a],...shared[b]])];
          phase.push({a,b,cardIndex,roundIndex,key:[cardIndex,roundIndex,gameIndex].join(":"),
            players,resources:[a,b,...players]});
        }
      }
    }
    const phasesInOrder = [...phases].sort(([a],[b]) => a-b).map(([,games]) =>
      games.sort((a,b) => a.roundIndex-b.roundIndex));
    return playOrder(phasesInOrder,capacity);
  }

  return {shuffle,league,tournament,resolve,sharedPlayers,tournamentOrder,leagueOrder};
})();
