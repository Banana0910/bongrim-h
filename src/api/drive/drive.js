const fs = require('fs');
const { google } = require('googleapis');
const { client_secret, client_id, redirect_uris, token } = require('./drive_token.json');
const { send_log } = require('../../index');
const path = require('path');

const files = [
    { id: '1aaxNC7KDN-GzJo-rsNtngW04bRCabKJs', path: path.join(__dirname,"..","..","data","data.json") }, // data.json
    { id: '1T2Tblug5f7IvxyUXIhtXxJLojrQ8GiAl', path: path.join(__dirname,"..","school","school_data.json") }, // school_data.json
    { id: '1E21hlZh4eGhPOd_YpUhaI3l60XLjUiDn', path: path.join(__dirname,"..","school","student_data.json") } // student_data.json
];

const oauth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
oauth2Client.credentials = token;

function json_download() {
    return Promise.all(files.map(file => {
        return new Promise((resolve, reject) => {
            const drive = google.drive({version: 'v3', auth: oauth2Client });
            const dest = fs.createWriteStream(file.path);
            drive.files.get({fileId: file.id, alt: "media" },{responseType: 'stream'},
                (err, { data }) => {
                    if (err) reject(err);
                    data.on("end", resolve).on("error", reject).pipe(dest);
                }
            );
        })
    }))
}

function json_update(data, a) {
    fs.writeFileSync(files[a].path, JSON.stringify(data, null, 4))
    const drive = google.drive({version: 'v3', auth: oauth2Client});
    drive.files.update({ 
        fileId: files[a].id, 
        media: {
            mimeType: "application/json", 
            body: fs.createReadStream(files[a].path)
        } 
    }, (err, res) => {
        if (err) {
            send_log(`[json_update 중 오류] ${err}`);
            return;
        }
    })
}

module.exports.json_download = json_download;
module.exports.json_update = json_update;