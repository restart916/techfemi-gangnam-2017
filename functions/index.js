var functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.test3 = functions.database.ref('/comments/{objectId}/comment')
    .onWrite(event => {
	    // Grab the current value of what was written to the Realtime Database.
	    const comment = event.data.val();
	   	if (comment == null) {
	   		return null;
	   	}

	    console.log('test', comment);

	    let len = comment.length;
	    console.log('test len:', len);

	    if (len > 30) {
			console.log('delete data');
			return event.data.ref.parent.remove();
	    }

	    let datetime = new Date();
	    return event.data.ref.parent.child('datetime').set(datetime);

	    // You must return a Promise when performing asynchronous tasks inside a Functions such as
	    // writing to the Firebase Realtime Database.
	    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
	    // return event.data.ref.parent.child('comments2').set(original);
    });