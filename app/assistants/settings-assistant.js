function SettingsAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
}

SettingsAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
    
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    this.controller.setupWidget('enabled-spinner', {}, { spinning: false });
    this.controller.setupWidget('enabled', {modelProperty:'value'}, this.enabledModel = {});

    /* add event handlers to listen to events from widgets */
    Mojo.Event.listen(this.controller.get('enabled'), Mojo.Event.propertyChange,
        this.handleEnable.bind(this));
};

SettingsAssistant.prototype.enabled = function (obj) {
    this.controller.get('enabled-spinner').mojo.stop(); //addClassName('hidden');
    this.controller.showAlertDialog({
        title: $L("SUCCESS"),
        message: "yay",
        choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
    });
};

SettingsAssistant.prototype.errorEnabling = function (oops) {
    this.controller.get('enabled-spinner').mojo.stop(); //addClassName('hidden');
    this.enabledModel.value = false;
    this.controller.showAlertDialog({
        title: $L("Oops, couldn't enable"),
        message: oops.errorText,
        choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
    });
};

SettingsAssistant.prototype.disabled = function (obj) {
    this.controller.get('enabled-spinner').addClassName('hidden');
};

SettingsAssistant.prototype.errorDisabling = function (oops) {
    this.controller.get('enabled-spinner').addClassName('hidden');
    this.enabledModel.value = true;
    this.controller.showAlertDialog({
        title: $L("Oops, couldn't disable"),
        message: oops.errorText,
        choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
    });
};

SettingsAssistant.prototype.handleEnable = function(event) {
    if (event.property != 'value') {
        return;
    }

    this.controller.get('enabled-spinner').mojo.start(); //removeClassName('hidden');

    if (event.value) {
        // Set up the timer subscription?
        this.controller.serviceRequest("palm://com.palm.power/timeout", {
            method: "set",
            parameters: {
                wakeup: false,
                key: "org.markpasc.paperplain.activate",
                uri: "palm://com.palm.applicationManager/launch",
                params: '{id:"org.markpasc.paperplain", params:{"action":"swappaper"}}',
                'in': "00:05:00"
            },
            onSuccess: this.enabled.bind(this),
            onFailure: this.errorEnabling.bind(this)
        });
    }
    else {
        // Delete the timer subscription.
        this.controller.serviceRequest("palm://com.palm.power/timeout", {
            method: "clear",
            parameters: {
                key: "org.markpasc.paperplain.activate"
            },
            onSuccess: this.disabled.bind(this),
            onFailure: this.errorDisabling.bind(this)
        });
    }
};

SettingsAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
};

SettingsAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

SettingsAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};
