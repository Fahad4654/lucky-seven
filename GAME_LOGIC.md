# Lucky Sevens - Game Logic Documentation

This document outlines the core logic, rules, and calculations used for each game in the application.

---

## 1. Blackjack (`blackjack-card.tsx`)

### Deck & Cards
- **Deck:** A standard 52-card deck is created at the start of each round and shuffled.
- **Card Values:**
  - Number cards (2-10) are worth their face value.
  - Face cards (J, Q, K) are worth 10.
  - Aces (A) are worth 11 unless that would cause the score to exceed 21, in which case they are worth 1.

### Game Flow
1.  **Betting:** The player places a bet. This amount is deducted from their credits.
2.  **Dealing:**
    - Player receives two cards, face up.
    - Dealer receives two cards, one face up and one face down.
3.  **Player's Turn:**
    - The player's score is calculated.
    - If the player has 21 (Blackjack) with the first two cards, they win 1.5x their bet immediately (payout is 2.5x the bet), unless the dealer also has Blackjack (which results in a Push).
    - If the player's score is over 21 (Bust), they lose their bet immediately.
    - The player can **Hit** (take another card) or **Stand** (end their turn).
4.  **Dealer's Turn:**
    - The dealer's hidden card is revealed.
    - The dealer must **Hit** until their score is 17 or higher.
    - If the dealer busts, the player wins.
5.  **Showdown:**
    - If neither player nor dealer has busted, their scores are compared.
    - **Win:** Player's score is higher than the dealer's. Player wins 1x their bet (payout is 2x the bet).
    - **Loss:** Player's score is lower than the dealer's. Player loses their bet.
    - **Push (Tie):** Player and dealer have the same score. The player's bet is returned.

---

## 2. Versus Poker (`poker-card.tsx`)

### Hand Evaluation
The game uses a standard poker hand ranking system. The logic evaluates a 5-card hand and returns its rank.

**Hand Ranks (from highest to lowest):**
1.  **Royal Flush:** A, K, Q, J, 10 of the same suit.
2.  **Straight Flush:** Five cards in sequence, all of the same suit.
3.  **Four of a Kind:** Four cards of the same rank.
4.  **Full House:** Three cards of one rank and two cards of another rank.
5.  **Flush:** Any five cards of the same suit, not in sequence.
6.  **Straight:** Five cards in sequence, but not of the same suit. (Ace can be high or low).
7.  **Three of a Kind:** Three cards of the same rank.
8.  **Two Pair:** Two cards of one rank, two cards of another rank.
9.  **One Pair:** Two cards of the same rank.
10. **High Card:** If no other hand is made, the hand with the highest card wins.

### Game Flow
1.  **Betting & Dealing:** Player places a bet. Both player and dealer are dealt five cards. The dealer's cards are initially hidden in the UI until the showdown.
2.  **Draw Phase:**
    - The player chooses which cards to **hold** (keep).
    - Cards not held are discarded and replaced with new cards from the deck.
3.  **Dealer's Draw AI:**
    - The dealer's logic is simple: if their initial hand is less than 'One Pair', they will discard their first three cards and draw new ones. Otherwise, they stand pat.
4.  **Showdown & Payout:**
    - Both final hands are evaluated.
    - **Winner Determination:**
        - The hand with the higher rank wins.
        - If both have the same rank (e.g., both have a Pair), a "kicker" system is used. The highest card not involved in the pair/three of a kind determines the winner. This is handled by comparing sorted arrays of the card ranks (`tieBreakerRanks`).
        - If the hands are identical in rank and kickers, it's a **Push**, and the bet is returned.
    - **Payout:** A winning player receives 1x their bet (payout is 2x the bet).

---

## 3. Slot Machine (`slot-machine.tsx`)

### Symbols & Payouts
The game uses a set of symbols, each with a multiplier. A win occurs when the three symbols on the center payline are identical.

- **Cherry:** 5x bet
- **Bell:** 10x bet
- **Clover:** 20x bet
- **Diamond:** 50x bet
- **Star:** 100x bet
- **Seven (Award icon):** 250x bet

### Game Flow
1.  **Reels:** The game has three reels. Each reel contains one of each symbol.
2.  **Initialization:** At the start, each reel's symbol list is shuffled randomly.
3.  **Spin:**
    - The player places a bet and spins. The bet is deducted.
    - Each reel visually "spins" for a staggered duration (1s, 1.3s, 1.6s).
    - During the spin animation, the symbols are randomly shuffled again.
4.  **Result:**
    - After the spin, the symbol at the top of each reel's array (`index 0`) is considered the result for the payline.
    - If the three symbols on the payline are the same, the player wins the bet amount multiplied by that symbol's multiplier. Otherwise, they lose the bet.

---

## 4. Dice Roller (`dice-roller-card.tsx`)

### Game Flow
1.  **Betting:** The player sets a bet amount and chooses a bet type:
    - **Low:** The total of the dice will be less than 11. (Payout: 1x bet)
    - **High:** The total of the dice will be greater than 11. (Payout: 1x bet)
    - **Exactly 11:** The total will be exactly 11. (Payout: 5x bet)
2.  **Roll:**
    - The number of dice is fixed at 3.
    - The bet is deducted, and a rolling animation begins.
    - The logic generates three random numbers between 1 and 6.
3.  **Result:**
    - The `total` of the three dice is calculated.
    - The `total` is checked against the player's `betType` to determine if it's a win or loss.
    - Winnings are calculated based on the payout multiplier and added to the player's credits.

---

## 5. Fortune Apple (`fortune-apple-card.tsx`)

### Game Structure
- **Levels:** The game consists of 10 levels.
- **Apples per Level:** Each level has 5 apples.
- **Bad Apples:** Each level contains one or more "bad" apples. The number of bad apples increases as the levels get higher.
  - Levels 1-3: 1 bad apple
  - Levels 4-6: 2 bad apples
  - Levels 7-9: 3 bad apples
  - Level 10: 4 bad apples
- **Multipliers:** Each level has an increasing payout multiplier.
  - Level 1: 1.2x, Level 2: 1.5x, ..., Level 10: 50x.

### Game Flow
1.  **Betting:** The player places a bet to start the game.
2.  **Level Progression:**
    - The player starts at Level 1.
    - On each level, the player picks one of the five apples.
    - **Good Apple:** If the chosen apple is "good," the potential winnings are updated by the level's multiplier, and the player advances to the next level.
    - **Bad Apple:** If the chosen apple is "bad," the game is over, and the player loses their initial bet.
3.  **Cashing Out:**
    - After successfully completing any level (from level 1 onwards), the player has the option to **Cash Out**.
    - If they cash out, they win the amount corresponding to the *last completed level* and the game ends.
4.  **Winning the Game:**
    - If the player successfully completes all 10 levels, they automatically win the top prize (bet * 50x) and the game ends.
