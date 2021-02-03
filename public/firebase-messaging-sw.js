importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js');

importScripts('https://www.gstatic.com/firebasejs/7.17.1/firebase-messaging.js');
/*Update this config*/
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

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  //console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
	icon: 'https://www.poojapandit.in/web_assets/img/logo.png',
	data:{noti_type:payload.data.noti_type,type:payload.data.type}
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
self.addEventListener('notificationclick', function(event) {
	var noti_type=event.notification.data.noti_type;
    var type=event.notification.data.type;
	event.preventDefault();
	var link='https://www.poojapandit.in';
	if (type == 'pandit') {
        if (noti_type == 1) {
            link = 'https://www.poojapandit.in/panditweb/pandit_account';
        } else if (noti_type == 2) {
            link = 'https://www.poojapandit.in/panditweb/booking';
        } else if (noti_type == 3) {
            link = 'https://www.poojapandit.in/panditweb/pandit_account';
        } else if (noti_type == 4) {
            link = 'https://www.poojapandit.in/panditweb/booking';
        } else if (noti_type == 5) {
            link = 'https://www.poojapandit.in/panditweb/pandit_account';
        } else {
            link = 'https://www.poojapandit.in';
        }
    } else if (type == 'user') {
        if (noti_type == 1) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 2) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 3) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 4) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 5) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 6) {
            link = 'https://www.poojapandit.in/custom-booking-list';
        } else if (noti_type == 7) {
            link = 'https://www.poojapandit.in/custom-booking-list';
        } else if (noti_type == 8) {
            link = 'https://www.poojapandit.in/order';
        } else if (noti_type == 9) {
            link = 'https://www.poojapandit.in';
        } else {
            link = 'https://www.poojapandit.in';
        }
    } else if (type == 'shopkeeper') {
        if (noti_type == 1) {
            link = 'https://www.poojapandit.in/shopkeeperweb/shopkeeper_account';
        } else if (noti_type == 2) {
            link = 'https://www.poojapandit.in/shopkeeperweb/booking';
        } else if (noti_type == 3) {
            link = 'https://www.poojapandit.in/shopkeeperweb/shopkeeper_account';
        } else {
            link = 'https://www.poojapandit.in';
        }
    }else if (type == 'visitor') {
        if (noti_type == 1) {
            link = 'https://www.poojapandit.in/live-pooja';
        } else if (noti_type == 2) {
            link = 'https://www.poojapandit.in/all-horoscope';
        } else if (noti_type == 3) {
            link = 'https://www.poojapandit.in/muhurt';
        } else {
            link = 'https://www.poojapandit.in';
        }
    } else {
        link = 'https://www.poojapandit.in';
    }
	clients.openWindow(link, '_blank');
});
// [END background_handler]