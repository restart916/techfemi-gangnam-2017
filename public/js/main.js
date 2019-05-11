const requestCount = 15;
let datas = [];
let blockUsers = [];
let fbuser = null;
let vue1, vue2;

document.addEventListener('DOMContentLoaded', function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('data', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  try {
    let app = firebase.app();
    let features = ['auth', 'database', 'storage'].filter(feature => typeof app[feature] === 'function');
    //document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    //document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }

  // document.getElementsByClassName('twitter-login-button')[0].addEventListener('click', function(event) {
  //   event.preventDefault();
  //   console.log('click twitter-login-button');
  //   loginTwitter();
  // });

  // document.getElementsByClassName('logout-button')[0].addEventListener('click', function(event) {
  //   event.preventDefault();
  //   console.log('click logout-button');
  //   logout();
  // });

  // document.getElementsByClassName('facebook-login-button')[0].addEventListener('click', function(event) {
  //   event.preventDefault();
  //   console.log('click facebook-login-button');
  //   loginFacebook();
  // });

  document.getElementsByClassName('comment-submit-btn')[0].addEventListener('click', function(event) {
    event.preventDefault();
    console.log('click comment-submit-btn');
    submitComment();
  });

  document.getElementsByClassName('more-btn')[0].addEventListener('click', function(event) {
    event.preventDefault();
    console.log('click more-btn');
    requestComments();
  });

  document.getElementsByClassName('more-btn')[0].addEventListener('click', function(event) {
    event.preventDefault();
    console.log('click more-btn');
    requestComments();
  });

  firebase.auth().onAuthStateChanged(function(auth) {
    vue1.fbuser = auth;
    vue2.fbuser = auth;
    // console.log(fbuser);
  });

  vue1 = new Vue({
    el: '#comment-lists',
    data: {
      fbuser: fbuser,
      datas: datas
    },
    methods: {
      shareFacebook: function(message) {
        shareFacebook(message);
      },
      deleteComment: function(key) {
        deleteComment(key);
      }
    }
  });

  vue2 = new Vue({
    el: '#top-nav',
    data: {
      fbuser: fbuser
    },
    methods: {
      logout: function() {
        requestLogout();
      },
      loginTwitter: function() {
        loginTwitter();
      },
      loginFacebook: function() {
        loginFacebook();
      }
    }
  });

  requestComments();

  firebase.database().ref().child('comments').orderByKey().limitToLast(requestCount).on('child_added',
    function(data) {
      let val = data.val();
      val.key = data.key;
      if ( datas.findIndex(x => x.key == data.key) == -1) {
        datas.unshift(val);
      }
    }
  );
  firebase.database().ref().child('comments').orderByKey().limitToLast(requestCount).on('child_changed',
    function(data) {
      let val = data.val();
      let index = datas.findIndex(x => x.key == data.key);
      if (index != -1) {
        datas[index].datetime = val.datetime;
      }
      vue1.$forceUpdate();
    }
  );
  firebase.database().ref().child('comments').orderByKey().limitToLast(requestCount).on('child_removed',
    function(data) {
      let index = datas.findIndex(x => x.key == data.key);
      if (index != -1) {
        datas.splice(index, 1);
      }
    }
  );
  firebase.database().ref().child('blockUsers').on('child_added',
    function(data) {
      blockUsers.push(data.key);
    }
  );
});

function deleteComment(key) {
  // let index = datas.findIndex(x => x.key == key);
  // if (index != -1) {
  // }

  let ref = firebase.database().ref().child('comments').child(key);
  ref.remove().then(function() {
    console.log("Remove succeeded.");
  });
}

function shareFacebook(message) {
  FB.ui({
    method: 'share',
    display: 'popup',
    href: 'https://remember-160517.com/',
    hashtag: '#강남역1주기',
    quote: message,

  }, function(response){});
}

function requestComments() {
  let count = datas.length;
  if (count > 0) {
    let lastKey = datas[count-1].key;
    // let firstKey = datas[0].key;

    firebase.database().ref().child('comments').orderByKey().endAt(lastKey).limitToLast(requestCount+1).once('value').then(
      function(snapshot) {
        processSnapshot(snapshot);
      }
    );
  } else {
    firebase.database().ref().child('comments').orderByKey().limitToLast(requestCount).once('value').then(
      function(snapshot) {
        processSnapshot(snapshot);
      }
    );
  }
}

function processSnapshot(snapshot) {
  newDatas = [];
  snapshot.forEach(function(childSnapshot) {
    let val = childSnapshot.val();
    val.key = childSnapshot.key;
    val.datetime = childSnapshot.datetime;
    // console.log(val);
    if ( datas.findIndex(x => x.key == childSnapshot.key) == -1) {
      newDatas.push(val);
    }
  });
  newDatas.reverse();
  newDatas.forEach(function(val) {
    datas.push(val);
  });
}

function submitComment() {
  let user = firebase.auth().currentUser;
  if (user == null) {
    showMessage("로그인을 하시면 추모 메시지를 작성할 수 있습니다.");
    return;
  }

  document.getElementsByClassName('comment-submit-btn')[0].disabled = true;
  let comment = document.getElementsByClassName('input-comment')[0].value;

  if (comment.trim() == '') {
    showMessage("추모 메시지를 입력해주세요.");
    return;
  }

  let len = comment.length;
  if (len > 140) {
    showMessage("추모 메시지는 140자 미만으로 작성해주세요.");
    return;
  }

  // 12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
  // 한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십한둘셋넷다여칠팔구십
  let uid = user.uid;
  if (blockUsers.findIndex(x => x == uid) != -1) {
    showMessage("추모 메시지를 작성할 수 없습니다. 자세한 사항은 아래 메일로 문의바랍니다.");
    return;
  }

  // console.log(comment);
  let object = {
    uid : user.uid,
    username : user.displayName,
    userPhotoUrl : user.photoURL,
    comment : comment,
  };

  // Get a key for a new Post.
  let newPostKey = firebase.database().ref().child('comments').push().key;

  let updates = {};
  updates['/comments/' + newPostKey] = object;

  firebase.database().ref().update(updates, function() {
    document.getElementsByClassName('comment-submit-btn')[0].disabled = false;
    document.getElementsByClassName('input-comment')[0].value = '';

    showMessage("추모 메시지가 등록 되었습니다.", true);
  }).catch(function(error) {
    // Handle Errors here.
    let errorCode = error.code;
    let errorMessage = error.message;
    // The email of the user's account used.
    let email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    let credential = error.credential;
    // ...

    showMessage("추모 메시지를 작성할 수 없습니다.  잠시 후 다시 시도하시거나 메일로 문의 바랍니다.");
  });
}

function requestLogout() {
  firebase.auth().signOut();
}

function loginFacebook() {
  let provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('user_birthday');
  provider.setCustomParameters({
    'display': 'popup'
  });

  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    let token = result.credential.accessToken;
    // The signed-in user info.
    let user = result.user;
    // ...
    console.log('success');

  }).catch(function(error) {
    // Handle Errors here.
    let errorCode = error.code;
    let errorMessage = error.message;
    // The email of the user's account used.
    let email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    let credential = error.credential;
    // ...

    console.log('error');
    showMessage("로그인을 할 수 없니다. 잠시 후 다시 시도하시거나 메일로 문의 바랍니다.");
  });
}

