const fs = require('fs');
const { google } = require('googleapis');
const { client_secret, client_id, redirect_uris, token } = require('./drive_token.json');
const { send_log } = require('../../index');
const path = require('path');

const FILE_ID = '1aaxNC7KDN-GzJo-rsNtngW04bRCabKJs';
const TARGET_PATH = path.join(__dirname,"..","..","data","data.json");

const oauth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
oauth2Client.credentials = token;

function json_download()
{
    return new Promise((resolve, reject) => {
        const drive = google.drive({version: 'v3', auth: oauth2Client });
        const dest = fs.createWriteStream(TARGET_PATH);
        drive.files.get(
            {fileId: FILE_ID, alt: "media" },
            {responseType: 'stream'},
            function (err, { data }) {
                if (err) {
                    reject(err);
                    return;
                }
                data.on("end", resolve).on("error", err => reject(err)).pipe(dest);
            }
        );
    });
}

function json_update(data)
{
    fs.writeFileSync(TARGET_PATH, JSON.stringify(data, null, 4))
    const drive = google.drive({version: 'v3', auth: oauth2Client});
    drive.files.update({ 
        fileId: FILE_ID, 
        media: {
            mimeType: "application/json", 
            body: fs.createReadStream(TARGET_PATH)
        } 
    }, (err, res) => {
        if (err) {
            send_log(`[json_upload 중 오류] ${err}`);
            return;
        }
    })
}

module.exports.json_download = json_download;
module.exports.json_update = json_update;