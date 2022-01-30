const { MessageEmbed } = require('discord.js');
const che = require('cheerio');
const axios = require('axios');

const SITE_URL = "http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do"

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
                    .replace(/\n/gi, '')
                    .replace(/<br\s*[\/]?>/gi, '\n')
                    .replace(/[0-9\\.]/gi, ''),
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
                    .replace(/\n/gi, '')
                    .replace(/<br\s*[\/]?>/gi, '\n')
                    .replace(/[0-9\\.]/gi, ''),
                    calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(4) > td").text().trim()
                }
            }
            resolve({ date: { year, month, day }, lunch: lunch , dinner: dinner });
        }).catch(err => reject(err))
    })
}

function gettoday() {
    return new Promise((resolve, reject) => {
        let data = { today: "None", nextday: "None" };
        const today = new Date();
        const today_splited = today.toLocaleString("en", { year: "numeric", month: "2-digit", day: "numeric" }).split('/');
        getmeal(today_splited[2], today_splited[0], today_splited[1]).then((res) => {
            data.today = res;
        }).catch((err) => {
            (err == "no meal") ? (data.today = "None") : reject();
        });
        let nextday = new Date();
        nextday.setDate(today.getDate() + 1);
        let i = 0;
        for (i = 0; i <= 14; i++) {
            if (i == 14) reject("over nextday");
            const nextday_splited = nextday.toLocaleString("en", { year: "numeric", month: "2-digit", day: "numeric" }).split('/');
            getmeal(nextday_splited[2], nextday_splited[0], nextday_splited[1]).then((res) => {
                data.nextday = res;
                resolve();
            }).catch((err) => {
                (err == "no meal") ? nextday.setDate(nextday.getDate() + 1) : reject(err);
            });
        }
    });
}

function meal_embed(data) {
    if (data.lunch) {
        const embed = new MessageEmbed({
            title: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 급식`,
            color: "0x139BCC"
        });
        embed.addField("──────────────\n중식 (Lunch)\n──────────────", `${data.lunch.meal}\n**[칼로리 : ${data.lunch.calorie}]**`,true);
        if (data.dinner) {
            embed.addField("──────────────\n석식 (Dinner)\n──────────────", `${data.dinner.meal}\n**[칼로리 : ${data.dinner.calorie}]**`, true);
        }
        return embed;
    } else {
        const embed = new MessageEmbed({
            title: `이런..`,
            description: "급식이 없습니다",
            color: "0x139BCC"
        });
        return embed;
    }
}

module.exports.getmeal = getmeal;
module.exports.gettoday = gettoday;
module.exports.meal_embed = meal_embed;