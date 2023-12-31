## 🎨 nijoow-drawing

- svg 드로잉 토이 프로젝트
- 🚧 개발 진행 중 🚧

[데모페이지]

<a href="https://nijoow-drawing.vercel.app/" target="_blank">nijoow-drawing.vercel.app</a>

[기술 스택]

- Next.js, Typescript, recoil, Tailwind

[기능]

- 마우스 드래그로 사각형, 삼각형, 원 그리기
- 면 색, 선 색, 선 굵기, 투명도 조절 (기본 세팅으로 그리기 및 도형 선택해서 변경)
- 도형 선택 핸들러 구현 (드래그로 이동, 크기 조절, 회전 이벤트)
- 점 찍어서 다각형 그리는 기능
- 펜처럼 그리는 기능

[추가할 기능]

- 텍스트 추가하는 기능
- 직선 Vertex 곡선으로 변경하는 기능
- 키보드 단축키 추가

[개선사항]

- ~~크기조절, 회전 핸들러 벌갈아 쓰면 크기 바뀌는 현상~~
- ~~도형 여러개 있을 때 다른 도형에 변형 생기는 문제~~
- ~~리사이즈시 크기가 0보다 작아지면 위치 바뀌는 문제~~
- ~~vertex로 이루어진 도형 resize 로직~~
- ~~기존 사각형, 삼각형 도형도 vertex polygon으로 변경~~
- ~~vertex 회전로직 수정~~
- ~~fill, stroke 빈값 추가~~
- ~~vertex 핸들러 변경사항 바로 적용안되는 문제~~
- ~~모든 도형 path로 통일시키고 vertex 저장 방식 수정~~
- ~~Vertex 곡선 조절 handler 기능 추가~~
