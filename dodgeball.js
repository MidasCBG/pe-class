"use strict";

(() => {
  const lessons = {
    court: {
      tab: "경기장", title: "내야와 외야는 어디일까요?",
      lead: "같은 팀의 외야는 상대 팀 내야의 뒤와 양옆에 있어요.",
      cases: [
        { name: "코트와 경계선", result: "양 팀 내야 · 18 m × 9 m",
          detail: "2026 전국학교스포츠클럽 축전 초등부 기준이에요. 각 팀 내야는 9 m × 9 m이고, 외야는 상대 내야 뒤에서 양옆의 4.5 m 지점까지 이어져요.", diagram: "dimensions" },
        { name: "처음 서는 자리", result: "한 팀 12명 · 내야 11명, 외야 1명",
          detail: "파랑팀 외야수는 빨강팀 내야 바깥에, 빨강팀 외야수는 파랑팀 내야 바깥에 서요. 초등부 공인구 4-1호 1개를 사용해요.", diagram: "lineup" },
        { name: "아웃 뒤 이동", result: "볼 데드존 → 우리 팀 외야",
          detail: "아웃된 내야수는 상대 구역을 가로지르지 않고 바깥 통로로 이동해요. 자기 팀 외야에 도착하면 다시 패스하거나 공격할 수 있어요.",
          diagram: "route" }
      ]
    },
    restart: {
      tab: "시작·재개", title: "경기는 어떻게 시작하고 다시 이어갈까요?",
      lead: "처음에는 점프볼을 하고, 경기가 멈춘 뒤에는 공을 머리 위로 들어요.",
      cases: [
        { name: "점프볼", result: "중앙에서 점프볼",
          detail: "정렬하고 인사한 뒤 양 팀 대표가 자기 진영 맞은편의 중앙선 양쪽에 서요. 주심이 띄운 공이 가장 높이 오른 뒤 자기 팀 쪽으로 쳐서 보내요.",
          frames: [
            { label: "양 팀 대표가 상대 내야 쪽에 서요", players: [[450,205,"blue"],[390,205,"red"]], ball: [420,222] },
            { label: "주심이 공을 위로 띄워요", sound: "whistle", players: [[450,205,"blue"],[390,205,"red"]], path: "M420 222V131" },
            { label: "파랑 대표가 자기 팀 쪽으로 쳐 보내요", sound: "throw", contact: "catch", players: [[450,192,"blue"],[390,192,"red"],[242,193,"blue"]], path: "M420 131Q345 122 263.25 193" }
          ] },
        { name: "점프볼 뒤 첫 공격", result: "내야에서 받으면 한 번 패스한 뒤 공격",
          detail: "내야에서 공을 확보했다면 먼저 같은 팀 외야로 패스해요. 점프볼에 참여한 선수는 공을 직접 잡아 첫 공격을 할 수 없어요.",
          frames: [
            { label: "파랑 내야가 공을 확보", players: [[242,202,"blue"],[624,19,"blue"],[560,223,"red"]], ball: [263.25,202] },
            { label: "파랑 내야에서 옆쪽 파랑 외야로 패스", sound: "throw", contact: "catch", players: [[242,202,"blue"],[624,19,"blue"],[560,223,"red"]], path: "M263.25 202Q405 27 602.75 19" },
            { label: "파랑 외야가 빨강 내야를 공격", sound: "throw", contact: "impact", players: [[242,202,"blue"],[624,19,"blue"],[560,223,"red"]], path: "M602.75 19Q628 134 560 223" }
          ] },
        { name: "볼 아웃·반칙 뒤 재개", result: "공 들기 → 휘슬 기다리기 → 경기 재개",
          detail: "공을 받은 팀은 지정된 구역에서 공을 머리 위로 들어요. 주심이 휘슬을 분 뒤 패스하거나 공격해요.", diagram: "restart" },
        { name: "같은 외야에서 재개", result: "공을 갖고 있던 외야가 그대로 재개",
          detail: "내야 재개가 원칙이에요. 외야수가 공을 잡은 상태에서 주심에 의해 경기가 잠시 중단되었다면 다시 그 외야에서 재개해요.", diagram: "restart", outside: true },
        { name: "휘슬 전에 던짐", result: "재개 동작 파울",
          detail: "공을 머리 위로 드는 동작을 생략하거나 휘슬 전에 던지면 반칙이에요. 상대 팀 내야에 공을 주고 주심 신호에 맞춰 재개해요.", diagram: "restart", early: true }
      ]
    },
    ball: {
      tab: "볼 아웃", title: "코트 밖으로 나간 공은 누구 공일까요?",
      lead: "내야 밖이라도 외야 안이면 경기 중이에요. 외야 경계까지 넘었다면 마지막으로 공을 건드린 선수를 확인해요.",
      cases: [
        { name: "아무도 안 맞고 밖으로", result: "빨강 내야 공",
          detail: "파랑이 던진 공이 아무에게도 닿지 않고 코트 밖으로 나갔어요. 파랑 내야에서 던졌든 외야에서 던졌든 빨강 내야에서 재개해요.",
          frames: [
            { label: "파랑 내야수가 던져요", players: [[265,199,"blue"],[550,252,"red"]], ball: [286.25,199] },
            { label: "노터치 · 외야 경계 밖", sound: "throw", players: [[265,199,"blue"],[550,252,"red"]], path: "M286.25 199Q390 124 495 20" },
            { label: "빨강 내야에서 재개", sound: "whistle", owner: "red-in", players: [[550,252,"red"]], ball: [550,230.75] }
          ] },
        { name: "내야수에 닿고 밖으로", result: "파랑 내야 공 · 빨강 내야수 아웃",
          detail: "파랑이 던진 공이 바닥에 닿기 전에 빨강 내야수 몸에 맞고 볼 데드존으로 나갔어요. 아웃된 빨강 선수는 자기 팀 외야로 이동하고, 파랑 내야에서 재개해요.",
          diagram: "route" },
        { name: "외야수에 닿고 밖으로", result: "파랑 내야 공",
          detail: "파랑 외야수가 같은 팀 내야수에게 패스했어요. 내야수가 공을 놓쳐 뒤로 빠졌고, 빨강 외야수에게 스친 뒤 외야 경계 밖으로 나갔어요. 마지막으로 닿은 선수가 빨강 외야수여서 파랑 공이에요.",
          continuousFlight: { path: "M605 28.51L88 285", rebound: "M88 285Q55 305 21 327" },
          frames: [
            { label: "파랑 외야수가 공을 갖고 있어요", players: [[624,19,"blue"],[245,229,"blue"],[88,285,"red"]], ball: [605,28.51] },
            { label: "파랑 내야에서 재개", sound: "whistle", owner: "blue-in", players: [[624,19,"blue"],[245,229,"blue"],[88,285,"red"]], ball: [245,207.75] }
          ] },
        { name: "외야 안에 떨어짐", result: "볼 아웃 아님 · 외야에서 경기 계속", visualLabel: "경기 계속",
          detail: "공이 외야 바깥 경계를 넘지 않았어요. 파랑 외야 구역 안에 공이 있으므로 파랑 외야수가 공을 가지고 그대로 경기를 진행하면 돼요.",
          frames: [
            { label: "파랑 내야에서 공을 던져요", players: [[251,208,"blue"],[753,213,"blue"]], ball: [272.25,208] },
            { label: "공이 파랑 외야 안에 떨어져요", sound: "throw", contact: "impact", players: [[251,208,"blue"],[753,213,"blue"]], path: "M272.25 208Q506 102 744 255" },
            { label: "파랑 외야가 공을 잡아요", sound: "catch", owner: "blue-out", players: [[753,238,"blue"]], ball: [731.75,238] }
          ] }
      ]
    },
    defense: {
      tab: "공격·아웃", title: "맞거나 잡았을 때 어떻게 판정할까요?",
      lead: "공이 바닥에 닿았는지, 어디에 맞았는지, 공중에서 잡았는지를 확인해요.",
      cases: [
        { name: "몸에 바로 맞음", result: "빨강 내야수 아웃",
          detail: "상대의 정상적인 공격이 바닥에 닿기 전에 몸에 맞고 떨어지면 아웃이에요. 맞은 선수는 자기 팀 외야로 이동해요.",
          frames: [
            { label: "파랑이 빨강 내야를 공격", sound: "throw", contact: "impact", players: [[252,213,"blue"],[564,216,"red"]], path: "M273.25 213Q406 146 564 216" },
            { label: "빨강 내야수 아웃", players: [[252,213,"blue"],[564,216,"red"]], path: "M564 216L579 257", mark: [564,216] }
          ] },
        { name: "바닥에 먼저 닿음", result: "빨강 내야수 세이프",
          detail: "공이 바닥에 먼저 닿고 몸에 맞았으므로 내야에 남아요.",
          frames: [
            { label: "공이 바닥에 먼저 닿아요", sound: "throw", contact: "impact", players: [[252,213,"blue"],[564,216,"red"]], path: "M273.25 213Q377 177 495 255", mark: [495,255] },
            { label: "튀어 오른 공에 맞아도 세이프", contact: "impact", players: [[252,213,"blue"],[564,216,"red"]], path: "M495 255Q529 196 564 216" }
          ] },
        { name: "공중에서 바로 잡음", result: "빨강팀 공격권",
          detail: "상대의 공을 바닥에 닿기 전에 바로 잡으면 아웃 없이 잡은 팀의 공격으로 바뀌어요.",
          frames: [
            { label: "파랑팀 공격", sound: "throw", contact: "catch", players: [[252,213,"blue"],[564,216,"red"]], path: "M273.25 213Q412 148 542.75 216" },
            { label: "빨강이 두 손으로 잡아요", owner: "red-in", players: [[252,213,"blue"],[564,216,"red"]], ball: [542.75,216] }
          ] },
        { name: "머리·얼굴에 맞음", result: "헤드어택 · 빨강 내야 공",
          detail: "이 장면처럼 상대의 얼굴 높이를 직접 공격하면 반칙이에요. 맞은 선수는 내야에 남고 수비하던 빨강팀이 공을 받아 재개해요.",
          frames: [
            { label: "공이 얼굴 높이로 날아와요", sound: "throw", contact: "impact", players: [[252,213,"blue"],[564,216,"red"]], path: "M270.18 202Q399 159 564 197", mark: [564,197] },
            { label: "빨강 내야 공", sound: "whistle", owner: "red-in", players: [[564,216,"red"]], ball: [564,194.75] }
          ] },
        { name: "두 명이 연달아 맞음", result: "공이 그대로 떨어지면 맞은 두 선수 아웃",
          detail: "바닥에 닿기 전에 빨강 내야수 두 명이 연달아 맞고 공이 떨어졌어요. 공중에서 다른 선수가 잡는 등 접촉이 이어지는 경우에는 주심 판정을 확인해요.",
          frames: [
            { label: "첫 번째 내야수가 맞아요", sound: "throw", contact: "impact", players: [[252,213,"blue"],[514,196,"red"],[624,228,"red"]], path: "M273.25 213Q398 141 514 196" },
            { label: "두 번째 내야수에게도 닿고 떨어져요", contact: "impact", players: [[252,213,"blue"],[514,196,"red"],[624,228,"red"]], path: "M514 196L624 228L650 267", mark: [624,228] }
          ] }
      ]
    },
    fouls: {
      tab: "패스·반칙", title: "패스와 공격에서 무엇을 지켜야 할까요?",
      lead: "같은 팀의 내야와 외야가 패스해요. 공을 잡으면 5초 안에 다음 동작을 해요.",
      cases: [
        { name: "패스 3번 뒤 공격", result: "네 번째는 상대 내야를 공격",
          detail: "공격권을 가진 동안 패스는 세 번까지예요. 네 번째 던지기도 같은 팀에게 보내면 포 패스 반칙이에요.",
          frames: [
            { label: "1회 · 파랑 내야 → 파랑 외야", sound: "throw", contact: "catch", players: [[245,226,"blue"],[750,194,"blue"],[567,227,"red"]], path: "M266.25 226Q485 107 728.75 194" },
            { label: "2회 · 파랑 외야 → 파랑 내야", sound: "throw", contact: "catch", players: [[245,226,"blue"],[750,194,"blue"],[567,227,"red"]], path: "M728.75 194Q485 107 266.25 226" },
            { label: "3회 · 파랑 내야 → 파랑 외야", sound: "throw", contact: "catch", players: [[245,226,"blue"],[750,194,"blue"],[567,227,"red"]], path: "M266.25 226Q485 107 728.75 194" },
            { label: "4번째 던지기 · 빨강 내야 공격", sound: "throw", contact: "impact", players: [[245,226,"blue"],[750,194,"blue"],[567,227,"red"]], path: "M728.75 194Q663 185 567 227" }
          ] },
        { name: "같은 구역끼리 패스", result: "더블 패스 · 상대 내야 공",
          detail: "내야수끼리 또는 외야수끼리 패스하면 반칙이에요. 이 장면에서는 파랑 내야끼리 주고받았으므로 빨강 내야에서 재개해요.",
          frames: [
            { label: "파랑 내야수가 같은 내야수에게 패스", sound: "throw", contact: "catch", players: [[212,223,"blue"],[340,172,"blue"],[555,219,"red"]], path: "M233.25 223Q264 151 318.75 172" },
            { label: "빨강 내야에서 재개", sound: "whistle", owner: "red-in", players: [[555,219,"red"]], ball: [555,197.75] }
          ] },
        { name: "5초를 넘김", result: "5초 룰 · 상대 내야 공",
          detail: "공을 잡은 선수는 5초 안에 패스하거나 공격해요. 공을 든 채 시간을 넘겨 반칙이 선언되면 상대 내야에서 재개해요.",
          frames: [
            { label: "파랑 내야수가 공을 잡아요", duration: 500, players: [[260,218,"blue"],[558,218,"red"]], ball: [260,196.75] },
            ...[1, 2, 3, 4, 5].map(count => ({
              label: `공을 잡은 지 ${count}초`, count, duration: 500,
              players: [[260,218,"blue"],[558,218,"red"]], ball: [260,196.75]
            })),
            { label: "5초 초과 · 빨강 내야에서 재개", sound: "whistle", owner: "red-in", players: [[260,218,"blue"],[558,218,"red"]], ball: [558,196.75] }
          ] },
        { name: "선을 밟고 던짐", result: "오버라인 · 맞아도 세이프",
          detail: "공격자가 자기 구역 선을 밟거나 넘어 던지면 반칙이에요. 맞은 선수는 내야에 남고 상대 내야에서 재개해요. 수비 내야수가 두 발 모두 자기 내야 밖으로 나가면 아웃이에요.",
          frames: [
            { label: "파랑 공격자의 발이 중앙선에 닿아요", sound: "throw", contact: "whistle", players: [[414,219,"blue"],[575,225,"red"]], path: "M435.25 219Q492 153 575 225", mark: [420,219] },
            { label: "빨강 내야에서 재개", sound: "whistle", owner: "red-in", players: [[575,225,"red"]], ball: [575,203.75] }
          ] },
        { name: "상대 바닥의 공을 가져감", result: "홀딩 · 상대 내야 공",
          detail: "상대 구역 바닥에 있거나 구르는 공을 손을 뻗어 가져오면 반칙이에요. 공중에 뜬 공은 경계선을 지키며 잡을 수 있어요.",
          frames: [
            { label: "공이 빨강 내야 바닥에 있어요", players: [[397,217,"blue"],[575,219,"red"]], ball: [449,217] },
            { label: "파랑 선수가 손을 뻗어 공을 끌어와요", players: [[397,217,"blue"],[575,219,"red"]], ball: [420,217], reach: { from: 449, shoulder: 406 } },
            { label: "홀딩 반칙 · 빨강 내야에서 재개", sound: "whistle", owner: "red-in", players: [[397,217,"blue"],[575,219,"red"]], ball: [575,197.75] }
          ] },
        { name: "아웃 뒤 경기 방해", result: "인터페어 · 빨강 내야 공",
          detail: "빨강이 던진 공에 맞아 아웃된 파랑 선수가 자기 팀 외야로 이동하다가, 가까이에 떨어진 공에 손을 뻗어 건드렸어요. 아웃된 선수가 고의로 공을 건드리면 인터페어예요. 빨강 내야에서 재개해요.",
          diagram: "route", route: "interference" },
        { name: "데드존 파울", result: "데드존 파울 · 빨강 내야 공",
          detail: "아웃된 파랑 선수는 볼 데드존을 따라 자기 팀 외야로 가야 해요. 빨강 내야를 밟아 데드존 파울이 선언되면, 공이 파랑 내야에 떨어졌어도 빨강 내야에서 재개해요.",
          diagram: "route", route: "deadZone" }
      ]
    },
    score: {
      tab: "세트·승패", title: "세트가 끝나면 어느 팀이 이길까요?",
      lead: "종료 휘슬이 울리면 내야에 남은 선수만 세어요.",
      cases: [
        { name: "내야 인원 세기", result: "파랑팀 세트 승",
          detail: "5분이 끝났을 때 파랑 내야에 7명, 빨강 내야에 4명이 남았다면 파랑팀이 세트를 이겨요. 외야에 있는 선수는 세지 않아요.", score: true },
        { name: "조별리그", result: "2026 전국 축전 4월 공개 요강 예시",
          detail: "조별리그는 세트당 5분, 2세트예요. 경기 승리는 3점, 무승부는 1점, 패배는 0점이에요.",
          cards: [["경기 시간","세트당 5분 · 2세트"],["경기 승점","승 3 · 무 1 · 패 0"],["승점이 같으면","내야 총득점 → 맞대결 → 2분 연장 → 골든 볼"]],
          terms: ["내야 총득점", "맞대결", "2분 연장", "골든 볼"] },
        { name: "결선 토너먼트", result: "2026 전국 축전 4월 공개 요강 예시",
          detail: "세트가 끝날 때 양 팀 내야에 남은 인원이 같으면 그 세트는 무승부예요. 파랑과 빨강이 한 세트씩 이기고 한 세트를 비기면 3세트를 해도 세트 스코어는 1 대 1이에요.",
          cards: [["경기 시간","세트당 5분 · 3세트"],["승패","세트 스코어"],["세트 스코어가 같으면","내야 총득점 → 2분 연장 → 골든 볼"]],
          terms: ["세트 스코어", "내야 총득점", "2분 연장", "골든 볼"] }
      ]
    }
  };

  const scoreTerms = {
    "내야 총득점": "각 세트가 끝났을 때 내야에 남은 우리 팀 선수 수를 더한 점수예요. 1세트에 7명, 2세트에 4명이 남았다면 11점이에요.",
    "맞대결": "순위가 같은 두 팀이 서로 경기했을 때의 결과를 봐요. 그 경기에서 이긴 팀이 앞서요. 요강에서는 ‘승자승’이라고 해요.",
    "세트 스코어": "각 팀이 이긴 세트 수예요. 내야 인원이 7 대 4, 3 대 5, 5 대 5였다면 세트 스코어는 1 대 1이고, 내야 총득점은 15 대 14예요.",
    "2분 연장": "앞의 기준으로도 승부가 나지 않으면 2분 더 경기해요.",
    "골든 볼": "2분 연장전도 비겼을 때 승자를 정하는 마지막 절차예요. 진행 방법은 대회 안내를 따라요."
  };

  const get = id => document.getElementById("dodgeball-" + id);
  const sound = setupLessonSound(get("sound"), get("whistle"));
  const nav = get("nav");
  const choices = get("cases");
  const visual = get("visual");
  const play = get("play");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const colors = { blue: "#7ab8ed", red: "#f28a7a" };
  const blueOut = {
    players: [[320,218,"blue"],[581,213,"red"]],
    ball: [559.75,213], path: "M559.75 213Q454 165 320 218",
    ready: "빨강 내야수가 공을 갖고 있어요", throwLabel: "빨강 내야수가 공을 던져요",
    hit: "파랑 내야수 아웃"
  };
  const outRoutes = {
    court: {
      ...blueOut,
      rebound: "M320 218Q297 242 279 265",
      walk: "M320 218V-38Q320 -48 330 -48H639Q650 -48 650 -37V18",
      arrived: "파랑 외야 도착"
    },
    interference: {
      ...blueOut,
      rebound: "M320 218Q321 190 351 153",
      walk: "M320 218Q320 184 322 153",
      moving: "아웃된 파랑 선수가 외야로 이동해요",
      arrived: "공을 건드렸어요 · 인터페어",
      touchX: 343.25,
      restart: { label: "인터페어 · 빨강 내야에서 재개", owner: "red-in", ball: [581,191.75] }
    },
    deadZone: {
      ...blueOut,
      rebound: "M320 218Q297 242 279 265",
      walk: "M320 218Q373 219 455 197",
      moving: "파랑 선수가 상대 내야 쪽으로 이동해요",
      arrived: "빨강 내야에 들어갔어요 · 데드존 파울",
      finishSound: "whistle",
      restart: { label: "빨강 내야에서 재개", owner: "red-in", ball: [581,191.75] }
    },
    ball: {
      players: [[566,185,"red"],[245,220,"blue"]],
      ball: [266.25,220], path: "M266.25 220Q411 135 566 185",
      rebound: "M566 185Q542 100 515 24",
      walk: "M566 185Q518 220 518 265V441Q518 454 505 454H237Q224 454 224 441V385",
      ready: "파랑 내야수가 공을 갖고 있어요", throwLabel: "파랑 내야수가 공을 던져요",
      hit: "빨강 내야수 아웃 · 공은 볼 데드존으로", arrived: "빨강 외야 도착",
      restart: { label: "파랑 내야에서 재개", owner: "blue-in", ball: [245,198.75] }
    }
  };
  const regions = {
    "blue-in": "M140 65H420V345H140Z",
    "red-in": "M420 65H700V345H420Z",
    "red-out": "M280 -28.33H46.67V438.33H280V345H140V65H280Z",
    "blue-out": "M560 -28.33H793.33V438.33H560V345H700V65H560Z"
  };
  const restartSteps = [
    ["공 들기", "공을 머리 위로 들어요."],
    ["휘슬 기다리기", "주심이 공과 위치를 확인해요."],
    ["경기 재개", "휘슬이 울리면 패스하거나 공격해요.", "whistle"]
  ];
  const earlySteps = [
    restartSteps[0],
    ["휘슬 전 투구", "신호가 울리기 전에 던졌어요.", "throw"],
    ["재개 동작 파울", "상대 내야에 공을 줘요.", "whistle"]
  ];
  let topic = "court";
  let selected = 0;
  let playback = 0;
  let contactTimer = 0;
  let routeFrame = 0;
  const current = () => lessons[topic].cases[selected];

  function label(x, y, value, size = 23) {
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="#fff3d7" font-size="${size}" font-weight="750">${value}</text>`;
  }

  function court(item, frame, animate) {
    const lineup = Array.from({ length: 11 }, (_, index) => {
      const x = 183 + (index % 4) * 61;
      const y = 164 + Math.floor(index / 4) * 64;
      return [[x, y, "blue"], [840 - x, y, "red"]];
    }).flat();
    const route = item.diagram === "route" ? outRoutes[item.route ?? topic] : null;
    const players = item.diagram === "lineup" ? [...lineup, [85,178,"red"], [755,178,"blue"]] : frame.players ?? [];
    const athletes = players.map(([x,y,team], index) =>
      `<circle ${route && index === 0 ? 'class="dodgeball-walker"' : ""} cx="${x}" cy="${y}" r="11" fill="${colors[team]}" stroke="#252014" stroke-width="2.5"/>`).join("");
    const possession = frame.owner
      ? `<path d="${regions[frame.owner]}" fill="#ffe38d" fill-opacity=".21" stroke="#ffe38d" stroke-width="4"/>`
      : "";
    const dimensions = item.diagram === "dimensions" ? `
      <path d="M22 -28.33V438.33M15 -28.33h14M15 438.33h14
               M560 -46H793.33M560 -53v14M793.33 -53v14
               M300 345V438.33M293 345h14M293 438.33h14
               M140 321H280M140 314v14M280 314v14M420 321H560M420 314v14M560 314v14"
        fill="none" stroke="#efca6d" stroke-width="2"/>
      <g transform="translate(15 205) rotate(-90)">${label(0,0,"15 m",21)}</g>
      ${label(677,-52,"7.5 m",22)}
      ${label(334,401,"3 m",21)}
      ${label(210,309,"4.5 m",20)}${label(490,309,"4.5 m",20)}
      ${label(280,170,"9 m × 9 m",24)}${label(560,170,"9 m × 9 m",24)}
      ${label(420,95,"중앙선",17)}
      ${label(420,212,"⌀ 3 m",20)}` : "";
    const reboundPath = route?.rebound ?? frame.rebound;
    const movement = frame.path ? `<path class="dodgeball-flight" d="${frame.path}" fill="none" stroke="#ffe082" stroke-width="3" stroke-dasharray="7 7"${reboundPath ? ' visibility="hidden"' : ""}/>` : "";
    const ballTrails = frame.path && reboundPath ? `
      <polyline class="dodgeball-ball-trail" fill="none" stroke="#ffe082" stroke-width="3" stroke-dasharray="7 7"/>
      <polyline class="dodgeball-rebound-trail" fill="none" stroke="#ffe082" stroke-width="3" stroke-dasharray="7 7"/>
      <path class="dodgeball-rebound" d="${reboundPath}" fill="none" visibility="hidden"/>` : "";
    const walk = route && frame.path ? `<path class="dodgeball-walk" d="${route.walk}" fill="none" visibility="hidden"/>
      <polyline class="dodgeball-walk-trail" fill="none" stroke="${colors[route.players[0][2]]}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>
      ${route.touchX ? `<line class="dodgeball-touch-arm" stroke="${colors.blue}" stroke-width="7" stroke-linecap="round" visibility="hidden"/>` : ""}
      <circle class="dodgeball-impact" cx="${route.players[0][0]}" cy="${route.players[0][1]}" r="20" fill="none" stroke="#ffdf77" stroke-width="4" opacity="0"/>` : "";
    const mark = frame.mark ? `<circle cx="${frame.mark[0]}" cy="${frame.mark[1]}" r="19" fill="none" stroke="#ffad87" stroke-width="3"/>` : "";
    const count = frame.count ? label(frame.ball[0], frame.ball[1] - 31, frame.count, 36) : "";
    const arm = frame.reach ? `<g transform="translate(${frame.reach.shoulder} ${frame.ball[1]})">
      <path class="dodgeball-reaching-arm" d="M0 0h${frame.ball[0] - frame.reach.shoulder - 9}" fill="none" stroke="${colors.blue}" stroke-width="7" stroke-linecap="round"/>
    </g>` : "";
    const ball = frame.ball || frame.path ? `<g class="dodgeball-ball" transform="translate(${(frame.ball || [0,0]).join(" ")})">
      <circle r="8" fill="#fbd54e" stroke="#242018" stroke-width="2"/><path d="M-7 -1 1-3 5-6M1-3 2 5 6 5" stroke="#29251b" stroke-width="1.5" fill="none"/>
    </g>` : "";
    visual.innerHTML = `<svg viewBox="0 -76 840 552" role="img" aria-label="${frame.label || item.result}. 왼쪽은 파랑 내야와 빨강 외야, 오른쪽은 빨강 내야와 파랑 외야입니다.">
      <path d="${regions["red-out"]}" fill="#633c37" stroke="#f1e0b5" stroke-width="2.5"/>
      <path d="${regions["blue-out"]}" fill="#344d61" stroke="#f1e0b5" stroke-width="2.5"/>
      <path d="${regions["blue-in"]}" fill="#284358"/><path d="${regions["red-in"]}" fill="#503331"/>
      <path d="M140 65H700V345H140ZM420 65V345" fill="none" stroke="#f1e0b5" stroke-width="2.5"/>
      ${possession}
      <circle cx="420" cy="205" r="46.67" fill="#443e50" fill-opacity=".65" stroke="#f1e0b5" stroke-width="2.5"/>
      ${label(280,127,"파랑 내야",27)}${label(560,127,"빨강 내야",27)}
      ${label(96,232,"빨강 외야",19)}${label(744,232,"파랑 외야",19)}
      ${topic === "court" || route ? label(420,27,"볼 데드존",22) : ""}
      ${dimensions}${ballTrails}${walk}${movement}${arm}${athletes}${mark}${ball}${count}
    </svg>`;
    if (frame.reach && animate && !reducedMotion.matches) {
      const [x, y] = frame.ball;
      const { from, shoulder } = frame.reach;
      const reached = (from - shoulder - 9) / (x - shoulder - 9);
      const timing = { duration: 780, easing: "ease-in-out" };
      visual.querySelector(".dodgeball-reaching-arm").animate([
        { transform: "scaleX(0)" },
        { transform: `scaleX(${reached})`, offset: .55 },
        { transform: "scaleX(1)" }
      ], timing);
      visual.querySelector(".dodgeball-ball").animate([
        { transform: `translate(${from}px, ${y}px)` },
        { transform: `translate(${from}px, ${y}px)`, offset: .55 },
        { transform: `translate(${x}px, ${y}px)` }
      ], timing);
    }
    const path = visual.querySelector(".dodgeball-flight");
    if (!path || reboundPath) return;
    const dot = visual.querySelector(".dodgeball-ball");
    const length = path.getTotalLength();
    const destination = path.getPointAtLength(length);
    dot.setAttribute("transform", `translate(${destination.x} ${destination.y})`);
    if (animate) {
      sound.play(reducedMotion.matches ? frame.contact ?? frame.sound : frame.sound);
      if (frame.contact && !reducedMotion.matches) {
        contactTimer = setTimeout(() => sound.play(frame.contact), 740);
      }
    }
    if (animate && !reducedMotion.matches) {
      const keyframes = Array.from({ length: 21 }, (_, index) => {
        const point = path.getPointAtLength(length * index / 20);
        return { transform: `translate(${point.x}px,${point.y}px)` };
      });
      dot.animate(keyframes, { duration: 740, easing: "ease-in-out" });
    }
  }

  function tracePath(path, trail) {
    const length = path.getTotalLength();
    const segments = Math.ceil(length / 4);
    const coordinates = ({ x, y }) => `${x},${y}`;
    const samples = Array.from({ length: segments + 1 }, (_, index) =>
      coordinates(path.getPointAtLength(length * index / segments)));
    return progress => {
      const point = path.getPointAtLength(length * progress);
      const passed = samples.slice(0, Math.floor(progress * segments) + 1);
      trail.setAttribute("points", progress > 0 ? [...passed, coordinates(point)].join(" ") : "");
      return point;
    };
  }

  function playContinuousFlight(item) {
    if (reducedMotion.matches) {
      draw(1, true);
      return;
    }
    const status = get("step");
    const label = "파랑 외야가 같은 팀 내야로 패스해요";
    status.textContent = label;
    court(item, { ...item.frames[0], ...item.continuousFlight, label });
    const ball = visual.querySelector(".dodgeball-ball");
    const traceFlight = tracePath(visual.querySelector(".dodgeball-flight"), visual.querySelector(".dodgeball-ball-trail"));
    const traceRebound = tracePath(visual.querySelector(".dodgeball-rebound"), visual.querySelector(".dodgeball-rebound-trail"));
    const hitAt = 1150;
    const reboundAt = hitAt + 160;
    const outAt = reboundAt + 300;
    const restartAt = outAt + 550;
    const start = performance.now();
    let impactPlayed = false;
    sound.play("throw");

    function tick(now) {
      const elapsed = Math.max(0, now - start);
      if (elapsed >= restartAt) {
        draw(1, true);
        return;
      }
      const flightPoint = traceFlight(Math.min(1, elapsed / hitAt));
      const point = elapsed >= reboundAt
        ? traceRebound(Math.min(1, (elapsed - reboundAt) / (outAt - reboundAt)))
        : flightPoint;
      ball.setAttribute("transform", `translate(${point.x} ${point.y})`);
      if (elapsed >= hitAt && !impactPlayed) {
        impactPlayed = true;
        sound.play("impact");
      }
      const caption = elapsed >= reboundAt ? "스친 공이 외야 경계 밖으로 나가요"
        : elapsed >= hitAt ? "빨강 외야수에게 스쳐요"
        : elapsed >= 810 ? "내야수가 패스를 놓쳐요" : label;
      if (status.textContent !== caption) status.textContent = caption;
      routeFrame = requestAnimationFrame(tick);
    }
    routeFrame = requestAnimationFrame(tick);
  }

  function playOutRoute(item, route) {
    const flight = visual.querySelector(".dodgeball-flight");
    const rebound = visual.querySelector(".dodgeball-rebound");
    const walk = visual.querySelector(".dodgeball-walk");
    const ball = visual.querySelector(".dodgeball-ball");
    const walker = visual.querySelector(".dodgeball-walker");
    const impact = visual.querySelector(".dodgeball-impact");
    const arm = visual.querySelector(".dodgeball-touch-arm");
    const status = get("step");
    const hitAt = 700;
    const reboundDuration = 550;
    const moveAt = route.restart ? hitAt + reboundDuration : 1060;
    const finishAt = item.route ? 2350 : 4200;
    const reachAt = finishAt - 220;
    const restartAt = finishAt + 650;
    const traceBall = tracePath(flight, visual.querySelector(".dodgeball-ball-trail"));
    const tracePlayer = tracePath(walk, visual.querySelector(".dodgeball-walk-trail"));
    const traceRebound = tracePath(rebound, visual.querySelector(".dodgeball-rebound-trail"));
    const start = performance.now();
    let impactPlayed = false;
    let finishSoundPlayed = false;
    if (!reducedMotion.matches) sound.play("throw");

    function tick(now) {
      const elapsed = reducedMotion.matches ? restartAt : Math.max(0, now - start);
      const hit = elapsed >= hitAt;
      if (hit && !impactPlayed) {
        impactPlayed = true;
        sound.play("impact");
      }
      const flightPoint = traceBall(Math.min(1, elapsed / hitAt));
      const ballPoint = hit
        ? traceRebound(Math.min(1, (elapsed - hitAt) / reboundDuration))
        : flightPoint;
      ball.setAttribute("transform", `translate(${ballPoint.x} ${ballPoint.y})`);
      impact.setAttribute("opacity", hit ? Math.max(0, 1 - (elapsed - hitAt) / 450) : 0);
      const progress = Math.min(1, Math.max(0, (elapsed - moveAt) / (finishAt - moveAt)));
      const playerPoint = tracePlayer(progress);
      walker.setAttribute("cx", playerPoint.x);
      walker.setAttribute("cy", playerPoint.y);
      if (arm && elapsed >= reachAt) {
        const reach = Math.min(1, (elapsed - reachAt) / (finishAt - reachAt));
        const pull = Math.min(1, Math.max(0, (elapsed - finishAt) / 240));
        const x = ballPoint.x + (route.touchX - ballPoint.x) * pull;
        const { y } = ballPoint;
        arm.setAttribute("visibility", "visible");
        arm.setAttribute("x1", playerPoint.x);
        arm.setAttribute("y1", playerPoint.y);
        arm.setAttribute("x2", playerPoint.x + (x - 9 - playerPoint.x) * reach);
        arm.setAttribute("y2", playerPoint.y + (y - playerPoint.y) * reach);
        ball.setAttribute("transform", `translate(${x} ${y})`);
      }
      if (route.finishSound && progress === 1 && !finishSoundPlayed) {
        finishSoundPlayed = true;
        sound.play(route.finishSound);
      }
      if (route.restart && elapsed >= restartAt) {
        court(item, { ...route.restart, players: [[playerPoint.x, playerPoint.y, route.players[0][2]], route.players[1]] });
        status.textContent = route.restart.label;
        if (!finishSoundPlayed) sound.play("whistle");
        return;
      }
      const caption = arm && elapsed >= reachAt && progress < 1 ? "파랑 선수가 공에 손을 뻗어요"
        : progress === 1 ? route.arrived
        : progress > 0 ? route.moving ?? "볼 데드존을 따라 이동"
        : hit ? route.hit : route.throwLabel;
      if (status.textContent !== caption) status.textContent = caption;
      if (elapsed < (route.restart ? restartAt : finishAt)) routeFrame = requestAnimationFrame(tick);
    }
    routeFrame = requestAnimationFrame(tick);
  }

  function cards(steps, active = -1, pose = "", terms = []) {
    visual.innerHTML = `<div class="dodgeball-card">${pose}<ol>${steps.map(([title, detail], index) =>
      `<li${index === active ? ' aria-current="step"' : ""}><strong>${title}</strong><span>${detail}</span></li>`).join("")}</ol>
      ${terms.length ? `<dl class="dodgeball-terms" aria-label="승패 판정 용어">${terms.map(term =>
        `<div><dt>${term}</dt><dd>${scoreTerms[term]}</dd></div>`).join("")}</dl>` : ""}</div>`;
  }

  function restartPose(item, index) {
    const throwing = item.early ? index === 1 : index === 2;
    const team = item.early && index === 2 ? "red" : "blue";
    return `<svg class="dodgeball-restart-pose" viewBox="0 0 160 126" role="img" aria-label="${throwing ? "공을 던져요" : "두 손으로 공을 머리 위에 들어요"}">
      <path d="M35 119h91" stroke="#a19579" stroke-width="2" stroke-linecap="round"/>
      <path d="M79 62v29m0-3-17 27m17-27 17 27M79 64${throwing ? " 98 51 114 43M79 64 66 58 61 47" : " 61 52 71 26M79 64 97 52 87 26"}"
        fill="none" stroke="${colors[team]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="79" cy="47" r="10" fill="${colors[team]}"/>
      <circle cx="${throwing ? 133 : 79}" cy="${throwing ? 43 : 19}" r="11" fill="#fbd54e" stroke="#29251b" stroke-width="2"/>
      ${throwing ? '<path d="M118 35h9m-7 17h7" stroke="#ffe082" stroke-width="2" stroke-linecap="round"/>' : ""}
    </svg>`;
  }

  function draw(index = 0, animate = false) {
    const item = current();
    if (item.diagram === "route") {
      const route = outRoutes[item.route ?? topic];
      get("step").textContent = animate ? route.throwLabel : route.ready;
      court(item, { ...route, label: get("step").textContent });
      if (animate) playOutRoute(item, route);
    } else if (item.diagram === "restart") {
      get("step").textContent = item.early && index === 2 ? "빨강 내야 · 재개 준비" : item.outside ? "파랑 외야 · 재개" : "파랑 내야 · 재개";
      const steps = item.early ? earlySteps : restartSteps;
      cards(steps, index, restartPose(item, index));
      if (animate) sound.play(steps[index][2]);
    } else if (item.score) {
      visual.innerHTML = `<div class="scoreboard"><div class="score-pair">
        <div class="score-team"><small>파랑 내야</small><strong>7</strong></div><span aria-hidden="true">–</span>
        <div class="score-team"><small>빨강 내야</small><strong>4</strong></div>
      </div><p>파랑팀 세트 승</p></div>`;
      get("step").textContent = "5분 종료 · 내야 인원";
    } else if (item.cards) {
      cards(item.cards, -1, "", item.terms);
      get("step").textContent = "대회 운영 예시";
    } else {
      const frame = item.frames?.[index] ?? {};
      court(item, frame, animate);
      if (animate && !frame.path) sound.play(frame.sound);
      get("step").textContent = frame.label || item.result;
    }
  }

  function renderCase() {
    clearTimeout(playback);
    clearTimeout(contactTimer);
    cancelAnimationFrame(routeFrame);
    const item = current();
    get("topic").textContent = item.visualLabel ?? lessons[topic].tab;
    for (const button of choices.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", Number(button.dataset.case) === selected);
    }
    renderNotes(get("insight"), [[item.result, item.detail]], 0);
    play.hidden = !(item.frames || item.diagram === "restart" || item.diagram === "route");
    get("caption").innerHTML = item.score || item.cards || item.diagram === "restart"
      ? (topic === "score" ? "대회에서는 해당 대회의 최종 참가요강을 적용해요." : "재개할 팀과 구역은 주심의 판정을 따라요.")
      : '<span class="team-key">파랑팀</span><span class="team-key red">빨강팀</span><span class="team-key ball">피구공</span>';
    draw();
  }

  function route() {
    clearTimeout(playback);
    clearTimeout(contactTimer);
    cancelAnimationFrame(routeFrame);
    const [sport, section] = location.hash.slice(1).split("/");
    if (sport !== "dodgeball") {
      visual.replaceChildren();
      return;
    }
    topic = Object.hasOwn(lessons, section) ? section : "court";
    get("lesson").dataset.topic = topic;
    selected = 0;
    const lesson = lessons[topic];
    const restoreFocus = nav.contains(document.activeElement);
    nav.innerHTML = Object.keys(lessons).map((key, index) =>
      `<a href="#dodgeball/${key}"${key === topic ? ' aria-current="page"' : ""}><span>0${index + 1}</span>${lessons[key].tab}</a>`).join("");
    if (restoreFocus) nav.querySelector('[aria-current="page"]').focus({ preventScroll: true });
    get("heading").textContent = lesson.title;
    get("lead").textContent = lesson.lead;
    choices.innerHTML = lesson.cases.map(({ name }, index) =>
      `<button type="button" data-case="${index}">${name}</button>`).join("");
    renderCase();
  }

  choices.addEventListener("click", event => {
    const choice = event.target.closest("[data-case]");
    if (!choice) return;
    selected = Number(choice.dataset.case);
    renderCase();
  });

  play.addEventListener("click", () => {
    clearTimeout(playback);
    clearTimeout(contactTimer);
    cancelAnimationFrame(routeFrame);
    if (current().continuousFlight) {
      playContinuousFlight(current());
      return;
    }
    if (current().diagram === "route") {
      draw(0, true);
      return;
    }
    const frames = current().frames;
    const total = frames?.length ?? restartSteps.length;
    function show(index) {
      draw(index, true);
      if (index + 1 < total) playback = setTimeout(() => show(index + 1), frames?.[index].duration ?? 1250);
    }
    show(0);
  });

  addEventListener("hashchange", route);
  route();
})();

