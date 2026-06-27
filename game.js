'use strict';

const R = Math.random;

// ===== SCREEN FLASH =====
function screenFlash(type) {
    const el = get('screen-flash');
    el.className = '';
    void el.offsetWidth;
    el.classList.add('flash-' + type);
    setTimeout(() => { el.className = ''; }, 180);
}

// ===== LOW HP VIGNETTE =====
function updateVignette() {
    const mhp = game.maxHp + game.bonusMaxHp;
    const pct = game.hp / mhp;
    const vig = get('low-hp-vignette');
    if (pct < 0.25 && game.hp > 0) {
        vig.style.opacity = '1';
        vig.classList.add('active');
    } else {
        vig.style.opacity = '0';
        vig.classList.remove('active');
    }
}

// ===== AUDIO ENGINE =====
const AudioEngine = {
    ctx: null,
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { console.warn('AudioContext not available'); }
    },
    play(type) {
        if (!soundEnabled) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        switch(type) {
            case 'click':      this._tone(600,0.08,'square',0.15); break;
            case 'step':       this._tone(200+R()*100,0.05,'triangle',0.1); this._tone(100+R()*50,0.03,'sine',0.03,0.02); break;
            case 'hit':        this._noise(0.15,0.2); this._tone(150,0.15,'sawtooth',0.15); this._tone(80,0.08,'square',0.08,0.05); break;
            case 'playerHit':  this._noise(0.2,0.25); this._tone(100,0.2,'sawtooth',0.2); this._tone(55,0.15,'square',0.12,0.06); break;
            case 'miss':       this._tone(300,0.15,'sine',0.08); this._tone(250,0.12,'sine',0.04,0.06); break;
            case 'crit':       this._noise(0.15,0.3); this._tone(200,0.1,'sawtooth',0.2); this._tone(400,0.1,'square',0.15,0.1); this._tone(150,0.1,'square',0.08,0.12); break;
            case 'heal':       this._tone(400,0.2,'sine',0.12); this._tone(600,0.2,'sine',0.12,0.1); this._tone(800,0.2,'sine',0.12,0.2); break;
            case 'gold':       this._tone(800,0.1,'square',0.1); this._tone(1000,0.1,'square',0.1,0.08); this._tone(1200,0.15,'square',0.1,0.16); break;
            case 'treasure':   this._tone(500,0.15,'sine',0.15); this._tone(700,0.15,'sine',0.15,0.12); this._tone(900,0.2,'sine',0.15,0.24); this._tone(1200,0.22,'sine',0.1,0.3); break;
            case 'levelup':    this._tone(400,0.15,'sine',0.15); this._tone(500,0.15,'sine',0.15,0.12); this._tone(600,0.15,'sine',0.15,0.24); this._tone(800,0.3,'sine',0.2,0.36); this._tone(1000,0.18,'sine',0.09,0.42); break;
            case 'combat':     this._tone(150,0.3,'sawtooth',0.15); this._tone(100,0.3,'sawtooth',0.15,0.15); this._noise(0.08,0.12,0.18); break;
            case 'victory':    this._tone(523,0.15,'square',0.12); this._tone(659,0.15,'square',0.12,0.15); this._tone(784,0.15,'square',0.12,0.3); this._tone(1047,0.4,'square',0.15,0.45); break;
            case 'death':      this._tone(300,0.3,'sawtooth',0.15); this._tone(200,0.3,'sawtooth',0.15,0.3); this._tone(100,0.5,'sawtooth',0.2,0.6); break;
            case 'flee':       this._tone(600,0.1,'triangle',0.1); this._tone(500,0.1,'triangle',0.1,0.08); this._tone(400,0.1,'triangle',0.1,0.16); this._tone(300,0.1,'triangle',0.06,0.2); break;
            case 'trap':       this._noise(0.1,0.2); this._tone(200,0.2,'square',0.15); this._tone(150,0.3,'square',0.15,0.1); break;
            case 'shop':       this._tone(500,0.1,'sine',0.1); this._tone(700,0.15,'sine',0.1,0.1); this._tone(600,0.08,'sine',0.06,0.16); break;
            case 'dice':       this._tone(300+R()*400,0.03,'square',0.08); break;
            case 'magic':      this._tone(600,0.1,'sine',0.1); this._tone(900,0.1,'sine',0.1,0.05); this._tone(1200,0.15,'sine',0.1,0.1); this._tone(800,0.2,'sine',0.08,0.2); break;
            case 'potion':     this._tone(400,0.15,'sine',0.1); this._tone(600,0.15,'sine',0.1,0.1); this._tone(500,0.2,'sine',0.1,0.2); break;
            case 'nextFloor':  this._tone(300,0.2,'sine',0.12); this._tone(450,0.2,'sine',0.12,0.2); this._tone(600,0.2,'sine',0.12,0.4); this._tone(900,0.4,'sine',0.15,0.6); break;
            case 'block':      this._tone(300,0.07,'triangle',0.09); this._tone(500,0.09,'triangle',0.07,0.03); this._noise(0.04,0.07,0.05); break;
            case 'achievement':this._tone(800,0.09,'sine',0.09); this._tone(1000,0.09,'sine',0.09,0.09); this._tone(1200,0.14,'sine',0.09,0.18); this._tone(1600,0.22,'sine',0.07,0.27); break;
            case 'secret':     this._tone(500,0.14,'sine',0.07); this._tone(800,0.14,'sine',0.07,0.14); this._tone(1100,0.18,'sine',0.09,0.28); break;
            case 'npc':        this._tone(400,0.09,'sine',0.07); this._tone(500,0.07,'sine',0.05,0.07); break;
            case 'combo':      this._tone(600,0.05,'square',0.07); this._tone(800,0.05,'square',0.07,0.03); this._tone(1000,0.07,'square',0.09,0.06); break;
            case 'heartbeat':  this._tone(55,0.12,'sine',0.06); this._tone(55,0.1,'sine',0.04,0.15); break;
            case 'door':       this._tone(300,0.2,'triangle',0.12); this._tone(250,0.3,'triangle',0.12,0.15); break;
        }
    },
    _tone(freq, dur, type, vol, delay=0) {
        if(!this.ctx) return;
        try {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = type; o.frequency.value = freq;
            g.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);
            o.connect(g).connect(this.ctx.destination);
            o.start(this.ctx.currentTime + delay);
            o.stop(this.ctx.currentTime + delay + dur + 0.05);
        } catch(e) {}
    },
    _noise(dur, vol, delay=0) {
        if(!this.ctx) return;
        try {
            const sz = this.ctx.sampleRate * dur;
            const buf = this.ctx.createBuffer(1, sz, this.ctx.sampleRate);
            const d = buf.getChannelData(0);
            for(let i = 0; i < sz; i++) d[i] = R() * 2 - 1;
            const s = this.ctx.createBufferSource(), g = this.ctx.createGain();
            s.buffer = buf;
            const t = this.ctx.currentTime + delay;
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            s.connect(g).connect(this.ctx.destination);
            s.start(t);
        } catch(e) {}
    },
    _ambientActive: false,
    _heartbeatInterval: null,
    startAmbient() {
        if(this._ambientActive) return;
        if(!this.ctx) this.init();
        if(!this.ctx) return;
        if(this.ctx.state === 'suspended') this.ctx.resume();
        this._ambientActive = true;
        const drone = () => {
            if(!this._ambientActive) return;
            this._tone([55,62,73,82][~~(R()*4)], 4.5, 'sine', 0.008);
            setTimeout(drone, 3500 + R() * 4500);
        };
        drone();
        const drip = () => {
            if(!this._ambientActive) return;
            this._tone(800 + R() * 1200, 0.025, 'sine', 0.012);
            setTimeout(drip, 2500 + R() * 7000);
        };
        drip();
    },
    stopAmbient() {
        this._ambientActive = false;
        this.stopHeartbeat();
    },
    startHeartbeat() {
        if(this._heartbeatInterval) return;
        this._heartbeatInterval = setInterval(() => {
            if(!game.gameOver && game.hp > 0) {
                const mhp = game.maxHp + game.bonusMaxHp;
                if(game.hp / mhp < 0.25) this.play('heartbeat');
            }
        }, 1200);
    },
    stopHeartbeat() {
        if(this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = null;
        }
    }
};

// ===== BACKGROUND =====
const Background = {
    canvas: null, ctx: null, stars: [],
    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        for(let i = 0; i < 130; i++) {
            this.stars.push({
                x: R()*3e3, y: R()*2e3, s: 0.3+R()*2,
                b: R(), bd: 0.002+R()*0.004,
                d: R()>0.5?1:-1, h: 200+R()*55
            });
        }
        this.loop();
    },
    resize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    },
    loop() {
        const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
        c.fillStyle = '#080816';
        c.fillRect(0, 0, w, h);
        const g = c.createRadialGradient(w*0.25, h*0.35, 0, w*0.25, h*0.35, w*0.42);
        g.addColorStop(0, 'rgba(22,8,50,0.08)');
        g.addColorStop(1, 'transparent');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        for(const s of this.stars) {
            s.b += s.bd * s.d;
            if(s.b >= 1 || s.b <= 0) s.d *= -1;
            s.b = Math.max(0, Math.min(1, s.b));
            c.globalAlpha = s.b * 0.5;
            c.fillStyle = `hsl(${s.h},42%,76%)`;
            c.beginPath();
            c.arc(s.x % w, s.y % h, s.s, 0, Math.PI*2);
            c.fill();
        }
        c.globalAlpha = 1;
        requestAnimationFrame(() => this.loop());
    }
};

// ===== PARTICLES =====
const Particles = {
    canvas: null, ctx: null, particles: [], pool: [],
    init() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    },
    resize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    },
    _get() { return this.pool.length > 0 ? this.pool.pop() : {}; },
    _release(p) { if(this.pool.length < 200) this.pool.push(p); },
    spawn(x, y, color, count=8, speed=3) {
        for(let i = 0; i < count; i++) {
            const a = (Math.PI*2/count)*i + R()*0.5;
            const p = this._get();
            p.x=x; p.y=y;
            p.vx=Math.cos(a)*speed*(0.5+R());
            p.vy=Math.sin(a)*speed*(0.5+R());
            p.life=1; p.decay=0.015+R()*0.02;
            p.size=2+R()*4; p.color=color; p.shape='circle';
            this.particles.push(p);
        }
    },
    sparkle(x, y, color, count=12) {
        for(let i = 0; i < count; i++) {
            const a = R()*Math.PI*2, s = 1+R()*3;
            const p = this._get();
            p.x=x; p.y=y;
            p.vx=Math.cos(a)*s; p.vy=Math.sin(a)*s-1;
            p.life=1; p.decay=0.014+R()*0.014;
            p.size=1+R()*2.5; p.color=color; p.shape='star';
            this.particles.push(p);
        }
    },
    trail(x, y, color) {
        for(let i = 0; i < 5; i++) {
            const p = this._get();
            p.x=x+R()*8-4; p.y=y+R()*8-4;
            p.vx=R()*2-1; p.vy=-1-R()*2;
            p.life=1; p.decay=0.022+R()*0.018;
            p.size=2+R()*2.5; p.color=color; p.shape='circle';
            this.particles.push(p);
        }
    },
    spawnAt(elem, color, count=10) {
        if(!elem) return;
        const r = elem.getBoundingClientRect();
        this.spawn(r.left+r.width/2, r.top+r.height/2, color, count);
    },
    loop() {
        const c = this.ctx;
        c.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = this.particles.length-1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.08; p.life -= p.decay;
            if(p.life <= 0) { this.particles.splice(i,1); this._release(p); continue; }
            c.globalAlpha = p.life;
            c.fillStyle = p.color;
            if(p.shape === 'star') {
                c.save(); c.translate(p.x, p.y); c.rotate(p.life*3);
                const sz = p.size * p.life;
                c.beginPath();
                for(let j = 0; j < 5; j++) {
                    c.lineTo(Math.cos((j*72-90)*Math.PI/180)*sz, Math.sin((j*72-90)*Math.PI/180)*sz);
                    c.lineTo(Math.cos((j*72-54)*Math.PI/180)*sz*0.4, Math.sin((j*72-54)*Math.PI/180)*sz*0.4);
                }
                c.closePath(); c.fill(); c.restore();
            } else {
                c.beginPath();
                c.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2);
                c.fill();
            }
        }
        c.globalAlpha = 1;
        requestAnimationFrame(() => this.loop());
    }
};

