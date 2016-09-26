const debug = true;

'use strict';

publicTabController = null; 

class TabController{
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
            if(tabLocation.childNodes[i].id === this.getSelectedTabObject().tab.id){
                tabLocation.removeChild(tabLocation.childNodes[i]);
            }
        }
    }

    setTabTitle(tab, title){ 
        var t; 
        if(title.length > 8) 
            t = title.substring(0, 8);
        else 
            t = title;
        tab.innerHTML = t;
    }

    setSelectedTab(tab){
        for(var i = 0; i < this.buttons.tabs.length; i++){
            this.setTabNotSelected(this.buttons.tabs[i]);
        }
        tab.classList.add('tab-selected');
    }

    setTabNotSelected(tab){
        tab.classList.remove('tab-selected');        
    }

    getSelectedTabObject(){
        var _ret = document.querySelector('.tab-selected');

        if(debug) console.log(_ret);

        return { 
            tab : _ret,
            webview : document.querySelector('#web-object-'+_ret.id)
        }
    }

    //Creates a tab and webview component to go with it.
    addTab(url){
        if(this.currentTab != null) this.setTabNotSelected(this.currentTab);

        var webviewTemplate = "<div id='web-tab-"+this.tabID+"'><webview id='web-object-tab-"+this.tabID+"' src='"+url+"' allowpopups disablewebsecurity preload='inject.js' plugins></webview></div>"; 
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

        return _ret; //Return a tab object
    }

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
    constructor(buttons, objects){
        this.buttons = buttons;
        this.objects = objects;   
        this.homepage = "http://www.google.ca";

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
        
        window.onresize = () => this.resizeLayout();

        this.resizeLayout();
    }

    handleExit() {
        console.log("Handling exit! Not Implemented Yet!");
    }

    handleLoadStart() {
        if(debug) console.log("Load Start");
        
        browserObject.buttons.refreshButton.image.classList.add('loading');
    }

    handleLoadStop() {
        if(debug) console.log("Load Stop");

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

    handleNewWindow(e) { 
        this.addTabButtonDown(e.url);
    }

    handleNewTitle(e){
        this.currentTab = this.tabController.getSelectedTabObject().tab;
        this.tabController.setTabTitle(this.currentTab, e.title);
    }

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

    resizeLayout(){
        this.allWebViews = document.querySelectorAll('webview');

        var controlsHeight = this.objects.controls.offsetHeight;
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        var webviewHeight = windowHeight - controlsHeight - 35;

        for(var i = 0; i < this.objects.allWebViews.length; i++){
            var obj = this.objects.allWebViews[i];

            console.log(obj);

            obj.style.width = windowWidth + 'px';
            obj.style.height = webviewHeight + 'px';
        }
    }

    urlBarSubmit(url){
        this.navigateTo(url);
    }

    navigateTo(url){
        this.currentWebView = this.tabController.getCurrentWebView();

        if(url.includes('/') || url.includes(':'))
            this.currentWebView.src = url;
        else
            this.currentWebView.src = this.toURL(url);

        this.objects.locationField.value = this.currentWebView.src;
    }

    toURL(input){
        var _ret;

        if(debug) console.log(input);

        if(input === "")
            _ret = this.homepage;
        else if(!input.includes('.') && !input.includes(' '))
            _ret = "http://www."+input+".com";
        else if(input.includes('.ca') | input.includes('.com') || input.includes('.org'))
            _ret = "http://www."+input;
        else
            _ret = "http://www.google.ca/search?q="+input;

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
        tabs            : document.querySelectorAll('.tab')
    }

    var Objects = { 
        locationField   : document.querySelector('#location'),
        locationForm    : document.querySelector('#location-form'),
        controls        : document.querySelector('#controls'),
        webviewLocation : document.querySelector('.web-view-control-group'),
        tabLocation     : document.querySelector('.tabs'),
        allWebViews     : document.querySelectorAll('webview')
    }
     
    var browser = new Browser(Buttons, Objects);
    window.onresize = browser.resizeLayout();
    browser.resizeLayout();
}); 