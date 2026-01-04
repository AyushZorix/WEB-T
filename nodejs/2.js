var url = require('url');
var http = require('http');

function add( var1 , var2) {
    return var1 + var2;
}
http.createServer(function (req, res) {
res.writeHead(200, {'Content-Type': 'text/html'});
var q = url.parse(req.url, true).query;
var a = parseInt(q.var1);
var b = parseInt(q.var2);
var result = add(a, b);
res.end("The result of addition is: " + result);
}).listen(8081);