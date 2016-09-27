window.onresize = doLayout;
var isLoading = false;

function TabController() {
	this.setTabSelected = function(tab){

	}, 
	this.setTabNotSelected = function(){

	}
}

function BrowserController() { 
	this.backButtonClicked = function() {

	}
}

$(document).ready(function(){
	var webview = document.querySelector('webview');
	var tabID = 0; 
	var selectedID = 0; 
	var tabTemplate = null;
	var webviewTemplate = null;
	var selectedTab = null;

		yout();

	var addTabButton   = $('#add-tab'); 
	var backButton     = $('#back');
	var forwardButton  = $('#forward');
	var homeButton     = $('#home');
	var refreshButton  = $('#reload');

	var tabGroupObject = $('.tabs');
	var tabObjects     = $('.tab');

	var webviewGroupObject = $('.web-view-control-group');

	var locationObject = $('#location');

	function setTabSelected(tab){
		tab.classList.add('tab-selected');
		selectedTab = tab;
		return tab;
	}

	function setTabNotSelected(tab){
		tab.classList.remove('tab-selected');

		return tab;
	}

	function getSelectedTab(){
		return document.querySelector('.tab-selected');
	}

	function addNewTab(title){ 
		var _retWebView;
		var _retTab; 

		function addNewWebView(url){
			webviewTemplate = "<div id='web-tab-"+tabID+"'><webview id='web-object-tab-"+tabID+"' src='"+url+"' allowpopups disablewebsecurity preload='inject.js' plugins></webview></div>"; 
			webviewGroupObject.html(webviewGroupObject.html() + webviewTemplate);	
			_retWebView = document.querySelector('web-object-tab-'+tabID);
		}

	    tabTemplate = '<button class="tab" id="tab-'+tabID+'" title="'+title+'">'+title+'</button>';	
		tabGroupObject.html(tabGroupObject.html() + tabTemplate);
		addNewWebView("http://www.google.ca");
		_retTab = document.querySelector('#tab-'+tabID);
		tabID++;

		setTabNotSelected(getSelectedTab);
		setTabSelected(_retTab);

		return {
			tab: _retTab,
			tabWebview: _retWebView
		}
	}

	function removeTab(tab){

	}

	function setTabTitle(tab, title){ 
		tab.innerHTML = title;
		tab.title = title;
	}

	//Add the first tab when the browser loads up
	var tabData = addNewTab("New Tab"); //TODO(Demetry): Change this to the home page label
	webview = tabData.tabWebiew;

	addTabButton.click(function(){ 		
		if(tabID < 9){ //TODO: Fix this to hide and make smaller
			addNewTab(null);
			if(tabID == 0){
				setTabSelected(document.querySelector('#tab-0'));				
			}
		}

		var query = document.querySelectorAll('.tab')
		for(var i = 0; i < query.length; i++){
      		query[i].onclick = function(){
				for(var j = 0; j < query.length; j++){
					setTabNotSelected(query[j]);
					$('#web-'+query[j].id).slideUp();
				}      
				setTabSelected(document.querySelector('#'+this.id));
				
				$('#web-'+this.id).slideDown();
				webview = document.querySelector('#web-object-'+this.id);
				document.querySelector('#location').value = webview.src;
				setTabTitle(document.querySelector('#'+this.id), webview.getTitle());
				doLayout();
      		}	
    	}
	});

	backButton.click(function(){
		webview.goBack();
	});

	forwardButton.click(function(){
		webview.goForward();
	});

	refreshButton.click(function(){
		if (isLoading) {
			webview.stop();
		} else {
			webview.reload();
		}
	});

	homeButton.click(function(){
		navigateTo("http://www.google.ca");
	});

	document.querySelector('#location-form').onsubmit = function(e) {
 	 	e.preventDefault();
  		navigateTo(document.querySelector('#location').value);
	};

	function navigateTo(url) {
  		resetExitedState();
  		if(url.includes('/') || url.includes(':') || url.includes('?')){
    		webview.src = url;
  		}else{
    		webview.src = "http://www.google.ca/search?q=" + url; 
  		}
		setTabTitle(webview.getTitle());
	}

	if(webview != null){
		webview.addEventListener('close', handleExit);
		webview.addEventListener('did-start-loading', handleLoadStart);
		webview.addEventListener('did-stop-loading', handleLoadStop);
		webview.addEventListener('did-fail-load', handleLoadAbort);
		webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
		webview.addEventListener('did-finish-load', handleLoadCommit);
	}

	function handleExit(event) {
		console.log(event.type);
		document.body.classList.add('exited');
		if (event.type == 'abnormal') {
			document.body.classList.add('crashed');
		} else if (event.type == 'killed') {
			document.body.classList.add('killed');
		}
	}

	function resetExitedState() {
		document.body.classList.remove('exited');
		document.body.classList.remove('crashed');
		document.body.classList.remove('killed');
	}

	function handleFindUpdate(event) {
		var findResults = document.querySelector('#find-results');
		if (event.searchText == "") {
			findResults.innerText = "";
		} else {
			findResults.innerText = event.activeMatchOrdinal + " of " + event.numberOfMatches;
		}

		// Ensure that the find box does not obscure the active match.
		if (event.finalUpdate && !event.canceled) {
			var findBox = document.querySelector('#find-box');
			findBox.style.left = "";
			findBox.style.opacity = "";
			var findBoxRect = findBox.getBoundingClientRect();
			if (findBoxObscuresActiveMatch(findBoxRect, event.selectionRect)) {
				// Move the find box out of the way if there is room on the screen, or
				// make it semi-transparent otherwise.
				var potentialLeft = event.selectionRect.left - findBoxRect.width - 10;
				if (potentialLeft >= 5) {
					findBox.style.left = potentialLeft + "px";
				} else {
					findBox.style.opacity = "0.5";
				}
			}
		}
	}

	function findBoxObscuresActiveMatch(findBoxRect, matchRect) {
		return findBoxRect.left < matchRect.left + matchRect.width &&
			findBoxRect.right > matchRect.left &&
			findBoxRect.top < matchRect.top + matchRect.height &&
			findBoxRect.bottom > matchRect.top;
	}

	function handleKeyDown(event) {
		if (event.ctrlKey) {
			switch (event.keyCode) {
			// Ctrl+F.
			case 70:
				event.preventDefault();
				openFindBox();
				break;

			// Ctrl++.
			case 107:
			case 187:
				event.preventDefault();
				increaseZoom();
				break;

			// Ctrl+-.
			case 109:
			case 189:
				event.preventDefault();
				decreaseZoom();
				break; 
			case 48:
				event.preventDefault();
				showHistory(); 
				break;
			}
		}
	}

	function showHistory(){
		console.log('Not Implemented Yet!');
	}

	function handleLoadCommit() {
		resetExitedState();
		var webview = document.querySelector('webview');
		document.querySelector('#location').value = webview.getURL();
		document.querySelector('#back').disabled = !webview.canGoBack();
		document.querySelector('#forward').disabled = !webview.canGoForward();
		closeBoxes();
	}

	function handleLoadStart(event) {
		document.body.classList.add('loading');
		isLoading = true;

		resetExitedState();
		if (!event.isTopLevel) {
			return;
		}

		document.querySelector('#location').value = event.url;
	}

	function handleLoadStop(event) {
		// We don't remove the loading class immediately, instead we let the animation
		// finish, so that the spinner doesn't jerkily reset back to the 0 position.
		document.querySelector('#location').value = webview.src;
		isLoading = false;
	}

	function handleLoadAbort(event) {
		var webview = document.querySelector('webview');
		document.querySelector('#location').value = webview.src;
		console.log('LoadAbort');
		console.log('  url: ' + event.url);
		console.log('  isTopLevel: ' + event.isTopLevel);
		console.log('  type: ' + event.type);
	}

	function handleLoadRedirect(event) {
		resetExitedState();
		document.querySelector('#location').value = event.newURL;
	}

	function getNextPresetZoom(zoomFactor) {
		var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
						2.5, 3, 4, 5];
		var low = 0;
		var high = preset.length - 1;
		var mid;
		while (high - low > 1) {
			mid = Math.floor((high + low)/2);
			if (preset[mid] < zoomFactor) {
			low = mid;
			} else if (preset[mid] > zoomFactor) {
			high = mid;
			} else {
			return {low: preset[mid - 1], high: preset[mid + 1]};
			}
		}
		return {low: preset[low], high: preset[high]};
	}

	function increaseZoom() {
		var webview = document.querySelector('webview');
		webview.getZoom(function(zoomFactor) {
			var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
			webview.setZoom(nextHigherZoom);
			document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
		});
	}

	function decreaseZoom() {
		var webview = document.querySelector('webview');
		webview.getZoom(function(zoomFactor) {
			var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
			webview.setZoom(nextLowerZoom);
			document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
		});
	}

	function openZoomBox() {
		document.querySelector('webview').getZoom(function(zoomFactor) {
			var zoomText = document.forms['zoom-form']['zoom-text'];
			zoomText.value = Number(zoomFactor.toFixed(6)).toString();
			document.querySelector('#zoom-box').style.display = '-webkit-flex';
			zoomText.select();
		});
	}

	function closeZoomBox() {
		//document.querySelector('#zoom-box').style.display = 'none';
	}

	function openFindBox() {
		document.querySelector('#find-box').style.display = 'block';
		document.forms['find-form']['find-text'].select();
	}

	function closeFindBox() {
		var findBox = document.querySelector('#find-box');
		//   findBox.style.display = 'none';
		//   findBox.style.left = "";
		//   findBox.style.opacity = "";
		//   document.querySelector('#find-results').innerText= "";
	}

	function closeBoxes() {
		closeZoomBox();
		closeFindBox();
	}

});

