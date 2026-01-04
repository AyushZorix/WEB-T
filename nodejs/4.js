const http = require('http');
const url = require('url');
const dt = require('./MyModule');

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // Parse query string
    const q = url.parse(req.url, true).query;
    let a = parseInt(q.a);
    let b = parseInt(q.b);

    if (isNaN(a) || isNaN(b)) {
        res.write("<h3>Please provide valid query parameters ?a= and ?b=</h3>");
        res.end("<p>Example: http://localhost:8081/?a=10&b=5</p>");
        return;
    }

    res.write(`<h2>Arithmetic Operations</h2>`);
    res.write(`Addition: ${dt.add(a, b)} <br>`);
    res.write(`Subtraction: ${dt.sub(a, b)} <br>`);
    res.write(`Multiplication: ${dt.mul(a, b)} <br>`);
    res.write(`Division: ${dt.div(a, b)} <br>`);
    res.end();
}).listen(8082, () => {
    console.log("Server running at http://localhost:8082/");
});