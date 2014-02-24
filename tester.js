var PORT = 8001;
var options = {
		host: '127.0.0.1'
};
options.port = PORT;

var HTTPmodule = require('./miniHttp');
var NETmodule = require('net');
var miniExpress = require("./miniExpress");
var app = miniExpress();
var server;

test0();
function runTests()
{
	server.close();
	app.use('/y',miniExpress.static(__dirname + '/www'));
	(server = HTTPmodule.createServer(app)).listen(PORT);
	
	var tests = [test1,test2,test3,test4,test5,test6,test7,test8,test9,test10,
	            test11,test12,test13,test14];
	for (var p = 0; p < tests.length; p++)
	{
		tests[p]();
	}
	setTimeout(function(){
		console.log();console.log();
		var testsDynamic = [test15,test16,test17,test18,test19,test20,test21,test22,test23,test24];
		for (var p = 0; p < testsDynamic.length; p++)
		{
			testsDynamic[p]();
		}
		},5000);
}

function sendWithSocket(request,start,check,success,failed)
{
	console.log(start);
	var socket = NETmodule.connect(options,function() {
		  socket.write(request);
		});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it is the header.
		{
			var d = chunk.toString();
			if (d.indexOf(check) !== -1)
			{
				console.log(success);
			}
			else
			{
				console.log(failed);
			}
			i++;
		}
	});
	socket.on('error', function(e) {
		console.log('problem with request 1: ' + e.message);
	});
}

/***** Test0 - check listen without use */
function test0()
{
	(server = HTTPmodule.createServer(app)).listen(PORT);
	console.log('0.start test_no_use');
	var socket0 = NETmodule.connect(options,function() {
			  socket0.write('GET /Hello_world.txt HTTP/1.1\r\n' +
			             'Host: 127.0.0.1\r\n' +
			             'Connection: keep-alive\r\n' + 
			              '\r\n');
			});
	var i0 = 0;
	socket0.on('data', function(chunk) {
		if (i0 === 0) //if it is the header.
		{
			var d = chunk.toString();
			if (d.indexOf('HTTP/1.1 404 Not Found') !== -1)
			{
				console.log('0.test_no_use SUCCEEDED');
			}
			else
			{
				console.log('0.test_no_use failed');
			}
			i0++;
		}
	});
	runTests();
	socket0.on('error', function(e) {
		console.log('problem with request 0: ' + e.message);
		runTests();
	});
}

/***** Test1 - check method not allowed */
function test1()
{
	var request = 'TRACE /Hello_world.txt HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
     '\r\n';
	sendWithSocket(request,'1.start test_MethodNotAllowed405','HTTP/1.1 405 Method Not Allowed',
			'1.test_MethodNotAllowed405 SUCCEEDED','1.test_MethodNotAllowed405 failed');
}

/***** Test2 - check internal problem - method not exists */
function test2()
{
	var request = 'GETT /profile.html HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
     '\r\n';
	sendWithSocket(request,'2.start test_MethodNotExists500','HTTP/1.1 500 Internal Server Error',
			'2.test_MethodNotExists500 SUCCEEDED','2.test_MethodNotExists500 failed');
}

/***** Test3 - check file not found */

function test3()
{
	var request = 'GET /profile.html HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
     '\r\n';
	sendWithSocket(request,'3.start test_FileNotFound404','HTTP/1.1 404 Not Found',
			'3.test_FileNotFound404 SUCCEEDED','3.test_FileNotFound404 failed');
}

/***** Test4 - check http1.0 with Connection: keep-alive */

