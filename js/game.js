// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: { default: 'arcade' },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };
  
  const game = new Phaser.Game(config);
  
  let score = 0;
  let level = 1;
  let timer = 60;
  let scoreText, levelText, timerText;
  let moles = [];
  let moleTimer;
  let goldenChance = 0.2; // 20% chance for golden mole
  let bgMusic, hitSound, missSound;
  
  // Preload Assets
  function preload() {
    this.load.image('mole', 'assets/images/mole.png');
    this.load.image('goldenMole', 'assets/images/golden-mole.png');
    this.load.image('hole', 'assets/images/hole.png');
    this.load.audio('hit', 'assets/sounds/hit.mp3');
    this.load.audio('miss', 'assets/sounds/miss.mp3');
    this.load.audio('bgMusic', 'assets/sounds/bg-music.mp3');
  }
  
  // Create the Game Scene
  function create() {
    // Background Music
    bgMusic = this.sound.add('bgMusic', { loop: true });
    hitSound = this.sound.add('hit');
    missSound = this.sound.add('miss');
    bgMusic.play();
  
    // UI Elements
    scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#000' });
    levelText = this.add.text(20, 50, 'Level: 1', { fontSize: '24px', fill: '#000' });
    timerText = this.add.text(20, 80, 'Time: 60s', { fontSize: '24px', fill: '#000' });
  
    // Create Holes and Moles
    const rows = 3, cols = 3;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = 150 + j * 150;
        const y = 150 + i * 150;
  
        // Create a hole
        this.add.image(x, y, 'hole');
  
        // Create a mole and hide it
        const mole = this.add.image(x, y, 'mole');
        mole.setInteractive();
        mole.setVisible(false);
        mole.isGolden = false;
  
        // Click event
        mole.on('pointerdown', () => hitMole(mole));
        moles.push(mole);
      }
    }
  
    // Start Game
    startLevel(this);
  }
  
  // Level Start
  function startLevel(scene) {
    moleTimer = scene.time.addEvent({
      delay: 1000 - level * 50, // Faster as levels increase
      callback: () => showRandomMole(scene),
      loop: true,
    });
  
    // Countdown Timer
    scene.time.addEvent({
      delay: 1000,
      callback: () => {
        timer--;
        timerText.setText(`Time: ${timer}s`);
        if (timer <= 0) endGame(scene);
      },
      loop: true,
    });
  }
  
  // Show Random Mole
  function showRandomMole(scene) {
    const mole = Phaser.Utils.Array.GetRandom(moles);
  
    // Randomly make it golden
    mole.isGolden = Math.random() < goldenChance;
    mole.setTexture(mole.isGolden ? 'goldenMole' : 'mole');
  
    mole.setVisible(true);
    scene.time.delayedCall(800 - level * 20, () => mole.setVisible(false)); // Hide after a short time
  }
  
  // Hit a Mole
  function hitMole(mole) {
    if (mole.visible) {
      score += mole.isGolden ? 5 : 1; // Bonus for golden moles
      scoreText.setText(`Score: ${score}`);
      mole.setVisible(false);
      hitSound.play();
      vibrateFeedback(); // Haptic Feedback
    } else {
      missSound.play();
    }
  
    // Level Up
    if (score >= level * 10) {
      level++;
      levelText.setText(`Level: ${level}`);
      moleTimer.delay = Math.max(300, 1000 - level * 50); // Faster levels
    }
  }
  
  // Haptic Feedback for Mobile
  function vibrateFeedback() {
    if ('vibrate' in navigator) navigator.vibrate(100); // 100ms vibration
  }
  
  // End the Game
  function endGame(scene) {
    scene.time.removeAllEvents();
    bgMusic.stop();
    alert(`Game Over! Final Score: ${score}`);
    location.reload(); // Restart the game
  }
  
  // Update Function (Optional)
  function update() {}
  