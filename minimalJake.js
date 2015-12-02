task('some_task_1', {async: true}, function () {
    console.log("|- Doing something");

    var execCallback = function() {
        console.log("  |- Done something");
        complete();
    };

    setTimeout(execCallback, 2000);
});

task('some_task_2', {async: true}, function () {
    console.log("|- Doing something else");

    var execCallback = function() {
        console.log("  |- Done something else");
        complete();
    };

    setTimeout(execCallback, 2000);
});

task('task_runner', {async: true}, function () {
    var firstTask = jake.Task['some_task_1'];
    var secondTask = jake.Task['some_task_2'];

    firstTask.addListener("complete", function() { secondTask.invoke(); });
    secondTask.addListener("complete", function() { complete(); });

    firstTask.invoke();
});

task('default', function () {
    jake.Task['task_runner'].invoke();
});