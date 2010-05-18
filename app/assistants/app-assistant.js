var MainStageName = 'settings';

function AppAssistant(appController) {
}

AppAssistant.prototype.handleLaunch = function (parameters) {
    Mojo.Log.info("Hi how are you");
    if (!parameters.action) {
        Mojo.Log.info("Oops, no action parameter; launching normally");
        this.launchStage();
    }
    else if (parameters.action == 'swappaper') {
        Mojo.Log.info("YAY SWAPPAPER ACTION");
        this.scheduleSwap();
        this.swapPaper();
    }
    else {
        Mojo.Log.info("Hmm, unrecognized action parameter '" + parameters.action + "'");
    }
};

AppAssistant.prototype.swapPaper = function () {
    Mojo.Log.info('SWAPPING WALLPAPER');

    // Pick a file, any file.
    var db;
    db = new Mojo.Depot({ name: 'wallpapers' }, function () {
        db.get('wallpapers', function (papers) {

            if (!papers) {
                Mojo.Log.info("Tried to pick a new wallpaper, but there aren't any to choose from");
                return;
            }

            var that_one = Math.floor(Math.random() * papers.length);
            var paper = papers[that_one];
            Mojo.Log.debug("Picked wallpaper " + paper);

            // Does that wallpaper exist?
            this.reqSwap = new Mojo.Service.Request('palm://com.palm.systemservice', {
                method: 'wallpaper/info',
                parameters: {
                    wallpaperFile: paper,
                },
                onSuccess: function (param) {
                    delete this.reqSwap;
                    this.setPaper(param.wallpaper);
                },
                onFailure: function () {
                    delete this.reqSwap;

                    Mojo.Log.debug("Couldn't info up that wallpaper; trying to import it");
                    this.reqSwap = new Mojo.Service.Request('palm://com.palm.systemservice', {
                        method: 'wallpaper/importWallpaper',
                        parameters: {
                            target: paper,
                        },
                        onSuccess: function (param) {
                            delete this.reqSwap;
                            this.setPaper(param.wallpaper);
                        },
                        onFailure: function () {
                            delete this.reqSwap;
                            Mojo.Log.error("Couldn't import wallpaper " + paper + " :(");
                        },
                    });

                }
            });

        }, function (oops) {
            Mojo.Log.error("Couldn't get wallpapers out of database: " + oops);
        });
    }, function (oops) {
        Mojo.Log.error("Couldn't open database, what: " + oops);
    });
};

AppAssistant.prototype.setPaper = function (paper) {
    // Set the new wallpaper to be the current one.
    this.reqSwap = Mojo.Service.Request('palm://com.palm.systemservice', {
        method: 'setPreferences',
        parameters: {
            'wallpaper': param.wallpaper,
        },
        onSuccess: function () {
            delete this.reqSwap;
            Mojo.Log.debug("Yay, set wallpaper!");
        },
        onFailure: function (oops) {
            delete this.reqSwap;
            Mojo.Log.error("Couldn't set wallpaper: " + oops.errorText);
        },
    });
}

AppAssistant.prototype.launchStage = function () {

    Mojo.Log.info('Need to launch! Are we open?');
    var stageProxy = this.controller.getStageProxy(MainStageName);
    var stageController = this.controller.getStageController(MainStageName);
    if (stageProxy) {
        if (stageController) {
            Mojo.Log.info("The stage is open! Let's switch to it");
            stageController.window.focus();
        }
        return;
    }
    Mojo.Log.info("No, not open, let's make a new stage")

    // Open us to the settings scene.
    this.controller.createStageWithCallback({
        'name': MainStageName,
        'lightweight': true,
    }, function (stageController) {
        Mojo.Log.info("Created stage, let's push the settings scene");
        stageController.pushScene('main');
    });

};

AppAssistant.prototype.scheduleSwap = function (succ, fail) {
    var now = new Date();
    var then = now.getTime() + 30 * 1000;  // 30 seconds
    var alarmTime = new Date(then);
    var alarmAt = [alarmTime.getUTCMonth()+1, alarmTime.getUTCDate(), alarmTime.getUTCFullYear()].join('/')
        + ' ' + [alarmTime.getUTCHours(), alarmTime.getUTCMinutes(), alarmTime.getUTCSeconds()].join(':')

    this.reqSchedule = new Mojo.Service.Request("palm://com.palm.power/timeout", {
        method: "set",
        parameters: {
            wakeup: false,
            key: "org.markpasc.paperplain.activate",
            uri: "palm://com.palm.applicationManager/launch",
            params: {
                id: "org.markpasc.paperplain",
                params: {"action": "swappaper"},
            },
            at: alarmAt,
        },
        onSuccess: function () { delete this.reqSchedule; if(succ) succ() },
        onFailure: function () { delete this.reqSchedule; if(fail) fail() },
    });
};

AppAssistant.prototype.unscheduleSwap = function (succ, fail) {
    this.reqUnschedule = new Mojo.Service.Request("palm://com.palm.power/timeout", {
        method: "clear",
        parameters: {
            key: "org.markpasc.paperplain.activate",
        },
        onSuccess: function () { delete this.reqUnschedule; if(succ) succ() },
        onFailure: function () { delete this.reqUnschedule; if(fail) fail() },
    });
};
