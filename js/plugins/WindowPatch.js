Window_Selectable.prototype.canProcessHandling =function(){
    return this.isOpenAndActive()  && !SceneManager.isSceneChanging() && !SceneManager.isCurrentSceneBusy();
}

Window_Selectable.prototype.processHandling = function() {
    if (this.canProcessHandling()) {
        if (this.isOkEnabled() && this.isOkTriggered()) {
            this.processOk();
        } else if (this.isCancelEnabled() && this.isCancelTriggered()) {
            this.processCancel();
        } else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
            this.processPagedown();
        } else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
            this.processPageup();
        }
    }
};
