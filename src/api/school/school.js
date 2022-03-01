const fs = require('fs');
const { MessageEmbed, Message } = require('discord.js');
const che = require('cheerio');
const axios = require('axios');
const path = require('path');

const SITE_URL = "http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do"

/**
 * @param {Date} date
 */

function datetostring(date) {
    const splited_date = date.toLocaleString("en", { year: "numeric", month: "2-digit", day: "2-digit"}).split('/');
    return { year: splited_date[2], month: splited_date[0], day: splited_date[1] };
}

// 급식 관련

function getmeal(year, month, day) {
    return new Promise((resolve, reject) => {
        axios.get(SITE_URL, {
            params: { dietDate: `${year}/${month}/${day}` }
        }).then(res => {
            let lunch;
            let dinner;
            const $ = che.load(res.data);
            const today_meal = $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td")
            if (today_meal.text().trim() != "") {
                lunch = {
                    meal: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td").html().trim()
                    .replace(/\n|[0-9\\.]/gi, '')
                    .replace(/<br\s*[\/]?>/gi, '\n'),
                    calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(4) > td").text().trim()
                }
            } else {
                reject("no meal");
                return;
            }
            const dinner_meal = $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(2) > td");
            if (dinner_meal.length) {
                dinner = { 
                    meal: dinner_meal.html().trim()        
                    .replace(/\n|[0-9\\.]/gi, '')
                    .replace(/<br\s*[\/]?>/gi, '\n'),
                    calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(4) > td").text().trim()
                }
            }
            resolve({ date: { year, month, day }, lunch: lunch , dinner: dinner });
        }).catch(err => reject(err))
    })
}


function gettoday() {
    return new Promise(async (resolve, reject) => {
        let data = { today: {}, nextday: {} };

        const today = new Date();
        const today_splited = datetostring(today);
        getmeal(today_splited.year, today_splited.month, today_splited.day)
            .then((res) => { data.today = res; })
            .catch((err) => { (err == "no meal") ? (!data.today) : reject(); });

        let nextdate = [];
        for (let i = 0; i <= 14; i++) {
            const date = new Date();
            date.setDate(today.getDate()+i+1);
            nextdate.push(datetostring(date));
        }
        let nextmeals = await Promise.allSettled(nextdate.map(date => {
            return getmeal(date.year, date.month, date.day);
        }));
        nextmeals = nextmeals.filter(f => f.status == 'fulfilled'); // no meal인거는 전부 뺌
        if (nextmeals.length < 1) reject("over nextday"); // nextmeals의 크기가 0보다 아래라는건 14일동안 급식이 없는것
        const toDate = (date) => { return new Date(`${date.year}-${date.month}-${date.day}`); }
        let min_meal = nextmeals[0].value;
        for (const meal of nextmeals) {
            if (toDate(min_meal.date) > toDate(meal.value.date))
                min_meal = meal.value;
        } //있는 것들 중에서 최소의 날짜를 가진 친구만 골라내는 작업
        data.nextday = min_meal;
        fs.writeFile(path.join(__dirname,'meal_data.json'), JSON.stringify(data), resolve);
    });
}

function meal_embed(data) {
    if (data.lunch) {
        const embed = new MessageEmbed({
            title: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 급식`,
            color: "0x139BCC",
            timestamp: new Date(),
            footer: { text: "※ 정규식 문제로 숫자가 깨져있습니다" }
        });
        embed.addField(`──────────────\n중식 (Lunch) (${data.lunch.calorie})\n──────────────`, data.lunch.meal,true);
        if (data.dinner)
            embed.addField(`──────────────\n석식 (Dinner) (${data.lunch.calorie})\n──────────────`, data.dinner.meal, true);
        return embed;
    } else {
        const embed = new MessageEmbed({
            title: `이런..`,
            description: "급식이 없습니다",
            color: "0x139BCC",
            timestamp: new Date(),
        });
        return embed;
    }
}

// 시간표 관련

function get_timetable(dayofweek) {
    const days = [null , "Mon", "Tue", "Wed", "Thu", "Fri", null];
    const days_ko = [null , "월", "화", "수", "목", "금", null];
    const data = require("./timetables.json");
    const timetable = data[days[dayofweek]];

    let output = "⠀⠀⠀⠀⠀⠀**1반**⠀⠀ **2반**⠀ ⠀ **3반**⠀ ⠀ **4반**\n";
    for (let i = 0; i < timetable.count; i++) {
        output += `**${i+1}교시**⠀⠀${timetable.class1[i]}⠀⠀${timetable.class2[i]}⠀⠀${timetable.class3[i]}⠀⠀${timetable.class4[i]}\n`
    }

    const embed = new MessageEmbed({
        title: `${days_ko[dayofweek]}요일 시간표`,
        description: output,
        color: "0x139BCC",
        timestamp: new Date()
    });
    return embed;
}

function timetable_embed(data) {
    if (data.date) {
        const date = new Date(`${data.date.year}-${data.date.month}-${data.date.day}`);
        return get_timetable(date.getDay());
    }
    return new MessageEmbed({ title: `이런..`, description: "시간표가 없습니다", color: "0x139BCC", timestamp: new Date()});
}


module.exports.getmeal = getmeal;
module.exports.gettoday = gettoday;
module.exports.meal_embed = meal_embed;

module.exports.get_timetable = get_timetable;
module.exports.timetable_embed = timetable_embed;