function test4()
{
	console.log('4.start test_http1.0_with_Connection_keep-alive');
	var options4 = {
			host: '127.0.0.1'
	};
	options4.port = PORT;
	var socket4 = NETmodule.connect(options4, function() {
	  socket4.write('GET /y/style.css HTTP/1.0\r\n' +
	             'Host: 127.0.0.1\r\n' +
	             'Connection: keep-alive\r\n' + 
	              '\r\n');
	});
	var i4 = 0;
	socket4.on('data', function(chunk) {
		if (i4 === 0) //if it is the header.
		{
			var d = chunk.toString();
			if ( (d.indexOf('HTTP/1.0 200 OK') !== -1) && (d.indexOf('Connection: keep-alive') !== -1) )	
				{
					console.log('4.test_http1.0_with_Connection_keep-alive SUCCEEDED');
				}
				else
				{
					console.log('4.test_http1.0_with_Connection_keep-alive failed');
				}
		  i4++;
		}
	});
	socket4.on('end',function(e){
		console.log('4.test_http1.0_with_Connection_keep-alive: timeout of 2000 miliseconds - its OK!');
	});
	socket4.on('error', function(e) {
		console.log('problem with request 4: ' + e.message);
	});
}

/***** Test5 - check http1.1 with Connection: close */

function test5()
{
	console.log('5.start test_http1.1_with_Connection_close');
	var options5 = {
			host: '127.0.0.1'
	};
	options5.port = PORT;
	var socket5 = NETmodule.createConnection(PORT, function() {
		socket5.write('GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
	             'Host: 127.0.0.1\r\n' +
	             'Connection: close\r\n' + 
	              '\r\n');
	});

	socket5.on('data', function(chunk) {});
	socket5.on('end',function(){
		try
		{
			socket5.write('GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
		             'Host: 127.0.0.1\r\n' +
		             'Connection: close\r\n' + 
		              '\r\n');
		}
		catch(e)
		{
			console.log('5.test_http1.1_with_Connection_close SUCCEEDED');//test passed.
		}
	});
      socket5.on('error',function(e){
		console.log('5.test_http1.1_with_Connection_close SUCCEEDED');//test passed.
	});
}

/***** Test6 - check that the user can't access a file no under the root. **/

function test6()
{
	var request = 'GET /y/../readme.txt HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' + 
     '\r\n';
	sendWithSocket(request,'6.start test_cant_access_no_under_root404','HTTP/1.1 404 Not Found',
			'6.test_cant_access_no_under_root404 SUCCEEDED','6.test_cant_access_no_under_root404 failed');
}

/***** Test7 - check that the user can't send a complete http request after timeout(2000 miliseconds). */

function test7()
{
	console.log('7.start test_try_to_send_complete_http_request_after_timeout');
	var options7 = {
			host: '127.0.0.1'
	};
	options7.port = PORT;
	var socket7 = NETmodule.connect(options7, function() {
	  socket7.write('GET /y/style.css HTTP/');
	  setTimeout(function(){
		  socket7.write('1.1\r\nHost: 127.0.0.1\r\n' +
		             'Connection: keep-alive\r\n' + 
		  			  '\r\n');
	  },2500);

	});

	socket7.on('data', function(chunk) {
		if (chunk.toString().indexOf('200 OK') !== -1)
		{
			console.log('7.test_complete_http_request_after_timeout failed');
		}
	});
	socket7.on('error', function(e) {
		console.log('7.test_try_to_send_complete_http_request_after_timeout SUCCEEDED');
	});
}


/***** Test8 - check that the user get 500 Internal Server Error when he sends an incomplete HTTP request. */

function test8()
{
	console.log('8.start test_incomplete_HTTP_Request');

	var socket8 = NETmodule.connect(options, function() {
	  socket8.write('GET /y/style.css HTTP/1');

	});

	var i8 = 0;
	socket8.on('data', function(chunk) {
		if (i8 === 0) //if it is the header.
		{
			if (chunk.toString().indexOf('500 Internal Server Error') !== -1)	
			{
				console.log('8.test_incomplete_HTTP_Request SUCCEEDED');
			}
			else
			{
				console.log('8.test_incomplete_HTTP_Request failed');
			}
			i8++;
		}
	});
	socket8.on('error', function(e) {
			console.log('problem with request 8: ' + e.message);
	});
}

/***** Test9 - check get_single_file */

