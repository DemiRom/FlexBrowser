class Webview{

	webviewObject: object; //Dom object, applied when creating it.

	url: string;
	id: number;

	constructor(url: string, id: number){
		this.url = url;
		this.webviewObject = document.querySelector('#webview-'+id);
		this.id = id;
	}

	navigateTo(url: string){
		this.webviewObject.src = url; 
	}
}
