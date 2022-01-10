const { Client } = require("discord-slash-commands-client");
const { token, client_id } = require("./config.json")

const client = new Client(token, client_id);
const guild_id = "783625320062386217"

// client.createCommand({
//     name: "ping",
//     description: "ping pong!",
// }, guild_id).then(console.log);

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
//     name: "ping",
//     description: "ping pong!",
// }).then(console.log);

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
// }).then(console.log);

// client.createCommand({
//     name: "getinf",
//     description: "급식 정보를 가져옵니다.",
// }, guild_id).then(console.log);

// client.createCommand({
//     name: "show",
//     description: "급식 정보를 보여줍니다.",
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

client.getCommands({}).then(console.log).catch(console.error);