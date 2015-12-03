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
    
  result.droidProject = '~/code/DNS/XamarinJakeBuild/Droid/XamarinJakeBuild.Droid.csproj';
  result.droidProjectBuildPath = '~/code/DNS/XamarinJakeBuild/Droid/bin/Release/';
  result.droidKeystore = '~/keystore/debug.keystore';
  result.droidKeystoreStorePass = 'mysecret123'; // to do: pass this as argument
  result.droidKeyname = 'android';
  result.outputPath = '~/jakeBuildOutput/'; 
  result.apkPresigned = 'com.sample.xamarinjakebuild.apk';
  result.apkPostsigned = 'xamarinjakebuild.apk';
  return result;
  //result.mdtool = '/Applications/Xamarin\\ Studio.app/Contents/MacOS/mdtool build';

  //complete(result);  // only call complete if async
  
});

desc('Delete Files From Previous Builds');
task('delete_old', ['prepare'], function (params) {
  console.log('delete old');
  config = jake.Task["prepare"].value;
  process.shellSync('rm -rf ' + config.outputPath);
  process.shellSync('rm -rf ' + config.droidProjectBuildPath);
});

desc('Create new folders');
task('create_new', ['delete_old'], function (params) {
  console.log('create new');
  // Note -- all of these are run async... so, if you want them sequential, join with ;
  /// This task isn't really needed - but serves as a demo of running shell commands in sequence.
  var cmd = 'mkdir ' + config.outputPath;
  process.shellSync (cmd);
 });

////////////////////////////
desc('Build IBS Android');
task('ibs_android', ['create_new'], function (params) {
  config = jake.Task["prepare"].value;
  var cmd =  config.xbuild + ' ' + config.droidProject + ' /p:Configuration=Release /p:Platform=AnyCPU /t:PackageForAndroid';
  // NOTE!!! This might not be signed correctly!  "The APK found in the bin/Release folder has been signed with the debug keystore that is used by Xamarin.Android; therefore, you should not distribute this APK. https://developer.xamarin.com/guides/android/deployment,_testing,_and_metrics/publishing_an_application/part_2_-_signing_the_android_application_package/#signing_legacy" 
  console.log('build ibs android', config, cmd );
  process.shellSync(cmd);
   process.shellSync('cp ' + config.droidProjectBuildPath + '*.apk ' + config.outputPath);
});

desc('Sign apk and install on phone');
task('deploy_android', ['create_new', 'ibs_android'], function (params) {
  config = jake.Task["prepare"].value;
  // Xamarin notes: https://developer.xamarin.com/guides/android/deployment,_testing,_and_metrics/publishing_an_application/part_2_-_signing_the_android_application_package/#signing_legacy
  // Android deploy instructions: http://stackoverflow.com/a/20878125/494635
  //var jarsign = 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ' + config.droidKeystore + ' ' + config.outputPath + config.apkPresigned + ' ' + config.droidKeyname;
  var jarsign = ['jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore', config.droidKeystore, config.outputPath + config.apkPresigned, config.droidKeyname, '-storepass ' + config.droidKeystoreStorePass].join(' ');
     process.shellSync(jarsign);
  
  var za = ['zipalign -f -v 4', config.outputPath + config.apkPresigned, config.outputPath + config.apkPostsigned].join(' ');
  process.shellSync(za);
  
  //process.shellSync()
  
  // generate keystore: keytool -genkey -v -keystore debug.keystore -alias android -keyalg RSA -keysize 2048 -validity 20000
  // list the aliase sin a keystore: keytool -list -keystore debug.keystore 
  // zipalign (creates output xamjake.apk to distribute): zipalign -f -v 5 com.sample.xamarinjakebuild.apk xamjake.apk

});


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