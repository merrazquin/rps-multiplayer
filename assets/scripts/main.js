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

var player1LoggedIn = false,
    player2LoggedIn = false,
    playerNumber,
    player1Object = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    },
    player2Object = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    },
    resetId;

// handle lost connection
connectedRef.on("value", function (snap) {
    if (!snap.val() && playerNumber) {
        db.ref("/players/" + playerNumber).remove();
        playerNumber = null;
    }
}, errorHandler);

// when player is added, update respective loggedIn flag and playerObject
playersRef.on("child_added", function (childSnap) {
    this["player" + childSnap.key + "LoggedIn"] = true;
    this["player" + childSnap.key + "Object"] = childSnap.val();
}, errorHandler);

// when player is changed, update respective playerObject and stats
playersRef.on("child_changed", function (childSnap) {
    this["player" + childSnap.key + "Object"] = childSnap.val();

    updateStats();
}, errorHandler);

// when player is removed, reset respective playerObject and loggedIn flag
playersRef.on("child_removed", function (childSnap) {
    this["player" + childSnap.key + "LoggedIn"] = false;
    this["player" + childSnap.key + "Object"] = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    };
}, errorHandler);

// when general changes are made, perform bulk of game logic
playersRef.on("value", function (snap) {
    $("#player-1").text(player1Object.name || "Waiting for Player 1");
    $("#player-2").text(player2Object.name || "Waiting for Player 2");

    updatePlayerBox("1", snap.child("1").exists(), snap.child("1").exists() && snap.child("1").val().choice);
    updatePlayerBox("2", snap.child("2").exists(), snap.child("2").exists() && snap.child("2").val().choice);

    updateStats();

    // display correct "screen" depending on logged in statuses
    if (player1LoggedIn && player2LoggedIn && !playerNumber) {
        loginPending();
    } else if (playerNumber) {
        showLoggedInScreen();
    } else {
        showLoginScreen();
    }

    // if both players have selected their choice, perform the comparison
    if (player1Object.choice && player2Object.choice) {
        rps(player1Object.choice, player2Object.choice);
    }

}, errorHandler);


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
        let playerName = $("#player-name").val().trim();
        window["player" + playerNumber + "Object"].name = playerName;
        $("#player-name").val("");

        $("#player-name-display").text(playerName);
        $("#player-number").text(playerNumber);

        db.ref("/players/" + playerNumber).set(window["player" + playerNumber + "Object"]);
        db.ref("/players/" + playerNumber).onDisconnect().remove();
    }
});

$(".selection").click(function () {
    if (!playerNumber) return;

    window["player" + playerNumber + "Object"].choice = this.id;
    db.ref("/players/" + playerNumber).set(window["player" + playerNumber + "Object"]);

    $(".p" + playerNumber + "-selections").hide();
    $(".p" + playerNumber + "-selection-reveal").text(this.id).show();
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

function showSelections() {
    $(".selections, .pending-selection, .selection-made").hide();
    $(".selection-reveal").show();
}

function rps(p1choice, p2choice) {
    $(".p1-selection-reveal").text(p1choice);
    $(".p2-selection-reveal").text(p2choice);

    showSelections();

    if (p1choice == p2choice) {
        //tie
        $("#feedback").text("TIE");
    }
    else if ((p1choice == "rock" && p2choice == "scissors") || (p1choice == "paper" && p2choice == "rock") || (p1choice == "scissors" && p2choice == "paper")) {
        // p1 wins
        $("#feedback").text("P1 wins");
        player1Object.wins++;
        player2Object.losses++;
    } else {
        // p2 wins
        $("#feedback").text("P2 wins");
        player2Object.wins++;
        player1Object.losses++;
    }
    updateStats();

    resetId = setTimeout(reset, 2000);
}

function reset() {
    clearTimeout(resetId);

    player1Object.choice = "";
    player2Object.choice = "";

    db.ref("/players").set({
        1: player1Object,
        2: player2Object
    });
    $(".selection-reveal").hide();
    $("#feedback").empty();
}

function updateStats() {
    ["1", "2"].forEach(playerNum => {
        var obj = window["player" + playerNum + "Object"];
        $("#p" + playerNum + "-wins").text(obj.wins);
        $("#p" + playerNum + "-losses").text(obj.losses);
    });

    player1LoggedIn ? $(".p1-stats").show() : $(".p1-stats").hide();
    player2LoggedIn ? $(".p2-stats").show() : $(".p2-stats").hide();
}

/**
 * Update the player box state
 * @param {string} playerNum 1 or 2
 * @param {boolean} exists 
 * @param {boolean} choice 
 */
function updatePlayerBox(playerNum, exists, choice) {
    if (exists) {
        if (playerNumber != playerNum) {
            if (choice) {
                $(".p" + playerNum + "-selection-made").show();
                $(".p" + playerNum + "-pending-selection").hide();
            } else {
                $(".p" + playerNum + "-selection-made").hide();
                $(".p" + playerNum + "-pending-selection").show();
            }
        }
    } else {
        $(".p" + playerNum + "-selection-made").hide();
        $(".p" + playerNum + "-pending-selection").hide();
    }
}

function errorHandler(error) {
    console.log("Error:", error.code);
}