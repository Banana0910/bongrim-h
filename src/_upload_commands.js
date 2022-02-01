const { Client } = require("discord-slash-commands-client");
const { token, client_id } = require("./data/config.json")

const client = new Client(token, client_id);
const guild_id = "783625320062386217"

// client.createCommand({
//     name: "eval",
//     description: "javascript 명령을 실행합니다.",
//     options: [
//         {
//             name: "명령어",
//             description: "실행할 명령어를 입력하면 됩니다.",
//             required: true,
//             type: 3,
//         }
//     ]
// }, guild_id).then(console.log);

// client.createCommand({
//     name: "getinf",
//     description: "급식 정보를 가져옵니다.",
// }, guild_id).then(console.log);

// client.createCommand({
//     name: "show",
//     description: "급식 정보를 보여줍니다.",
//     options: [
//         {
//             name: "날",
//             description: "보고 싶은 날의 급식을 봅니다.",
//             required: true,
//             type: 3,
//             choices: [
//                 {
//                     name: "오늘",
//                     value: "today",
//                 },
//                 {
//                     name: "내일",
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
//     name: "set",
//     description: "타겟 채널을 설정합니다.",
//     options: [
//         {
//             name: "채널",
//             description: "실행할 채널의 ID를 입력하시면 됩니다.",
//             required: false,
//             type: 7,
//             channel_types: 0,
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
//                     min_value: 0,
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
//                 }
//             ]
//         },
//         {
//             name: "list",
//             description: "재생 대기 중인 리스트를 보여줍니다.",
//             type: 1,
//         }
//     ]
// }, guild_id).then(console.log);

// client.createCommand({
//     name: "channel",
//     description: "채널들을 관리합니다.",
//     options: [
//         {
//             name: "타깃채널",
//             description: "타깃채널을 관리합니다",
//             type: 2,
//             options: [
//                 {
//                     name: "설정",
//                     description: "타깃채널로 설정합니다.",
//                     type: 1,
//                     options: [
//                         {
//                             name: "채널",
//                             description: "타깃채널로 설정할 채널을 선택합니다.",
//                             required: false,
//                             type: 7,
//                             channel_types: 0,
//                         }
//                     ]
//                 },
//                 {
//                     name: "삭제",
//                     description: "타깃채널로의 설정을 해제합니다.",
//                     type: 1,
//                     options: [
//                         {
//                             name: "채널",
//                             description: "타깃채널로 설정을 해제할 채널",
//                             required: false,
//                             type: 7,
//                             channel_types: 0,
//                         }
//                     ]
//                 }
//             ]
//         },
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

client.createCommand({
    name: "status",
    description: "서버 상태를 채널에 등록합니다.",
}, guild_id).then(console.log);

client.createCommand({
    name: "eval",
    description: "JavaScript 코드를 실행합니다.",
    options: [
        {
            name: "코드",
            description: "실행할 코드를 입력합니다",
            type: 3,
            required: true,
        }
    ]
}, guild_id).then(console.log);

// const delete_command_list = [ "936911163143368734", "936911216683651102", "936264361075429386"];
// delete_command_list.map(command => {
//     client.deleteCommand(command, guild_id).then(console.log);
// });