function doLayout() {
	var webview = document.querySelectorAll('webview');
	var controls = document.querySelector('#controls');
	var controlsHeight = controls.offsetHeight;
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var webviewWidth = windowWidth;
	var webviewHeight = windowHeight - controlsHeight - 35;

	for(var i = 0; i < webview.length; i++){
		webview[i].style.width = webviewWidth + 'px';
		webview[i].style.height = webviewHeight + 'px'; 
	}

	var sadWebview = document.querySelector('#sad-webview');
	sadWebview.style.width = webviewWidth + 'px';
	sadWebview.style.height = webviewHeight * 2/3 + 'px';
	sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

// onload = function() {
//   var webview = document.querySelector('webview');
//   doLayout();

//   var id = 0; 
//   var selectedId = 0; 
//   var selectedWebview = null;
//   document.querySelector('#add-tab').onclick = function() {
    
//     if(id < 9){
//       document.querySelector('.tabs').innerHTML += tabtemplate;
//       id++;
//     }
//     var query = document.querySelectorAll('.tab')
//     for(var i = 0; i < query.length; i++){
//       query[i].onclick = function(){
//         for(var j = 0; j < query.length; j++){
//           query[j].classList.remove('tab-selected');
//           $('#web-'+query[j].id).slideUp();
//         }      
//         document.querySelector('#'+this.id).classList.add('tab-selected');
//         $('#web-'+this.id).slideDown();
//         selectedWebview = $('#web-object-'+this.id);
//       }
//     }
//   };


//   document.querySelector('#back').onclick = function() {
//     webview.goBack();
//   };

//   document.querySelector('#forward').onclick = function() {
//     webview.goForward();
//   };

//   document.querySelector('#home').onclick = function() {
//     navigateTo(selectedWebview, 'http://www.google.com/');
//   };

//   document.querySelector('#reload').onclick = function() {
//     if (isLoading) {
//       webview.stop();
//     } else {
//       webview.reload();
//     }
//   };

//   document.querySelector('#reload').addEventListener(
//     'webkitAnimationIteration',
//     function() {
//       if (!isLoading) {
//         document.body.classList.remove('loading');
//       }
//     });

// 	 document.querySelector('#location-form').onsubmit = function(e) {
//  	 e.preventDefault();
//   	navigateTo(selectedWebview, document.querySelector('#location').value);
// 	 };

//   webview.addEventListener('close', handleExit);
//   webview.addEventListener('did-start-loading', handleLoadStart);
//   webview.addEventListener('did-stop-loading', handleLoadStop);
//   webview.addEventListener('did-fail-load', handleLoadAbort);
//   webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
//   webview.addEventListener('did-finish-load', handleLoadCommit);

//   // Test for the presence of the experimental <webview> zoom and find APIs.
//   if (typeof(webview.setZoom) == "function" &&
//       typeof(webview.find) == "function") {
//     var findMatchCase = false;

//     document.querySelector('#zoom').onclick = function() {
//       if(document.querySelector('#zoom-box').style.display == '-webkit-flex') {
//         closeZoomBox();
//       } else {
//         openZoomBox();
//       }
//     };

//     document.querySelector('#zoom-form').onsubmit = function(e) {
//       e.preventDefault();
//       var zoomText = document.forms['zoom-form']['zoom-text'];
//       var zoomFactor = Number(zoomText.value);
//       if (zoomFactor > 5) {
//         zoomText.value = "5";
//         zoomFactor = 5;
//       } else if (zoomFactor < 0.25) {
//         zoomText.value = "0.25";
//         zoomFactor = 0.25;
//       }
//       webview.setZoom(zoomFactor);
//     }

//     document.querySelector('#zoom-in').onclick = function(e) {
//       e.preventDefault();
//       increaseZoom();
//     }

//     document.querySelector('#zoom-out').onclick = function(e) {
//       e.preventDefault();
//       decreaseZoom();
//     }

//     document.querySelector('#find').onclick = function() {
//       if(document.querySelector('#find-box').style.display == 'block') {
//         document.querySelector('webview').stopFinding();
//         closeFindBox();
//       } else {
//         openFindBox();
//       }
//     };

//     document.querySelector('#find-text').oninput = function(e) {
//       webview.find(document.forms['find-form']['find-text'].value,
//                    {matchCase: findMatchCase});
//     }

//     document.querySelector('#find-text').onkeydown = function(e) {
//       if (event.ctrlKey && event.keyCode == 13) {
//         e.preventDefault();
//         webview.stopFinding('activate');
//         closeFindBox();
//       }
//     }

//     document.querySelector('#match-case').onclick = function(e) {
//       e.preventDefault();
//       findMatchCase = !findMatchCase;
//       var matchCase = document.querySelector('#match-case');
//       if (findMatchCase) {
//         matchCase.style.color = "blue";
//         matchCase.style['font-weight'] = "bold";
//       } else {
//         matchCase.style.color = "black";
//         matchCase.style['font-weight'] = "";
//       }
//       webview.find(document.forms['find-form']['find-text'].value,
//                    {matchCase: findMatchCase});
//     }

//     document.querySelector('#find-backward').onclick = function(e) {
//       e.preventDefault();
//       webview.find(document.forms['find-form']['find-text'].value,
//                    {backward: true, matchCase: findMatchCase});
//     }

//     document.querySelector('#find-form').onsubmit = function(e) {
//       e.preventDefault();
//       webview.find(document.forms['find-form']['find-text'].value,
//                    {matchCase: findMatchCase});
//     }

//     webview.addEventListener('findupdate', handleFindUpdate);
//     window.addEventListener('keydown', handleKeyDown);
//   } else {
//     var zoom = document.querySelector('#zoom');
//     var find = document.querySelector('#find');
//     //zoom.style.visibility = "hidden";
//     //zoom.style.position = "absolute";
//     //find.style.visibility = "hidden";
//     //find.style.position = "absolute";
//   }
// };