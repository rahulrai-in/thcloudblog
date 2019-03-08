import Parser from 'rss-parser';
import { Feed } from 'feed';

export function handler(event, context, callback) {
  (async () => {
    let parser = new Parser();
    let parsedFeed = await parser.parseURL(
      'https://thecloudblog.net/post/index.xml'
    );

    const feed = new Feed({
      title: parsedFeed.title,
      description: parsedFeed.description,
      link: parsedFeed.link,
      language: 'en',
      generator: 'The Cloud Blog',
      author: {
        name: 'Rahul Rai',
        email: parsedFeed.email
      }
    });
    parsedFeed.items.shift();
    parsedFeed.items
      .filter((value, index) => index < 5)
      .forEach(item => {
        feed.addItem({
          title: item.title,
          link: item.link,
          description: item.content,
          published: new Date(item.isoDate),
          date: new Date(item.isoDate),
          guid: item.guid
        });
      });
    callback(null, { statusCode: 200, body: feed.atom1() });
  })();
}
