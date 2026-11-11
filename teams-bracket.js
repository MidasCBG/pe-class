"use strict";
const TeamBracket = (() => {
  const cardWidth = 152, cardHeight = 104, columnStep = 178, rowStep = 118;

  function diagrams(bracket, resolved, teamName) {
    const {teamOf,outcomes} = resolved;
    const matches = new Map(bracket.matches.map(match => [match.id,match]));
    const byes = new Set(bracket.stages.flatMap(stage => stage.idle));
    const winnerInputs = new Set();
    for (const match of bracket.matches) {
      for (const ref of [match.a,match.b]) {
        if (ref.outcome === "winner") winnerInputs.add(ref.match);
      }
    }
    const rankByMatch = new Map();
    bracket.ranks.forEach((ref,index) => {
      if (ref.outcome === "winner") rankByMatch.set(ref.match,index+1);
    });
    function label(ref) {
      const team = teamOf(ref);
      const name = team !== undefined ? teamName(team) :
        ref.match+"경기 "+(ref.outcome === "winner" ? "승자" : "패자");
      return byes.has(ref) ? name+" · 부전승" : name;
    }
    return bracket.matches.filter(match => !winnerInputs.has(match.id)).sort((a,b) =>
      rankByMatch.get(a.id)-rankByMatch.get(b.id)).map(final => {
      const nodes = [], lines = [];
      function addNode(match,x,y) {
        const refs = [match.a,match.b];
        const participants = refs.map(teamOf);
        const winner = outcomes.get(match.id)?.winner;
        const node = {id:match.id,x,y,final:match === final,participants,slots:refs.map((ref,index) => ({
          label:label(ref), won:winner !== undefined && participants[index] === winner
        }))};
        nodes.push(node);
        return node;
      }
      function connect(child,parent,side,slot) {
        const fromX = child.x + (side < 0 ? cardWidth : 0);
        const toX = parent.x + (side > 0 ? cardWidth : 0);
        const fromY = child.y + cardHeight/2;
        const toY = parent.y + 44 + slot*34;
        const bend = (fromX+toX)/2;
        lines.push([[fromX,fromY],[bend,fromY],[bend,toY],[toX,toY]]);
      }
      function branch(ref,side) {
        if (ref.outcome !== "winner") return null;
        const first = nodes.length;
        const firstLine = lines.length;
        let nextRow = 0;
        function walk(match,depth) {
          const children = [match.a,match.b].map(input =>
            input.outcome === "winner" ? walk(matches.get(input.match),depth+1) : null);
          const center = children.map(child => child?.y ?? nextRow++ * rowStep);
          const node = addNode(match,side*depth*columnStep,(center[0]+center[1])/2);
          children.forEach((child,index) => { if (child) connect(child,node,side,index); });
          return node;
        }
        const root = walk(matches.get(ref.match),1);
        const offset = root.y;
        for (const node of nodes.slice(first)) node.y -= offset;
        for (const line of lines.slice(firstLine)) {
          for (const point of line) point[1] -= offset;
        }
        return root;
      }
      const left = branch(final.a,-1);
      const right = branch(final.b,1);
      const center = addNode(final,0,0);
      if (left) connect(left,center,-1,0);
      if (right) connect(right,center,1,1);
      const halfWidth = Math.max(...nodes.map(node => Math.abs(node.x)));
      const minY = Math.min(...nodes.map(node => node.y));
      const width = halfWidth*2+cardWidth+24;
      const height = Math.max(...nodes.map(node => node.y))-minY+cardHeight+24;
      for (const node of nodes) { node.x += 12+halfWidth; node.y += 12-minY; }
      for (const line of lines) for (const point of line) { point[0] += 12+halfWidth; point[1] += 12-minY; }
      const rank = rankByMatch.get(final.id);
      const title = rank === 1 ? "결승 대진" : rank+"·"+(rank+1)+"위 결정전";
      return {title,width,height,nodes,lines};
    });
  }
  return {diagrams,cardWidth,cardHeight};
})();
