/*
Requirements:

Only two users can play at the same time.

Both players pick either rock, paper or scissors. 
    After the players make their selection, the game will tell them whether a tie occurred or if one player defeated the other.

The game will track each player's wins and losses.

Users can chat with each other
*/

// Initialize Firebase
var config = {
    apiKey: "AIzaSyB36zKLMLt3n5QT9I1KPmciKQ12d1CQ5KY",
    authDomain: "rock-paper-scissors-5f753.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-5f753.firebaseio.com",
    projectId: "rock-paper-scissors-5f753",
    storageBucket: "rock-paper-scissors-5f753.appspot.com",
    messagingSenderId: "11185586866"
};

firebase.initializeApp(config);

var db = firebase.database();
var playersRef = db.ref("/players");


const MAX_PLAYERS = 2;
var numPlayers,
    player1LoggedIn = false,
    player2LoggedIn = false,
    playerNumber,
    playerObject = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    };

playersRef.on("value", function (snap) {
    console.log("playersRef");
    console.log(snap.val());
    numPlayers = snap.numChildren();
    /*if (!snap.child("1").exists()) {
        playerNumber = "1";
    } else if (!snap.child("2").exists()) {
        playerNumber = "2";
    } else {
        playerNumber = null;

        loginPending();
    }*/


    if (snap.child("1").exists()) {
        player1LoggedIn = true;
        $("#player-1").text(snap.child("1").val().name);
    } else {
        player1LoggedIn = false;
        $("#player-1").text("Waiting for Player 1");
    }
    if (snap.child("2").exists()) {
        player2LoggedIn = true;
        $("#player-2").text(snap.child("2").val().name);
    } else {
        player2LoggedIn = false;
        $("#player-2").text("Waiting for Player 2");
    }

    if (player1LoggedIn && player2LoggedIn && !playerNumber) {
        loginPending();
    } else if (playerNumber) {
        showLoggedInScreen();
    } else {
        showLoginScreen();
    }
});


$("#add-player").click(function (e) {
    e.preventDefault();
    if (!player1LoggedIn) {
        playerNumber = "1";
    } else if (!player2LoggedIn) {
        playerNumber = "2";
    } else {
        playerNumber = null;
    }

    if (playerNumber) {
        playerObject.name = $("#player-name").val().trim();
        $("#player-name").val("");

        $("#player-name-display").text(playerObject.name);
        $("#player-number").text(playerNumber);

        db.ref("/players/" + playerNumber).set(playerObject);
        db.ref("/players/" + playerNumber).onDisconnect().remove();
    }
});

function loginPending() {
    $(".pre-connection, .pre-login, .post-login").hide();
    $(".pending-login").show();
}
function showLoginScreen() {
    $(".pre-connection, .pending-login, .post-login").hide();
    $(".pre-login").show();
}

function showLoggedInScreen() {
    $(".pre-connection, .pre-login, .pending-login").hide();
    $(".post-login").show();
}