// ===== MINIMAP =====
const Minimap = {
    canvas: null, ctx: null,
    init() {
        this.canvas = document.getElementById('minimap-canvas');
        this.ctx = this.canvas.getContext('2d');
    },
    render() {
        if(!game.map || !game.map.length) return;
        const W = game.mapWidth, H = game.mapHeight;
        const scale = Math.min(80/W, 60/H);
        this.canvas.width  = Math.ceil(W * scale);
        this.canvas.height = Math.ceil(H * scale);
        const c = this.ctx;
        c.fillStyle = '#0a0a15';
        c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for(let y = 0; y < H; y++) {
            for(let x = 0; x < W; x++) {
                const cell = game.map[y][x];
                if(!cell.revealed) continue;
                const px = x*scale, py = y*scale;
                if(x === game.playerX && y === game.playerY) {
                    c.fillStyle = '#2ecc71';
                } else if(cell.type === 'wall') {
                    c.fillStyle = '#3d3d5c';
                } else if(cell.content === 'exit') {
                    c.fillStyle = '#3498db';
                } else if(cell.content === 'monster' || cell.content === 'boss') {
                    c.fillStyle = '#e74c3c';
                } else if(cell.content === 'treasure') {
                    c.fillStyle = '#ffd700';
                } else if(cell.content === 'shop') {
                    c.fillStyle = '#f39c12';
                } else if(cell.content === 'heal') {
                    c.fillStyle = '#27ae60';
                } else if(cell.visited) {
                    c.fillStyle = '#1e1e32';
                } else {
                    c.fillStyle = '#2a2a3e';
                }
                c.fillRect(px, py, Math.ceil(scale), Math.ceil(scale));
            }
        }
    }
};

