const playerCardsEl = document.getElementById("player-cards");
        const dealerCardsEl = document.getElementById("dealer-cards");
        const playerScoreEl = document.getElementById("player-score");
        const dealerScoreEl = document.getElementById("dealer-score");
        const resultEl = document.getElementById("result");
        const balanceEl = document.getElementById("balance");
        const betAmountEl = document.getElementById("bet-amount");

        const hitButton = document.getElementById("hit");
        const standButton = document.getElementById("stand");
        const resetButton = document.getElementById("reset");

        let playerCards = [];
        let dealerCards = [];
        let playerScore = 0;
        let dealerScore = 0;
        let gameOver = false;
        let dealerHiddenCard = null;
        let balance = 10000;
        let betAmount = 0;

        const deck = [];
        const suits = ["♠", "♥", "♦", "♣"];
        const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        function createDeck() {
            suits.forEach(suit => {
                ranks.forEach(rank => {
                    deck.push({ rank, suit });
                });
            });
        }

        function animateCard(cardElement) {
            cardElement.classList.add('card');
            setTimeout(() => {
                cardElement.classList.remove('card');
            }, 500);
        }

        function shuffleDeck() {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function getCardValue(card) {
            if (["J", "Q", "K"].includes(card.rank)) return 10;
            if (card.rank === "A") return 11;
            return parseInt(card.rank);
        }

        function calculateScore(cards) {
            let score = cards.reduce((sum, card) => sum + getCardValue(card), 0);
            let aceCount = cards.filter(card => card.rank === "A").length;

            while (score > 21 && aceCount > 0) {
                score -= 10;
                aceCount--;
            }

            return score;
        }

        function renderCards(container, cards, hideFirst = false) {
            container.innerHTML = "";
            cards.forEach((card, index) => {
                const cardEl = document.createElement("div");
                cardEl.classList.add("card");
                if (card.suit === "♥" || card.suit === "♦") {
                    cardEl.classList.add("heart", "diamond");
                } else if (card.suit === "♠" || card.suit === "♣") {
                    cardEl.classList.add("spade", "club");
                }
        
                if (hideFirst && index === 1) {
                    cardEl.classList.add("hidden");
                    cardEl.textContent = "";
                } else {
                    cardEl.textContent = `${card.rank}${card.suit}`;
                }
                
                container.appendChild(cardEl);
            });
        }
        

        function checkWinner() {
            if (playerScore > 21) {
                resultEl.textContent = "Vesztettél!";
                balance -= betAmount;
                gameOver = true;
            } else if (dealerScore > 21) {
                resultEl.textContent = "Nyertél!";
                balance += betAmount;
                gameOver = true;
            } else if (gameOver && dealerScore >= 17) {
                if (playerScore > dealerScore) {
                    resultEl.textContent = "Nyertél!";
                    balance += betAmount;
                } else if (playerScore < dealerScore) {
                    resultEl.textContent = "Vesztettél!";
                    balance -= betAmount;
                } else {
                    resultEl.textContent = "Döntetlen!";
                }
            }
            balanceEl.textContent = balance;
            toggleButtons();
        }


        function revealDealerCard() {
            dealerCards.push(dealerHiddenCard);
            dealerHiddenCard = null;
            renderCards(dealerCardsEl, dealerCards);
            dealerScore = calculateScore(dealerCards);
            dealerScoreEl.textContent = dealerScore;
        }

        function dealInitialCards() {
            betAmount = parseInt(betAmountEl.value) || 0;

            if (betAmount < 100) {
                betAmount = 100;
                betAmountEl.value = 100;
            }

            if (betAmount > balance) {
                alert("Nincs elég egyenleged ehhez a téthez!");
                return;
            }

            playerCards = [];
            dealerCards = [];
            dealerScore = 0;
            gameOver = false;
            resultEl.textContent = "";

            playerCards.push(deck.pop(), deck.pop());
            dealerCards.push(deck.pop());
            dealerHiddenCard = deck.pop();

            playerScore = calculateScore(playerCards);
            dealerScore = calculateScore([dealerCards[0], dealerHiddenCard]);

            renderCards(playerCardsEl, playerCards);
            renderCards(dealerCardsEl, dealerCards, true);

            playerScoreEl.textContent = playerScore;
            dealerScoreEl.textContent = calculateScore([dealerCards[0]]);

            toggleButtons();

            if (playerScore === 21 && playerCards.length === 2) {
                resultEl.textContent = "Blackjack! Nyertél!";
                balance += Math.floor(betAmount * 1.5);
                gameOver = true;
                balanceEl.textContent = balance;
                toggleButtons();
            }
        }


        function toggleButtons() {
            if (playerScore === 21 || gameOver) {
                hitButton.disabled = true;
                standButton.disabled = false;
            } else {
                hitButton.disabled = false;
                standButton.disabled = false;
            }
        }

        document.getElementById("hit").addEventListener("click", () => {
            if (gameOver) return;

            const card = deck.pop();
            playerCards.push(card);
            playerScore = calculateScore(playerCards);
            renderCards(playerCardsEl, playerCards);
            playerScoreEl.textContent = playerScore;
            checkWinner();
        });

        document.getElementById("stand").addEventListener("click", () => {
            if (gameOver) return;

            revealDealerCard();

            while (dealerScore < 17) {
                const card = deck.pop();
                dealerCards.push(card);
                dealerScore = calculateScore(dealerCards);
                renderCards(dealerCardsEl, dealerCards);
                dealerScoreEl.textContent = dealerScore;
            }

            gameOver = true;
            checkWinner();
        });

        document.getElementById("reset").addEventListener("click", () => {
            createDeck();
            shuffleDeck();
            dealInitialCards();
        });

        createDeck();
        shuffleDeck();
        dealInitialCards();