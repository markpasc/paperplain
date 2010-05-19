function MainAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
    this.paperdepot = new Mojo.Depot({
        name: 'wallpapers',
        version: 1,
        replace: false,
    },
        function () { Mojo.Log.info("Yay opened wallpapers depot") },
        function (oops) { Mojo.Log.info("Oops, couldn't open depot: ", oops); }
    );
}

MainAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
    
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    this.controller.setupWidget('enabled-spinner', {}, { spinning: false });
    this.controller.setupWidget('enabled', {modelProperty:'value'}, this.enabledModel = {});
    this.controller.setupWidget('addpaper', {}, this.addpaperModel = { label: "Add wallpaper" });

    /* add event handlers to listen to events from widgets */
    Mojo.Event.listen(this.controller.get('enabled'), Mojo.Event.propertyChange,
        this.handleEnable.bind(this));
    Mojo.Event.listen(this.controller.get('addpaper'), Mojo.Event.tap,
        this.handleAddPaper.bind(this));
};

MainAssistant.prototype.enabled = function (obj) {
    this.controller.get('enabled-spinner').mojo.stop(); //addClassName('hidden');
    Mojo.Log.info("Enabled paper swapping");
};

MainAssistant.prototype.errorEnabling = function (oops) {
    this.controller.get('enabled-spinner').mojo.stop(); //addClassName('hidden');
    this.enabledModel.value = false;
    Mojo.Log.error("Couldn't enable paper swapping: " + oops.errorText);
    this.controller.showAlertDialog({
        title: $L("Oops, couldn't enable"),
        message: oops.errorText,
        choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
    });
};

MainAssistant.prototype.disabled = function (obj) {
    this.controller.get('enabled-spinner').addClassName('hidden');
    Mojo.Log.info("Disabled paper swapping");
};

MainAssistant.prototype.errorDisabling = function (oops) {
    this.controller.get('enabled-spinner').addClassName('hidden');
    this.enabledModel.value = true;
    Mojo.Log.error("Couldn't disable paper swapping: " + oops.errorText);
    this.controller.showAlertDialog({
        title: $L("Oops, couldn't disable"),
        message: oops.errorText,
        choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
    });
};

MainAssistant.prototype.handleEnable = function(event) {
    if (event.property != 'value') {
        return;
    }

    this.controller.get('enabled-spinner').mojo.start(); //removeClassName('hidden');

    var appController = Mojo.Controller.getAppController();
    if (event.value) {
        // Set up the timer subscription?
        Mojo.Log.info("Trying to schedule paper swapping");
        appController.assistant.scheduleSwap(
            this.enabled.bind(this),
            this.errorEnabling.bind(this)
        );
    }
    else {
        // Delete the timer subscription.
        Mojo.Log.info("Trying to unschedule paper swapping");
        appController.assistant.unscheduleSwap(
            this.disabled.bind(this),
            this.errorDisabling.bind(this)
        );
    }
};

MainAssistant.prototype.handleAddPaper = function (event) {
    var stageController = Mojo.Controller.getAppController().getStageController('settings');

    var addPaper = function (picked) {
        var addPaperToDepot = function (papers) {
            if (!papers)
                papers = { wallpapers: [] };

            Mojo.Log.info("YAY PAPERS AM ", Object.toJSON(papers));

            papers.wallpapers.push(picked.fullPath);

            this.paperdepot.add('wallpapers', papers, function () {
                Mojo.Log.info("YAY SAVED A PAPER " + picked.fullPath);
            }, function (oops) {
                Mojo.Log.error("Couldn't save new wallpaper " + picked.fullPath + " to wallpapers: " + oops);
            });
        };

        this.paperdepot.get('wallpapers', addPaperToDepot.bind(this));
    };

    Mojo.FilePicker.pickFile({
        kinds: ['image'],
        actionName: 'Add',
        onSelect: addPaper.bind(this),
    }, stageController);
};

MainAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
};

MainAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};
