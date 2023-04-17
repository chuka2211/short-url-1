const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/shorten') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const longUrl = body.trim();
      const shortUrl = generateShortUrl();
      saveUrlMapping(longUrl, shortUrl);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(shortUrl);
    });
  } else if (req.method === 'GET') {
    const shortUrl = req.url.slice(1); // remove leading '/'
    const longUrl = getLongUrl(shortUrl);
    if (longUrl) {
      res.writeHead(301, { 'Location': longUrl });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET, POST' });
    res.end('405 Method Not Allowed');
  }
});

function generateShortUrl() {
  // generate a short random string for the short URL
  return Math.random().toString(36).substring(2, 8);
}

function saveUrlMapping(longUrl, shortUrl) {
  // save the URL mapping to a file
  fs.appendFileSync('urls.txt', `${shortUrl} ${longUrl}\n`);
}

function getLongUrl(shortUrl) {
  // read the URL mapping from the file and return the long URL
  const data = fs.readFileSync('urls.txt', 'utf8');
  const lines = data.trim().split('\n');
  for (let line of lines) {
    const [urlShort, urlLong] = line.split(' ');
    if (urlShort === shortUrl) {
      return urlLong;
    }
  }
  return null;
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});