const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const che = require('cheerio');
const axios = require('axios');
const path = require('path');

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

/**
 * @param {Date} date
 */

function datetostring(date) {
    const splited_date = date.toLocaleString("en", { year: "numeric", month: "2-digit", day: "2-digit"}).split('/');
    return { year: splited_date[2], month: splited_date[0], day: splited_date[1] };
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
            date.setDate(today.getDate()+i);
            nextdate.push(datetostring(date));
        }
        let nextmeal = await Promise.any(nextdate.map(date => {
            return getmeal(date.year, date.month, date.day);
        }));
        if (nextmeal) {
            data.nextday = nextmeal;
            fs.writeFile(path.join(__dirname,'meal_data.json'), JSON.stringify(data), resolve);
        } else {
            reject("over nextday");
        }
    });
}

function meal_embed(data) {
    if (data.lunch) {
        const embed = new MessageEmbed({
            title: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 급식`,
            color: "0x139BCC"
        });
        embed.addField(`──────────────\n중식 (Lunch) (${data.lunch.calorie})\n──────────────`, data.lunch.meal,true);
        if (data.dinner)
            embed.addField(`──────────────\n석식 (Dinner) (${data.lunch.calorie})\n──────────────`, data.dinner.meal, true);
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