// ===== UTILITIES =====
function get(id) { return document.getElementById(id); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function floatText(text, x, y, className='damage') {
    const el = document.createElement('div');
    el.className = `float-text ${className}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function floatTextAtElement(text, elem, className='damage') {
    if(!elem) return;
    const r = elem.getBoundingClientRect();
    floatText(text, r.left + r.width/2 - 20 + R()*30, r.top + R()*8, className);
}

function screenShake(big=false) {
    const gc = get('game-container');
    gc.classList.remove('shake-sm','shake-lg');
    void gc.offsetWidth;
    gc.classList.add(big ? 'shake-lg' : 'shake-sm');
    setTimeout(() => gc.classList.remove('shake-sm','shake-lg'), 500);
}

// ===== SOUND TOGGLE =====
let soundEnabled = true;
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = get('sound-toggle');
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.title = soundEnabled ? 'Mute Sound' : 'Unmute Sound';
    if(!soundEnabled) {
        AudioEngine.stopAmbient();
        AudioEngine.stopHeartbeat();
        if(AudioEngine.ctx) AudioEngine.ctx.suspend();
    } else {
        if(AudioEngine.ctx) AudioEngine.ctx.resume();
        if(game.selectedHero && !game.gameOver) {
            AudioEngine.startAmbient();
            AudioEngine.startHeartbeat();
        }
    }
}

// ===== PAUSE =====
let gamePaused = false;
function togglePause() {
    if(game.gameOver || !game.selectedHero) return;
    if(!get('start-screen').classList.contains('hidden')) return;
    gamePaused = !gamePaused;
    const overlay = get('pause-overlay');
    if(gamePaused) {
        overlay.classList.add('show');
        saveGame();
    } else {
        overlay.classList.remove('show');
    }
    AudioEngine.play('click');
}

// ===== HELP =====
function toggleHelp() {
    get('help-overlay').classList.toggle('show');
    AudioEngine.play('click');
}

// ===== HIGH SCORES =====
const SCORES_KEY = 'littleHeroes_scores';
const HighScores = {
    scores: [],
    load() {
        try {
            const raw = localStorage.getItem(SCORES_KEY);
            this.scores = raw ? JSON.parse(raw) : [];
        } catch(e) { this.scores = []; }
    },
    add(name, heroClass, score, floor, level, won) {
        this.load();
        this.scores.push({ name, heroClass, score, floor, level, won, date: new Date().toLocaleDateString() });
        this.scores.sort((a,b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10);
        try { localStorage.setItem(SCORES_KEY, JSON.stringify(this.scores)); } catch(e) {}
    },
    getAll() { this.load(); return this.scores; },
    clear() {
        this.scores = [];
        try { localStorage.removeItem(SCORES_KEY); } catch(e) {}
    }
};

function renderHighScores() {
    const list = get('hs-list');
    if(!list) return;
    const scores = HighScores.getAll();
    if(!scores.length) {
        list.innerHTML = '<div style="color:#555;text-align:center;padding:10px;font-size:0.8rem;">No scores yet — be the first!</div>';
        return;
    }
    list.innerHTML = scores.map((s,i) => {
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
        const wonIcon = s.won ? '🏆' : '💀';
        return `<div class="hs-entry${i<3?' top3':''}">
            <span class="hs-rank">${medal}</span>
            <span class="hs-name">${s.name}</span>
            <span class="hs-class">${s.heroClass}</span>
            <span class="hs-score">${wonIcon} ${s.score}</span>
            <span class="hs-detail">Lv${s.level} F${s.floor}</span>
        </div>`;
    }).join('');
}

function toggleHighScores() {
    const panel = get('hs-panel');
    panel.classList.toggle('show');
    renderHighScores();
    AudioEngine.play('click');
}

// ===== SAVE / LOAD =====
const SAVE_KEY = 'littleHeroes_save';

function saveGame() {
    if(game.gameOver || !game.selectedHero) return;
    try {
        const saveData = {
            version: 2,
            timestamp: Date.now(),
            selectedHero: game.selectedHero,
            difficulty: game.difficulty,
            heroName: game.heroName,
            diffMult: game.diffMult,
            floor: game.floor,
            maxFloors: game.maxFloors,
            map: game.map,
            mapWidth: game.mapWidth,
            mapHeight: game.mapHeight,
            playerX: game.playerX,
            playerY: game.playerY,
            hp: game.hp, maxHp: game.maxHp,
            mp: game.mp, maxMp: game.maxMp,
            baseAtk: game.baseAtk, baseDef: game.baseDef,
            baseMag: game.baseMag, baseSpd: game.baseSpd,
            bonusAtk: game.bonusAtk, bonusDef: game.bonusDef,
            bonusMag: game.bonusMag, bonusSpd: game.bonusSpd,
            bonusMaxHp: game.bonusMaxHp, bonusMaxMp: game.bonusMaxMp,
            gold: game.gold, keys: game.keys,
            xp: game.xp, level: game.level, xpToLevel: game.xpToLevel,
            potions: game.potions, bigPotions: game.bigPotions,
            scrolls: game.scrolls, bombs: game.bombs, antidotes: game.antidotes,
            inventory: game.inventory,
            steps: game.steps, monstersKilled: game.monstersKilled,
            treasuresFound: game.treasuresFound, floorsCleared: game.floorsCleared,
            score: game.score, totalHealed: game.totalHealed,
            crits: game.crits, fleeCount: game.fleeCount,
            playerStatus: game.playerStatus,
            abilityUsed: game.abilityUsed,
            achievements: Achievements.earned,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch(e) { console.warn('Save failed:', e); }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if(!raw) return false;
        const s = JSON.parse(raw);
        if(!s.version || !s.selectedHero) return false;
        const hero = HEROES[s.selectedHero];
        if(!hero) return false;

        game.selectedHero  = s.selectedHero;
        game.difficulty    = s.difficulty;
        game.heroName      = s.heroName;
        game.diffMult      = s.diffMult;
        game.floor         = s.floor;
        game.maxFloors     = s.maxFloors;
        game.map           = s.map;
        game.mapWidth      = s.mapWidth;
        game.mapHeight     = s.mapHeight;
        game.playerX       = s.playerX;
        game.playerY       = s.playerY;
        game.prevPositions = [];
        game.hp            = s.hp;    game.maxHp  = s.maxHp;
        game.mp            = s.mp;    game.maxMp  = s.maxMp;
        game.baseAtk       = s.baseAtk;  game.baseDef  = s.baseDef;
        game.baseMag       = s.baseMag;  game.baseSpd  = s.baseSpd;
        game.bonusAtk      = s.bonusAtk; game.bonusDef = s.bonusDef;
        game.bonusMag      = s.bonusMag; game.bonusSpd = s.bonusSpd;
        game.bonusMaxHp    = s.bonusMaxHp; game.bonusMaxMp = s.bonusMaxMp;
        game.gold          = s.gold;  game.keys   = s.keys;
        game.xp            = s.xp;    game.level  = s.level;
        game.xpToLevel     = s.xpToLevel;
        game.potions       = s.potions;    game.bigPotions = s.bigPotions;
        game.scrolls       = s.scrolls;   game.bombs      = s.bombs;
        game.antidotes     = s.antidotes;
        game.inventory     = s.inventory || [];
        game.steps         = s.steps;
        game.monstersKilled= s.monstersKilled;
        game.treasuresFound= s.treasuresFound;
        game.floorsCleared = s.floorsCleared;
        game.score         = s.score;
        game.totalHealed   = s.totalHealed;
        game.crits         = s.crits;
        game.fleeCount     = s.fleeCount || 0;
        game.playerStatus  = s.playerStatus || [];
        game.abilityUsed   = s.abilityUsed || false;
        game.inCombat      = false; game.combatBusy = false;
        game.combo         = 0;     game.isDefending = false;
        game.enemyStatus   = [];
        game.gameOver      = false; game.walking = false;
        game.combatDamageTaken = 0;

        Achievements.earned = s.achievements || [];

        get('start-screen').classList.add('hidden');
        const avatarNode = get('player-avatar');
        avatarNode.childNodes[0].textContent = hero.icon;
        get('player-name').textContent  = game.heroName;
        get('map-subtitle').textContent = FLOOR_NAMES[Math.min(game.floor-1, FLOOR_NAMES.length-1)];

        AudioEngine.startAmbient();
        AudioEngine.startHeartbeat();
        renderMap();
        updateStatusDisplay();
        updateUI();
        addLog('💾 Game loaded!', 'special');
        addLog(`🏰 Floor ${game.floor}: ${FLOOR_NAMES[Math.min(game.floor-1,FLOOR_NAMES.length-1)]}`, 'info');
        return true;
    } catch(e) {
        console.warn('Load failed:', e);
        clearSave();
        return false;
    }
}

function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
    updateContinueButton();
}

function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch(e) { return false; }
}

function updateContinueButton() {
    const btn = get('continue-btn');
    if(!btn) return;
    if(hasSave()) {
        btn.style.display = 'block';
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY));
            const hero = HEROES[s.selectedHero];
            const age  = Date.now() - s.timestamp;
            const mins = ~~(age / 60000);
            const timeText = mins < 60 ? `${mins}m ago` : `${~~(mins/60)}h ago`;
            btn.innerHTML = `💾 Continue: ${hero.icon} ${s.heroName} Lv${s.level} F${s.floor} <span style="font-size:0.5rem;opacity:0.5">${timeText}</span>`;
        } catch(e) { btn.textContent = '💾 Continue Game'; }
    } else {
        btn.style.display = 'none';
    }
}

function continueGame() {
    AudioEngine.play('click');
    if(!loadGame()) addLog('❌ No save found!', 'damage');
}

function autoSave() {
    if(!game.gameOver && game.selectedHero && !game.inCombat) saveGame();
}

// ===== ACHIEVEMENTS =====
const Achievements = {
    earned: [],
    list: {
        first_blood:    { icon:'🩸', name:'First Blood',      desc:'Defeat first monster' },
        treasure5:      { icon:'📦', name:'Treasure Hunter',   desc:'Find 5 treasures' },
        boss_slayer:    { icon:'🐲', name:'Boss Slayer',       desc:'Defeat a boss' },
        level5:         { icon:'⭐', name:'Rising Star',       desc:'Reach level 5' },
        rich:           { icon:'💎', name:'Rich Kid',          desc:'Collect 100 gold' },
        survivor:       { icon:'🛡️', name:'Survivor',          desc:'Win with ≤3 HP' },
        combo3:         { icon:'🔥', name:'Combo Master',      desc:'3x combo' },
        floor3:         { icon:'🏰', name:'Deep Diver',        desc:'Reach floor 3' },
        untouchable:    { icon:'💨', name:'Untouchable',       desc:'No damage in a fight' },
        explorer:       { icon:'🗺️', name:'Explorer',          desc:'Take 200 steps' },
        healer_supreme: { icon:'💚', name:'Healer Supreme',    desc:'Heal 50+ total HP' },
        no_flee:        { icon:'🦁', name:'Brave Heart',       desc:'10 kills, never fled' },
    },
    check(id) {
        if(this.earned.includes(id)) return;
        this.earned.push(id);
        const a = this.list[id];
        AudioEngine.play('achievement');
        addLog(`🏆 ${a.name}!`, 'achievement');
        Particles.sparkle(innerWidth/2, 60, '#ffd700', 18);
        get('ach-toast-icon').textContent = a.icon;
        get('ach-toast-name').textContent = a.name;
        get('ach-toast-desc').textContent = a.desc;
        const t = get('achievement-toast');
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3800);
    }
};

// ===== HERO DATA =====
const HEROES = {
    knight: { icon:'🗡️', name:'Knight', hp:16, atk:5, def:5, mag:1, spd:2, mp:3,  ability:'Power Strike',      abilityDesc:'2× ATK counter on defend',  abilityCost:2 },
    wizard: { icon:'🧙', name:'Wizard',  hp:11, atk:3, def:2, mag:7, spd:3, mp:8,  ability:'Chain Lightning',   abilityDesc:'MAG×2 magic damage',         abilityCost:3 },
    archer: { icon:'🏹', name:'Ranger',  hp:13, atk:4, def:2, mag:2, spd:6, mp:4,  ability:'Precision Shot',    abilityDesc:'Always hits +50% dmg',       abilityCost:2 },
    healer: { icon:'🧝', name:'Druid',   hp:14, atk:3, def:3, mag:5, spd:3, mp:6,  ability:"Nature's Blessing", abilityDesc:'Heal 50% HP + cure status',  abilityCost:3 },
};

// ===== MONSTERS =====
const MONSTERS = [
    { icon:'🐀', name:'Giant Rat',    hp:5,  atk:2,  def:1, xp:6,  gold:[1,4],   tier:0, status:null },
    { icon:'🦇', name:'Bat Swarm',    hp:4,  atk:3,  def:0, xp:6,  gold:[1,3],   tier:0, status:null },
    { icon:'🕷️', name:'Spider',       hp:7,  atk:3,  def:1, xp:9,  gold:[2,5],   tier:0, status:'poison' },
    { icon:'💀', name:'Skeleton',     hp:9,  atk:4,  def:3, xp:12, gold:[3,6],   tier:1, status:null },
    { icon:'👻', name:'Ghost',        hp:7,  atk:5,  def:1, xp:13, gold:[3,7],   tier:1, status:null },
    { icon:'🧟', name:'Zombie',       hp:14, atk:4,  def:3, xp:14, gold:[2,6],   tier:1, status:'poison' },
    { icon:'🐺', name:'Dire Wolf',    hp:11, atk:5,  def:2, xp:16, gold:[4,8],   tier:1, status:null },
    { icon:'👹', name:'Goblin Chief', hp:16, atk:6,  def:3, xp:22, gold:[6,12],  tier:2, status:null },
    { icon:'👾', name:'Mimic',        hp:13, atk:7,  def:4, xp:22, gold:[10,18], tier:2, status:null },
    { icon:'🐉', name:'Young Dragon', hp:22, atk:8,  def:5, xp:32, gold:[12,22], tier:2, status:'burn' },
    { icon:'🧌', name:'Troll',        hp:28, atk:7,  def:5, xp:28, gold:[8,16],  tier:2, status:null },
    { icon:'😈', name:'Demon',        hp:32, atk:10, def:6, xp:42, gold:[15,28], tier:3, status:'burn' },
    { icon:'🐲', name:'Elder Dragon', hp:42, atk:12, def:8, xp:65, gold:[22,42], tier:3, status:'burn' },
];

const BOSSES = [
    { icon:'🐲', name:'Dragon Lord',   hp:35, atk:8,  def:5, xp:55,  gold:[18,30], status:'burn' },
    { icon:'👑', name:'Skeleton King', hp:40, atk:9,  def:7, xp:65,  gold:[22,35], status:null },
    { icon:'🦑', name:'Kraken',        hp:45, atk:10, def:4, xp:75,  gold:[28,40], status:'poison' },
    { icon:'😈', name:'Demon Lord',    hp:55, atk:13, def:8, xp:100, gold:[35,55], status:'burn' },
];

// ===== ITEMS =====
const ITEMS = {
    potion:    { icon:'🧪', name:'Health Potion', desc:'Restores 8 HP',          type:'consumable',        healAmount:8 },
    bigPotion: { icon:'💊', name:'Big Potion',    desc:'Restores 18 HP',         type:'consumable',        healAmount:18 },
    key:       { icon:'🗝️', name:'Key',           desc:'Opens locked doors',     type:'key' },
    shield:    { icon:'🛡️', name:'Shield',        desc:'+2 Defense',             type:'equip', stat:'def',   bonus:2 },
    sword:     { icon:'⚔️', name:'Sword',         desc:'+3 Attack',              type:'equip', stat:'atk',   bonus:3 },
    ring:      { icon:'💍', name:'Magic Ring',    desc:'+2 Magic',               type:'equip', stat:'mag',   bonus:2 },
    boots:     { icon:'👢', name:'Speed Boots',   desc:'+3 Speed',               type:'equip', stat:'spd',   bonus:3 },
    amulet:    { icon:'📿', name:'Amulet',        desc:'+6 Max HP',              type:'equip', stat:'maxhp', bonus:6 },
    scroll:    { icon:'📜', name:'Fire Scroll',   desc:'Deal 14 magic damage',   type:'combat_consumable', damage:14 },
    bomb:      { icon:'💣', name:'Bomb',          desc:'Deal 12 damage',         type:'combat_consumable', damage:12 },
    antidote:  { icon:'🌿', name:'Antidote',      desc:'Cure status effects',    type:'cure' },
    crystal:   { icon:'💎', name:'Mana Crystal',  desc:'+4 Max MP',              type:'equip', stat:'maxmp', bonus:4 },
};

const TREASURE_POOLS = {
    common:   ['potion','potion','key','antidote','potion'],
    uncommon: ['potion','shield','sword','ring','boots','bigPotion','bomb','antidote','crystal'],
    rare:     ['amulet','scroll','bigPotion','sword','shield','crystal','bomb'],
};

const SHOP_POOLS = [
    {item:'potion',    price:5},  {item:'bigPotion', price:14},
    {item:'scroll',    price:16}, {item:'bomb',      price:13},
    {item:'shield',    price:22}, {item:'sword',     price:27},
    {item:'ring',      price:20}, {item:'boots',     price:20},
    {item:'amulet',    price:32}, {item:'antidote',  price:6},
    {item:'crystal',   price:18},
];

const FLOOR_NAMES = [
    'The Dusty Cellars',
    'Shadowy Catacombs',
    'Crystal Caverns',
    'Lava Depths',
    "Dragon's Lair",
];

const RANDOM_EVENTS = [
    { icon:'🧚', title:'Friendly Fairy',  desc:'A fairy offers a gift!',      effect: g => { g.hp = Math.min(g.hp+6, g.maxHp+g.bonusMaxHp); return '+6 HP from fairy!'; } },
    { icon:'📖', title:'Ancient Tome',    desc:'Knowledge awaits.',           effect: g => { g.xp += 12; return '+12 XP!'; } },
    { icon:'🗡️', title:'Weapon Shrine',   desc:'Magic glows.',                effect: g => { g.bonusAtk += 1; return '+1 ATK!'; } },
    { icon:'🛡️', title:'Shield Shrine',   desc:'Protective magic.',           effect: g => { g.bonusDef += 1; return '+1 DEF!'; } },
    { icon:'✨', title:'Mana Spring',     desc:'Magical energy.',             effect: g => { g.mp = Math.min(g.mp+3, g.maxMp+g.bonusMaxMp); return '+3 MP!'; } },
    { icon:'🍄', title:'Mushroom',        desc:'Eat it?',         choice:true, effect: g => { if(R()>0.35){g.hp=Math.min(g.hp+10,g.maxHp+g.bonusMaxHp);return'+10 HP!';}else{g.hp-=3;return'-3 HP! Yuck!';} } },
    { icon:'💫', title:'Wishing Well',    desc:'Toss a coin? (3g)',choice:true, effect: g => { if(g.gold<3)return'No gold!';g.gold-=3;if(R()>0.3){const b=8+~~(R()*14);g.gold+=b;return`+${b} gold!`;}return'Nothing...'; } },
    { icon:'🎲', title:'Gambling Goblin', desc:'"Roll high to win!"',choice:true,effect: g => { const roll=rollDice(6);if(roll>=4){const gold=roll*3;g.gold+=gold;return`Rolled ${roll}! Won ${gold} gold!`;}else{const loss=Math.min(g.gold,6);g.gold-=loss;return`Rolled ${roll}! Lost ${loss} gold!`;} } },
    { icon:'🔮', title:'Crystal Ball',    desc:'Peek into the future...',     effect: g => { for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const nx=g.playerX+dx,ny=g.playerY+dy;if(nx>=0&&nx<g.mapWidth&&ny>=0&&ny<g.mapHeight)g.map[ny][nx].revealed=true;}return'Map revealed!'; } },
    { icon:'💪', title:'Training Dummy',  desc:'Practice your skills!',       effect: g => { const stat=R()<0.5?'baseAtk':'baseDef';g[stat]+=1;return`+1 ${stat==='baseAtk'?'ATK':'DEF'} from training!`; } },
];

const NPC_DIALOGUES = [
    { icon:'👴', name:'Old Sage',    lines:['"Beware the shadows..."', '"Defense is important!"', '"Deeper = more treasure!"'] },
    { icon:'🐱', name:'Dungeon Cat', lines:['"Meow!" +2 HP', 'The cat purrs and heals you.'] },
    { icon:'🧝‍♂️',name:'Elf Scout',  lines:['"I mapped this area for you."', '"Secrets hide in the walls."'] },
    { icon:'🧙‍♀️',name:'Witch',      lines:['"Take this blessing..." +3 MP'] },
];

// ===== GAME STATE =====
let game = {
    selectedHero: null, difficulty: 'easy', heroName: 'Hero', diffMult: 1,
    floor: 1, maxFloors: 5, map: [], mapWidth: 0, mapHeight: 0,
    playerX: 0, playerY: 0, prevPositions: [],
    hp: 15, maxHp: 15, mp: 4, maxMp: 4,
    baseAtk: 5, baseDef: 3, baseMag: 2, baseSpd: 3,
    bonusAtk: 0, bonusDef: 0, bonusMag: 0, bonusSpd: 0, bonusMaxHp: 0, bonusMaxMp: 0,
    gold: 0, keys: 0, xp: 0, level: 1, xpToLevel: 20,
    potions: 1, bigPotions: 0, scrolls: 0, bombs: 0, antidotes: 0,
    inventory: [], maxInventory: 12,
    steps: 0, monstersKilled: 0, treasuresFound: 0, floorsCleared: 0, score: 0,
    totalHealed: 0, crits: 0, combatDamageTaken: 0, fleeCount: 0,
    inCombat: false, combatEnemy: null, combatEnemyHp: 0, combatEnemyMaxHp: 0,
    combatTurn: 'player', combatBusy: false,
    combo: 0, isDefending: false, abilityUsed: false,
    playerStatus: [], enemyStatus: [],
    gameOver: false, walking: false,
};

// ===== STARS =====
function createStars() {
    const c = get('stars-container');
    for(let i = 0; i < 90; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const size = 0.5 + R()*3;
        s.style.width  = size + 'px';
        s.style.height = size + 'px';
        s.style.left   = R()*100 + '%';
        s.style.top    = R()*100 + '%';
        s.style.setProperty('--dur', (2 + R()*5) + 's');
        s.style.animationDelay = R()*4 + 's';
        c.appendChild(s);
    }
    for(let i = 0; i < 3; i++) {
        const ss = document.createElement('div');
        ss.className = 'shooting-star';
        ss.style.top = (8 + R()*35) + '%';
        ss.style.setProperty('--dur', (5 + R()*7) + 's');
        ss.style.animationDelay = R()*10 + 's';
        c.appendChild(ss);
    }
}

// ===== HERO SELECTION =====
function selectHero(heroKey) {
    game.selectedHero = heroKey;
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.hero-card[data-hero="${heroKey}"]`).classList.add('selected');
    get('start-btn').disabled = false;
    get('start-btn').textContent = '⚔️ Start Adventure!';
    AudioEngine.play('click');
}

