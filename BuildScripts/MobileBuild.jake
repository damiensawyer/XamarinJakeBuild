// call with jake -f ibs.jake default[cat,car,boat]
// this will display the tasks jake -f ibs.jake -T
// 

/*
  Notes on Jake - "Tasks should execute serially, but shell commands within a task should be run in parallel." --  https://srackham.wordpress.com/2014/08/23/switching-from-grunt-to-jake/
*/

util = require('util');
var child_process = require('child_process');
desc('Build All');
task('default', [], function (params) {
  jake.Task['ibs_android'].invoke();
  jake.Task['ibs_iphone'].invoke();
});

// It was a PITA getting Jake to run syncronously. This seems to have done it.
process.shellSync = function(cmd){
    var r = child_process.execSync(cmd);
    process.stdout.write(r);
}

desc('Any prerequisites for preparation');
task('prepare', [], function (params) {
  console.log('preparing....');
  var result = {};
  result.mono = '/usr/bin/mono';
  result.xbuild = '/Library/Frameworks/Mono.framework/Commands/xbuild';
  
  result.iPhoneProjectBuildPath = '~/code/DNS/XamarinJakeBuild/iOS/bin/iPhone/Release/';
  result.iPhoneProject = '~/code/DNS/XamarinJakeBuild/iOS/XamarinJakeBuild.iOS.csproj';
  result.outputPath = '~/jakeBuildOutput'; 
  return result;
  //result.mdtool = '/Applications/Xamarin\\ Studio.app/Contents/MacOS/mdtool build';

  //complete(result);  // only call complete if async
  
});

desc('Delete Files From Previous Builds');
task('delete_old', ['prepare'], function (params) {
  console.log('delete old');
  config = jake.Task["prepare"].value;
  // Note -- all of these are run async
  var cmds = [
    //'rm -rf /Users/damiensawyer/temp/jake',
    //'rm -rf ' + config.xCodeArchive + '*',
    'rm -rf ' + config.outputPath 
  ];

 jake.exec(cmds);
});

desc('Create new folders');
task('create_new', ['delete_old'], function (params) {
  console.log('create new');
  // Note -- all of these are run async... so, if you want them sequential, join with ;
  /// This task isn't really needed - but serves as a demo of running shell commands in sequence.
  var cmd = 'mkdir ' + config.outputPath;
  process.shellSync (cmd);
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
  
  var cmd =  config.xbuild + ' ' + config.iPhoneProject + ' /p:Configuration=Release /p:Platform=iPhone /p:BuildIpa=true';
  process.shellSync(cmd);
  process.shellSync('cp ' + config.iPhoneProjectBuildPath + '*.ipa ' + config.outputPath);
  
  
}, {async:false});
  
  

// // "/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" archive '-c:Release|iPhone' '-p:XamarinJakeBuild.iOS' /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln

// // "/Applications/Xamarin Studio.app/Contents/MacOS/mdtool" build '-c:Release|iPhone' '-p:XamarinJakeBuild.iOS' /Users/damiensawyer/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln 



// });

// //////////////////////////
// jake.addListener('complete', function () {
//   console.log('_____finished_____')
//   process.exit();
// });


//Library/Frameworks/Mono.framework/Commands/xbuild YourSolution.sln /p:Configuration=Ad-Hoc /p:Platform=iPhone /p:BuildIpa=true


// ipa notes https://developer.xamarin.com/guides/ios/deployment,_testing,_and_metrics/app_distribution/ipa_support/


///Library/Frameworks/Mono.framework/Commands/xbuild ~/code/DNS/XamarinJakeBuild/XamarinJakeBuild.sln /p:Configuration=Release /p:Platform=iPhone /p:BuildIpa=true
//Library/Frameworks/Mono.framework/Commands/xbuild ~/code/DNS/XamarinJakeBuild/iOS/XamarinJakeBuild.iOS.csproj /p:Configuration=Release /p:Platform=iPhone /p:BuildIpa=true 


// builds it here bin/iPhone/Release/XamarinJakeBuild.iOS-1.0.ipa