function loginTwitter() {
  let provider = new firebase.auth.TwitterAuthProvider();
  provider.setCustomParameters({
    'lang': 'kr'
  });

  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
    // You can use these server side with your app's credentials to access the Twitter API.
    let token = result.credential.accessToken;
    let secret = result.credential.secret;
    // The signed-in user info.
    let user = result.user;
    // ...
    console.log('twitter success');

  }).catch(function(error) {
    // Handle Errors here.
    let errorCode = error.code;
    let errorMessage = error.message;
    // The email of the user's account used.
    let email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    let credential = error.credential;
    // ...
    console.log('twitter error');
    showMessage("로그인을 할 수 없니다. 잠시 후 다시 시도하시거나 메일로 문의 바랍니다.");
  });
  //*/
}

function showMessage(message, autoHide = false) {
  let result;
  if (autoHide) {
    hideMessage();
    result = document.getElementsByClassName('submit-result')[0];
    result.innerHTML = message;
    fadeIn(result);
    setTimeout(function() {
      fadeOut(result);
    }, 1300);
  }
  else {
    result = document.getElementsByClassName('submit-result-fail')[0];
    let messageDiv = document.getElementsByClassName('result-fail-message')[0];
    messageDiv.innerHTML = message;
    fadeIn(result);
  }
}

function hideMessage() {
  let result = document.getElementsByClassName('submit-result-fail')[0];
  fadeOut(result);
}

// fade out
function fadeOut(el) {
  let op = 1;
  let timer = setInterval(function () {
    if (op <= 0.1){
      clearInterval(timer);
      el.style.display = 'none';
    }
    el.style.opacity = op;
    op -= op * 0.1;
  }, 10);
}

// fade in
function fadeIn(el) {
  let op = 0;
  el.style.opacity = op;
  el.style.display = '';

  let timer = setInterval(function () {
    if (op >= 1.0){
      clearInterval(timer);
    }
    el.style.opacity = op;
    op = op + 0.1;
  }, 30);
}
