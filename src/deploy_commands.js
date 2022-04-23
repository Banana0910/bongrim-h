const { Client } = require("discord-slash-commands-client");
const { token, client_id } = require("./data/config.json")

const client = new Client(token, client_id);
const guild_ids = ["783625320062386217","758758978078769233"]

guild_ids.map((guild_id) => {
    // client.createCommand({
    //     name: "getinf",
    //     description: "급식 정보를 가져옵니다.",
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "show",
    //     description: "급식과 시간표 정보를 보여줍니다.",
    //     options: [
    //         {
    //             name: "날",
    //             description: "보고 싶은 날의 급식과 시간표를 봅니다.",
    //             required: true,
    //             type: 3,
    //             choices: [
    //                 {
    //                     name: "오늘",
    //                     value: "today",
    //                 },
    //                 {
    //                     name: "다음",
    //                     value: "next",
    //                 }
    //             ]
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "schoolmeal",
    //     description: "특정 일의 급식을 가져오고, 보여줍니다.",
    //     options: [
    //         {
    //             name: "연",
    //             description: "가져올 급식의 연도",
    //             required: true,
    //             type: 4,
    //             min_value: 1,
    //             max_value: 2022,
    //         },
    //         {
    //             name: "월",
    //             description: "가져올 급식의 월",
    //             required: true,
    //             type: 4,
    //             min_value: 1,
    //             max_value: 12,
    //         },
    //         {
    //             name: "일",
    //             description: "가져올 급식의 일",
    //             required: true,
    //             type: 4,
    //             min_value: 1,
    //             max_value: 31,
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "clean",
    //     description: "정해진 횟수만큼 씨부린것들을 삭제합니다.",
    //     options: [
    //         {
    //             name: "양",
    //             description: "삭제하고싶은 양",
    //             required: true,
    //             type: 4,
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "youtube",
    //     description: "youtube관련 명령어를 사용합니다.",
    //     options: [
    //         {
    //             name: "play",
    //             description: "youtube에서 원하는 영상의 오디오를 재생합니다.",
    //             type: 1,
    //             options: [
    //                 {
    //                     name: "word",
    //                     description: "원하는 youtube영상의 URL 또는 검색어를 입력합니다.",
    //                     required: true,
    //                     type: 3,
    //                 },
    //                 {
    //                     name: "음량",
    //                     description: "원하는 음량의 값을 정합니다.",
    //                     required: false,
    //                     type: 4,
    //                     min_value: 1,
    //                     max_value: 10,
    //                 }
    //             ]
    //         },
    //         {
    //             name: "search",
    //             description: "검색어를 이용해 youtube에서 원하는 영상을 찾습니다",
    //             type: 1,
    //             options: [
    //                 {
    //                     name: "검색어",
    //                     description: "검색하고싶은 문장 또는 단어",
    //                     required: true,
    //                     type: 3,
    //                 },
    //                 {
    //                     name: "음량",
    //                     description: "원하는 음량의 값을 정합니다.",
    //                     required: false,
    //                     type: 4,
    //                     min_value: 1,
    //                     max_value: 10,
    //                 }
    //             ]
    //         },
    //         {
    //             name: "list",
    //             description: "재생 대기 중인 리스트에 관한 명령어 입니다.",
    //             type: 2,
    //             options: [
    //                 {
    //                     name: "del",
    //                     description: "리스트 중에서 선택한 영상을 삭제합니다",
    //                     type: 1
    //                 },
    //                 {
    //                     name: "show",
    //                     description: "리스트를 출력합니다",
    //                     type: 1
    //                 }
    //             ]
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "channel",
    //     description: "채널들을 관리합니다.",
    //     options: [
    //         {
    //             name: "로그채널",
    //             description: "로그채널을 관리합니다",
    //             type: 2,
    //             options: [
    //                 {
    //                     name: "설정",
    //                     description: "로그채널로 설정합니다.",
    //                     type: 1,
    //                     options: [
    //                         {
    //                             name: "채널",
    //                             description: "로그채널로 설정할 채널",
    //                             required: false,
    //                             type: 7,
    //                             channel_types: 0,
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     name: "삭제",
    //                     description: "로그채널로의 설정을 해제합니다.",
    //                     type: 1,
    //                     options: [
    //                         {
    //                             name: "채널",
    //                             description: "로그채널로의 설정을 해제할 채널",
    //                             required: false,
    //                             type: 7,
    //                             channel_types: 0,
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "stats",
    //     description: "서버 상태를 채널에 등록합니다.",
    //     options: [
    //         {
    //             name: "상태",
    //             description: "서버 상태 기능이 온오프 여부를 알려줍니다.",
    //             type: 1
    //         },
    //         {
    //             name: "리셋",
    //             description: "서버 상태를 리셋합니다.",
    //             type: 1
    //         },
    //         {
    //             name: "활성화",
    //             description: "서버 상태 기능을 활성화 합니다.",
    //             type: 1
    //         },
    //         {
    //             name: "비활성화",
    //             description: "서버 상태 기능을 비활성화 합니다.",
    //             type: 1
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "autorole",
    //     description: "길드 참여시 자동적으로 권한을 부여합니다.",
    //     options: [
    //         {
    //             name: "활성화",
    //             description: "자동 권한 부여 기능을 활성화합니다.",
    //             type: 1,
    //             options: [
    //                 {
    //                     name: "봇",
    //                     description: "들어오는 봇에게 부여할 권한을 설정합니다.",
    //                     type: 8,
    //                     required: true
    //                 },
    //                 {
    //                     name: "유저",
    //                     description: "들어오는 유저에게 부여할 권한을 설정합니다.",
    //                     type: 8,
    //                     required: true
    //                 }
    //             ]
    //         },
    //         {
    //             name: "비활성화",
    //             description: "자동 권한 부여 기능을 활성화합니다.",
    //             type: 1
    //         },
    //         {
    //             name: "상태",
    //             description: "자동 권한 부여 기능의 활성화 여부를 확인합니다.",
    //             type: 1,
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "eval",
    //     description: "JavaScript 코드를 실행합니다.",
    //     options: [
    //         {
    //             name: "코드",
    //             description: "실행할 코드를 입력합니다",
    //             type: 3,
    //             required: true,
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "timetable",
    //     description: "원하는 요일의 시간표를 출력합니다",
    //     options: [
    //         {
    //             name: "요일",
    //             description: "원하는 요일을 선택합니다",
    //             type: 4,
    //             required: true,
    //             choices: [
    //                 { name: "월", value: 1 },
    //                 { name: "화", value: 2 },
    //                 { name: "수", value: 3 },
    //                 { name: "목", value: 4 },
    //                 { name: "금", value: 5 }
    //             ]
    //         }
    //     ]
    // }, guild_id).then(console.log);
    
    // client.createCommand({
    //     name: "level",
    //     description: "유저 레벨 관련 명령어입니다.",
    //     options: [
    //         {
    //             name: "활성화",
    //             description: "유저 레벨 기능을 활성화합니다",
    //             type: 1
    //         },
    //         {
    //             name: "조회",
    //             description: "특정 유저의 레벨을 조회합니다",
    //             type: 1,
    //             options: [
    //                 {
    //                     name: "유저",
    //                     description: "조회할 유저를 선택합니다",
    //                     type: 6,
    //                     required: false
    //                 }
    //             ]
    //         }
    //     ]
    // }, guild_id).then(console.log);

    // client.createCommand({
    //     name: "school",
    //     description: "학교 관련 명령어입니다",
    //     options: [
    //         {
    //             name: "추가",
    //             description: "학교를 추가합니다",
    //             type: 1,
    //             options: [
    //                 {
    //                     name: "학교",
    //                     description: "추가할 학교의 아이디를 입력합니다 (학교 사이트에서 http://[학교아이디].gne.go.kr)",
    //                     type: 3,
    //                     required: true
    //                 }
    //             ]
    //         },
    //         {
    //             name: "설정",
    //             description: "자신의 학교를 설정합니다",
    //             type: 1,
    //         }
    //     ]
    // }).then(console.log);
});
client.getCommands({}).then(console.log);