function selectDifficulty(diff, el) {
    game.difficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    AudioEngine.play('click');
}

// ===== GAME START =====
function startGame() {
    const sel = game.selectedHero;
    if(!sel) return;
    AudioEngine.play('click');

    const hero = HEROES[sel];
    const name = get('hero-name-input').value.trim() || ['Brave One','Star Child','Hero'][~~(R()*3)];

    game = {
        selectedHero: sel,
        difficulty: game.difficulty,
        heroName: name,
        diffMult: { easy:1, normal:1.35, hard:1.7 }[game.difficulty] || 1,
        floor:1, maxFloors:5, map:[], mapWidth:0, mapHeight:0,
        playerX:0, playerY:0, prevPositions:[],
        hp:hero.hp, maxHp:hero.hp, mp:hero.mp, maxMp:hero.mp,
        baseAtk:hero.atk, baseDef:hero.def, baseMag:hero.mag, baseSpd:hero.spd,
        bonusAtk:0, bonusDef:0, bonusMag:0, bonusSpd:0, bonusMaxHp:0, bonusMaxMp:0,
        gold:0, keys:0, xp:0, level:1, xpToLevel:20,
        potions:1, bigPotions:0, scrolls:0, bombs:0, antidotes:0,
        inventory:[], maxInventory:12,
        steps:0, monstersKilled:0, treasuresFound:0, floorsCleared:0, score:0,
        totalHealed:0, crits:0, combatDamageTaken:0, fleeCount:0,
        inCombat:false, combatEnemy:null, combatEnemyHp:0, combatEnemyMaxHp:0,
        combatTurn:'player', combatBusy:false,
        combo:0, isDefending:false, abilityUsed:false,
        playerStatus:[], enemyStatus:[],
        gameOver:false, walking:false,
    };
    Achievements.earned = [];

    get('start-screen').classList.add('hidden');
    const avatarNode = get('player-avatar');
    avatarNode.childNodes[0].textContent = hero.icon;
    get('player-name').textContent = name;

    AudioEngine.startAmbient();
    AudioEngine.startHeartbeat();
    generateFloor();
    updateUI();
    addLog(`🌟 ${name} the ${hero.name} enters the dungeon!`, 'info');
    addLog(`💡 ${hero.ability}: ${hero.abilityDesc}`, 'special');
    addLog(`🕹️ Click any visible tile or use WASD/Arrows`, 'info');
}

function restartGame() {
    get('game-over-screen').classList.remove('show');
    get('start-screen').classList.remove('hidden');
    get('start-btn').disabled = true;
    get('start-btn').textContent = 'Choose a Hero!';
    game.selectedHero = null;
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
    AudioEngine.stopAmbient();
    AudioEngine.play('click');
    get('low-hp-vignette').style.opacity = '0';
    get('low-hp-vignette').classList.remove('active');
    gamePaused = false;
    get('pause-overlay').classList.remove('show');
    updateContinueButton();
}

// ===== BFS PATHFINDING =====
function findPath(sx, sy, ex, ey) {
    if(sx === ex && sy === ey) return [];
    const W = game.mapWidth, H = game.mapHeight;
    const visited = Array.from({length:H}, () => Array(W).fill(false));
    const parent  = Array.from({length:H}, () => Array(W).fill(null));
    const queue   = [{x:sx, y:sy}];
    visited[sy][sx] = true;
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    while(queue.length) {
        const {x,y} = queue.shift();
        if(x === ex && y === ey) {
            const path = []; let cx = ex, cy = ey;
            while(cx !== sx || cy !== sy) {
                path.unshift({x:cx, y:cy});
                const p = parent[cy][cx]; cx = p.x; cy = p.y;
            }
            return path;
        }
        for(const [dx,dy] of dirs) {
            const nx = x+dx, ny = y+dy;
            if(nx>=0 && nx<W && ny>=0 && ny<H && !visited[ny][nx]) {
                const c = game.map[ny][nx];
                if(c.type === 'floor' && c.revealed) {
                    visited[ny][nx] = true;
                    parent[ny][nx]  = {x, y};
                    queue.push({x:nx, y:ny});
                }
            }
        }
    }
    return null;
}

async function walkPath(path) {
    if(!path || !path.length) return;
    game.walking = true;
    for(const step of path) {
        if(game.inCombat || game.gameOver || gamePaused) break;
        const cell = game.map[step.y][step.x];
        game.prevPositions.push({x:game.playerX, y:game.playerY});
        if(game.prevPositions.length > 5) game.prevPositions.shift();
        game.playerX = step.x; game.playerY = step.y;
        game.steps++; cell.visited = true;
        revealAround(step.x, step.y);
        AudioEngine.play('step');
        tickPlayerStatus();
        if(game.hp <= 0) { gameOver(false); game.walking = false; return; }
        renderMap(); updateUI();
        const cellEl = document.querySelector(`.map-cell[data-x="${step.x}"][data-y="${step.y}"]`);
        if(cellEl) cellEl.classList.add('walk-pop');
        if(cell.content) { handleCellContent(cell, step.x, step.y); if(game.inCombat || game.gameOver) break; }
        await wait(120);
    }
    game.walking = false;
    if(game.steps >= 200) Achievements.check('explorer');
    renderMap(); updateUI();
}

// ===== AUTO-EXPLORE =====
function autoExplore() {
    if(game.inCombat || game.gameOver || game.walking || gamePaused) return;
    const targets = [];
    for(let y = 0; y < game.mapHeight; y++) {
        for(let x = 0; x < game.mapWidth; x++) {
            const c = game.map[y][x];
            if(c.type === 'floor' && c.revealed && !(x === game.playerX && y === game.playerY)) {
                let pri = 0;
                if(c.content === 'treasure') pri = 5;
                else if(c.content === 'heal') pri = 4;
                else if(['shop','npc','secret','event'].includes(c.content)) pri = 4;
                else if(c.content === 'exit') pri = 3;
                else if(!c.visited) pri = 2;
                else if(c.content === 'monster' || c.content === 'boss') pri = 1;
                if(pri > 0) targets.push({x, y, pri});
            }
        }
    }
    if(!targets.length) { addLog('🧭 Nothing to explore!','info'); return; }
    targets.sort((a,b) => {
        if(b.pri !== a.pri) return b.pri - a.pri;
        return (Math.abs(a.x-game.playerX)+Math.abs(a.y-game.playerY)) -
               (Math.abs(b.x-game.playerX)+Math.abs(b.y-game.playerY));
    });
    const tgt  = targets[0];
    const path = findPath(game.playerX, game.playerY, tgt.x, tgt.y);
    if(path && path.length) walkPath(path);
    else addLog('🧭 Can\'t reach target!','info');
}

// ===== MAP GENERATION =====
function generateFloor() {
    const sizes = { easy:{w:8,h:7}, normal:{w:9,h:8}, hard:{w:10,h:9} };
    const size  = sizes[game.difficulty];
    game.mapWidth  = size.w + Math.min(game.floor-1, 3);
    game.mapHeight = size.h + Math.min(game.floor-1, 2);
    const W = game.mapWidth, H = game.mapHeight;
    game.map = []; game.prevPositions = [];

    for(let y = 0; y < H; y++) {
        game.map[y] = [];
        for(let x = 0; x < W; x++) {
            game.map[y][x] = { type:'wall', content:null, revealed:false, visited:false, monsterIcon:null };
        }
    }

    const rooms = [], roomCount = 4 + game.floor + ~~(R()*3);
    for(let attempt = 0; attempt < roomCount*4 && rooms.length < roomCount; attempt++) {
        const rw = 2+~~(R()*3), rh = 2+~~(R()*3);
        const rx = 1+~~(R()*(W-rw-2)), ry = 1+~~(R()*(H-rh-2));
        let overlap = false;
        for(const room of rooms) {
            if(rx<room.x+room.w+1 && rx+rw+1>room.x && ry<room.y+room.h+1 && ry+rh+1>room.y) {
                overlap = true; break;
            }
        }
        if(overlap && rooms.length > 0) continue;
        for(let dy = 0; dy < rh; dy++) for(let dx = 0; dx < rw; dx++)
            if(ry+dy < H && rx+dx < W) game.map[ry+dy][rx+dx].type = 'floor';
        rooms.push({ x:rx, y:ry, w:rw, h:rh, cx:~~(rx+rw/2), cy:~~(ry+rh/2) });
    }

    for(let i = 1; i < rooms.length; i++) {
        let cx = rooms[i-1].cx, cy = rooms[i-1].cy;
        const b = rooms[i];
        while(cx !== b.cx) { if(cy>=0&&cy<H&&cx>=0&&cx<W) game.map[cy][cx].type='floor'; cx += cx<b.cx?1:-1; }
        while(cy !== b.cy) { if(cy>=0&&cy<H&&cx>=0&&cx<W) game.map[cy][cx].type='floor'; cy += cy<b.cy?1:-1; }
    }

    const startRoom = rooms[0];
    game.playerX = startRoom.cx; game.playerY = startRoom.cy;
    const endRoom = rooms[rooms.length-1];
    game.map[endRoom.cy][endRoom.cx].content = 'exit';

    const floorCells = [];
    for(let y = 0; y < H; y++) for(let x = 0; x < W; x++)
        if(game.map[y][x].type==='floor' && game.map[y][x].content!=='exit' && !(x===game.playerX && y===game.playerY))
            floorCells.push({x,y});
    for(let i = floorCells.length-1; i > 0; i--) {
        const j = ~~(R()*(i+1));
        [floorCells[i], floorCells[j]] = [floorCells[j], floorCells[i]];
    }

    let idx = 0;
    const counts = {
        monster:  3 + game.floor + ~~(R()*3),
        treasure: 2 + ~~(R()*3),
        heal:     1 + ~~(R()*2),
        trap:     game.floor>1 ? 1+~~(R()*game.floor) : 0,
        shop:     R()<0.45 ? 1 : 0,
        npc:      R()<0.35 ? 1 : 0,
        secret:   R()<0.25 ? 1 : 0,
        event:    R()<0.40 ? 1 : 0,
    };
    for(const [type, count] of Object.entries(counts))
        for(let i = 0; i < count && idx < floorCells.length; i++, idx++)
            game.map[floorCells[idx].y][floorCells[idx].x].content = type;

    if(game.floor >= 2 || game.floor === game.maxFloors) {
        for(const cell of floorCells) {
            const dist = Math.abs(cell.x-endRoom.cx) + Math.abs(cell.y-endRoom.cy);
            if(dist <= 2 && dist > 0 && !game.map[cell.y][cell.x].content) {
                game.map[cell.y][cell.x].content = 'boss'; break;
            }
        }
    }

    revealAround(game.playerX, game.playerY);
    game.map[game.playerY][game.playerX].visited = true;
    get('map-subtitle').textContent = FLOOR_NAMES[Math.min(game.floor-1, FLOOR_NAMES.length-1)];
    renderMap();
    Minimap.render();
}

function revealAround(px, py) {
    const radius = game.selectedHero === 'archer' ? 3 : 2;
    for(let dy = -radius; dy <= radius; dy++) {
        for(let dx = -radius; dx <= radius; dx++) {
            const nx = px+dx, ny = py+dy;
            if(nx>=0 && nx<game.mapWidth && ny>=0 && ny<game.mapHeight && Math.abs(dx)+Math.abs(dy) <= radius+1)
                game.map[ny][nx].revealed = true;
        }
    }
}

