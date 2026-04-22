== MeetNote 설치 및 실행 방법 ==

[필요 환경]
- Node.js 18 이상  (https://nodejs.org)

[처음 설치]
1. 이 meetnote 폴더를 원하는 위치에 저장하세요
2. 터미널(또는 PowerShell)에서 해당 폴더로 이동:
     cd 경로/meetnote
3. 의존성 설치 (최초 1회만):
     npm install
4. 서버 실행:
     node server.js

[접속]
- 브라우저에서 http://localhost:3000 열기

[데이터 저장 위치]
- meetings.json 파일에 자동 저장됩니다
- 이 파일을 백업하면 회의록을 보존할 수 있습니다

[서버 종료]
- 터미널에서 Ctrl+C
