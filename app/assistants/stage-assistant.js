function StageAssistant() {
    /* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the stage is first created */
    this.controller.pushScene('settings');
};

StageAssistant.prototype.handleLaunch = function (parameters) {
    if (parameters.action == 'swappaper') {
        Mojo.Controller.getAppController().showBanner('O HAI SWAPPY PAPER', {source:'notification'});
    }
};