function getMonsterForFloor() {
    const maxTier  = Math.min(~~(game.floor/2), 3);
    const possible = MONSTERS.filter(m => m.tier <= maxTier);
    return possible[~~(R()*possible.length)];
}

function rollDice(sides=20) { return ~~(R()*sides) + 1; }

// ===== MAP RENDERING =====
function renderMap() {
    const mapEl = get('dungeon-map');
    mapEl.style.gridTemplateColumns = `repeat(${game.mapWidth}, 48px)`;
    mapEl.style.gridTemplateRows    = `repeat(${game.mapHeight}, 48px)`;
    mapEl.innerHTML = '';

    const CELL_CLASS = { monster:'monster', boss:'boss-cell', treasure:'treasure', exit:'exit', heal:'heal', shop:'shop', npc:'npc-cell', secret:'secret-cell', event:'event-cell' };
    const CELL_ICON  = { boss:'👑', treasure:'📦', exit:'🚪', heal:'💚', shop:'🏪', npc:'💬', secret:'❓', event:'✨' };

    for(let y = 0; y < game.mapHeight; y++) {
        for(let x = 0; x < game.mapWidth; x++) {
            const cell = game.map[y][x];
            const div  = document.createElement('div');
            div.className = 'map-cell';
            div.dataset.x = x; div.dataset.y = y;

            if(!cell.revealed) {
                div.classList.add('fog');
            } else if(x === game.playerX && y === game.playerY) {
                div.classList.add('current');
                div.innerHTML = `<span class="cell-content">${HEROES[game.selectedHero].icon}</span>`;
            } else if(cell.type === 'wall') {
                div.classList.add('wall');
                div.textContent = '🧱';
            } else {
                div.classList.add('floor');
                if(cell.visited) div.classList.add('visited');
                if(game.prevPositions.some(p => p.x===x && p.y===y)) div.classList.add('trail');
                const dist = Math.abs(x-game.playerX) + Math.abs(y-game.playerY);
                if(dist === 1) div.classList.add('adjacent');
                else if(cell.revealed && cell.type === 'floor') div.classList.add('reachable');

                if(cell.content) {
                    if(cell.content === 'trap' && cell.visited) {
                        div.classList.add('trap');
                        div.innerHTML = '<span class="cell-content">⚡</span>';
                    } else if(cell.content === 'trap') {
                        // hidden trap
                    } else if(cell.content === 'monster') {
                        div.classList.add('monster');
                        if(!cell.monsterIcon) cell.monsterIcon = getMonsterForFloor().icon;
                        div.innerHTML = `<span class="cell-content">${cell.monsterIcon}</span>`;
                    } else if(CELL_CLASS[cell.content]) {
                        div.classList.add(CELL_CLASS[cell.content]);
                        if(CELL_ICON[cell.content]) div.innerHTML = `<span class="cell-content">${CELL_ICON[cell.content]}</span>`;
                    }
                }
            }
            div.addEventListener('click', () => handleCellClick(x, y));
            mapEl.appendChild(div);
        }
    }
    Minimap.render();
}

// ===== MOVEMENT =====
function handleCellClick(x, y) {
    if(game.inCombat || game.gameOver || game.walking || gamePaused) return;
    const cell = game.map[y]?.[x];
    if(!cell || cell.type === 'wall' || !cell.revealed) return;
    if(x === game.playerX && y === game.playerY) return;

    const dist = Math.abs(x-game.playerX) + Math.abs(y-game.playerY);
    if(dist === 1) {
        movePlayerDirect(x, y);
    } else {
        const path = findPath(game.playerX, game.playerY, x, y);
        if(path && path.length) {
            path.forEach(p => {
                const el = document.querySelector(`.map-cell[data-x="${p.x}"][data-y="${p.y}"]`);
                if(el) el.classList.add('path-highlight');
            });
            setTimeout(() => walkPath(path), 150);
        } else {
            addLog('🚫 Can\'t reach there!','info');
        }
    }
}

function movePlayerDirect(nx, ny) {
    if(nx<0 || nx>=game.mapWidth || ny<0 || ny>=game.mapHeight) return;
    const cell = game.map[ny][nx];
    if(cell.type === 'wall' || !cell.revealed) return;
    game.prevPositions.push({x:game.playerX, y:game.playerY});
    if(game.prevPositions.length > 5) game.prevPositions.shift();
    game.playerX = nx; game.playerY = ny; game.steps++;
    cell.visited = true; revealAround(nx, ny);
    AudioEngine.play('step');
    tickPlayerStatus();
    if(game.hp <= 0) { gameOver(false); return; }
    if(cell.content) handleCellContent(cell, nx, ny);
    if(game.steps >= 200) Achievements.check('explorer');
    renderMap(); updateUI();
}

function handleCellContent(cell, x, y) {
    switch(cell.content) {
        case 'monster': startCombat(false); cell.content = null; break;
        case 'boss':    startCombat(true);  cell.content = null; break;
        case 'treasure': openTreasure(); cell.content = null; break;
        case 'heal': {
            const healAmt = 6 + ~~(R()*8);
            const mhp    = game.maxHp + game.bonusMaxHp;
            const healed = Math.min(healAmt, mhp - game.hp);
            game.hp = Math.min(game.hp + healAmt, mhp);
            game.totalHealed += healed;
            AudioEngine.play('heal');
            addLog(`💚 Healing spring! +${healed} HP!`, 'heal-msg');
            Particles.sparkle(innerWidth/2, innerHeight/2, '#2ecc71', 16);
            screenFlash('heal');
            cell.content = null;
            break;
        }
        case 'trap': {
            const dmg = 2 + ~~(R()*4) + game.floor;
            game.hp -= dmg;
            AudioEngine.play('trap'); screenShake(); screenFlash('damage');
            addLog(`⚡ Trap! -${dmg} HP!`, 'damage');
            Particles.spawn(innerWidth/2, innerHeight/2, '#e74c3c', 12, 4);
            if(game.hp <= 0) { gameOver(false); return; }
            cell.content = null;
            break;
        }
        case 'shop': openShop(); break;
        case 'exit': nextFloor(); break;
        case 'npc': {
            const npc  = NPC_DIALOGUES[~~(R()*NPC_DIALOGUES.length)];
            const line = npc.lines[~~(R()*npc.lines.length)];
            AudioEngine.play('npc');
            if(npc.name === 'Dungeon Cat') {
                const h = Math.min(2, game.maxHp+game.bonusMaxHp - game.hp);
                game.hp += h; game.totalHealed += h;
            }
            if(npc.name === 'Elf Scout') {
                for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++) {
                    const nx=game.playerX+dx, ny=game.playerY+dy;
                    if(nx>=0&&nx<game.mapWidth&&ny>=0&&ny<game.mapHeight) game.map[ny][nx].revealed=true;
                }
                renderMap();
            }
            if(npc.name === 'Witch') {
                game.mp = Math.min(game.mp+3, game.maxMp+game.bonusMaxMp);
            }
            addLog(`${npc.icon} ${npc.name}: ${line}`, 'info');
            showEvent(npc.icon, npc.name, line, [{text:'Thanks!', class:'primary', action:()=>closeEvent()}]);
            cell.content = null;
            break;
        }
        case 'secret': {
            AudioEngine.play('secret');
            Particles.sparkle(innerWidth/2, innerHeight/2, '#9b59b6', 16);
            screenFlash('magic');
            const r = R();
            if(r < 0.4) {
                const g = 10+~~(R()*15); game.gold += g;
                addLog(`❓ Secret! +${g}💰!`, 'gold-msg');
                showEvent('💎','Secret Room!',`${g} gold!`,[{text:'Wow!',class:'primary',action:()=>closeEvent()}]);
            } else if(r < 0.7) {
                addItem(R()<0.5?'bigPotion':'scroll');
                addLog('❓ Secret stash!','special');
                showEvent('🔮','Hidden Stash!','Supplies found!',[{text:'Nice!',class:'primary',action:()=>closeEvent()}]);
            } else {
                game.bonusAtk+=1; game.bonusDef+=1;
                addLog('❓ Shrine! +1 ATK +1 DEF!','level-up');
                showEvent('✨','Ancient Shrine','+1 ATK, +1 DEF!',[{text:'Amazing!',class:'primary',action:()=>closeEvent()}]);
            }
            cell.content = null;
            break;
        }
        case 'event': {
            const ev = RANDOM_EVENTS[~~(R()*RANDOM_EVENTS.length)];
            AudioEngine.play('secret');
            if(ev.choice) {
                showEvent(ev.icon, ev.title, ev.desc, [
                    { text:'Yes!', class:'primary', action:()=>{ const r=ev.effect(game); addLog(`${ev.icon} ${r}`,'special'); closeEvent(); renderMap(); updateUI(); } },
                    { text:'No thanks', class:'secondary', action:()=>closeEvent() }
                ]);
            } else {
                const r = ev.effect(game);
                addLog(`${ev.icon} ${r}`, 'special');
                showEvent(ev.icon, ev.title, r, [{text:'OK!', class:'primary', action:()=>closeEvent()}]);
                renderMap(); updateUI();
            }
            cell.content = null;
            break;
        }
    }
}

function tickPlayerStatus() {
    for(let i = game.playerStatus.length-1; i >= 0; i--) {
        const s = game.playerStatus[i]; s.turns--;
        if(s.type==='poison') { game.hp -= 2; addLog('🟢 Poison: -2 HP','damage'); }
        if(s.type==='burn')   { game.hp -= 3; addLog('🔥 Burn: -3 HP','damage'); }
        if(s.turns <= 0) game.playerStatus.splice(i, 1);
    }
    updateStatusDisplay();
}

function updateStatusDisplay() {
    const el = get('status-row'); el.innerHTML = '';
    game.playerStatus.forEach(s => {
        const sp = document.createElement('span');
        sp.className  = 'status-pip';
        sp.textContent = s.type==='poison' ? '🟢' : '🔥';
        sp.title = `${s.type} (${s.turns} turns)`;
        el.appendChild(sp);
    });
}

// ===== KEYBOARD =====
document.addEventListener('keydown', (e) => {
    if(game.gameOver) return;
    if(!get('start-screen').classList.contains('hidden')) return;

    if(e.key === 'Escape') {
        e.preventDefault();
        if(get('event-popup').classList.contains('show'))   { closeEvent();        return; }
        if(get('shop-overlay').classList.contains('active')){ closeShop();         return; }
        if(get('level-up-overlay').classList.contains('show')){ closeLevelUp();    return; }
        if(get('hs-panel').classList.contains('show'))      { toggleHighScores();  return; }
        if(get('help-overlay').classList.contains('show'))  { toggleHelp();        return; }
        togglePause();
        return;
    }

    if(game.inCombat || game.walking || gamePaused) return;

    let dx = 0, dy = 0;
    switch(e.key) {
        case 'ArrowUp':  case 'w': case 'W': dy = -1; break;
        case 'ArrowDown':case 's': case 'S': dy =  1; break;
        case 'ArrowLeft':case 'a': case 'A': dx = -1; break;
        case 'ArrowRight':case 'd':case 'D': dx =  1; break;
        case 'p': case 'P': usePotion();    return;
        case 'e': case 'E': autoExplore(); return;
        case 'q': case 'Q': useAntidote(); return;
        default: return;
    }
    e.preventDefault();
    movePlayerDirect(game.playerX + dx, game.playerY + dy);
});

// ===== MOBILE SCROLL FIX =====
document.addEventListener('touchmove', (e) => {
    if(e.target.closest('.story-log,.combat-log,.shop-items,#dungeon-map,#side-panel,.hs-list')) return;
    e.preventDefault();
}, { passive:false });
document.addEventListener('gesturestart',  e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());

