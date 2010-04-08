function FirstAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
}

FirstAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
        
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    
    /* add event handlers to listen to events from widgets */

    this.total = 0;
    this.controller.get('count').update(this.total);

    this.buttonattr = {};
    this.buttonmodel = {
        label: 'Tap me',
        buttonClass: '',
        disabled: false
    };
    this.controller.setupWidget('tap-me', this.buttonattr, this.buttonmodel);

    Mojo.Event.listen(this.controller.get('tap-me'), Mojo.Event.tap,
        this.handleButtonPress.bind(this));
};

FirstAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
};

FirstAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

FirstAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};

FirstAssistant.prototype.handleButtonPress = function (event) {
    this.total++;
    this.controller.get('count').update(this.total);
};
