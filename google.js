const fs = require('fs');
const {google} = require('googleapis');
const {client_secret, client_id, redirect_uris} = require('./credentials.json').installed;
const token = require('./token.json');

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(token);
const drive = google.drive({version: "v3", auth: oAuth2Client});
var fileId = '1G5KN2eg-EYBQ6uoHLrYBno9TehPV5Q_z';
var dest = fs.createWriteStream('./GuildsData.json');
drive.files.get(
    {fileId: fileId, alt: "media"},
    {responseType: "stream"},
    (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
      res.data.pipe(dest);
    }
  );