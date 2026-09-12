const logger = require('../utils/logger');
const RPGProfile = require('../rpg/rpgProfile');

/**
 * Trivia Game System
 * Quiz-based game with XP and Ichi rewards
 */
class TriviaGame {
  constructor() {
    this.questions = [
      {
        id: 1,
        question: 'What is the name of the main character in Attack on Titan?',
        options: ['Eren Yeager', 'Levi Ackerman', 'Mikasa Ackerman', 'Armin Arlert'],
        correct: 0,
        category: 'anime',
      },
      {
        id: 2,
        question: 'Which anime features the character Rem?',
        options: ['Demon Slayer', 'Re:ZERO', 'Sword Art Online', 'Darling in the Franxx'],
        correct: 1,
        category: 'anime',
      },
      {
        id: 3,
        question: 'What is the main power system in My Hero Academia?',
        options: ['Chakra', 'Quirks', 'Devil Fruits', 'Stands'],
        correct: 1,
        category: 'anime',
      },
      {
        id: 4,
        question: 'Who is the protagonist of Demon Slayer?',
        options: ['Tanjiro Kamado', 'Nezuko Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira'],
        correct: 0,
        category: 'anime',
      },
      {
        id: 5,
        question: 'In which year did Attack on Titan first air?',
        options: ['2011', '2012', '2013', '2014'],
        correct: 2,
        category: 'anime',
      },
      {
        id: 6,
        question: 'What is Ichika\'s anime of origin?',
        options: ['Classroom of the Elite', 'Fate Series', 'Re:ZERO', 'Darling in the Franxx'],
        correct: 0,
        category: 'ichika',
      },
      {
        id: 7,
        question: 'Which anime has the most episodes?',
        options: ['One Piece', 'Naruto', 'Bleach', 'Dragon Ball'],
        correct: 0,
        category: 'anime',
      },
      {
        id: 8,
        question: 'What is the main plot of Sword Art Online?',
        options: ['School romance', 'Virtual reality game', 'Time travel', 'Supernatural powers'],
        correct: 1,
        category: 'anime',
      },
    ];

    this.activeGames = new Map(); // groupId -> game state
  }

  /**
   * Get random question
   */
  getRandomQuestion() {
    return this.questions[Math.floor(Math.random() * this.questions.length)];
  }

  /**
   * Start trivia game
   */
  startGame(groupId, sender) {
    try {
      if (this.activeGames.has(groupId)) {
        return 'A trivia game is already active, Senpai! Use /answer to respond.';
      }

      const question = this.getRandomQuestion();
      const game = {
        question,
        player: sender,
        startTime: Date.now(),
        answered: false,
        correctAnswer: false,
      };

      this.activeGames.set(groupId, game);

      let response = `🎯 **Trivia Question!**\n\n${question.question}\n\n`;
      question.options.forEach((option, index) => {
        response += `${String.fromCharCode(65 + index)}) ${option}\n`;
      });
      response += `\nReply with /answer [A/B/C/D]`;

      return response;
    } catch (error) {
      logger.error(`Error starting trivia: ${error.message}`);
      return 'Error starting trivia game.';
    }
  }

  /**
   * Submit answer
   */
  submitAnswer(groupId, sender, answer) {
    try {
      const game = this.activeGames.get(groupId);
      if (!game) {
        return 'No active trivia game, Senpai!';
      }

      if (game.player !== sender) {
        return `Only ${game.player} can answer this question!`;
      }

      if (game.answered) {
        return 'You already answered this question!';
      }

      const answerIndex = answer.toUpperCase().charCodeAt(0) - 65;
      const isCorrect = answerIndex === game.question.correct;

      game.answered = true;
      game.correctAnswer = isCorrect;

      let response = '';
      if (isCorrect) {
        const xpReward = 50;
        const ichiReward = 25;

        RPGProfile.addXP(sender, xpReward);
        RPGProfile.addIchi(sender, ichiReward);

        response = `
✨ **Correct!**

+${xpReward} XP
+${ichiReward} Ichi

Great job, Senpai! 🎌
        `.trim();
      } else {
        const correctOption = game.question.options[game.question.correct];
        response = `
❌ **Wrong Answer!**

Correct answer was: ${correctOption}

Better luck next time, Senpai~ 😏
        `.trim();
      }

      // Clean up game
      setTimeout(() => this.activeGames.delete(groupId), 5000);

      return response;
    } catch (error) {
      logger.error(`Error submitting answer: ${error.message}`);
      return 'Error processing answer.';
    }
  }

  /**
   * Get active game
   */
  getActiveGame(groupId) {
    return this.activeGames.get(groupId);
  }
}

module.exports = new TriviaGame();
