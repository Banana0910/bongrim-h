const { google } = require('googleapis');
const { client_secret, client_id, redirect_uris, token } = require('./youtube_token.json');

const oauth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
oauth2Client.credentials = token;

function search_videos(word) {
    return new Promise((resolve, reject) => {
        google.youtube('v3').search.list({
            auth: oauth2Client,
            part: 'snippet',
            q: word,
            type: 'video',
            maxResults: 10,
        }, function(err, res) {
            if (err) { reject(err) }
            const items = res.data.items;
            resolve(items.map(item => ({ title: item.snippet.title, vid_id: item.id.videoId })));
        });
    });
}

function search_video(word) {
    return new Promise((resolve, reject) => {
        google.youtube('v3').search.list({
            auth: oauth2Client,
            part: 'snippet',
            q: word,
            type: 'video',
            maxResults: 1,
        }, function(err, res) {
            if (err) { reject(err); }
            const items = res.data.items;
            resolve(items[0].id.videoId);
        });
    });
}

function get_list(list_id) {
    return new Promise((resolve, reject) => {
        google.youtube('v3').playlistItems.list({
            auth: oauth2Client,
            part: 'contentDetails',
            playlistId: list_id,
            maxResults: 50
        }, function(err,res) {
            if (err) { reject(err); }
            const items = res.data.items;
            resolve(items.map(item => item.contentDetails.videoId));
        })
    })
}

module.exports.search_videos = search_videos;
module.exports.search_video = search_video;
module.exports.get_list = get_list;