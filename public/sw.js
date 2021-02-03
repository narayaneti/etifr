// JavaScript Document
self.addEventListener('install',(e)=>{
	//console.log('serviceWorker install');
});
self.addEventListener('notificationclick', function (event) {
    //console.log(event);
    event.notification.close();
    var noti_type=event.notification.data.noti_type;
	event.preventDefault();
	var link='https://narayaneti.herokuapp.com/';
        if (noti_type == 1) {
            link = 'https://narayaneti.herokuapp.com/upcoming-payment';
        } else if (noti_type == 2) {
            link = 'https://narayaneti.herokuapp.com/due-payment';
        } 
    
	clients.openWindow(link, '_blank');
});