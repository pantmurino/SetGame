var cardsArray = null;
var cardsOnScreen = 0;

var maxSetSize = 3;
var currentSetSize = 0;
var chosenSetCards = new Array(maxSetSize);

var maxRows = 4; // 4 by default + 1 row for additional cards
var maxColumns = 4;
var maxCardsOnScreen = 12; // not quite true... with additional cards there might be 15 cards. but I'll think about it later
var maxCardsCount = 81;

var availableTypes = [
    "oval", // 0
    "rect", // 1
    "curly" // 2
];

var availableColors = [
    "red",      // 0
    "green",    // 1
    "purple"    // 2
];

var availableCounts = [
    "1", // 0
    "2", // 1
    "3", // 2
];

var availableFilling = [
    "empty",   // 0
    "stripes", // 1
    "filled"   // 2
];


function startGame() {
    if (cardsOnScreen > 0) {
        playgroundModel.clear();
        delete cardsArray;
        cardsOnScreen = 0;
    }

    // Populate cards array
    cardsArray = new Array(maxCardsCount);
    var counter = 0;
    for(var t=0; t < availableTypes.length; t++) {
        var jsonCardType = "{";
        jsonCardType += "\"cardClicked\" : false,";
        jsonCardType += "\"cardType\": \"" + availableTypes[t] + "\",";
        for(var c=0; c < availableColors.length; c++) {
            var jsonCardColor = "\"cardColor\": \"" + availableColors[c] + "\",";
            for(var cn=0; cn < availableCounts.length; cn++) {
                var jsonCardCount = "\"cardCount\": \"" + availableCounts[cn] + "\",";
                for(var f=0; f < availableFilling.length; f++) {
                    var jsonString = jsonCardType + jsonCardColor + jsonCardCount;
                    jsonString += "\"cardFilling\": \"" + availableFilling[f] + "\"";
                    jsonString += "}";
                    cardsArray[counter] = jsonString;
                    counter++;
                }
            }
        }
    }

    shuffle(cardsArray);

    populateCards();
}

function populateCards() {
    while((cardsOnScreen < maxCardsOnScreen) &&
          (cardsArray.length > 0)) {
        // Add card on the screen
        var jsonString = cardsArray.pop();
        console.log("JSON: " + jsonString);
        playgroundModel.append(JSON.parse(jsonString));
        cardsOnScreen++;
    }
}

function shuffle(array) {
    var n = array.length;
    for(var i=0; i < n; i++) {
        var r = getRandomInt(i, n-i);
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// TODO: implement correct set check
function cardClicked(index) {
    var selected = playgroundModel.get(index).cardClicked;
    playgroundModel.get(index).cardClicked = !selected;


    if (selected) {
        // undo changes
        console.assert(currentSetSize > 0)
        chosenSetCards[currentSetSize] = -1;
        currentSetSize--;
    } else {
        chosenSetCards[currentSetSize] = index;
        currentSetSize++;

        // check for set if 3rd card was clicked
        if (currentSetSize == maxSetSize) {

            // check if selected cards is a set
            var card1 = playgroundModel.get(chosenSetCards[0]);
            var card2 = playgroundModel.get(chosenSetCards[1]);
            var card3 = playgroundModel.get(chosenSetCards[2]);

            var isSet = validateProperty(card1.cardType, card2.cardType, card3.cardType)
                    && validateProperty(card1.cardCount, card2.cardCount, card3.cardCount)
                    && validateProperty(card1.cardColor, card2.cardColor, card3.cardColor)
                    && validateProperty(card1.cardFilling, card2.cardFilling, card3.cardFilling);

            if(isSet) {
                console.log("It is a set");
                // Sort indexes in a reverse order. Thus, remove from the model is safe
                chosenSetCards = chosenSetCards.sort(function (a, b) {
                    return b-a;
                });

                for(var i=0; i<chosenSetCards.length; i++) {
                    var index = chosenSetCards[i];
                    playgroundModel.get(index).cardClicked = false;
                    playgroundModel.remove(index);
                }

                cardsOnScreen = cardsOnScreen - 3;
                populateCards();
            } else {
                console.log("It is not a set");
                // Reset set state
                for(i=0; i< cardsOnScreen; i++) {
                    if(playgroundModel.get(i).cardClicked) {
                        playgroundModel.get(i).cardClicked = false;
                    }
                }
           }

            for(i=0; i < chosenSetCards.length; i++) {
                chosenSetCards[i] = -1;
            }
            currentSetSize = 0;
        }
    }
}

function validateProperty(prop1, prop2, prop3) {
    if ((prop1 === prop2) && (prop2 === prop3))
        return true;
    else if ((prop1 !== prop2) && (prop2 !== prop3)
             && (prop1 !== prop3))
        return true;
    else
        return false;
}
