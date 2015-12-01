// call with jake -f ibs.jake default[cat,car,boat]
// this will display the tasks jake -f ibs.jake -T

util = require('util')

desc('Task 1');

task('default', [], function (params) {
	console.log('This is the default task.');
	console.log(util.inspect(arguments));
	console.log(params);
});

desc('Task 2');

task('task2', [], function (params) {
	console.log('This is the second task.');
	console.log(util.inspect(arguments));
	console.log(params);
});