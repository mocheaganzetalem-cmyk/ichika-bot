const logger = require('../utils/logger');
const RPGProfile = require('../rpg/rpgProfile');
const trivia = require('./trivia');

/**
 * Game Commands Handler
 */
class GameCommands {
  /**
   * /trivia - Start trivia game
   */
  static handleTrivia(sender, groupId) {
    try {
      return trivia.startGame(groupId, sender);
    } catch (error) {
      logger.error(`Error in /trivia: ${error.message}`);
      return 'Error starting trivia game.';
    }
  }

  /**
   * /answer [option] - Submit trivia answer
   */
  static handleAnswer(args, sender, groupId) {
    try {
      if (args.length === 0) {
        return 'Usage: /answer [A/B/C/D]';
      }

      const answer = args[0];
      if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
        return 'Invalid answer. Choose A, B, C, or D.';
      }

      return trivia.submitAnswer(groupId, sender, answer);
    } catch (error) {
      logger.error(`Error in /answer: ${error.message}`);
      return 'Error processing answer.';
    }
  }

  /**
   * /guesstheanime - Guess the anime by description
   */
  static handleGuessAnime(sender, groupId) {
    try {
      const animeList = [
        { name: 'Attack on Titan', hint: 'Titans are eating humans behind giant walls' },
        { name: 'Demon Slayer', hint: 'A young boy fights demons to save his sister' },
        { name: 'My Hero Academia', hint: 'Superheroes with special powers called Quirks' },
        { name: 'Sword Art Online', hint: 'Players are trapped in a virtual reality game' },
        { name: 'Re:ZERO', hint: 'A boy can go back in time with his memories intact' },
        { name: 'One Piece', hint: 'A pirate crew searching for the ultimate treasure' },
        { name: 'Naruto', hint: 'A ninja village with chakra-based powers' },
        { name: 'Death Note', hint: 'A notebook that can kill anyone whose name is written in it' },
      ];

      const anime = animeList[Math.floor(Math.random() * animeList.length)];

      return `
🎌 **Guess the Anime!**

Hint: ${anime.hint}

Reply with /guessanswer [anime_name]
      `.trim();
    } catch (error) {
      logger.error(`Error in /guesstheanime: ${error.message}`);
      return 'Error starting anime guessing game.';
    }
  }

  /**
   * /wordchain - Start word chain game
   */
  static handleWordChain(sender, groupId) {
    try {
      const words = [
        'anime',
        'ichika',
        'attack',
        'titan',
        'demon',
        'slayer',
        'sword',
        'art',
      ];

      const startWord = words[Math.floor(Math.random() * words.length)];
      const lastChar = startWord[startWord.length - 1];

      return `
📝 **Word Chain Game!**

Starting word: **${startWord}**

Reply with a word starting with '${lastChar}'
Use: /wordanswer [word]
      `.trim();
    } catch (error) {
      logger.error(`Error in /wordchain: ${error.message}`);
      return 'Error starting word chain game.';
    }
  }

  /**
   * /hangman - Start hangman game
   */
  static handleHangman(sender, groupId) {
    try {
      const words = [
        'ICHIKA',
        'ANIME',
        'DEMON',
        'SLAYER',
        'ATTACK',
        'TITAN',
        'QUEST',
      ];

      const word = words[Math.floor(Math.random() * words.length)];
      const blanks = '_'.repeat(word.length);

      return `
🎮 **Hangman Game!**

Word: ${blanks.split('').join(' ')}

Guess a letter using: /guess [letter]
      `.trim();
    } catch (error) {
      logger.error(`Error in /hangman: ${error.message}`);
      return 'Error starting hangman game.';
    }
  }

  /**
   * /numberguess - Guess the number game
   */
  static handleNumberGuess(sender, groupId) {
    try {
      const number = Math.floor(Math.random() * 100) + 1;

      return `
🎲 **Number Guessing Game!**

I'm thinking of a number between 1-100.
Guess it with: /guess [number]

You have 5 attempts!
      `.trim();
    } catch (error) {
      logger.error(`Error in /numberguess: ${error.message}`);
      return 'Error starting number guessing game.';
    }
  }
}

module.exports = GameCommands;
