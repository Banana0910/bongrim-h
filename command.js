const { Client } = require("discord-slash-commands-client");
const { token, client_id } = require("./config.json")

const client = new Client(token, client_id);
const guild_id = "758758978078769233"

client.createCommand({
    name: "eval",
    description: "javascript 명령을 실행합니다.",
    options: [
        {
            name: "명령어",
            description: "실행할 명령어를 입력하면 됩니다.",
            required: true,
            type: 3,
        }
    ]
}, guild_id).then(console.log);

client.createCommand({
    name: "getinf",
    description: "급식 정보를 가져옵니다.",
}, guild_id).then(console.log);

client.createCommand({
    name: "show",
    description: "급식 정보를 보여줍니다.",
}, guild_id).then(console.log);

client.createCommand({
    name: "schoolmeal",
    description: "특정 일의 급식을 가져오고, 보여줍니다.",
    options: [
        {
            name: "연",
            description: "가져올 급식의 연도",
            required: true,
            type: 4,
            min_value: 1,
            max_value: 2022,
        },
        {
            name: "월",
            description: "가져올 급식의 월",
            required: true,
            type: 4,
            min_value: 1,
            max_value: 12,
        },
        {
            name: "일",
            description: "가져올 급식의 일",
            required: true,
            type: 4,
            min_value: 1,
            max_value: 31,
        }
    ]
}, guild_id).then(console.log);

client.createCommand({
    name: "set",
    description: "타겟 채널을 설정합니다.",
    options: [
        {
            name: "채널",
            description: "실행할 채널의 ID를 입력하시면 됩니다.",
            required: false,
            type: 7,
            channel_types: 0,
        }
    ]
}, guild_id).then(console.log);

client.createCommand({
    name: "sendmsg",
    description: "타겟 채널에 메시지를 전송합니다.",
    options: [
        {
            name: "메시지",
            description: "보낼 메시지를 입력합니다",
            required: true,
            type: 3,
        }
    ]
}, guild_id).then(console.log);