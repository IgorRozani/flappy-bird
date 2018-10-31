const config = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

// Game
const game = new Phaser.Game(config)
let gameOver
let upButton
const widthMiddle = 144
// Bird
let player
let framesMoveUp = 0
const birdRedName = 'bird-red'
const birdYellowName = 'bird-yellow'
const birdBlueName = 'bird-blue'
// Background
let backgroundDay
let backgroundNight
// pipes
let pipes
let gaps
let nextPipes = 0
const pipeGreenName = 'green-pipe'
const pipeRedName = 'red-pipe'
let currentPipeName = pipeGreenName
// score variables
let scoreboard
let score = 0
const numberWidth = 25

function preload() {
    // Backgrounds and ground
    this.load.image('background-day', 'assets/background-day.png')
    this.load.image('background-night', 'assets/background-night.png')
    this.load.image('ground', 'assets/base.png')

    // Pipes
    this.load.image(pipeGreenName, 'assets/pipe-green.png')
    this.load.image(pipeRedName, 'assets/pipe-red.png')
    this.load.image('gap', 'assets/gap.png')

    // End game
    this.load.image('game-over', 'assets/gameover.png')
    this.load.image('restart-button', 'assets/restart-button.png')

    // Birds
    this.load.spritesheet(birdRedName, 'assets/redbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(birdBlueName, 'assets/bluebird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(birdYellowName, 'assets/yellowbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image('number0', 'assets/0.png')
    this.load.image('number1', 'assets/1.png')
    this.load.image('number2', 'assets/2.png')
    this.load.image('number3', 'assets/3.png')
    this.load.image('number4', 'assets/4.png')
    this.load.image('number5', 'assets/5.png')
    this.load.image('number6', 'assets/6.png')
    this.load.image('number7', 'assets/7.png')
    this.load.image('number8', 'assets/8.png')
    this.load.image('number9', 'assets/9.png')
}

function create() {
    const birdName = getRandomBird()

    backgroundDay = this.add.image(widthMiddle, 256, 'background-day').setInteractive();
    backgroundDay.on('pointerdown', moveBird)
    backgroundNight = this.add.image(widthMiddle, 256, 'background-night').setInteractive();
    backgroundNight.visible = false
    backgroundNight.on('pointerdown', moveBird)

    gaps = this.physics.add.group()
    pipes = this.physics.add.group()
    makePipes()

    const grounds = this.physics.add.staticGroup()
    const ground = grounds.create(widthMiddle, 458, 'ground')
    ground.setDepth(10)

    player = this.physics.add.sprite(80, 185, birdName)
    player.setCollideWorldBounds(true)

    this.anims.create({
        key: 'clap-wings',
        frames: this.anims.generateFrameNumbers(birdName, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'stop',
        frames: [{
            key: birdName,
            frame: 1
        }],
        frameRate: 20
    })

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    this.physics.add.collider(player, grounds, hitBird, null, this)
    this.physics.add.collider(player, pipes, hitBird, null, this)

    this.physics.add.overlap(player, gaps, updateScore, null, this)

    player.anims.play('clap-wings', true)

    scoreboard = this.physics.add.staticGroup()
    scoreboard.create(widthMiddle, 30, 'number0')
}

function update() {
    if (gameOver)
        return

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (Phaser.Input.Keyboard.JustDown(upButton))
        moveBird()
    else {
        player.setVelocityY(120)

        if (player.angle < 90)
            player.angle += 1
    }

    pipes.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    });

    gaps.children.iterate(function (child) {
        child.setVelocityX(-100)
    });

    nextPipes++;
    if (nextPipes === 130) {
        makePipes()
        nextPipes = 0
    }
}

function hitBird(player) {
    this.physics.pause()

    gameOver = true

    player.anims.play('stop')

    this.add.image(widthMiddle, 206, 'game-over')

    const restart = this.add.image(widthMiddle, 300, 'restart-button').setInteractive()
    restart.on('pointerdown', () => alert('soon'))
}

function updateScore(_, gap) {
    score++
    gap.destroy()

    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible

        if (currentPipeName === pipeGreenName)
            currentPipeName = pipeRedName
        else
            currentPipeName = pipeGreenName
    }

    updateScoreboard()
}

function makePipes() {
    const pipeTopY = Phaser.Math.Between(-120, 120)

    const gap = gaps.create(288, pipeTopY + 210, 'gap', null, false)
    gap.body.allowGravity = false

    const pipeTop = pipes.create(288, pipeTopY, currentPipeName)
    pipeTop.body.allowGravity = false
    pipeTop.angle = 180

    const pipeBottom = pipes.create(288, pipeTopY + 420, currentPipeName)
    pipeBottom.body.allowGravity = false
}

function moveBird() {
    if (gameOver)
        return

    player.setVelocityY(-400)
    player.angle = -15
    framesMoveUp = 5
}

function getRandomBird() {
    switch (Phaser.Math.Between(0, 2)) {
        case 0:
            return birdRedName
        case 1:
            return birdBlueName
        case 2:
        default:
            return birdYellowName
    }
}

function updateScoreboard() {
    scoreboard.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboard.create(widthMiddle, 30, 'number' + score).setDepth(10)
    else {
        let initialPosition = widthMiddle - ((score.toString().length * numberWidth) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboard.create(initialPosition, 30, 'number' + scoreAsString[i]).setDepth(10)
            initialPosition += numberWidth
        }
    }
}