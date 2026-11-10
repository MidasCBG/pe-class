# 체육 교실 · PE Class

초등 체육 수업용 정적 웹앱입니다. 배드민턴과 플라잉디스크 얼티밋을 한 페이지에서 선택합니다. 기리공작소 버전은 v1.2.1입니다.

- 배드민턴은 기존 규칙 시범과 유튜브 실사 영상을 사용합니다.
- 얼티밋은 수업용 PPT를 바탕으로 경기장, 패스와 이동, 득점, 공격권 교체, 파울과 수비, 풀을 다룹니다. 기술 시범에는 백핸드, 포핸드, 양손 받기 영상이 있습니다.
- 얼티밋의 공식 판정은 [WFDF Rules of Ultimate](https://rules.wfdf.sport/)를 참고했습니다. 던지기 영상은 [조지아대학교 공개 교재](https://open.online.uga.edu/ultimate/chapter/skillsandtechnique/), 받기 영상은 [Manhattanville University 자료 목록](https://mville.libguides.com/c.php?g=370062&p=2500503)에서 확인할 수 있습니다.

## 로컬에서 보기

이 폴더에서 `python -m http.server 8781 --bind 127.0.0.1`을 실행한 뒤 http://127.0.0.1:8781/ 을 엽니다.

## GitHub Pages에 반영

1. `pe-class` 저장소의 `main` 브랜치 루트에 이 폴더 **안의 파일**을 올리고 한 커밋으로 저장합니다. `index.html`과 `.nojekyll`이 저장소의 가장 위에 있어야 합니다.
2. Settings → Pages에서 Deploy from a branch, `main`, `/ (root)`를 선택합니다.
3. Actions에서 배포 성공을 확인한 뒤 Pages 주소를 엽니다. 같은 저장소를 업데이트할 때는 수정된 파일을 커밋하면 됩니다.

공유한 버전을 표시하려면 배포 커밋에 `v1.2.1` 태그를 붙이거나 해당 태그로 GitHub Release를 만듭니다. 화면 버전 표시는 `index.html`의 `site-version`과 정적 파일 URL에 적힌 버전을 함께 갱신합니다.
