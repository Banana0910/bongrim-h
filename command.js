const { Client } = require("discord-slash-commands-client");

const client = new Client("OTI5Mzg3Nzc0MTY2MDczMzk1.Ydml0A.p4cHm0rRMal9YkYvQ3XFfwat50g", "929387774166073395");

client.createCommand({
    name: "ping",
    description: "ping pong!",
}, "758758978078769233");

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
}, "758758978078769233");

client.createCommand({
    name: "getinf",
    description: "급식 정보를 가져옵니다.",
}, "758758978078769233");

client.createCommand({
    name: "show",
    description: "급식 정보를 보여줍니다.",
}, "758758978078769233");

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
}, "758758978078769233");