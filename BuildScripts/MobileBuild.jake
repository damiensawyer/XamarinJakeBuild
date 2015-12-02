// call with jake -f ibs.jake default[cat,car,boat]
// this will display the tasks jake -f ibs.jake -T
// 

/*
  Notes on Jake - "Tasks should execute serially, but shell commands within a task should be run in parallel." --  https://srackham.wordpress.com/2014/08/23/switching-from-grunt-to-jake/
*/

util = require('util');

desc('Build All');
task('default', [], function (params) {
  jake.Task['ibs_android'].invoke();
  jake.Task['ibs_iphone'].invoke();
});

desc('Any prerequisites for preparation');
task('prepare', [], function (params) {
  console.log('preparing....');
  var result = {};
  result.mono = '/usr/bin/mono';
  result.mdtool = '/Applications/Xamarin\\ Studio.app/Contents/MacOS/mdtool build';
  result.xCodeArchive = '/Users/damiensawyer/Library/Developer/Xcode/Archives/'
  return result;
  //complete(result);  // only call complete if async
});

desc('Delete Files From Previous Builds');
task('delete_old', ['prepare'], function (params) {
  console.log('delete old');
  config = jake.Task["prepare"].value;
  // Note -- all of these are run async
  var cmds = [
    'rm -rf /Users/damiensawyer/temp/jake',
    'rm -rf ' + config.xCodeArchive + '*' 
  ];

 jake.exec(cmds);
});

desc('Create new folders');
task('create_new', ['delete_old'], function (params) {
  console.log('create new');
  // Note -- all of these are run async... so, if you want them sequential, join with ;
  /// This task isn't really needed - but serves as a demo of running shell commands in sequence.
  var cmds = [
    //'mkdir /Users/damiensawyer/temp/jake;' 
    //+  'mkdir /Users/damiensawyer/temp/jake/damien;'
     '"/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" build "-c:Release|iPhone" "-p:XamarinJakeBuild.iOS" /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln'
   ];
  jake.exec(cmds,  {printStdout: true, printStderr:true, breakOnError:false});
 });

// ////////////////////////////
// desc('Build IBS Android');
// task('ibs_android', ['prepare'], function (params) {
//   config = jake.Task["prepare"].value;
//   console.log('build ibs android', config );
// });


desc('Build IBS IPhone');
task('ibs_iphone', ['create_new'], function (params) {
  var config = jake.Task["prepare"].value;
  console.log('building ibs iphone');
  
  var cmds = [
    //'"/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" build "-c:Release|iPhone" "-p:XamarinJakeBuild.iOS" /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln'
    'echo ddbuilding.....'
  ];

  jake.exec(cmds, {printStdout: true, printStderr:true, breakOnError:false});
  
  
}, {async:false});
  
  

// // "/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" archive '-c:Release|iPhone' '-p:XamarinJakeBuild.iOS' /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln

// // "/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" build '-c:Release|iPhone' '-p:XamarinJakeBuild.iOS' /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln 



// });

// //////////////////////////
// jake.addListener('complete', function () {
//   console.log('_____finished_____')
//   process.exit();
// });