// ===== COMBAT =====
function startCombat(isBoss) {
    game.inCombat = true; game.combatBusy = false;
    game.combo = 0; game.isDefending = false;
    game.abilityUsed = false; game.combatDamageTaken = 0;
    game.enemyStatus = []; game.walking = false;

    let enemy;
    if(isBoss) {
        const bi = Math.min(game.floor-1, BOSSES.length-1);
        enemy = {...BOSSES[bi]};
        enemy.hp  = ~~(enemy.hp  * game.diffMult);
        enemy.atk = ~~(enemy.atk * game.diffMult);
    } else {
        const base = getMonsterForFloor();
        enemy = {...base};
        enemy.hp  = ~~(enemy.hp  * game.diffMult * (0.9+R()*0.3));
        enemy.atk = ~~(enemy.atk * game.diffMult * (0.9+R()*0.2));
    }

    game.combatEnemy    = enemy;
    game.combatEnemyHp  = enemy.hp;
    game.combatEnemyMaxHp = enemy.hp;
    game.combatTurn     = 'player';

    get('combat-area').classList.add('active');
    get('combat-player-avatar').textContent = HEROES[game.selectedHero].icon;
    get('combat-player-name').textContent   = game.heroName;
    get('combat-enemy-avatar').textContent  = enemy.icon;
    get('combat-enemy-name').textContent    = (isBoss ? '👑 ' : '') + enemy.name;
    get('combat-log').innerHTML    = '';
    get('dice-display').innerHTML  = '';
    get('combo-display').innerHTML = '';
    get('enemy-status').innerHTML  = '';

    updateTurnIndicator();
    updateCombatUI();
    setCombatButtonsEnabled(true);
    AudioEngine.play('combat');
    screenShake();
    addLog(`⚔️ ${enemy.name} appears!`, 'damage');
    addCombatLog(isBoss ? `👑 A mighty ${enemy.name} blocks your path!` : `A wild ${enemy.name} attacks!`, 'log-info');
}

function updateTurnIndicator() {
    const el = get('turn-indicator');
    if(game.combatTurn === 'player') {
        el.textContent = '⚔️ Your Turn';
        el.className = 'turn-indicator player-turn';
    } else {
        el.textContent = `${game.combatEnemy?.icon || '👹'} Enemy Turn`;
        el.className = 'turn-indicator enemy-turn';
    }
}

function setCombatButtonsEnabled(en) {
    document.querySelectorAll('.combat-btn').forEach(b => b.disabled = !en);
}

function updateCombatUI() {
    const mhp = game.maxHp + game.bonusMaxHp;
    get('combat-player-hp').style.width    = Math.max(0,(game.hp/mhp)*100) + '%';
    get('combat-player-hp-text').textContent = `${Math.max(0,game.hp)}/${mhp}`;
    get('combat-enemy-hp').style.width     = Math.max(0,(game.combatEnemyHp/game.combatEnemyMaxHp)*100) + '%';
    get('combat-enemy-hp-text').textContent  = `${Math.max(0,game.combatEnemyHp)}/${game.combatEnemyMaxHp}`;
    const es = get('enemy-status'); es.innerHTML = '';
    game.enemyStatus.forEach(s => { es.innerHTML += s.type==='poison'?'🟢':s.type==='burn'?'🔥':'❄️'; });
}

async function showDiceRoll(result) {
    const display = get('dice-display');
    for(let i = 0; i < 6; i++) {
        display.innerHTML = `<div class="dice-result" style="animation:none;opacity:0.4">${rollDice(20)}</div>`;
        AudioEngine.play('dice');
        await wait(50);
    }
    let cls = '';
    if(result === 20) cls = 'crit';
    else if(result === 1) cls = 'miss';
    display.innerHTML = `<div class="dice-result ${cls}">${result}</div>`;
    AudioEngine.play('dice');
    await wait(350);
}

function animateAvatar(id, animClass) {
    const el = get(id);
    el.classList.remove('idle','player-attack','enemy-attack','hit','heal-anim','dodge-anim','death-anim','magic-cast','block-anim');
    void el.offsetWidth;
    el.classList.add(animClass);
    setTimeout(() => {
        el.classList.remove(animClass);
        if(!animClass.includes('death')) el.classList.add('idle');
    }, 800);
}

function addCombatLog(text, className='') {
    const log   = get('combat-log');
    const entry = document.createElement('div');
    entry.className  = `log-entry ${className}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

async function combatAction(action) {
    if(game.combatBusy || game.combatTurn !== 'player') return;
    game.combatBusy = true;
    setCombatButtonsEnabled(false);

    const tAtk = game.baseAtk + game.bonusAtk;
    const tDef = game.baseDef + game.bonusDef;
    const tMag = game.baseMag + game.bonusMag;
    const tSpd = game.baseSpd + game.bonusSpd;
    const mhp  = game.maxHp  + game.bonusMaxHp;
    game.isDefending = false;

    switch(action) {
        case 'attack': {
            const roll = rollDice(20);
            await showDiceRoll(roll);
            if(roll === 1) {
                addCombatLog('🎲 Nat 1 — Critical Miss!','log-miss');
                animateAvatar('combat-player-avatar','dodge-anim');
                AudioEngine.play('miss'); game.combo = 0;
            } else if(roll === 20) {
                const dmg = Math.max(1,(tAtk*2+roll)-game.combatEnemy.def);
                game.combatEnemyHp -= dmg; game.combo++; game.crits++;
                addCombatLog(`🎲 NAT 20! CRITICAL! ${dmg} damage!`,'log-crit');
                animateAvatar('combat-player-avatar','player-attack');
                await wait(250);
                animateAvatar('combat-enemy-avatar','hit');
                AudioEngine.play('crit'); screenShake(true); screenFlash('crit');
                Particles.spawnAt(get('combat-enemy-avatar'),'#ff6b6b',20);
                floatTextAtElement(`-${dmg}!`, get('combat-enemy-avatar'),'crit-float');
            } else if(roll + tAtk > game.combatEnemy.def + 5) {
                const dmg = Math.max(1, tAtk + ~~(roll/4) - game.combatEnemy.def);
                game.combatEnemyHp -= dmg; game.combo++;
                addCombatLog(`🎲 Rolled ${roll} — Hit! ${dmg} damage!`,'log-damage');
                animateAvatar('combat-player-avatar','player-attack');
                await wait(250);
                animateAvatar('combat-enemy-avatar','hit');
                AudioEngine.play('hit'); screenShake();
                Particles.spawnAt(get('combat-enemy-avatar'),'#e74c3c',12);
                floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
            } else {
                addCombatLog(`🎲 Rolled ${roll} — Miss!`,'log-miss');
                AudioEngine.play('miss');
                floatTextAtElement('Miss!', get('combat-enemy-avatar'),'miss-float');
                game.combo = 0;
            }
            break;
        }
        case 'magic': {
            const cost = game.abilityUsed ? 1 : HEROES[game.selectedHero].abilityCost;
            if(game.mp < cost) {
                addCombatLog('Not enough MP!','log-info');
                game.combatBusy = false; setCombatButtonsEnabled(true); return;
            }
            game.mp -= cost;
            const roll = rollDice(20);
            await showDiceRoll(roll);
            const isAbility = !game.abilityUsed && game.selectedHero === 'wizard';
            let dmg = Math.max(1, tMag + (isAbility ? tMag : 0) + ~~(roll/3));
            if(roll === 20) { dmg = ~~(dmg*1.5); game.crits++; }
            game.combatEnemyHp -= dmg; game.combo++;
            if(isAbility) { game.abilityUsed = true; addCombatLog(`⚡ Chain Lightning! ${dmg} damage!`,'log-crit'); }
            else addCombatLog(`✨ Magic blast! ${dmg} damage!`,'log-damage');
            animateAvatar('combat-player-avatar','magic-cast');
            await wait(300);
            animateAvatar('combat-enemy-avatar','hit');
            AudioEngine.play('magic'); screenShake(); screenFlash('magic');
            Particles.spawnAt(get('combat-enemy-avatar'),'#9b59b6',15);
            Particles.sparkle(innerWidth/2-50, innerHeight/2,'#9b59b6',10);
            floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
            if(R()<0.3 && !game.enemyStatus.find(s=>s.type==='burn'))
                game.enemyStatus.push({type:'burn', turns:3});
            break;
        }
        case 'defend': {
            game.isDefending = true;
            addCombatLog('🛡️ Defending! +50% DEF','log-block');
            animateAvatar('combat-player-avatar','block-anim');
            AudioEngine.play('block');
            if(!game.abilityUsed && game.selectedHero==='knight' && game.mp>=HEROES.knight.abilityCost) {
                game.abilityUsed = true; game.mp -= HEROES.knight.abilityCost;
                const dmg = Math.max(1, tAtk*2);
                game.combatEnemyHp -= dmg; game.combo++;
                addCombatLog(`🔥 Power Strike counter! ${dmg} damage!`,'log-crit');
                await wait(200);
                animateAvatar('combat-enemy-avatar','hit');
                AudioEngine.play('crit'); screenShake();
                Particles.spawnAt(get('combat-enemy-avatar'),'#e67e22',15);
                floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
            }
            break;
        }
        case 'heal': {
            const roll = rollDice(8);
            await showDiceRoll(roll);
            const isAbility = !game.abilityUsed && game.selectedHero==='healer';
            let amt;
            if(isAbility && game.mp >= HEROES.healer.abilityCost) {
                game.abilityUsed = true; game.mp -= HEROES.healer.abilityCost;
                amt = ~~(mhp*0.5); game.playerStatus = []; updateStatusDisplay();
                addCombatLog(`🌿 Nature's Blessing! +${Math.min(amt,mhp-game.hp)} HP & cured!`,'log-heal');
            } else {
                amt = ~~(roll/2) + ~~(tMag/2) + 3;
                addCombatLog(`💚 Healed ${Math.min(amt,mhp-game.hp)} HP!`,'log-heal');
            }
            const healed = Math.min(amt, mhp-game.hp);
            game.hp = Math.min(game.hp+amt, mhp);
            game.totalHealed += healed;
            animateAvatar('combat-player-avatar','heal-anim');
            AudioEngine.play('heal'); screenFlash('heal');
            Particles.sparkle(innerWidth/2-80, innerHeight/2,'#2ecc71',12);
            floatTextAtElement(`+${healed}`, get('combat-player-avatar'),'heal-float');
            if(game.totalHealed >= 50) Achievements.check('healer_supreme');
            break;
        }
        case 'item': {
            if(game.scrolls > 0) {
                game.scrolls--;
                const dmg = 14; game.combatEnemyHp -= dmg; game.combo++;
                addCombatLog(`📜 Fire Scroll! ${dmg} damage!`,'log-damage');
                AudioEngine.play('magic'); screenShake(); screenFlash('magic');
                Particles.spawn(innerWidth/2+80, innerHeight/2,'#e67e22',18,5);
                floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
                animateAvatar('combat-enemy-avatar','hit');
            } else if(game.bombs > 0) {
                game.bombs--;
                const dmg = 12; game.combatEnemyHp -= dmg; game.combo++;
                addCombatLog(`💣 Bomb! ${dmg} damage!`,'log-damage');
                AudioEngine.play('trap'); screenShake(true); screenFlash('crit');
                Particles.spawn(innerWidth/2+80, innerHeight/2,'#f39c12',22,6);
                floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
                animateAvatar('combat-enemy-avatar','hit');
            } else if(game.potions > 0) {
                game.potions--;
                const hl = Math.min(8, mhp-game.hp);
                game.hp = Math.min(game.hp+8, mhp); game.totalHealed += hl;
                addCombatLog(`🧪 Potion! +${hl} HP!`,'log-heal');
                AudioEngine.play('potion'); screenFlash('heal');
                Particles.trail(innerWidth/2-80, innerHeight/2,'#2ecc71');
                floatTextAtElement(`+${hl}`, get('combat-player-avatar'),'heal-float');
            } else {
                addCombatLog('No items!','log-info');
                game.combatBusy = false; setCombatButtonsEnabled(true); return;
            }
            if(!game.abilityUsed && game.selectedHero==='archer' && game.mp>=HEROES.archer.abilityCost) {
                game.abilityUsed = true; game.mp -= HEROES.archer.abilityCost;
                await wait(300);
                const dmg = Math.max(1, ~~(tAtk*1.5));
                game.combatEnemyHp -= dmg;
                addCombatLog(`🎯 Precision Shot! ${dmg} bonus damage!`,'log-crit');
                animateAvatar('combat-enemy-avatar','hit');
                AudioEngine.play('hit');
                floatTextAtElement(`-${dmg}`, get('combat-enemy-avatar'),'damage');
            }
            break;
        }
        case 'flee': {
            const roll = rollDice(20);
            await showDiceRoll(roll);
            if(roll + tSpd > 12) {
                game.fleeCount++;
                addCombatLog('🏃 Escaped!','log-info');
                AudioEngine.play('flee');
                addLog(`🏃 Fled from ${game.combatEnemy.name}!`,'info');
                await wait(400);
                endCombat(); return;
            } else {
                addCombatLog(`🏃 Failed to escape! (${roll})`,'log-miss');
                AudioEngine.play('miss'); game.combo = 0;
            }
            break;
        }
    }

    // Combo display
    if(game.combo >= 2) {
        get('combo-display').innerHTML = `<span class="combo-pop">🔥 ${game.combo}x Combo!</span>`;
        AudioEngine.play('combo');
        if(game.combo >= 3) Achievements.check('combo3');
    } else {
        get('combo-display').innerHTML = '';
    }

    // Enemy status tick
    for(let i = game.enemyStatus.length-1; i >= 0; i--) {
        const s = game.enemyStatus[i]; s.turns--;
        if(s.type==='poison') game.combatEnemyHp -= 2;
        if(s.type==='burn')   game.combatEnemyHp -= 3;
        if(s.turns <= 0) game.enemyStatus.splice(i,1);
    }

    updateCombatUI(); updateUI();
    await wait(400);
    if(game.combatEnemyHp <= 0) { await enemyDefeated(); return; }
    game.combatTurn = 'enemy';
    updateTurnIndicator();
    await enemyTurn();
}

