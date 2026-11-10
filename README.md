# 배드민턴 교실

초등 체육 수업용 정적 웹앱의 초기 화면입니다. 코트와 선, 서브, 점수와 서브권, 자주 나오는 상황, 기술 시범의 다섯 주제를 제공합니다.

## 실행

이 폴더를 서버 루트로 하여 아래 명령을 실행한 후 브라우저에서 http://127.0.0.1:8765/ 를 엽니다.

```sh
python -m http.server 8765 --bind 127.0.0.1
```

## GitHub Pages

공개용 저장소의 `main` 브랜치 루트에 이 폴더 안의 파일을 올리고, Settings → Pages → Deploy from a branch에서 `main`과 `/ (root)`를 선택합니다. 빌드와 외부 의존성 설치 없이 실행할 수 있습니다.

## 화면과 시범

- 01~04에서 경기 방식을 선택할 수 있습니다. 05 기술 시범의 동작 안내는 오른손잡이 기준입니다.
- 기술 시범은 Badminton Insight와 Badminton with Ajay Jayaram의 공개 영상을 원본 플레이어로 재생합니다. 학교 네트워크에서 외부 영상이 제한되면 원본 링크로 재생 여부를 확인할 수 있습니다.
- 01~04는 규칙과 판정을 코트 도식과 점수판으로 보여줍니다. 실제 동작 영상은 05 기술 시범에서 볼 수 있습니다.
- 타격음은 웹 오디오에서 합성합니다. 기리공작소 마크는 학교 업무 허브에서 가져왔습니다.
- 규칙 자료는 BWF Laws of Badminton, 시범 참고 자료는 BWF Shuttle Time입니다. 경기 기준은 [2025년 규칙 원문](https://www.badminton.no/contentassets/c0b5fd676d9a4a10bd7a14c673a7bad0/section-4.1---laws-of-badminton---26-april-2025-v5.0-1--1.pdf)과 [2027년 점수제 시행 안내](https://www.badminton.or.jp/news/detail/2156)에서 확인할 수 있습니다.
