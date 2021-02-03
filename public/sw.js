// JavaScript Document
self.addEventListener('install',(e)=>{
	//console.log('serviceWorker install');
});
self.addEventListener('notificationclick', function (event) {
    //console.log(event);
    event.notification.close();
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