async function enemyTurn() {
    const enemy  = game.combatEnemy;
    const tDef   = game.baseDef + game.bonusDef;
    const tSpd   = game.baseSpd + game.bonusSpd;
    const effDef = ~~(tDef * (game.isDefending ? 1.5 : 1));
    const roll   = rollDice(20);
    await showDiceRoll(roll);

    if(roll === 1) {
        addCombatLog(`${enemy.icon} ${enemy.name} fumbles!`,'log-miss');
        AudioEngine.play('miss');
    } else if(roll === 20) {
        const dmg = Math.max(1,(enemy.atk*2+roll)-effDef);
        game.hp -= dmg; game.combatDamageTaken += dmg;
        addCombatLog(`${enemy.icon} CRITICAL! ${dmg} damage!`,'log-crit');
        animateAvatar('combat-enemy-avatar','enemy-attack');
        await wait(250);
        animateAvatar('combat-player-avatar','hit');
        AudioEngine.play('playerHit'); screenShake(true); screenFlash('crit');
        Particles.spawnAt(get('combat-player-avatar'),'#ff6b6b',18);
        floatTextAtElement(`-${dmg}!`, get('combat-player-avatar'),'crit-float');
    } else if(roll + enemy.atk > effDef + tSpd) {
        const dmg = Math.max(1, enemy.atk + ~~(roll/5) - effDef);
        game.hp -= dmg; game.combatDamageTaken += dmg;
        if(game.isDefending) {
            addCombatLog(`${enemy.icon} Blocked! Only ${dmg} damage!`,'log-block');
            animateAvatar('combat-player-avatar','block-anim');
            AudioEngine.play('block');
            floatTextAtElement(`🛡️${dmg}`, get('combat-player-avatar'),'block-float');
        } else {
            addCombatLog(`${enemy.icon} ${enemy.name} hits for ${dmg}!`,'log-damage');
            animateAvatar('combat-enemy-avatar','enemy-attack');
            await wait(250);
            animateAvatar('combat-player-avatar','hit');
            AudioEngine.play('playerHit'); screenShake(); screenFlash('damage');
            Particles.spawnAt(get('combat-player-avatar'),'#e74c3c',10);
            floatTextAtElement(`-${dmg}`, get('combat-player-avatar'),'damage');
        }
        if(enemy.status && R()<0.25 && !game.playerStatus.find(s=>s.type===enemy.status)) {
            game.playerStatus.push({type:enemy.status, turns:3});
            updateStatusDisplay();
            addCombatLog(`${enemy.status==='poison'?'🟢':'🔥'} ${enemy.name} inflicts ${enemy.status}!`,'log-damage');
        }
    } else {
        addCombatLog(`${enemy.icon} ${enemy.name} misses!`,'log-miss');
        animateAvatar('combat-player-avatar','dodge-anim');
        AudioEngine.play('miss');
        floatTextAtElement('Dodge!', get('combat-player-avatar'),'miss-float');
    }

    updateCombatUI(); updateUI();
    await wait(350);

    if(game.hp <= 0) {
        addCombatLog('💀 Defeated!','log-damage');
        AudioEngine.play('death'); screenShake(true); screenFlash('death');
        await wait(1000);
        endCombat(); gameOver(false); return;
    }

    game.combatBusy  = false;
    game.combatTurn  = 'player';
    updateTurnIndicator();
    setCombatButtonsEnabled(true);
}

async function enemyDefeated() {
    animateAvatar('combat-enemy-avatar','death-anim');
    AudioEngine.play('victory'); screenFlash('gold');
    Particles.sparkle(innerWidth/2+60, innerHeight/2,'#ffd700',22);
    Particles.spawn(innerWidth/2+60, innerHeight/2,'#e67e22',13,4);

    const enemy      = game.combatEnemy;
    const goldEarned = enemy.gold[0] + ~~(R()*(enemy.gold[1]-enemy.gold[0]+1));
    const bonusGold  = game.combo >= 3 ? ~~(goldEarned*0.5) : 0;
    game.gold       += goldEarned + bonusGold;
    game.xp         += enemy.xp;
    game.monstersKilled++;
    game.score      += enemy.xp*10 + game.combo*25;

    const mpRegen = 1 + ~~(R()*2);
    game.mp = Math.min(game.mp+mpRegen, game.maxMp+game.bonusMaxMp);

    addCombatLog(`🎉 ${enemy.name} defeated!`,'log-info');
    addCombatLog(`💰 +${goldEarned}${bonusGold?'+'+bonusGold+' combo':''} gold  ⭐ +${enemy.xp} XP`,'log-gold');
    addLog(`🎉 ${enemy.name}! +${goldEarned+bonusGold}💰 +${enemy.xp}⭐`,'gold-msg');
    floatTextAtElement(`+${goldEarned+bonusGold}💰`, get('combat-enemy-avatar'),'gold-float');

    if(game.monstersKilled === 1)  Achievements.check('first_blood');
    if(game.hp <= 3 && game.hp > 0) Achievements.check('survivor');
    if(game.combatDamageTaken === 0) Achievements.check('untouchable');
    if(game.gold >= 100) Achievements.check('rich');
    if(['Dragon','King','Lord','Kraken'].some(n => enemy.name.includes(n))) Achievements.check('boss_slayer');
    if(game.monstersKilled >= 10 && game.fleeCount === 0) Achievements.check('no_flee');

    await wait(1200);
    endCombat();
    checkLevelUp();
    updateUI();
    autoSave();
}

function endCombat() {
    game.inCombat   = false;
    game.combatBusy = false;
    get('combat-area').classList.remove('active');
    renderMap(); updateUI();
}

// ===== TREASURE =====
function openTreasure() {
    game.treasuresFound++; game.score += 50;
    AudioEngine.play('treasure'); screenFlash('gold');
    Particles.sparkle(innerWidth/2, innerHeight/2,'#ffd700',20);

    const pool    = R()<0.45 ? 'common' : R()<0.8 ? 'uncommon' : 'rare';
    const itemKey = TREASURE_POOLS[pool][~~(R()*TREASURE_POOLS[pool].length)];
    const item    = ITEMS[itemKey];
    const goldFound = 3 + ~~(R()*(6+game.floor*3));
    game.gold += goldFound;
    addItem(itemKey);
    addLog(`📦 Treasure! +${goldFound}💰, ${item.icon} ${item.name}!`, 'gold-msg');
    if(game.treasuresFound >= 5) Achievements.check('treasure5');
    if(game.gold >= 100) Achievements.check('rich');
    showEvent('📦','Treasure Found!',
        `You found ${goldFound} gold and a ${item.icon} ${item.name}!\n${item.desc}`,
        [{text:'Sweet! ✨', class:'primary', action:()=>closeEvent()}]
    );
}

function addItem(itemKey) {
    const item = ITEMS[itemKey];
    if(item.type === 'consumable') {
        if(itemKey==='potion')    game.potions++;
        else if(itemKey==='bigPotion') game.bigPotions++;
    } else if(item.type === 'combat_consumable') {
        if(itemKey==='scroll') game.scrolls++;
        else if(itemKey==='bomb') game.bombs++;
    } else if(item.type === 'key') {
        game.keys++;
    } else if(item.type === 'cure') {
        game.antidotes++;
    } else if(item.type === 'equip') {
        if(item.stat==='atk')   game.bonusAtk   += item.bonus;
        else if(item.stat==='def')   game.bonusDef   += item.bonus;
        else if(item.stat==='mag')   game.bonusMag   += item.bonus;
        else if(item.stat==='spd')   game.bonusSpd   += item.bonus;
        else if(item.stat==='maxhp') { game.bonusMaxHp += item.bonus; game.hp += item.bonus; }
        else if(item.stat==='maxmp') { game.bonusMaxMp += item.bonus; game.mp += item.bonus; }
        game.inventory.push(itemKey);
    }
    updateUI();
}

// ===== SHOP =====
function openShop() {
    AudioEngine.play('shop');
    get('shop-gold').textContent = `💰 Your Gold: ${game.gold}`;
    const shopEl = get('shop-items'); shopEl.innerHTML = '';
    [...SHOP_POOLS].sort(()=>R()-0.5).slice(0,5).forEach(si => {
        const item  = ITEMS[si.item];
        const price = si.price + ~~(game.floor*2);
        const div   = document.createElement('div');
        div.className = `shop-item ${game.gold>=price?'':'sold-out'}`;
        div.innerHTML = `<div class="shop-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-desc">${item.desc}</div>
            <div class="shop-price">💰 ${price}</div>`;
        if(game.gold >= price) div.onclick = () => {
            game.gold -= price; addItem(si.item); AudioEngine.play('gold');
            addLog(`🏪 Bought ${item.icon} ${item.name}!`, 'gold-msg');
            Particles.sparkle(innerWidth/2, innerHeight/2,'#ffd700',8);
            div.classList.add('sold-out'); div.onclick = null;
            get('shop-gold').textContent = `💰 Your Gold: ${game.gold}`;
            updateUI();
            shopEl.querySelectorAll('.shop-item').forEach(el => {
                const p = parseInt(el.querySelector('.shop-price').textContent.replace(/\D/g,''));
                if(game.gold < p) el.classList.add('sold-out');
            });
        };
        shopEl.appendChild(div);
    });
    get('shop-overlay').classList.add('active');
    addLog('🏪 Found a merchant!', 'special');
}
function closeShop() { get('shop-overlay').classList.remove('active'); AudioEngine.play('click'); }

// ===== POTIONS =====
function usePotion() {
    if(game.inCombat || game.gameOver) return;
    const mhp = game.maxHp + game.bonusMaxHp;
    if(game.hp >= mhp) { addLog('❌ Full HP!','info'); return; }
    let healAmt = 0;
    if(game.bigPotions > 0) {
        game.bigPotions--; healAmt = 18;
        addLog(`💊 Big Potion! +${Math.min(healAmt,mhp-game.hp)} HP`, 'heal-msg');
    } else if(game.potions > 0) {
        game.potions--; healAmt = 8;
        addLog(`🧪 Potion! +${Math.min(healAmt,mhp-game.hp)} HP`, 'heal-msg');
    } else {
        addLog('❌ No potions!','info'); return;
    }
    const healed = Math.min(healAmt, mhp-game.hp);
    game.hp = Math.min(game.hp+healAmt, mhp);
    game.totalHealed += healed;
    AudioEngine.play('potion'); screenFlash('heal');
    Particles.trail(innerWidth/4, innerHeight/2,'#2ecc71');
    updateUI();
    if(game.totalHealed >= 50) Achievements.check('healer_supreme');
}

