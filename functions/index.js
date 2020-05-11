var functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
var moment = require('moment-timezone');

exports.test4 = functions.database.ref('/comments/{objectId}/comment')
    .onWrite(event => {
	    // Grab the current value of what was written to the Realtime Database.
			console.log('test', event);
			console.log('test', event.before, event.before.val());
			console.log('test', event.after, event.after.val());

			if (!event.after.exists()) {
				console.log('event delete');
        return null;
      }

	    let datetime = moment().tz("Asia/Seoul").format('YY-MM-DD HH:mm');
	    console.log('datetime', datetime);
	    // ;
	    return event.after.ref.parent.child('datetime').set(datetime);

	    // You must return a Promise when performing asynchronous tasks inside a Functions such as
	    // writing to the Firebase Realtime Database.
	    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
	    // return event.data.ref.parent.child('comments2').set(original);
    });
