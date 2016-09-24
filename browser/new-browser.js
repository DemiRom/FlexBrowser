const debug = true;

class TabController{
    constructor(buttons, objects){
        this.buttons = buttons; 
        this.objects = objects;

        this.tabID = 0;
    }

    removeTab(tab){
        tab.parent.removeChild(tab.id);
    }

    setTabTitle(tab, title){ 
        tab.innerHTML = title;
    }

    setSelectedTab(tab){
        tab.classList.add('tab-selected');
    }

    setTabNotSelected(tab){
        tab.classList.remove('tab-selected');        
    }

    getSelectedTabObject(){
        var _ret = document.querySelector('.tab-selected');

        return { 
            tab : _ret,
            webview : document.querySelector('#web-object-'+_ret.id)
        }
    }

    //Creates a tab and webview component to go with it.
    addTab(url){
        var webviewTemplate = "<div id='web-tab-"+this.tabID+"'><webview id='web-object-tab-"+this.tabID+"' src='"+url+"' allowpopups disablewebsecurity preload='inject.js' plugins></webview></div>"; 
        document.querySelector('.web-view-control-group').innerHTML += webviewTemplate;

        this.currentWebView = document.querySelector('#web-object-tab-'+this.tabID);

        var title = "About: Blank";

        var tabTemplate = "<button class='tab' id='tab-'"+this.tabID+" title="+title+">"+title+"</button>"; 
        document.querySelector('.tabs').innerHTML += tabTemplate;

        this.currentTab = document.querySelector('#tab-'+this.tabID);

        this.setSelectedTab(this.currentTab);

        var _ret = {
            tab : this.currentTab,
            webview : this.currentWebView
        }

        if(debug) console.log('Returning Object: ' + _ret);

        this.tabID++;

        return _ret; //Return a tab object
    }
}

class Browser{ //Main Browser Class
    constructor(buttons, objects){
        this.buttons = buttons;
        this.objects = objects;   
        this.homepage = "http://www.google.ca";

        this.tabController = new TabController(buttons, objects);
        
        //Create first webview and tab.
        this.tabController.addTab(this.homepage);

        this.currentWebView = null;

        objects.locationField.value = "";
        objects.locationField.submit(this.urlBarSubmit(objects.locationField.value));

        buttons.addTabButton.click(this.addTabButtonDown());
        buttons.removeTabButton.click(this.removeTabButtonDown());
        buttons.backButton.click(this.handleBackButtonDown());
    }

    addTabButtonDown(){

    }

    removeTabButtonDown(){

    }

    backButtonDown(){
        
    }

    forwardButtonDown(){

    }

    reloadButtonDown(){

    }

    homeButtonDown(){

    }

    urlBarSubmit(url){
        this.navigateTo(url);
    }

    navigateTo(url){
        this.tabController.getSelectedTabObject.webview.src = url;
    }
}

$(document).ready(function(){ //When the program finally loads the HTML
    var Buttons = {
        backButton      : document.querySelector('#back'),
        fowardButton    : document.querySelector('#forward'), 
        refreshButton   : {
                            button : document.querySelector('#reload'),
                            image  : document.querySelector('#refresh')
                        }, 
        homeButton      : document.querySelector('#home'), 
        addTabButton    : document.querySelector('#add-tab'),
        removeTabButton : document.querySelector('#remove-tab')
    }

    var Objects = { 
        locationField  : document.querySelector('#location'),
        webviewLocaion : document.querySelector('webview-control-group')
    }
     
    var browser = new Browser(Buttons, Objects);

}); 