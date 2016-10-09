const debug = true;

'use strict';

publicTabController = null;

class TabController{
    /**
     * @constructor
     * @param {Object} buttons
     * @param {Object} objects
     */
    constructor(buttons, objects){
        this.buttons = buttons;
        this.objects = objects;

        this.tabID = 0;
    }

    removeTab(){
        var tabLocation = this.objects.tabLocation;
        var webViewLocation = this.objects.webviewLocation;

		for(var i = 1; i < webViewLocation.childNodes.length; i++){
			if(webViewLocation.childNodes[i].id.toString().substring(4, 9) === this.getSelectedTabObject().tab.id){
                webViewLocation.removeChild(webViewLocation.childNodes[i]);
            }
        }

        for(var i = 0; i < tabLocation.childNodes.length; i++){
			if(this.getSelectedTabObject() == null) return;
            if(tabLocation.childNodes[i].id === this.getSelectedTabObject().tab.id){
                tabLocation.removeChild(tabLocation.childNodes[i]);
            }
        }

		this.setSelectedTab(document.querySelectorAll('.tab')[document.querySelectorAll('.tab').length-1]);
    }

    /**
     * @param {Object} tab
     * @param {String} title
     */
    setTabTitle(tab, title){
        if(tab == null || tab === "") return;
        if(title == null || title === "") return;
        var t;
        if(title.length > 8)
            t = title.substring(0, 8) + "...";
        else
            t = title;
        tab.innerHTML = t;
    }

    /**
     * @param {Object} tab
     */
    setSelectedTab(tab){
		this.lastSelectedTab = this.currentTab;

        for(var i = 0; i < this.buttons.tabs.length; i++){
            this.setTabNotSelected(this.buttons.tabs[i]);
        }
        tab.classList.add('tab-selected');
		this.currentTab = tab;
    }

    /**
     * @param {Object} tab
     */
    setTabNotSelected(tab){
        tab.classList.remove('tab-selected');
    }

    getSelectedTabObject(){
        var _ret = document.querySelector('.tab-selected');

		if(_ret == null) return;

        if(debug) console.log(_ret);

        return {
            tab : _ret,
            webview : document.querySelector('#web-object-'+_ret.id)
        }
    }

    //Creates a tab and webview component to go with it.
    /**
     * @param {String} url
     */
    addTab(url){
        if(this.currentTab != null) this.setTabNotSelected(this.currentTab);

        var webviewTemplate = "<div id='web-tab-"+this.tabID+"'><webview id='web-object-tab-"+this.tabID+"' src='"+url+"' allowpopups disablewebsecurity plugins></webview></div>";
        this.objects.webviewLocation.innerHTML += webviewTemplate;

        this.currentWebView = document.querySelector('#web-object-tab-'+this.tabID);

        var title = "About: Blank";

        var tabTemplate = "<button class='tab' id='tab-"+this.tabID+"' title="+title+">"+title+"</button>";
        this.objects.tabLocation.innerHTML += tabTemplate;

        this.buttons.tabs = document.querySelectorAll('.tab');
        this.currentTab = document.querySelector('#tab-'+this.tabID);

        this.setSelectedTab(this.currentTab);

        var tabs = this.buttons.tabs;

        if(debug) console.log(tabs);

        publicTabController = this;

        this.currentWebView.addEventListener('dom-ready', function(e){
            publicTabController.setTabTitle(
                publicTabController.currentTab,
                publicTabController.currentWebView.getTitle()
            );
            publicTabController.objects.locationField.value = publicTabController.currentWebView.src;
        });

        for(var i = 0; i < tabs.length; i++){
            var tab = tabs[i];
            tab.onclick = function(){
                publicTabController.tabClicked(this);
            }
        }

        var _ret = {
            tab : this.currentTab,
            webview : this.currentWebView
        }

        if(debug) console.log(_ret);

        this.tabID++;

        resizeLayout();

        return _ret; //Return a tab object
    }

    /**
     * @param {Object} tab
     */
    tabClicked(tab){
        this.currentTab = tab;
        this.setSelectedTab(tab);

        this.currentWebView = document.querySelector('#web-object-'+tab.id);

        this.objects.allWebViews = document.querySelectorAll('webview');
        var webViews = this.objects.allWebViews;


        for(var i = 0; i < webViews.length; i++){
            $(webViews[i]).hide();
        }

        $(this.currentWebView).show();

        this.objects.locationField.value = this.currentWebView.src;
        this.setTabTitle(this.currentTab, this.currentWebView.getTitle());
    }

    resizeTab(){

    }

    getCurrentWebView(){
        return this.currentWebView;
    }
}

browserObject = null;

class Browser{ //Main Browser Class
    /**
     * @constructor
     * @param {Object} buttons
     * @param {Object} objects
     */
    constructor(buttons, objects){
        this.buttons = buttons;
        this.objects = objects;
        this.homepage = "http://www.google.ca";
		this.menuClicked = false;

        this.tabController = new TabController(buttons, objects);

        //Create first webview and tab.
        this.tabController.addTab(this.homepage);

        this.currentWebView = this.tabController.getSelectedTabObject().webview;

        this.objects.locationField.value = "";

        browserObject = this;

        this.objects.locationForm.onsubmit = function(e) {
            if(debug) console.log('Submitted!');
            e.preventDefault();
            browserObject.urlBarSubmit(objects.locationField.value);
        };

        this.buttons.addTabButton.onclick = () => {this.addTabButtonDown()};
        this.buttons.removeTabButton.onclick = () => {this.removeTabButtonDown()};
        this.buttons.backButton.onclick = () => {this.backButtonDown()};
        this.buttons.forwardButton.onclick = () => {this.forwardButtonDown()};
        this.buttons.refreshButton.button.onclick = () => {this.reloadButtonDown()};
        this.buttons.homeButton.onclick = () => {this.homeButtonDown()};
		this.buttons.menuButton.onclick = () => {this.menuButtonDown()};
    }