function test9()
{
	console.log('9.start test_get_simple_file');

	var socket = NETmodule.connect(options, function() {
		  socket.write('GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
				  		'Host: 127.0.0.1\r\n' +
				  		'Connection: keep-alive\r\n' + 
		  				'\r\n');

		});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it is the header.
		{
			var d = chunk.toString();
			if (d.indexOf('200 OK') !== -1)
			{
				console.log('9.test_get_simple_file SUCCEEDED');
			}
			else
			{
				console.log('9.test_get_simple_file failed');
			}
			i++;
		}
	});
	socket.on('error', function(e) {
		console.log('problem with request 9: ' + e.message);
	});
}


/***** Test10 - check http1.0 with no Connection: keep-alive. */

function test10()
{
	console.log('10.start test_http1.0_with_NO_Connection_keep_alive');

	var options10 = {
			host: '127.0.0.1'
	};
	options10.port = PORT;
	var socket10 = NETmodule.createConnection(PORT, function() {
		socket10.write('GET /y/hello-world-for-test.txt HTTP/1.0\r\n' +
	             'Host: 127.0.0.1\r\n\r\n');
	});

	socket10.on('data', function(chunk) {});
	socket10.on('end',function(){
		try
		{
			socket10.write('GET /y/hello-world-for-test.txt HTTP/1.0\r\n' +
		             'Host: 127.0.0.1\r\n\r\n');
			console.log('10.test_http1.0_with_NO_Connection_keep_alive failed');
		}
		catch(e)
		{
			console.log('10.test_http1.0_with_NO_Connection_keep_alive SUCCEEDED');
		}
	});
}


/***** Test11 - check invalid_http_version */

function test11()
{
	var request = 'GET /y/hello-world-for-test.txt HTTP/1.4\r\n' +
    'Host: 127.0.0.1\r\n' + 
     '\r\n';
	sendWithSocket(request,'11.start test_invalid_http_version','500 Internal Server Error',
			'11.test_invalid_http_version SUCCEEDED','11.test_invalid_http_version failed');
}

/***** Test12 - check Concatenated_HTTP_requests */

function test12()
{
	console.log('12.start test_concatenated_HTTP_requests');
	var options12 = {
			host: '127.0.0.1'
	};
	options12.port = PORT;
	var socket12 = NETmodule.connect(options12, function() {
		socket12.write('GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
		             'Host: 127.0.0.1\r\n' +
		             'Connection: keep-alive\r\n' + 
		              '\r\n' + 
		              'GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
			          'Host: 127.0.0.1\r\n' +
			          'Connection: keep-alive\r\n' + 
			          '\r\n'+
			          'GET /y/hello-world-for-test.txt HTTP/1.1\r\n' +
			          'Host: 127.0.0.1\r\n' +
			          'Connection: keep-alive\r\n' + 
			          '\r\n');

	});
	var i12 = 0;
	socket12.on('data', function(chunk) {
		var count = chunk.toString().match(/200 OK/g);
		if (count !== null){
			i12 += count.length;
		}
	});

	socket12.on('end', function(chunk) {
		if (i12 === 3) // i.e. it got 3 http response of 200 OK
		{
			console.log('12.test_concatenated_HTTP_requests SUCCEEDED');
		}
		else
		{
			console.log('12.test_concatenated_HTTP_requests failed');
		}
	});

	socket12.on('error', function(e) {
			console.log('problem with request 12: ' + e.message);
	});
}


/***** Test13 - check LFs instead of CRLFs */

function test13()
{
	console.log('13.start test_LFs instead of CRLFs');
	var options13 = {
			host: '127.0.0.1'
	};
	options13.port = PORT;
	var socket13 = NETmodule.connect(options13, function() {
		socket13.write('GET /y/hello-world-for-test.txt HTTP/1.1\n' +
		             'Host: 127.0.0.1\n' +
		             'Connection: keep-alive\n\n');

	});
	var i13 = 0;
	socket13.on('data', function(chunk) {
		if (i13 === 0) //if it's the header of http resposne.
		{
			if (chunk.toString().indexOf('200 OK') !== -1)
			{
				console.log('13.LFs instead of CRLFs SUCCEEDED');
			}
			else
			{
				console.log('13.LFs instead of CRLFs failed');
			}
			i13++;
		}
	});

	socket13.on('error', function(e) {
			console.log('problem with request 13: ' + e.message);
	});
}

