// call with jake -f ibs.jake default[cat,car,boat]
// this will display the tasks jake -f ibs.jake -T

util = require('util');



desc('Build All');
task('default', [], function (params) {
  jake.Task['ibs_android'].invoke();
  jake.Task['ibs_iphone'].invoke();
});

////////////////////////////
desc('Any prerequisites for preparation');
task('prepare', [], function (params) {
  console.log('preparing....');
  var result = {};
  result.mono = '/usr/bin/mono';
  result.mdtool = '/Applications/Xamarin\\ Studio.app/Contents/MacOS/mdtool build';
  complete(result);
});

////////////////////////////
desc('Build IBS Android');
task('ibs_android', ['prepare'], function (params) {
  config = jake.Task["prepare"].value;
  console.log('build ibs android', config );
});

////////////////////////////
desc('Build IBS IPhone');
task('ibs_iphone', ['prepare'], function (params) {
  config = jake.Task["prepare"].value;
  console.log('build ibs iphone', config);

//"/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" build '-c:Debug|iPhoneSimulator' ~/Code/DNS/BodyshopWindows/BodyshopWindows.sln
"/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" archive '-c:Release iPhone iBodyshop|iPhone' ~/Code/DNS/BodyshopWindows/BodyshopWindows.sln


});

////////////////////////////
jake.addListener('complete', function () {
  console.log('_____finished_____')
  process.exit();
});