// ===== ANTIDOTE =====
function useAntidote() {
    if(game.inCombat || game.gameOver) return;
    if(game.antidotes <= 0) { addLog('❌ No antidotes!','info'); return; }
    if(game.playerStatus.length === 0) { addLog('❌ No status effects!','info'); return; }
    game.antidotes--;
    game.playerStatus = [];
    updateStatusDisplay();
    AudioEngine.play('heal'); screenFlash('heal');
    addLog('🌿 Cured all status effects!', 'heal-msg');
    updateUI();
}

// ===== LEVEL UP =====
function checkLevelUp() {
    while(game.xp >= game.xpToLevel) {
        game.xp       -= game.xpToLevel;
        game.level++;
        game.xpToLevel = ~~(game.xpToLevel*1.5);
        const hpGain  = 3+~~(R()*3);
        const atkGain = R()<0.5?1:0, defGain=R()<0.5?1:0;
        const magGain = R()<0.45?1:0, spdGain=R()<0.45?1:0;
        game.maxHp   += hpGain;
        game.hp       = Math.min(game.hp+hpGain, game.maxHp+game.bonusMaxHp);
        game.maxMp   += 1;
        game.mp       = Math.min(game.mp+1, game.maxMp+game.bonusMaxMp);
        game.baseAtk += atkGain; game.baseDef += defGain;
        game.baseMag += magGain; game.baseSpd += spdGain;
        game.abilityUsed = false;

        AudioEngine.play('levelup');
        Particles.sparkle(innerWidth/4, 40,'#e67e22',28);
        Particles.spawn(innerWidth/4, 40,'#ffd700',15,5);

        let statsText = `❤️ +${hpGain} HP | 💎 +1 MP`;
        if(atkGain) statsText += ` | ⚔️ +${atkGain} ATK`;
        if(defGain) statsText += ` | 🛡️ +${defGain} DEF`;
        if(magGain) statsText += ` | ✨ +${magGain} MAG`;
        if(spdGain) statsText += ` | 💨 +${spdGain} SPD`;
        statsText += '<br>🔄 Ability recharged!';

        addLog(`⬆️ LEVEL ${game.level}!`, 'level-up');
        floatText(`⬆️ Level ${game.level}!`, innerWidth/2-50, 80,'level-float');
        get('lu-title').textContent   = `Level ${game.level}!`;
        get('lu-desc').textContent    = `${game.heroName} grows stronger!`;
        get('lu-stats').innerHTML     = statsText;
        get('level-up-overlay').classList.add('show');
        if(game.level >= 5) Achievements.check('level5');
    }
}
function closeLevelUp() { get('level-up-overlay').classList.remove('show'); AudioEngine.play('click'); updateUI(); }

// ===== NEXT FLOOR =====
function nextFloor() {
    if(game.floor >= game.maxFloors) { gameOver(true); return; }
    game.floor++; game.floorsCleared++; game.score += 200; game.abilityUsed = false;
    AudioEngine.play('nextFloor');
    addLog(`🏰 Floor ${game.floor}!`, 'special');

    const trans = get('floor-transition');
    trans.querySelector('.ft-text').textContent  = FLOOR_NAMES[Math.min(game.floor-1, FLOOR_NAMES.length-1)];
    trans.querySelector('.ft-floor').textContent = `Floor ${game.floor}`;
    trans.classList.add('active');

    setTimeout(() => {
        const mhp = game.maxHp + game.bonusMaxHp;
        const h   = ~~(mhp*0.25);
        game.hp   = Math.min(game.hp+h, mhp);
        addLog(`💚 Rested. +${h} HP`, 'heal-msg');
        game.mp   = Math.min(game.mp+2, game.maxMp+game.bonusMaxMp);
        game.playerStatus = []; updateStatusDisplay();
        if(game.floor >= 3) Achievements.check('floor3');
        generateFloor(); updateUI();
        Particles.spawn(innerWidth/2, innerHeight/2,'#3498db',25,5);
        saveGame();
        setTimeout(() => trans.classList.remove('active'), 600);
    }, 1200);
}

// ===== GAME OVER =====
function gameOver(won) {
    game.gameOver = true; game.inCombat = false; game.walking = false;
    get('combat-area').classList.remove('active');
    AudioEngine.stopAmbient();
    get('low-hp-vignette').style.opacity = '0';
    get('low-hp-vignette').classList.remove('active');

    game.score += game.gold*2 + game.monstersKilled*20 + game.floorsCleared*100 + (won?500:0);

    const titleEl  = get('game-over-title');
    const trophyEl = get('trophy-icon');
    if(won) {
        titleEl.className   = 'game-over-title win';
        titleEl.textContent = '🎉 Victory! 🎉';
        trophyEl.textContent = '🏆';
        AudioEngine.play('victory');
        Particles.sparkle(innerWidth/2, innerHeight/2,'#ffd700',35);
        Particles.spawn(innerWidth/3, innerHeight/3,'#2ecc71',25,5);
        Particles.spawn(innerWidth*2/3, innerHeight/3,'#3498db',25,5);
    } else {
        titleEl.className   = 'game-over-title lose';
        titleEl.textContent = '💀 Defeated!';
        trophyEl.textContent = '💀';
        AudioEngine.play('death'); screenShake(true); screenFlash('death');
    }

    get('final-score').textContent = `Score: ${game.score}`;
    get('final-stats').innerHTML   =
        `Level ${game.level} ${HEROES[game.selectedHero].name}<br>` +
        `Floors: ${game.floorsCleared} | Kills: ${game.monstersKilled} | Treasures: ${game.treasuresFound}<br>` +
        `Steps: ${game.steps} | Gold: ${game.gold} | Crits: ${game.crits} | Healed: ${game.totalHealed}`;

    const as = get('go-achievements'); as.innerHTML = '';
    Achievements.earned.forEach(id => {
        const a = Achievements.list[id];
        const b = document.createElement('div');
        b.className   = 'ach-badge';
        b.textContent = `${a.icon} ${a.name}`;
        as.appendChild(b);
    });

    HighScores.add(game.heroName, HEROES[game.selectedHero].name, game.score, game.floor, game.level, won);
    renderHighScores();
    clearSave();
    get('game-over-screen').classList.add('show');
}

// ===== EVENT POPUP =====
function showEvent(icon, title, desc, buttons) {
    get('event-icon').textContent  = icon;
    get('event-title').textContent = title;
    get('event-desc').textContent  = desc;
    const bc = get('event-buttons'); bc.innerHTML = '';
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className   = `event-btn ${b.class||'primary'}`;
        btn.textContent = b.text;
        btn.onclick     = b.action;
        bc.appendChild(btn);
    });
    get('event-popup').classList.add('show');
}
function closeEvent() { get('event-popup').classList.remove('show'); AudioEngine.play('click'); updateUI(); }

// ===== UI UPDATE =====
function updateUI() {
    const mhp    = game.maxHp + game.bonusMaxHp;
    const mmp    = game.maxMp + (game.bonusMaxMp||0);
    const hpPct  = Math.max(0,(game.hp/mhp)*100);
    const xpPct  = (game.xp/game.xpToLevel)*100;
    const mpPct  = Math.max(0,(game.mp/mmp)*100);

    const hpBar = get('hp-bar');
    hpBar.style.width = hpPct + '%';
    hpBar.classList.remove('low','critical');
    if(hpPct < 15) hpBar.classList.add('critical');
    else if(hpPct < 30) hpBar.classList.add('low');

    get('hp-text').textContent    = `HP: ${Math.max(0,game.hp)}/${mhp}  MP: ${Math.max(0,game.mp)}/${mmp}`;
    get('xp-bar').style.width     = xpPct + '%';
    get('mp-bar').style.width     = mpPct + '%';
    get('player-level').textContent = `Lv${game.level} | XP: ${game.xp}/${game.xpToLevel}`;
    get('level-badge').textContent  = game.level;
    get('gold-display').textContent = game.gold;
    get('keys-display').textContent = game.keys;
    get('floor-display').textContent= game.floor;
    get('kills-display').textContent= game.monstersKilled;
    get('floor-badge').textContent  = `Floor ${game.floor}`;

    const sa = game.baseAtk+game.bonusAtk, sd=game.baseDef+game.bonusDef;
    const sm = game.baseMag+game.bonusMag, ss=game.baseSpd+game.bonusSpd;
    get('stat-atk').textContent = sa; get('stat-def').textContent = sd;
    get('stat-mag').textContent = sm; get('stat-spd').textContent = ss;
    get('stat-atk-bonus').textContent = game.bonusAtk ? `+${game.bonusAtk}` : '';
    get('stat-def-bonus').textContent = game.bonusDef ? `+${game.bonusDef}` : '';
    get('stat-mag-bonus').textContent = game.bonusMag ? `+${game.bonusMag}` : '';
    get('stat-spd-bonus').textContent = game.bonusSpd ? `+${game.bonusSpd}` : '';

    // Inventory
    const invGrid = get('inventory-grid'); invGrid.innerHTML = '';
    const displayItems = [];
    if(game.potions)    displayItems.push({icon:'🧪', name:'Potion',    count:game.potions});
    if(game.bigPotions) displayItems.push({icon:'💊', name:'Big Potion',count:game.bigPotions});
    if(game.scrolls)    displayItems.push({icon:'📜', name:'Scroll',    count:game.scrolls});
    if(game.bombs)      displayItems.push({icon:'💣', name:'Bomb',      count:game.bombs});
    if(game.antidotes)  displayItems.push({icon:'🌿', name:'Antidote',  count:game.antidotes});
    if(game.keys)       displayItems.push({icon:'🗝️', name:'Key',       count:game.keys});
    game.inventory.forEach(ik => {
        const it = ITEMS[ik];
        displayItems.push({icon:it.icon, name:`${it.name}: ${it.desc}`, count:0});
    });
    for(let i = 0; i < game.maxInventory; i++) {
        const slot = document.createElement('div');
        if(i < displayItems.length) {
            const di = displayItems[i];
            slot.className   = 'inv-slot';
            slot.textContent = di.icon;
            if(di.count > 1) slot.innerHTML += `<span class="item-count">×${di.count}</span>`;
            slot.innerHTML += `<div class="inv-tooltip">${di.name}</div>`;
        } else {
            slot.className = 'inv-slot empty';
        }
        invGrid.appendChild(slot);
    }

    const totalPotions = game.potions + game.bigPotions;
    const potionBtn = get('use-potion-btn');
    potionBtn.textContent = `🧪 Use Potion (${totalPotions})`;
    potionBtn.disabled    = totalPotions===0 || game.hp>=mhp;

    const antBtn = get('use-antidote-btn');
    antBtn.textContent = `🌿 Antidote (${game.antidotes})`;
    antBtn.disabled    = game.antidotes===0 || game.playerStatus.length===0;

    const expBtn = get('auto-explore-btn');
    expBtn.disabled = game.walking || game.inCombat || game.gameOver;

    // Mobile buttons
    const mobPot = get('mob-potion-btn');
    if(mobPot) { mobPot.textContent=`🧪 ${totalPotions}`; mobPot.disabled=totalPotions===0||game.hp>=mhp; }
    const mobAnt = get('mob-antidote-btn');
    if(mobAnt) { mobAnt.textContent=`🌿 ${game.antidotes}`; mobAnt.disabled=game.antidotes===0||game.playerStatus.length===0; }

    updateVignette();
}

function addLog(text, className='') {
    const log   = get('story-log');
    const entry = document.createElement('div');
    entry.className   = `story-entry ${className}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    while(log.children.length > 55) log.removeChild(log.firstChild);
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
    createStars();
    Background.init();
    Particles.init();
    Minimap.init();
    AudioEngine.init();
    HighScores.load();
    renderHighScores();
    updateContinueButton();

    get('hero-name-input').addEventListener('focus', () => {
        if(AudioEngine.ctx?.state === 'suspended') AudioEngine.ctx.resume();
    });

    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);

    // Save on page exit
    window.addEventListener('beforeunload', () => {
        if(!game.gameOver && game.selectedHero && !game.inCombat) saveGame();
    });
});