/***** Test14 - check tolerance_of_spaces_BETWEEN_fields_in_initial_request_line */

function test14()
{
	console.log('14.start test_tolerance_of_spaces_initial_request_line');
	console.log();
	var options14 = {
			host: '127.0.0.1'
	};
	options14.port = PORT;
	var socket14 = NETmodule.connect(options14, function() {
		socket14.write('GET     /y/hello-world-for-test.txt          HTTP/1.1\n' +
		             'Host: 127.0.0.1\n' +
		             'Connection: keep-alive\n\n');

	});
	var i14 = 0;
	socket14.on('data', function(chunk) {
		if (i14 === 0) //if it's the header of http resposne.
		{
			if (chunk.toString().indexOf('200 OK') !== -1)
			{
				console.log('14.tolerance_of_spaces_BETWEEN_fields_in_initial_request_line SUCCEEDED');
			}
			else
			{
				console.log('14.tolerance_of_spaces_BETWEEN_fields_in_initial_request_line failed');
			}
			i14++;
		}
	});

	socket14.on('error', function(e) {
			console.log('problem with request 14: ' + e.message);
	});
}


function test15()
{
	app.get('/x/:z',function(req,res,next){
		req.body = 'Hello world';
		next();
	});
	app.use('/x/:z',function(req,res,next){
		res.send(200,req.body);
	});
	var request = 'GET /x/anything.txt HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
     '\r\n';
	console.log('Start to test with dynamic functions');
	console.log('15.start test_dynamic_with_next() /x/:z');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 1)
		{
			if (chunk.toString().indexOf('Hello world') !== -1)
			{
				console.log('15.test_dynamic_with_next() /x/:z SUCCEEDED');
			}
			else
			{
				console.log('15.test_dynamic_with_next() /x/:z failed');
			}
			i++;
		}
		if (i === 0) //if it's the header of http resposne.
		{
			if (chunk.toString().indexOf('200 OK') === -1)
			{
				console.log('15.test_dynamic_with_next() /x/:z failed');
			}
			else
			{
				i++;
			}

		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 15: ' + e.message);
	});
}

function test16()
{
	app.get('/cook/:c',function(req,res,next){
		res.cookie('name', 'alon', { domain: '.cook', path: '/cook', secure: true, expires: new Date(Date.now() + 900000) });
		next();
	});
	app.get('/cook/:c',function(req,res,next){
		res.send(200,'You get a cookie.');
	});
	var request = 'GET /cook/cookie HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
     '\r\n';
	console.log('16.start test_set_cookie /cook/:c');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 1)
		{
			if (chunk.toString().indexOf('You get a cookie.') !== -1)
			{
				console.log('16.test_set_cookie /cook/:c SUCCEEDED');
			}
			else
			{
				console.log('16.test_set_cookie /cook/:c failed');
			}
			i++;
		}
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') === -1) || (d.indexOf('name=alon') === -1) )
			{
				console.log('16.test_set_cookie /cook/:c failed');
			}
			else
			{
				i++;
			}
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 16: ' + e.message);
	});
}

function test17()
{
	app.get('/cookParser/:c',miniExpress.cookieParser());
	app.get('/cookParser/:c',function(req,res,next){
		res.send(200,req.cookies);
	});
	var request = 'GET /cookParser/cookie HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' + 
    'Cookie: name1=value1;name2=value2;name3=value3\r\n'+
     '\r\n';
	console.log('17.start test_cookieParser /cookParser/:c');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 1)
		{
			if (chunk.toString().indexOf(' "name1": "value1",\n  "name2": "value2",\n  "name3": "value3"') !== -1)
			{
				console.log('17.test_cookieParser /cookParser/:c SUCCEEDED');
			}
			else
			{
				console.log('17.test_cookieParser /cookParser/:c failed');
			}
			i++;
		}
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if (d.indexOf('200 OK') === -1)
			{
				console.log('17.test_cookieParser /cookParser/:c failed');
			}
			else
			{
				i++;
			}
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 17: ' + e.message);
	});
}

