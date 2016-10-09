$(document).ready(function(){
	//Insert plugin code here
	var clicked = false;

	var objects = {
		facebookButton : document.querySelector('#messenger'),
		browserOverlay : document.querySelector('.overlay')
	}

	objects.facebookButton.onclick = function(){
		//Open the facebook messenger overlay
		clicked = !clicked;

		clicked ? objects.browserOverlay.classList.remove('hidden') : objects.browserOverlay.classList.add('hidden');
	}
});
