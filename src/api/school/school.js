const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const axios = require('axios').default;
const path = require('path');

// 급식 관련

function getmeal(year, month, day, sname) {
    return new Promise(async (resolve, reject) => {
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayofweek = days[(new Date(parseInt(year), parseInt(month)-1, parseInt(day))).getDay()];
        const school_data = require("./school_data.json");
        const res = await axios.get("https://open.neis.go.kr/hub/mealServiceDietInfo", {
            params: {
                KEY: "f0491ec9a1784e2cb92d2a4070f1392b",
                Type: "json",
                pIndex: 1,
                pSize: 100,
                ATPT_OFCDC_SC_CODE: school_data[sname].sido,
                SD_SCHUL_CODE: school_data[sname].code,
                MLSV_YMD: `${year}${month}${day}`
            }
        });
        if (res.data.RESULT) {
            reject((res.data.RESULT.CODE == 'INFO-200') ? "no meal" : res.data.RESULT.MESSAGE);
            return;
        }
        const meals = await Promise.all(res.data.mealServiceDietInfo[1].row.map(meal => ({
            name: meal.MMEAL_SC_NM,
            meal: meal.DDISH_NM.replace(/\n|[0-9\\.]{2,}/gi, '').replace(/\(\)/gi, '')
                .split(/<br\s*[\/]?>/gi).map(m => (m.trim())).join('\n'),
            calorie: meal.CAL_INFO
        })))
        resolve({ date: { year, month, day, dayofweek }, meals})
    })
}

// function getmeal(year, month, day, sname) { // PageParseVer [dependency : cheerio]
//     return new Promise(async (resolve, reject) => {
//         const days = ["일", "월", "화", "수", "목", "금", "토"];
//         const dayofweek = days[(new Date(parseInt(year), parseInt(month)-1, parseInt(day))).getDay()];
//         const school_data = require("./school_data.json");
//         axios.get(`http://${school_data[sname].sid}.gne.go.kr/${school_data[sname].sid}/dv/dietView/selectDietDetailView.do`, {
//             params: { dietDate: `${year}${month}${day}` }
//         }).then(async res => {
//             const $ = cheerio.load(res.data);
//             if ($('#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td').text().trim() == "") { reject("no meal"); }
//             const meals = await Promise.all($(".BD_table").map((i, e) => ({
//                     name: $(e).find("table > tbody > tr.dietTy_tr > td").text().trim(),
//                     meal: $(e).find("table > tbody > tr:nth-child(2) > td").html().trim()
//                         .replace(/\n|[0-9\\.]{2,}/gi, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
//                         .replace(/Ábr\/&gt;/gi, '<br/>').replace(/\(\)/gi, '')
//                         .split(/<br\s*[\/]?>/gi).map(m => m.trim()).join('\n'),
//                     calorie: $(e).find("table > tbody > tr:nth-child(4) > td").text().trim()
//                 })
//             ));
//             resolve({ date: { year, month, day, dayofweek }, meals });
//         }).catch(err => reject(err));
//     });
// }

function gettoday() {
    return new Promise(async (resolve, reject) => {
        const datetostring = (date) => {
            const splited_date = date.toLocaleString("en", { year: "numeric", month: "2-digit", day: "2-digit"}).split('/');
            return { year: splited_date[2], month: splited_date[0], day: splited_date[1] };
        }
        const school_data = require(path.join(__dirname,"school_data.json"));
        const today = new Date();
        const today_s = datetostring(today);
        let data = {  };
        await Promise.all(Object.keys(school_data).map(async sname => {
            data[sname] = { };
            getmeal(today_s.year, today_s.month, today_s.day, sname)
                .then((res) => { data[sname].today = res; })
                .catch((err) => { (err == "no meal") ? (!data[sname].today) : reject(); });
    
            let nextdate = [];
            for (let i = 1; i <= 15; i++) {
                const date = new Date();
                date.setDate(today.getDate()+i);
                nextdate.push(datetostring(date));
            }
            let nextmeals = await Promise.allSettled(nextdate.map(date => (getmeal(date.year,date.month,date.day,sname))));
            nextmeals = nextmeals.filter(f => f.status == 'fulfilled'); // no meal인거는 전부 뺌
            if (nextmeals.length < 1) { // nextmeals의 크기가 0보다 아래라는건 14일동안 급식이 없는것
                reject(`over nextday[${sname}]`); 
                return;
            }
            const toDate = (date) => { return new Date(`${date.year}-${date.month}-${date.day}`); }
            nextmeals.sort((a,b) => (toDate(a.value.date) - toDate(b.value.date)));
            data[sname].nextday = nextmeals[0].value;
        }));
        fs.writeFileSync(path.join(__dirname,'meal_data.json'), JSON.stringify(data, null, 4));
        resolve();
    });
}

function meal_embed(data, color, sname) {
    if (data) {
        const embed = new MessageEmbed({
            author: { name: sname },
            title: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 ${data.date.dayofweek}요일 급식`,
            color: color,
            timestamp: new Date(),
            fields: data.meals.map(meal => ({
                name: `───────────\n${meal.name} (${meal.calorie})\n───────────`,
                value: meal.meal,
                inline: true
            }))
        });
        return embed;
    } else {
        const embed = new MessageEmbed({
            author: { name: sname },
            title: `이런..`,
            description: "급식이 없습니다",
            color: color,
            timestamp: new Date(),
        });
        return embed;
    }
}

// 시간표 관련

function get_timetable(dayofweek, color, sname) {
    const days = [null , "월", "화", "수", "목", "금", null];
    const data = require("./timetables.json");
    if (!data[sname]) {
        return new MessageEmbed({ 
            author: { name: sname }, 
            title: `이런..`, 
            description: "시간표가 없습니다", 
            color: color, 
            timestamp: new Date()
        });
    }
    
    const t = data[sname][days[dayofweek]];
    let output = "⠀⠀⠀⠀⠀⠀";
    t.timetable.map(c => { output += `**${String.fromCharCode(0x2460+c.class-1)}반**⠀⠀ `; });
    output += "\n";
    
    for (let i = 0; i < t.count; i++) {
        const splitter = `${'────'.repeat(t.timetable.length+1)}`;
        let subject = `**${String.fromCharCode(0x2460+i)}교시**⠀⠀`;
        let teacher = `⠀ ⠀ ⠀ ⠀ `;
        t.timetable.map(c => {
            subject +=  `${c.subject[i]}⠀⠀ `;
            teacher += `${c.teacher[i]}⠀`
        });
        output += `${splitter}\n${subject}\n${teacher}\n`;
    }   
    return new MessageEmbed({
        author: { name: sname },
        title: `${days[dayofweek]}요일 시간표`,
        description: output,
        color: color,
        timestamp: new Date()
    });
}

function timetable_embed(data, color, sname) {
    if (data) {
        const date = new Date(`${data.date.year}-${data.date.month}-${data.date.day}`);
        return get_timetable(date.getDay(), color, sname);
    }
    return new MessageEmbed({ author: { name: sname }, title: `이런..`, description: "시간표가 없습니다", color: color, timestamp: new Date()});
}


module.exports.getmeal = getmeal;
module.exports.gettoday = gettoday;
module.exports.meal_embed = meal_embed;

module.exports.get_timetable = get_timetable;
module.exports.timetable_embed = timetable_embed;