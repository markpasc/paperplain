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
        Mojo.Controller.getAppController().showBanner('O HAI SWAPPY PAPER', {source:'notification'});
    }
    else {
        Mojo.Log.info("Hmm, unrecognized action parameter '" + parameters.action + "'");
    }
};

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
