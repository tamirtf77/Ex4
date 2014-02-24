var PORT = 8001;
var LOOPS = 500;

var miniHttp = require('./miniHttp');
var NETmodule = require('net');
var miniExpress = require("./miniExpress");
var app = miniExpress();
var HTTPmodule = require('http');
app.use('/y',miniExpress.static(__dirname + '/www'));
app.listen(PORT);
var filesToGet = ['/y/bibi.jpg', '/y/style.css', '/y/calculator.js', '/y/hello-world-for-test.txt','/y/jQuery.js'];

var start = new Date();
var end = undefined;
var options = {
		hostname: '127.0.0.1',
		port: PORT,
		path: '/y/hello-world-for-test.txt',
		method: 'GET',
		headers: {
	          'Connection': 'keep-alive'
	      }
};

var counter = 0;
for (var i = 0; i < LOOPS; i++)
{
	for (var j = 0; j < filesToGet.length; j++ )
	{
		test(filesToGet[j],i*filesToGet.length+j);
	}
}

function test(fileName,number)
{
	options.path = fileName;
	var req = HTTPmodule.request(options, function(res){
	    res.on("data", function (chunk) {
	    });
	    res.on("end", function () {
	    	if (res.statusCode === 200)
	    	{
	    		counter++;
    	    }
	    	if (counter === (LOOPS * filesToGet.length) )
	    	{
	    		var end = new Date();
	    		console.log('Total time for ' + (LOOPS * filesToGet.length) + ' requests is ' + (end-start) +' milliseconds');
	    	}
	    });
	    res.on("error",function(e){
	    	if ('ECONNRESET' != e.code) 
	    	{
	    		console.log(e);
            	process.exit();
       		}
	    });
	});
	req.on("error",function(e){
		console.log('can not connect');
		process.exit();
	});
	req.end();
}