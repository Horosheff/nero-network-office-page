/**
 * ЭТАЛОННЫЙ JS-ДВИЖОК HERO (копия vibecoding-engine с эталонной страницы владельца).
 *
 * Назначение для аниматора Алины: всегда открывай этот файл как отправную точку.
 * На новой странице: СКОПИРУЙ в тему как `*-engine.js` и ПЕРЕДЕЛАЙ сцену под тему.
 *
 * ОСТАВЛЯЕМ (тип персонажей): класс Agent + 5 ролей/цветов, походка, пузыри createBubble,
 *   общий каркас canvas (resize, frame, engineloop).
 *
 * ПЕРЕДЕЛЫВАЕМ ПОЛНОСТЬЮ под тему: Conveyor / WebsiteTerminal (или замени на свои классы),
 *   предметы на ленте, цвета коробок C.box*, тексты dialogs[], все createBubble-строки,
 *   фазы цикла в WebsiteTerminal, координаты targetX/targetY у Agent при другой «сцене».
 *
 * Исходник темы: assets/js/vibecoding-engine.js (Configured WordPress Theme).
 */

/**
 * Vibecoding Factory 2D Engine - v244 (Final Polish)
 * Improved: Slower speeds, smaller bubbles, smoother rocket launch.
 */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("vibe-factory-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let cw = 0, ch = 0, scale = 1;
    let cx = 0, cy = 0;
    let frame = 0;
    
    function resizeCanvas() {
        if (!canvas.parentElement) return;
        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
        cw = canvas.width;
        ch = canvas.height;
        cx = cw / 2;
        cy = (ch / 2) + 60; 
        
        if (cw < 768) {
            scale = cw / 600;
        } else {
            scale = Math.min(cw / 1000, ch / 800) * 1.5;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const C = {
        outline: '#0f172a',
        windowBg: '#ffffff', windowTop: '#e2e8f0', windowBtn: '#ef4444', 
        deskTop: '#ffffff', deskFront: '#e2e8f0',
        beltTop: '#334155', beltRoll: '#1e293b',
        agentYellow: '#eab308', agentGreen: '#10b981', agentBlue: '#3b82f6', agentPink: '#ec4899', agentPurple: '#8b5cf6', 
        serverBase: '#1e293b', serverLight: '#38bdf8',
        boxPrompt: '#f8fafc', boxSEO: '#a7f3d0', boxCode: '#93c5fd', boxDesign: '#fbcfe8',
        bubbleBg: '#ffffff', moneyGreen: '#22c55e'
    };

    function drawPolyRound(ctx, x, y, w, h, radius, fill, stroke) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
        else ctx.rect(x, y, w, h);
        ctx.fill();
        if(stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); }
    }

    class Conveyor {
        constructor(x, y, w, h) {
            this.x = x; this.y = y; this.w = w; this.h = h;
        }
        draw(ctx) {
            ctx.lineJoin = 'round';
            drawPolyRound(ctx, this.x + 20, this.y + 10, this.w - 40, 40, [0,0,4,4], C.deskFront, C.outline);
            drawPolyRound(ctx, this.x, this.y - 20, this.w, 40, [4,4,0,0], C.deskTop, C.outline);
            
            const beltPad = 10;
            drawPolyRound(ctx, this.x + beltPad, this.y - 20 + beltPad, this.w - beltPad*2, 40 - beltPad*2, 2, C.beltTop, C.outline);
            
            // SLOWER belt movement (0.3 instead of 0.5)
            let offset = (frame * 0.3) % 30;
            ctx.save();
            ctx.beginPath();
            if(ctx.roundRect) ctx.roundRect(this.x + beltPad, this.y - 20 + beltPad, this.w - beltPad*2, 40 - beltPad*2, 2);
            else ctx.rect(this.x + beltPad, this.y - 20 + beltPad, this.w - beltPad*2, 40 - beltPad*2);
            ctx.clip();
            ctx.fillStyle = C.beltRoll;
            for(let i = this.x; i < this.x + this.w + 50; i += 30) {
                ctx.fillRect(i - offset, this.y - 20 + beltPad, 5, 20);
            }
            ctx.restore();
        }
    }

    class WebsiteTerminal {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.buildProgress = 0; 
            this.rocketY = 0;
            this.moneyY = 0;
            this.rocketSpeed = 0;
        }
        
        drawMiniText(ctx, tx, ty, lines, w) {
            for(let i=0; i<lines; i++) {
                drawPolyRound(ctx, tx, ty + i*6, w * (0.6 + Math.random()*0.4), 3, 1, '#94a3b8', null);
            }
        }

        draw(ctx) {
            // SLOWER build cycle (0.05 instead of 0.1)
            this.buildProgress = (frame * 0.05) % 200; 
            ctx.lineJoin = 'round';
            
            drawPolyRound(ctx, this.x, this.y, 200, 260, 8, C.serverBase, C.outline);
            
            let wx = this.x + 10; let wy = this.y + 10; let ww = 180; let wh = 240;
            
            if (this.buildProgress > 180) {
                // Rocket state
                let fallPrg = this.buildProgress - 180; // 0 to 20
                
                // SMOOTHER Rocket launch with acceleration
                if (fallPrg === 0.05) this.rocketSpeed = 0;
                this.rocketSpeed += 0.5;
                this.rocketY -= this.rocketSpeed;
                this.moneyY += 2; // slow descend
                
                let ry = wy + this.rocketY;
                ctx.save();
                ctx.translate(wx + ww/2, ry + 100);
                
                // Flame
                ctx.fillStyle = frame % 4 < 2 ? '#ef4444' : '#facc15';
                ctx.beginPath(); ctx.moveTo(-12, 15); ctx.lineTo(12, 15); ctx.lineTo(0, 40 + Math.random()*15); ctx.fill();
                
                // ZIP Box
                drawPolyRound(ctx, -25, -25, 50, 40, 4, '#fcd34d', C.outline); 
                drawPolyRound(ctx, -8, -8, 16, 8, 1, '#fff', C.outline); 
                ctx.fillStyle = C.outline; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center"; ctx.fillText("ZIP", 0, -2);
                
                ctx.restore();

                // Falling Money
                if (this.moneyY > 10) {
                    ctx.save();
                    let alpha = 1 - (fallPrg / 20); 
                    ctx.globalAlpha = Math.max(0, alpha);
                    ctx.font = '900 32px Inter, sans-serif';
                    ctx.textAlign = "center";
                    ctx.fillStyle = C.moneyGreen;
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
                    ctx.strokeText('+$1,500', wx + ww/2, wy - 40 + this.moneyY * 4);
                    ctx.fillText('+$1,500', wx + ww/2, wy - 40 + this.moneyY * 4);
                    ctx.restore();
                }

            } else {
                this.rocketY = 0;
                this.moneyY = 0;
                this.rocketSpeed = 0;
                
                drawPolyRound(ctx, wx, wy, ww, wh, 6, C.windowBg, C.outline);
                drawPolyRound(ctx, wx, wy, ww, 24, [6,6,0,0], C.windowTop, C.outline);
                drawPolyRound(ctx, wx+10, wy+10, 6, 6, 3, C.windowBtn, null);
                drawPolyRound(ctx, wx+22, wy+10, 6, 6, 3, '#facc15', null);
                drawPolyRound(ctx, wx+34, wy+10, 6, 6, 3, '#10b981', null);

                if (this.buildProgress > 25) {
                    drawPolyRound(ctx, wx+10, wy+35, 160, 20, 2, C.boxPrompt, C.outline); 
                    drawPolyRound(ctx, wx+15, wy+40, 10, 10, 5, C.outline, null); 
                    drawPolyRound(ctx, wx+110, wy+43, 15, 4, 1, '#cbd5e1', null);
                    drawPolyRound(ctx, wx+130, wy+43, 15, 4, 1, '#cbd5e1', null);
                }
                if (this.buildProgress > 65) {
                    drawPolyRound(ctx, wx+10, wy+65, 75, 70, 4, C.boxSEO, C.outline); 
                    this.drawMiniText(ctx, wx+15, wy+75, 4, 60);
                    drawPolyRound(ctx, wx+95, wy+65, 75, 70, 4, C.boxSEO, C.outline); 
                    this.drawMiniText(ctx, wx+100, wy+75, 4, 60);
                }
                if (this.buildProgress > 105) {
                    drawPolyRound(ctx, wx+10, wy+145, 160, 40, 4, C.boxCode, C.outline);
                    drawPolyRound(ctx, wx+20, wy+155, 80, 20, 2, '#fff', C.outline); 
                    drawPolyRound(ctx, wx+110, wy+155, 40, 20, 4, '#ef4444', C.outline); 
                }
                if (this.buildProgress > 145) {
                    drawPolyRound(ctx, wx+10, wy+65, 75, 70, 4, C.boxDesign, C.outline);
                    ctx.fillStyle = C.outline;
                    ctx.beginPath(); ctx.moveTo(wx+15, wy+120); ctx.lineTo(wx+30, wy+90); ctx.lineTo(wx+45, wy+120); ctx.fill();
                    
                    drawPolyRound(ctx, wx+95, wy+65, 75, 70, 4, '#fcd34d', C.outline);
                    this.drawMiniText(ctx, wx+100, wy+75, 3, 60);
                    drawPolyRound(ctx, wx+110, wy+155, 40, 20, 4, '#8b5cf6', C.outline); 
                }
            }
        }
    }

    class Agent {
        constructor(x, y, color, role, stepTrig, dialogs) {
            this.x = x; this.y = y; this.baseX = x; this.baseY = y;
            this.color = color; this.role = role;
            this.timer = Math.random() * 100;
            this.stepTrig = stepTrig; 
            this.dialogs = dialogs; 
            this.hitAnimation = 0;
        }

        draw(ctx) {
            // SLOWER agent animation timer
            this.timer += 0.03; 
            let isMoving = false;
            let carryType = null;
            let faceDir = 1;
            
            let prg = (frame * 0.05) % 200; // synced to slower buildProgress
            let targetX = 180; 
            let targetY = -40 + (this.stepTrig * 0.5);
            
            if (prg >= this.stepTrig && prg < this.stepTrig + 25) {
                let localPrg = prg - this.stepTrig; 
                if (localPrg < 10) {
                    isMoving = true; faceDir = 1; carryType = this.color; 
                    this.x = this.baseX + (targetX - this.baseX) * (localPrg / 10);
                    this.y = this.baseY + (targetY - this.baseY) * (localPrg / 10);
                } else if (localPrg < 15) {
                    isMoving = false; faceDir = 1; this.x = targetX; this.y = targetY;
                } else {
                    isMoving = true; faceDir = -1;
                    this.x = targetX - (targetX - this.baseX) * ((localPrg - 15) / 10);
                    this.y = targetY - (targetY - this.baseY) * ((localPrg - 15) / 10);
                }
            } else {
                this.x = this.baseX; this.y = this.baseY; isMoving = false;
                carryType = prg >= this.stepTrig - 10 ? this.color : null; 
            }

            if (!isMoving) {
                let bX1 = -300 + ((frame * 0.3) % 300);
                let bX2 = -300 + ((frame * 0.3 + 100) % 300);
                let bX3 = -300 + ((frame * 0.3 + 200) % 300);
                if (Math.abs(bX1 - this.x) < 20 || Math.abs(bX2 - this.x) < 20 || Math.abs(bX3 - this.x) < 20) {
                    this.hitAnimation = Math.sin(frame * 0.3) * 8; 
                } else {
                    this.hitAnimation = 0;
                }

                // REDUCED Idle chat frequency (0.05% chance every 100 frames instead of 0.2)
                if (frame % 200 === 0 && Math.random() < 0.1) {
                    let rnd = this.dialogs[Math.floor(Math.random() * this.dialogs.length)];
                    createBubble(this.x, this.y - 20, rnd, 250); 
                }
            } else {
                this.hitAnimation = 0;
            }

            let bob = Math.abs(Math.sin(this.timer * 3)) * 2;
            if(!isMoving) bob = Math.sin(this.timer * 1.5) * 1; 
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.lineJoin = 'round';
            
            let legL = 0, legR = 0;
            if (isMoving) {
                let walkPhase = this.timer * 6;
                legL = Math.sin(walkPhase) * 5; legR = Math.sin(walkPhase + Math.PI) * 5;
            }
            drawPolyRound(ctx, -10, -5 + Math.max(0, legL), 8, 14, 2, C.outline, null);
            drawPolyRound(ctx, -12, 5 + Math.max(0, legL), 12, 6, 2, C.outline, null); 
            drawPolyRound(ctx, 2, -5 + Math.max(0, legR), 8, 14, 2, C.outline, null);
            drawPolyRound(ctx, 0, 5 + Math.max(0, legR), 12, 6, 2, C.outline, null); 
            
            drawPolyRound(ctx, -15, -12 - bob, 30, 20, 6, this.color, C.outline);
            
            let hx = 0, hy = -28 - bob;
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI*2); ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = C.outline; ctx.stroke();

            ctx.save();
            ctx.scale(faceDir, 1);
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(hx+4, hy-2, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(hx-4, hy-2, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = C.outline;
            ctx.beginPath(); ctx.arc(hx+5, hy-2, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(hx-3, hy-2, 2, 0, Math.PI*2); ctx.fill();
            
            if (this.role === '1_architect') {
                ctx.strokeStyle = C.outline; ctx.lineWidth = 1;
                ctx.strokeRect(hx+1, hy-5, 6, 6); ctx.strokeRect(hx-7, hy-5, 6, 6);
            } else if (this.role === '2_seo') {
                drawPolyRound(ctx, hx-12, hy-14, 24, 8, [6,6,0,0], C.outline, null);
                drawPolyRound(ctx, hx, hy-8, 15, 3, 1, C.outline, null); 
            } else if (this.role === '3_coder') {
                ctx.fillStyle = C.outline;
                ctx.beginPath(); ctx.moveTo(hx-10, hy-8); ctx.lineTo(hx-14, hy-18); ctx.lineTo(hx-4, hy-12);
                ctx.lineTo(hx, hy-20); ctx.lineTo(hx+4, hy-12); ctx.lineTo(hx+12, hy-16); ctx.lineTo(hx+10, hy-8); ctx.fill();
                if(this.hitAnimation !== 0) {
                    ctx.lineWidth = 3; ctx.strokeStyle = C.outline;
                    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(20, -10 + this.hitAnimation); ctx.stroke(); 
                    drawPolyRound(ctx, 16, -15 + this.hitAnimation, 12, 10, 2, '#94a3b8', C.outline); 
                }
            } else if (this.role === '4_designer') {
                drawPolyRound(ctx, hx-14, hy-12, 28, 6, 3, '#f43f5e', C.outline);
                drawPolyRound(ctx, hx-2, hy-15, 4, 4, 2, C.outline, null);
                if(this.hitAnimation !== 0) {
                    ctx.lineWidth = 2; ctx.strokeStyle = C.outline;
                    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(20, -5 + this.hitAnimation); ctx.stroke(); 
                    drawPolyRound(ctx, 18, -10 + this.hitAnimation, 6, 12, 2, C.agentPink, C.outline);
                }
            } else if (this.role === '5_deployer') {
                ctx.strokeStyle = C.outline; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(hx, hy, 14, Math.PI, Math.PI*2); ctx.stroke();
                drawPolyRound(ctx, hx-16, hy-2, 4, 8, 2, C.outline, null);
                drawPolyRound(ctx, hx+12, hy-2, 4, 8, 2, C.outline, null);
                ctx.beginPath(); ctx.moveTo(hx+12, hy+4); ctx.lineTo(hx+6, hy+8); ctx.stroke(); 
            }
            ctx.restore();

            if (carryType) {
                drawPolyRound(ctx, -20 * faceDir, -18 - bob, 16, 16, 2, carryType, C.outline);
            }
            ctx.restore();
        }
    }

    const entities = [];
    const bubbles = [];

    let belt = new Conveyor(-350, 60, 500, 40);
    let site = new WebsiteTerminal(180, -100);
    entities.push(belt);
    entities.push(site);

    entities.push(new Agent(-330, 40, C.agentYellow, '1_architect', 15, ["Анализ ниши...", "Создаю промпт", "Идея готова!"])); 
    entities.push(new Agent(-200, 110, C.agentGreen, '2_seo', 55, ["Мало ключей!", "SEO готово.", "LSI-фразы."]));        
    entities.push(new Agent(-80, 20, C.agentBlue, '3_coder', 95, ["Баг пофикшен!", "Пишу JS код.", "Чистый код."]));       
    entities.push(new Agent(20, 100, C.agentPink, '4_designer', 135, ["Меняю шрифт.", "UX идеален.", "UI готов!"]));     
    entities.push(new Agent(70, 0, C.agentPurple, '5_deployer', 175, ["Жду аппрув...", "Деплой на прод", "ZIP готов!"]));    

    function createBubble(x, y, text, customLife = 300) {
        bubbles.push({ x: x, y: y, text: text, life: customLife, maxLife: customLife }); 
    }

    function engineloop() {
        frame++;
        ctx.clearRect(0, 0, cw, ch); 
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        entities.sort((a, b) => (a.y || 0) - (b.y || 0));
        entities.forEach(ent => ent.draw(ctx));

        let cY = 20; 
        ctx.lineWidth = 2; ctx.strokeStyle = C.outline;
        
        let itmX1 = -300 + ((frame * 0.3) % 300);
        if(itmX1 < 100) drawPolyRound(ctx, itmX1, cY, 15, 15, 2, C.boxPrompt, C.outline);
        
        let itmX2 = -300 + ((frame * 0.3 + 100) % 300);
        if(itmX2 < 100) drawPolyRound(ctx, itmX2, cY, 15, 15, 2, C.boxSEO, C.outline);

        let itmX3 = -300 + ((frame * 0.3 + 200) % 300);
        if(itmX3 < 100) drawPolyRound(ctx, itmX3, cY, 15, 15, 2, C.boxCode, C.outline);

        let prg = (frame * 0.05) % 200;
        if (prg >= 14 && prg < 14.05) createBubble(-330, -10, "1. Каркас");
        if (prg >= 54 && prg < 54.05) createBubble(-200, 60, "2. SEO текст");
        if (prg >= 94 && prg < 94.05) createBubble(-80, -30, "3. JS логика");
        if (prg >= 134 && prg < 134.05) createBubble(20, 50, "4. UI дизайн");
        if (prg >= 174 && prg < 174.05) createBubble(70, -50, "5. Деплой!");

        // Smaller Bubbles Rendering
        ctx.font = 'bold 11px Inter, sans-serif'; // smaller font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        
        for (let i = bubbles.length - 1; i >= 0; i--) {
            let bub = bubbles[i];
            bub.life--;
            if (bub.life <= 0) {
                bubbles.splice(i, 1);
                continue;
            }
            
            let alpha = Math.min(1, bub.life / 30);
            if (bub.life > bub.maxLife - 10) alpha = (bub.maxLife - bub.life) / 10;
            
            ctx.globalAlpha = alpha;
            let tw = ctx.measureText(bub.text).width + 16; // smaller padding
            let th = 20; // smaller height
            let bx = bub.x;
            let by = bub.y - (bub.maxLife - bub.life) * 0.05; // slower float
            
            ctx.lineWidth = 2; ctx.strokeStyle = C.outline;
            drawPolyRound(ctx, bx - tw/2, by - th, tw, th, 6, C.bubbleBg, C.outline);
            ctx.fillStyle = C.bubbleBg;
            ctx.beginPath(); ctx.moveTo(bx - 4, by); ctx.lineTo(bx + 4, by); ctx.lineTo(bx, by + 5); ctx.fill(); ctx.stroke();
            ctx.fillRect(bx - 3, by - 2, 6, 4);

            ctx.fillStyle = C.outline;
            ctx.fillText(bub.text, bx, by - th/2);
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();
        requestAnimationFrame(engineloop);
    }
    
    document.fonts.ready.then(() => engineloop());
});