function test18()
{
	app.use('/paris/:p',function(req,res,next){
		res.set({'Content-Length':'5','Content-LengtH':'2'});
		res.set('CONTENT-LENGTH',6);
		res.send(200,'pariss');
	});
	
	var request = 'GET /paris/paris HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('18.start test_same_header /paris/:p');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('CONTENT-LENGTH: 6') !== -1) )
			{
				console.log('18.test_same_header /paris/:p SUCCEEDED');
			}
			else
			{
				console.log('18.test_same_header /paris/:p failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 18: ' + e.message);
	});
}

function test19()
{
	app.get('/query/query/query',function(req,res,next){
		res.send(200,req.query.user + ' ' + req.query.email);
	});
	
	var request = 'GET /query/query/query?user=tobi+mcgetr&email=tobi@learnboost.com HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('19.start test_query_parsing /query/query/query');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);
	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('Content-Length: 31') !== -1) )
			{
				console.log('19.test_query_parsing /query/query/query SUCCEEDED');
			}
			else
			{
				console.log('19.test_query_parsing /query/query/query failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 19: ' + e.message);
	});
}

function test20()
{
	app.use('/params/:who',function(req,res,next){
		res.send(req.param('who'));
	});
	
	var request = 'GET /params/London/England HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('20.start test_check_param params/:who');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('Content-Length: 6') !== -1) )
			{
				console.log('20.test_check_param params/:who SUCCEEDED');
			}
			else
			{
				console.log('20.test_check_param params/:who failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 20: ' + e.message);
	});
}

function test21()
{
	app.use('/send_op',function(req,res,next){
		res.send('send_tolerance',200);
	});
	
	var request = 'GET /send_op HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('21.start test_send_tolerance /send_op');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('Content-Length: 14') !== -1) )
			{
				console.log('21.test_send_tolerance /send_op SUCCEEDED');
			}
			else
			{
				console.log('21.test_send_tolerance /send_op failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 21: ' + e.message);
	});
}

function test22()
{
	app.use('/check_json',function(req,res,next){
		res.json([1,2,3]);
	});
	
	var request = 'GET /check_json HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('22.start test_check_json /check_json');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('Content-Type: application/json') !== -1) )
			{
				console.log('22.test_check_json /check_json SUCCEEDED');
			}
			else
			{
				console.log('22.test_check_json /check_json failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 22: ' + e.message);
	});
}

function test23()
{
	app.use('/inv',function(req,res,next){
		res.invalid();
	});
	
	var request = 'GET /inv HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('23.start test_invalid_property_of_res /inv');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if (d.indexOf('500 Internal Server Error') !== -1)
			{
				console.log('23.test_invalid_property_of_res /inv SUCCEEDED');
			}
			else
			{
				console.log('23.test_invalid_property_of_res /inv failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 23: ' + e.message);
	});
}

function test24()
{
	app.use(function(req,res,next){
		res.send('handle any request');
	});
	
	var request = 'GET /any/any/:any HTTP/1.1\r\n' +
    'Host: 127.0.0.1\r\n' +
    'Connection: keep-alive\r\n' +
     '\r\n';
	console.log('24.start test_handle_any_request');

	var socket = NETmodule.connect(options, function() {
		socket.write(request);

	});
	var i = 0;
	socket.on('data', function(chunk) {
		if (i === 0) //if it's the header of http resposne.
		{
			var d = chunk.toString();
			if ( (d.indexOf('200 OK') !== -1) && (d.indexOf('Content-Length: 18') !== -1) )
			{
				console.log('24.test_handle_any_request SUCCEEDED');
			}
			else
			{
				console.log('24.test_handle_any_request failed');
			}
			i++;
		}
	});
	
	socket.on('error', function(e) {
			console.log('problem with request 24: ' + e.message);
	});
}
