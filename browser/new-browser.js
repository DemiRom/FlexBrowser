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

        for(var i = 0; i < this.objects.allWebViews.length; i++){
            this.objects.allWebViews[i].addEventListener('close', () => this.handleExit());
            this.objects.allWebViews[i].addEventListener('did-start-loading', () => this.handleLoadStart());
            this.objects.allWebViews[i].addEventListener('did-stop-loading', () => handleLoadStop());
            this.objects.allWebViews[i].addEventListener('did-fail-load', () => handleLoadAbort());
            this.objects.allWebViews[i].addEventListener('did-get-redirect-request', () => handleLoadRedirect());
            this.objects.allWebViews[i].addEventListener('did-finish-load', () => handleLoadCommit());
        }

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
        console.log("Handling Loading Start! Not Implemented Yet!");
    }

    handleLoadStop() {

    }

    handleLoadAbort() {

    }

    handleLoadRedirect() {

    }

    handleLoadCommit() { 

    }


    addTabButtonDown(){
        this.tabController.addTab(this.homepage);
    }

    removeTabButtonDown(){
        this.tabController.removeTab();
    }

    backButtonDown(){
        
    }

    forwardButtonDown(){

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