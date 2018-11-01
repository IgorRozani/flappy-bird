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

const assets = {
    bird: {
        red: 'bird-red',
        yellow: 'bird-yellow',
        blue: 'bird-blue'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bo'
            }
        },
        gap: 'gap'
    },
    scene: {
        background: {
            day: 'background-day',
            night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button'
    },
    scoreboard: {
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        clapWings: 'clap-wings',
        stop: 'stop'
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
// Background
let backgroundDay
let backgroundNight
// pipes
let pipesGroup
let gapsGroup
let nextPipes = 0
let currentPipe = assets.obstacle.pipe.green
// score variables
let scoreboardGroup
let score = 0
const numberWidth = 25

function preload() {
    // Backgrounds and ground
    this.load.image(assets.scene.background.day, 'assets/background-day.png')
    this.load.image(assets.scene.background.night, 'assets/background-night.png')
    this.load.image(assets.scene.ground, 'assets/ground.png')

    // Pipes
    this.load.image(assets.obstacle.pipe.green.top, 'assets/pipe-green-top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets/pipe-green-bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, 'assets/pipe-red-top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets/pipe-red-bottom.png')
    this.load.image(assets.obstacle.gap, 'assets/gap.png')

    // End game
    this.load.image(assets.scene.gameOver, 'assets/gameover.png')
    this.load.image(assets.scene.restart, 'assets/restart-button.png')

    // Birds
    this.load.spritesheet(assets.bird.red, 'assets/redbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bird.blue, 'assets/bluebird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bird.yellow, 'assets/yellowbird-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image(assets.scoreboard.number0, 'assets/0.png')
    this.load.image(assets.scoreboard.number1, 'assets/1.png')
    this.load.image(assets.scoreboard.number2, 'assets/2.png')
    this.load.image(assets.scoreboard.number3, 'assets/3.png')
    this.load.image(assets.scoreboard.number4, 'assets/4.png')
    this.load.image(assets.scoreboard.number5, 'assets/5.png')
    this.load.image(assets.scoreboard.number6, 'assets/6.png')
    this.load.image(assets.scoreboard.number7, 'assets/7.png')
    this.load.image(assets.scoreboard.number8, 'assets/8.png')
    this.load.image(assets.scoreboard.number9, 'assets/9.png')
}

function create() {
    const birdName = getRandomBird()

    backgroundDay = this.add.image(widthMiddle, 256, assets.scene.background.day).setInteractive();
    backgroundDay.on('pointerdown', moveBird)
    backgroundNight = this.add.image(widthMiddle, 256, assets.scene.background.night).setInteractive();
    backgroundNight.visible = false
    backgroundNight.on('pointerdown', moveBird)

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    makePipes()

    const groundsGroup = this.physics.add.staticGroup()
    const ground = groundsGroup.create(widthMiddle, 458, assets.scene.ground)
    ground.setDepth(10)

    player = this.physics.add.sprite(80, 185, birdName)
    player.setCollideWorldBounds(true)

    this.anims.create({
        key: assets.animation.clapWings,
        frames: this.anims.generateFrameNumbers(birdName, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: assets.animation.stop,
        frames: [{
            key: birdName,
            frame: 1
        }],
        frameRate: 20
    })

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    this.physics.add.collider(player, groundsGroup, hitBird, null, this)
    this.physics.add.collider(player, pipesGroup, hitBird, null, this)

    this.physics.add.overlap(player, gapsGroup, updateScore, null, this)

    player.anims.play(assets.animation.clapWings, true)

    scoreboardGroup = this.physics.add.staticGroup()
    scoreboardGroup.create(widthMiddle, 30, assets.scoreboard.number0)
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

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    });

    gapsGroup.children.iterate(function (child) {
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

    player.anims.play(assets.animation.stop)

    this.add.image(widthMiddle, 206, assets.scene.gameOver)

    const restart = this.add.image(widthMiddle, 300, assets.scene.restart).setInteractive()
    restart.on('pointerdown', restartGame)
}

function updateScore(_, gap) {
    score++
    gap.destroy()

    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible

        if (currentPipe === assets.obstacle.pipe.green)
            currentPipe = assets.obstacle.pipe.red
        else
            currentPipe = assets.obstacle.pipe.green
    }

    updateScoreboard()
}

function makePipes() {
    const pipeTopY = Phaser.Math.Between(-120, 120)

    const gap = gapsGroup.create(288, pipeTopY + 210, assets.obstacle.gap, null, false)
    gap.body.allowGravity = false

    const pipeTop = pipesGroup.create(288, pipeTopY, currentPipe.top)
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(288, pipeTopY + 420, currentPipe.bottom)
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
            return assets.bird.red
        case 1:
            return assets.bird.blue
        case 2:
        default:
            return assets.bird.yellow
    }
}

function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboardGroup.create(widthMiddle, 30, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = widthMiddle - ((score.toString().length * numberWidth) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += numberWidth
        }
    }
}

function restartGame() {
    location.reload()
}