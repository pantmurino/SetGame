import QtQuick 2.5
import QtQuick.Window 2.2
import QtQuick.Layouts 1.1

import "setgame.js" as SetGame

Window {
    id: root
    width: 480
    height: 640
    visible: true

    property bool enableHints: true

    SystemPalette { id: activePalette }

    Image {
        id: background
        width: parent.width
        height: parent.height - 30
        anchors {
            top: parent.top
        }
        source: "qrc:/setgame/content/images/background.png"
        fillMode: Image.PreserveAspectCrop
   }

    GridView {
        id: playgroundView
        anchors.fill:background

        anchors.leftMargin: 20
        anchors.rightMargin: 20
        anchors.topMargin: 20
        anchors.bottomMargin: 20

        cellWidth: Math.floor(width / SetGame.maxColumns)
        cellHeight: Math.floor(height / SetGame.maxRows)

        model: ListModel {
            id: playgroundModel
        }

        add: Transition {
            PropertyAnimation { properties: "scale"; from: 0; to: 1.0; duration: 500 }
        }

        displaced: Transition {
            NumberAnimation { properties: "x,y"; duration: 500 }
        }

        remove: Transition {
            NumberAnimation { property: "opacity"; to: 0; duration: 500 }
        }

        Timer {
            id: hintTimer
            interval: 3000
            running: false
            repeat: false
            onTriggered: {
                SetGame.highlightHint(false);
            }
        }


        delegate: Item {
            id: cardWrapper
            width: playgroundView.cellWidth
            height: playgroundView.cellHeight

            Card {
                id: cardContent

                clicked: cardClicked
                hintHighlight: cardHintHighlight

                figuresType: cardType
                figuresCount: cardCount
                figuresColor: cardColor
                figuresFilling:cardFilling

                width: cardWrapper.width - 5
                height: cardWrapper.height - 15

                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        infoMessage.close();
                        SetGame.cardClicked(index)
                    }
                }
            }
        }
   }

    Rectangle {
          id: toolBar
          width: parent.width; height: 30
          color: activePalette.window
          anchors.bottom: root.bottom
          y: parent.height - 30

          Button {
              id: newGameButton
              anchors { left: parent.left; verticalCenter: parent.verticalCenter }
              text: "New Game"
              onClicked: SetGame.startGame();
          }

          Button {
              id: giveMeMoreCardsButton
              anchors {
                  left: newGameButton.right;
                  leftMargin: 10;
                  verticalCenter: parent.verticalCenter
              }
              enabled: false
              text: "Give me more cards!"
              onClicked: SetGame.giveMeMoreCards(enableHints);
          }

          Text {
              id: score
              anchors { right: parent.right; verticalCenter: parent.verticalCenter }
              text: "Score: Who knows?"
          }
    }

    InfoMessage {
        id: infoMessage
    }
}