    handleExit() {
        console.log("Handling exit! Not Implemented Yet!");
    }

    handleLoadStart() {
        if(debug) console.log("Load Start");
        browserObject.objects.locationField.value = browserObject.currentWebView.src;
        browserObject.buttons.refreshButton.image.classList.add('loading');
    }

    handleLoadStop() {
        if(debug) console.log("Load Stop");
        browserObject.objects.locationField.value = browserObject.currentWebView.src;
        browserObject.buttons.refreshButton.image.classList.remove('loading');
    }

    handleLoadAbort() {
        console.log("Handling loading aborted! Not Implemented Yet!");
    }

    handleLoadRedirect() {
        console.log("Handling redirect! Not Implemented Yet!");
    }

    handleLoadCommit() {
        this.currentWebView = this.tabController.getCurrentWebView();

		this.buttons.backButton.disabled = !this.currentWebView.canGoBack();
		this.buttons.forwardButton.disabled = !this.currentWebView.canGoForward();
    }

    /**
     * @param {Object} e
     */
    handleNewWindow(e) {
        if(debug) console.log("Open new window!")
        this.addTabButtonDown(e.url);
    }

    /**
     * @param {Object} e
     */
    handleNewTitle(e){
        this.currentTab = this.tabController.getSelectedTabObject().tab;
        this.tabController.setTabTitle(this.currentTab, e.title);
    }

    /**
     * @param {String} url
     */
    addTabButtonDown(url){

        var tabObject
        if(url == null || url === "" )
            tabObject = this.tabController.addTab(this.homepage);
        else
            tabObject = this.tabController.addTab(url);

        var webview = tabObject.webview;

        webview.addEventListener('close', (e) => browserObject.handleExit(e));
		webview.addEventListener('did-start-loading', (e) => browserObject.handleLoadStart(e));
		webview.addEventListener('did-stop-loading', (e) => browserObject.handleLoadStop(e));
		webview.addEventListener('did-fail-load', (e) => browserObject.handleLoadAbort(e));
		webview.addEventListener('did-get-redirect-request', (e) => browserObject.handleLoadRedirect(e));
		webview.addEventListener('did-finish-load', (e) => browserObject.handleLoadCommit(e));
        webview.addEventListener('new-window', (e) => browserObject.handleNewWindow(e));
        webview.addEventListener('page-title-updated', (e) => browserObject.handleNewTitle(e));
    }

    removeTabButtonDown(){
        this.tabController.removeTab();
    }

    backButtonDown(){
        this.currentWebView.goBack();
    }

    forwardButtonDown(){
        this.currentWebView.goForward();
    }

    reloadButtonDown(){
        this.currentWebView = this.tabController.getCurrentWebView();
        if(debug) console.log('Reload Time!');
        this.currentWebView.reload();
    }

    homeButtonDown(){
        this.navigateTo(this.homepage);
    }

	menuButtonDown(){
		this.menuClicked = !this.menuClicked;
		this.menuClicked ? this.objects.menuObject.classList.remove('hidden') : this.objects.menuObject.classList.add('hidden');
	}

    /**
     * @param {String} url
     */
    urlBarSubmit(url){
        this.navigateTo(url);
    }

    treeCommand(){
        var html = "<html><body> </body></html>";
    }

    /**
     * @param {String} url
     */
    navigateTo(url){
        this.currentWebView = this.tabController.getCurrentWebView();

        if(url.includes('tree:')) console.log("Custom command: tree");
        if(url.includes('dlws:')) console.log("Custom command: website download");
        if(url.includes('cmnd:')) console.log("Custom command: JS Direct console");

        if(url.includes('ipv4:')) {
            this.navigateTo(url.substring(5, url.length));
            return;
        }
        if(url.includes('ipv6:')) {
            this.navigateTo(url.substring(5, url.length));
            return;
        }

        if(url.includes('//'))
            this.currentWebView.src = url;
        else
            this.currentWebView.src = this.toURL(url);

        this.objects.locationField.value = this.currentWebView.src;
    }

    /**
     * @param {String} input
     */
    toURL(input){
        var _ret;

        if(debug) console.log(input);

        if(input === "")
            _ret = this.homepage;
        else if(!input.includes('.') && !input.includes(' '))
            _ret = "http://www."+input+".com";
        else if(input.includes('.ca') | input.includes('.com') || input.includes('.org') || input.includes('.net'))
            _ret = "http://www."+input;
        else if(input.includes(' '))
            _ret = "http://www.google.ca/search?q="+input;
        else
            _ret = "http://"+input;

        return _ret;
    }
}

$(document).ready(function(){ //When the program finally loads the HTML
    var Buttons = {
        backButton      : document.querySelector('#back'),
        forwardButton   : document.querySelector('#forward'),
        refreshButton   : {
                            button : document.querySelector('#reload'),
                            image  : document.querySelector('#refresh')
                        },
        homeButton      : document.querySelector('#home'),
        addTabButton    : document.querySelector('#add-tab'),
        removeTabButton : document.querySelector('#remove-tab'),
        tabs            : document.querySelectorAll('.tab'),
		menuButton      : document.querySelector('#addons-menu')
    }

    var Objects = {
        locationField   : document.querySelector('#location'),
        locationForm    : document.querySelector('#location-form'),
        controls        : document.querySelector('#controls'),
        webviewLocation : document.querySelector('.web-view-control-group'),
        tabLocation     : document.querySelector('.tabs'),
        allWebViews     : document.querySelectorAll('webview'),
		menuObject      : document.querySelector('.menu')
    }

    var browser = new Browser(Buttons, Objects);
});
