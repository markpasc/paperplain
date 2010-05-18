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
