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
var connectedRef = db.ref(".info/connected");


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

connectedRef.on("value", function (snap) {
    if (!snap.val() && playerNumber) {
        playersRef.ref("/players/" + playerNumber).remove();
        playerNumber = null;
    }
}, function (error) { cosole.log("error", error.code); });

playersRef.on("value", function (snap) {
    console.log("playersRef");
    console.log(snap.val());
    numPlayers = snap.numChildren();

    let p1choice, p2choice;

    if (snap.child("1").exists()) {
        player1LoggedIn = true;
        $("#player-1").text(snap.child("1").val().name);
        p1choice = snap.child("1").val().choice;

        if (playerNumber != "1") {
            if (snap.child("1").val().choice) {
                $(".p1-selection-made").show();
                $(".p1-pending-selection").hide();
            } else {
                $(".p1-selection-made").hide();
                $(".p1-pending-selection").show();
            }
        } else if (playerNumber == "1") {
            if (snap.child("1").val().choice) {
                // show selection
            }
        }
    } else {
        player1LoggedIn = false;
        $("#player-1").text("Waiting for Player 1");
    }
    if (snap.child("2").exists()) {
        player2LoggedIn = true;
        $("#player-2").text(snap.child("2").val().name);
        p2choice = snap.child("2").val().choice;

        if (playerNumber != "2") {
            if (snap.child("2").val().choice) {
                $(".p2-selection-made").show();
                $(".p2-pending-selection").hide();
            } else {
                $(".p2-selection-made").hide();
                $(".p2-pending-selection").show();
            }
        }
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

    if(p1choice && p2choice) {
        rps(p1choice, p2choice);
    }
}, function (error) {
    console.log("Error", error.code);
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

$(".selection").click(function () {
    if (!playerNumber) return;

    playerObject.choice = this.id;
    db.ref("/players/" + playerNumber).set(playerObject);
    $(".selection").addClass("disabled");
    this.addClass("active");

});

function loginPending() {
    $(".pre-connection, .pre-login, .post-login, .selections").hide();
    $(".pending-login").show();
}
function showLoginScreen() {
    $(".pre-connection, .pending-login, .post-login, .selections").hide();
    $(".pre-login").show();
}

function showLoggedInScreen() {
    $(".pre-connection, .pre-login, .pending-login").hide();
    $(".post-login").show();
    if (playerNumber == "1") {
        $(".p1-selections").show();
    } else {
        $(".p1-selections").hide();
    }
    if (playerNumber == "2") {
        $(".p2-selections").show();
    } else {
        $(".p2-selections").hide();
    }
}

function rps(p1choice, p2choice) {
    if(p1choice == p2choice) {
        //tie
        $("#feedback").text("TIE");
    }
    else if((p1choice == "rock" && p2choice == "scissors") || (p1choice == "paper" && p2choice == "rock") || (p1choice == "scissors" && p2choice == "paper")) {
        // p1 wins
        $("#feedback").text("P1 wins");
    } else {
        // p2 wins
        $("#feedback").text("P2 wins");
    }
}