const config = require('../config'),

// node modules defined in package.json

	c = require('irc-colors'),
	cheerio = require('cheerio'),
	getYouTubeID = require('get-youtube-id'),
	moment = require('moment'),
	numeral = require('numeral'),
	request = require('request'),
	youtube = require('youtube-api');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text) {
        if(text.startsWith(config.botPrefix)) return

        if (text.match(/(http|https):\/\/(i\.imgur|imgur)\.(com\/gallery\/|com\/r\/(\S+)\/|com\/)(\S+)/g)) {
            var imgurR = /(?:http|https):\/\/(?:i\.imgur|imgur)\.(?:com\/gallery\/|com\/r\/(?:\S+)\/|com\/)(\S+)/g;

            var imageID = imgurR.exec(text)[1];
            imageID = /[^.]*/.exec(imageID)[0];

            var requestURL = 'https://imgur.com/gallery/' + imageID;
            request(requestURL, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var $ = cheerio.load(body);
                    var imageTitle = $('title').text().trim();
                    if (imageTitle !== 'Imgur') {
                        bot.say(to, c.bold('Imgur: ') + imageTitle.replace(' - Imgur', ''));
                    }
                }
            });
        } else if (text.match(/(https?(:\/\/))?(www.)?youtu(be|.be)?(.com)?\/(watch\?v=)?(\S+)/gi)) {
            var ytID = getYouTubeID(text);

            youtube.videos.list({
                part: 'snippet, contentDetails, statistics',
                id: ytID
            }, function (error, data) {
                if (!error && data.items[0]) {
                    var nsfw, contentRating = data.items[0].contentDetails.contentRating;
                    if (contentRating) {
                        if (contentRating.ytRating === 'ytAgeRestricted') {
                            nsfw = c.bold.red.bgwhite('NSFW') + ' | ';
                        } else {
                            nsfw = '';
                        }
                    } else {
                        nsfw = '';
                    }
                    /*
                    var ytSummaryOutput = nsfw + 'Youtube title: ' + c.bold(data.items[0].snippet.title) +
                        ' | Duration: ' + moment.duration(data.items[0].contentDetails.duration).format('hh:mm:ss', { trim: false }) +
                        ' | Like: ' + c.green(numeral(data.items[0].statistics.likeCount).format('0,0')) +
                        ' / Dislike: ' + c.red(numeral(data.items[0].statistics.dislikeCount).format('0,0')) +
                        ' | Views: ' + numeral(data.items[0].statistics.viewCount).format('0,0');
                    */

                    var ytSummaryOutput = nsfw + c.bold('Youtube | ') + c.underline(data.items[0].snippet.title) +
                        ' by ' + c.bold(data.items[0].snippet.channelTitle) +
                        c.bold(' | ') + moment.duration(data.items[0].contentDetails.duration).format('hh:mm:ss', { trim: false });

                    bot.say(to, ytSummaryOutput);
                } else {
                    bot.say(to, 'Something went wrong while trying to get information about that Youtube video, call CSI to zoom-enhance & investigate.');
                }
            });
        } else if (text.match(/https?:\/\/twitter.com\/\w*(\/status\/\d*)?/gi)) {
            var twitterURL = text.match(/https?:\/\/twitter.com\/\w*(\/status\/\d*)?/gi);
            request(twitterURL[0], function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var $ = cheerio.load(body);
                    var twitterTitle = $('title').text().trim();
                    console.log("tt: " + body);
                    
                    twitterTitle = twitterTitle.split(':');
                    var twitterTitleText = twitterTitle[1].split('http')[0].substring(2);
                    bot.say(to, 'Twitter' + c.bold(' | ' + twitterTitle[0].split(' on Twitter')[0] + ' | ') + twitterTitleText);
                }
            });
        } else if (text.match(/https?:\/\/github.com\/\S*/gi)) {
            var githubURL = text.match(/https?:\/\/github.com\/\S*/gi);
            request(githubURL[0], function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var $ = cheerio.load(body);
                    var githubDescription = $('.repository-description').text().trim();
                    var githubUserFullName = $('.vcard-fullname').text().trim();
                    var githubUserNick = $('.vcard-username ').text().trim();
                    var githubOrganisationName = $('.org-name').text().trim();
                    console.log(githubDescription);
                    console.log(githubUserFullName);
                    console.log(githubUserNick);
                    

                    if (githubDescription !== '') {
                        bot.say(to, c.bold('GitHub: ') + githubDescription);
                    } else if (githubUserFullName !== '' && githubUserNick !== '') {
                        bot.say(to, c.bold('GitHub user: ') + githubUserFullName + ' (' + githubUserNick + ')');
                    } else if (githubUserFullName === '' && githubUserNick !== '') {
                        bot.say(to, c.bold('GitHub user: ') + githubUserNick);
                    } else if (githubOrganisationName !== '') {
                        bot.say(to, c.bold('GitHub organisation: ') + githubOrganisationName);
                    }
                }
            });
        } else if (text.match(/http?s:\/\/(www.)?soundcloud.com\/([^\/]*)\/(\S*)/gi)) {
            var soundCloudLink = text.match(/http?s:\/\/(www.)?soundcloud.com\/([^\/]*)\/(.*)/gi);
            request({
                    uri: soundCloudLink[0],
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0'
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var soundCloudSongID = body.match(/soundcloud:\/\/sounds:\d*/i);
                        soundCloudSongID = soundCloudSongID[0].match(/\d{6,}/g);

                        if (soundCloudSongID[0]) {
                            soundCloudLink = 'https://api.soundcloud.com/tracks/' + soundCloudSongID[0] + '.json?client_id=' + config.soundCloudClientID;
                            request({
                                    uri: soundCloudLink,
                                    method: 'GET',
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0'
                                    }
                                }, function (error, response, data) {
                                    if (!error && response.statusCode === 200) {
                                        data = JSON.parse(data);

                                        var soundCloudSummary = 'SoundCloud:' + c.bold(data.title) +
                                            ' | Duration: ' + moment.duration(data.duration).format('hh:mm:ss', { trim: false }) +
                                            ' | Likes: ' + c.green(numeral(data.favoritings_count).format('0,0')) +
                                            ' | Played: ' + c.white(numeral(data.playback_count).format('0,0')) + ' times';
                                        bot.say(to, soundCloudSummary);
                                    }
                                });
                        }
                    }
                });
        }
    },

    config: {
        type: "message"
    }
}