import Parser from 'rss-parser';
import axios from 'axios';

export function handler(event, context, callback) {
  // get first post from feed.
  var getTopPost = async () => {
    let parser = new Parser();
    let parsedFeed = await parser.parseURL(
      'https://thecloudblog.net/post/index.xml'
    );
    return parsedFeed.items.shift();
  };

  // send notification with onesignal.
  var sendNotification = async (messageToPost, clickUrl) => {
    try {
      const body = JSON.parse(event.body);
      if (!body.onesignalToken || !body.appId) {
        throw 'onesignalToken or appId not specified in request payload';
      }

      var result = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: body.appId,
          included_segments: 'Subscribed Users',
          contents: {
            en: 'Just released on The Cloud Blog: '.concat(messageToPost)
          },
          url: clickUrl
        },
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            authorization: 'Basic '.concat(body.onesignalToken)
          }
        }
      );
      return result;
    } catch (error) {
      throw error;
    }
  };

  // workflow.
  var process = async () => {
    try {
      let topPost = await getTopPost();
      if (!topPost.title || !topPost.link) {
        throw 'no content received from rss top post';
      }

      let result = await sendNotification(topPost.title, topPost.link);
      return { status: result.status, statusText: result.statusText };
    } catch (error) {
      throw error;
    }
  };

  process()
    .then(res =>
      callback(null, { statusCode: res.status, body: res.statusText })
    )
    .catch(err => callback(err));
}
