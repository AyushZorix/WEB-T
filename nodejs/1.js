var http = require('http');

http.createServer(function (req, res) {
    console.log("connecting");
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write("<body bgcolor='cyan'>");
    res.write("<h1>Hello World</h1>");
    res.write("</body>");
    res.end("<h1>good morning</h1>");
    
}).listen(8080)