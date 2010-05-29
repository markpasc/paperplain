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
    this.controller.setupWidget('selected-wallpaper', {
        listTemplate: 'main/papers-list',
        itemTemplate: 'main/papers-item',
        swipeToDelete: true,
        autoconfirmDelete: false,
        addItemLabel: 'Add',
        onItemRendered: function () { Mojo.Log.info('YAY RENDER ITEM') }
    }, this.selectedModel = {
        listTitle: "Selected wallpaper",
        items: []
    });

    // Snap the enabled switch to the correct setting, somewhen.
    var updateSwitch = function (alreadyEnabled) {
        this.enabledModel.value = alreadyEnabled;
        this.controller.modelChanged(this.enabledModel);
    };
    this.paperdepot.get('enabled', updateSwitch.bind(this));

    Mojo.Log.info('Filling list with "wallpapers" infos from depot');
    this.paperdepot.get('wallpapers', this.updateSelectedWallpaper.bind(this));

    /* add event handlers to listen to events from widgets */
    Mojo.Event.listen(this.controller.get('enabled'), Mojo.Event.propertyChange,
        this.handleEnable.bind(this));
    Mojo.Event.listen(this.controller.get('selected-wallpaper'), Mojo.Event.listAdd,
        this.handleAddPaper.bind(this));
    Mojo.Event.listen(this.controller.get('selected-wallpaper'), Mojo.Event.listDelete,
        this.handleDeletePaper.bind(this));
};

MainAssistant.prototype.updateSelectedWallpaper = function (paper) {
    if (!paper || !paper.wallpapers)
        paper = { wallpapers: [] };

    var papers = paper.wallpapers.slice(0);
    Mojo.Log.info('Updating wallpaper list with', typeof papers, papers);
    for (var i = 0; i < papers.length; i++) {
        papers[i] = {'fullpath': papers[i]};
    }
    this.selectedModel.items = papers;
    Mojo.Log.info('Yay infos are now', this.selectedModel.items);
    this.controller.modelChanged(this.selectedModel);
};

MainAssistant.prototype.enabled = function (obj) {
    var reallyEnabled = function () {
        this.controller.get('enabled-spinner').mojo.stop(); //addClassName('hidden');
        Mojo.Log.info("Enabled paper swapping");
    };
    this.paperdepot.add('enabled', true, reallyEnabled.bind(this));
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
    var reallyDisabled = function () {
        this.controller.get('enabled-spinner').addClassName('hidden');
        Mojo.Log.info("Disabled paper swapping");
    };
    this.paperdepot.add('enabled', false, reallyDisabled.bind(this));
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
        this.paperdepot.discard('papercycle');

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
        // Here in javascriptland we need to use a URI-escaped version of
        // this path, and yet the file picker didn't escape it. Awesome.
        var fullPath = picked.fullPath.replace(/ /g, '%20');

        var addPaperToWallpapers = function (papers) {
            if (!papers)
                papers = { wallpapers: [] };

            papers.wallpapers.push(fullPath);
            this.paperdepot.add('wallpapers', papers);

            this.updateSelectedWallpaper(papers);
        };
        this.paperdepot.get('wallpapers', addPaperToWallpapers.bind(this));

        var addPaperToCycle = function (papers) {
            if (!papers)
                papers = { wallpapers: [] };

            papers.wallpapers.push(fullPath);
            this.paperdepot.add('papercycle', papers);
        };
        this.paperdepot.get('papercycle', addPaperToCycle.bind(this));
    };

    Mojo.FilePicker.pickFile({
        kinds: ['image'],
        actionName: 'Add',
        onSelect: addPaper.bind(this),
    }, stageController);
};

MainAssistant.prototype.handleDeletePaper = function (event) {
    var item = event.item;
    Mojo.Log.info('Huh deleting', item, 'i guess');

    var removePaperFromWallpapers = function (papers) {
        if (!papers || !papers.wallpapers || !papers.wallpapers.length)
            return;

        var wallp = papers.wallpapers;
        var itemInWallpapers = wallp.indexOf(item.fullpath);
        if (itemInWallpapers == -1) {
            Mojo.Log.info("Wanted to remove", item.fullpath, "from wallpapers, but it's already not there");
            return;
        }

        wallp.splice(itemInWallpapers, 1);
        this.paperdepot.add('wallpapers', papers);
        // The list deleter already removed the item, so don't need to re-update it.
    };
    this.paperdepot.get('wallpapers', removePaperFromWallpapers.bind(this));

    var removePaperFromCycle = function (papers) {
        if (!papers || !papers.wallpapers || !papers.wallpapers.length)
            return;

        var wallp = papers.wallpapers;
        var itemInWallpapers = wallp.indexOf(item.fullpath);
        if (itemInWallpapers == -1) {
            Mojo.Log.info("Wanted to remove", item.fullpath, "from cycle, but it's already not there");
            return;
        }

        wallp.splice(itemInWallpapers, 1);
        this.paperdepot.add('papercycle', papers);
    };
    this.paperdepot.get('papercycle', removePaperFromCycle.bind(this));
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
