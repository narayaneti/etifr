// <!-- The core Firebase JS SDK is always required and must be listed first -->
// <script src="https://www.gstatic.com/firebasejs/8.2.5/firebase-app.js"></script>

// <!-- TODO: Add SDKs for Firebase products that you want to use
//      https://firebase.google.com/docs/web/setup#available-libraries -->
// <script src="https://www.gstatic.com/firebasejs/8.2.5/firebase-analytics.js"></script>

// <script>
//   // Your web app's Firebase configuration
//   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
//   var firebaseConfig = {
//     apiKey: "AIzaSyB5APwS1p6nFc_6qPzdQDlyzczABfZebCU",
//     authDomain: "eti-finance-web.firebaseapp.com",
//     projectId: "eti-finance-web",
//     storageBucket: "eti-finance-web.appspot.com",
//     messagingSenderId: "1093580266644",
//     appId: "1:1093580266644:web:fa9d457cf2c0376d7a6881",
//     measurementId: "G-398VB7DQ58"
//   };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);
//   firebase.analytics();
// </script>

function base_url() {
    var pathparts = location.pathname.split('/');
    if (location.host == 'localhost') {
        var url = location.origin+'/'+pathparts[1].trim('/')+'/'; // http://localhost/myproject/
    }else{
        var url = location.origin; // http://stackoverflow.com
    }
    return url;
}

var config = {
	apiKey: "AIzaSyB5APwS1p6nFc_6qPzdQDlyzczABfZebCU",
    authDomain: "eti-finance-web.firebaseapp.com",
    //databaseURL: "https://quickstart-1594728531992.firebaseio.com",
    projectId: "eti-finance-web",
    storageBucket: "eti-finance-web.appspot.com",
    messagingSenderId: "1093580266644",
    appId: "1:1093580266644:web:fa9d457cf2c0376d7a6881",
    measurementId: "G-398VB7DQ58"
};
firebase.initializeApp(config);
// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();
messaging.requestPermission()
	.then(function() {
		//console.log('Notification permission granted.');
		if(isTokenSentToServer()) {
			//console.log('Token already saved.');
		}else {
			getRegToken();
		}
	})
	.catch(function(err) {
		console.log('Unable to get permission to notify.', err);
	});
function getRegToken(argument){
	messaging.getToken()
	.then(function(currentToken) {
		if (currentToken) {
			saveToken(currentToken);
			//console.log(currentToken);
			//setTokenSentToServer(true);
		} else {
			console.log('No Instance ID token available. Request permission to generate one.');
			setTokenSentToServer(false);
		}
	})
	.catch(function(err) {
		console.log('An error occurred while retrieving token. ', err);
		setTokenSentToServer(false);
	});
}
function setTokenSentToServer(sent) {
	window.localStorage.setItem('sentToServer', sent ? 1 : 0);
}
function isTokenSentToServer() {
	return window.localStorage.getItem('sentToServer') == 1;
}
function saveToken(currentToken) {
	$.ajax({
		url: base_url('index.php')+"index.php/Home/save_token",
		method: 'post',
		data: 'token=' + currentToken
	}).done(function(result){
		//console.log(result);
	})
}
navigator.serviceWorker.register(base_url('index.php')+'sw.js');
if('serviceWorker' in navigator){
	window.addEventListener('load',()=>{
		navigator.serviceWorker
			.register('sw.js')
			.then(reg=>console.log('serviceWorker: reg'))
			.catch(err=>console.log('serviceWorker: err :'+err));
			
	});
}

messaging.onMessage(function(payload) {
	//console.log("Message received. ", payload);
	notificationTitle = payload.data.title;
	notificationOptions = {
		body: payload.data.body,
		icon: 'https://www.poojapandit.in/web_assets/img/logo.png',
		vibrate: [200, 100, 200, 100, 200, 100, 200],
		data:{noti_type:payload.data.noti_type,type:payload.data.type}
	};
	Notification.requestPermission(function(result) {
		if (result === 'granted') {
			navigator.serviceWorker.ready.then(function(registration) {
				registration.showNotification(notificationTitle,notificationOptions);
			});
		}
	});
});
