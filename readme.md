MPEG1 Streaming Demo using jsmpg.js
===================================

MPEG1 streaming demo using iSight
with [jsmpg.js](https://github.com/phoboslab/jsmpeg)

Installation
------------

```
$ npm install ws express
```


Run
---

Start streaming WebSocket and homepage server
```
$ node app.js 1111
Listening for MPEG Stream on http://127.0.0.1:8082/1111/1024/576
Awaiting WebSocket connections on ws://127.0.0.1:8084/
Demo web page listening on http://127.0.0.1:3000
```

Start ffmpeg for incoming stream from iSight
```
ffmpeg -s 1024x576 -f avfoundation -i "0" -f mpeg1video -b 800k -r 30 http://localhost:8082/1111/1024/576
```

Open the page http://127.0.0.1:3000
