import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Player = { id: string; name: string; score: number; answered: boolean; connected: boolean; answer?: number; answerTime?: number; joinedAt: number };
type Room = { pin: string; hostId: string; players: Map<string, Player>; nameToSocket: Map<string, string>; state: 'LOBBY'|'COUNTDOWN'|'QUESTION'|'RESULTS'|'GAME_OVER'; used: Set<string>; questionIds: string[]; subjectFilter?: string[]; current?: any; currentStartedAt?: number; timer?: any; intermission?: any; countdownTimer?: any; questionCount: number; countdownSeconds?: number; };

const rooms = new Map<string, Room>();

function makePin() { return Math.floor(100000 + Math.random()*900000).toString(); }

function roomPlayerList(room: Room) {
  return Array.from(room.players.values()).map(p=>({ id:p.id, name:p.name, score:p.score, connected:p.connected }));
}

async function sendSubjects(socket: Socket) {
  try {
    const rows = await prisma.question.findMany({
      where: { isActive: true },
      select: { subject: true },
    });
    const subjects = Array.from(new Set(rows.map((r:any)=>r.subject).filter(Boolean)));
    socket.emit('subjects:list', { subjects });
  } catch (e) {
    socket.emit('subjects:list', { subjects: [] });
  }
}

async function randomQuestion(exclude: Set<string>, subjectFilter?: string[]) {
  const where: any = { isActive: true };
  if (subjectFilter && subjectFilter.length > 0) where.subject = { in: subjectFilter };
  const count = await prisma.question.count({ where });
  if (count === 0) return null;
  for (let i=0;i<50;i++) {
    const skip = Math.floor(Math.random()*count);
    const q = await prisma.question.findFirst({ where, skip, take: 1 });
    if (q && !exclude.has(q.id) && !q.imageUrl) return q;
  }
  return null;
}

async function beginQuestion(io: Server, pin: string) {
  const room = rooms.get(pin); if (!room) return;
  const q = await randomQuestion(room.used, room.subjectFilter); if (!q) return;
  room.used.add(q.id); room.questionIds.push(q.id); room.current = q; room.currentStartedAt = Date.now(); room.questionCount++;
  room.players.forEach(p => { p.answered=false; p.answer=undefined; p.answerTime=undefined; });
  room.state = 'QUESTION';
  io.to(pin).emit('question:start', { question: { id:q.id, text:q.text, options:q.options }, timer: 60, questionIndex: room.questionCount });
  room.timer && clearTimeout(room.timer);
  room.timer = setTimeout(() => endQuestion(io, pin), 60000);
}

export function initSocket(server: any) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket: Socket) => {
    socket.on('host:create', async () => {
      let pin = makePin();
      while (rooms.has(pin)) pin = makePin();
      const room: Room = { pin, hostId: socket.id, players: new Map(), nameToSocket: new Map(), state: 'LOBBY', used: new Set(), questionIds: [], questionCount: 0 };
      rooms.set(pin, room);
      socket.join(pin);
      socket.emit('room:created', { pin });
      sendSubjects(socket);
    });

    socket.on('host:setSubjects', ({ pin, subjects }: { pin: string; subjects: string[] }) => {
      const room = rooms.get(pin);
      if (!room || room.hostId !== socket.id) return;
      room.subjectFilter = subjects.filter((s:string)=>s.trim()).map((s:string)=>s.trim());
      socket.emit('subjects:set', { subjects: room.subjectFilter });
    });

    socket.on('host:getSubjects', () => {
      sendSubjects(socket);
    });

    socket.on('host:rejoin', ({ pin }: { pin: string }) => {
      const room = rooms.get(pin);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Room not found or not host' }); return; }
      socket.join(pin);
      socket.emit('room:rejoined', {
        pin: room.pin,
        state: room.state,
        players: roomPlayerList(room),
        questionIndex: room.questionCount,
        countdownSeconds: room.countdownSeconds,
        current: room.current ? { id: room.current.id, text: room.current.text, options: room.current.options } : null,
        timer: room.currentStartedAt ? Math.max(0, 60 - Math.floor((Date.now() - room.currentStartedAt) / 1000)) : 0,
        subjects: room.subjectFilter || [],
      });
      sendSubjects(socket);
    });

    socket.on('player:join', ({ pin, name }: { pin: string; name: string }) => {
      const room = rooms.get(pin);
      if (!room) { socket.emit('error', { message: 'Room not found' }); return; }
      const trimmed = (name || '').trim();
      if (!trimmed) { socket.emit('error', { message: 'Enter your name' }); return; }

      const existing = Array.from(room.players.values()).find(p => p.name === trimmed);
      if (existing) {
        room.players.delete(existing.id);
        existing.id = socket.id; existing.connected = true;
        room.players.set(socket.id, existing);
        room.nameToSocket.set(trimmed, socket.id);
        socket.join(pin);
        socket.emit('joined', { pin, state: room.state, players: roomPlayerList(room), reconnected: true });
        io.to(pin).emit('room:players', { players: roomPlayerList(room) });
        return;
      }

      if (room.state !== 'LOBBY') {
        socket.emit('error', { message: 'Game already started. You can only rejoin if you used this name before.' });
        return;
      }

      const player: Player = { id: socket.id, name: trimmed, score: 0, answered: false, connected: true, joinedAt: Date.now() };
      room.players.set(socket.id, player);
      room.nameToSocket.set(trimmed, socket.id);
      socket.join(pin);
      socket.emit('joined', { pin, state: room.state, players: roomPlayerList(room), reconnected: false });
      io.to(pin).emit('room:players', { players: roomPlayerList(room) });
    });

    socket.on('host:startNext', async ({ pin }: { pin: string }) => {
      const room = rooms.get(pin);
      if (!room || room.hostId !== socket.id) return;
      if (room.state !== 'LOBBY') return;
      if (room.players.size === 0) { socket.emit('error', { message: 'No participants yet' }); return; }

      room.state = 'COUNTDOWN';
      room.countdownSeconds = 10;
      room.currentStartedAt = Date.now();
      io.to(pin).emit('game:countdown', { seconds: 10 });

      room.countdownTimer = setInterval(() => {
        const r = rooms.get(pin); if (!r) return;
        r.countdownSeconds = (r.countdownSeconds || 10) - 1;
        io.to(pin).emit('game:countdown', { seconds: r.countdownSeconds });
        if (r.countdownSeconds <= 0) {
          r.countdownTimer && clearInterval(r.countdownTimer);
          r.countdownTimer = undefined;
          beginQuestion(io, pin);
        }
      }, 1000);
    });

    socket.on('player:answer', ({ pin, answer }: { pin: string; answer: number }) => {
      const room = rooms.get(pin); if (!room || room.state !== 'QUESTION') return;
      const p = room.players.get(socket.id); if (!p || !p.connected || p.answered) return;
      p.answered = true; p.answer = answer; p.answerTime = Date.now() - (room.currentStartedAt || Date.now());
      const connected = Array.from(room.players.values()).filter(x => x.connected);
      io.to(room.hostId).emit('response:count', { count: connected.filter(x => x.answered).length, total: connected.length });
      const all = connected.length > 0 && connected.every(x => x.answered);
      if (all) {
        room.timer && clearTimeout(room.timer);
        endQuestion(io, pin);
      }
    });

    socket.on('disconnect', () => {
      for (const [pin, room] of rooms.entries()) {
        const p = room.players.get(socket.id);
        if (p) {
          p.connected = false;
          room.nameToSocket.delete(p.name);
          io.to(pin).emit('room:players', { players: roomPlayerList(room) });
        }
      }
    });
  });
}

async function endQuestion(io: Server, pin: string) {
  const room = rooms.get(pin); if (!room || room.state !== 'QUESTION') return;
  room.state = 'RESULTS';
  const q = room.current;
  const correct = q.correctOption;
  room.players.forEach(p => {
    if (p.answered && p.answer === correct) {
      const secs = (p.answerTime || 0) / 1000;
      const points = Math.max(0, Math.round(1000 * (1 - secs / 60)));
      p.score += points;
    }
  });
  const leaderboard = Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, score: p.score, correct: p.answer === correct })).sort((a, b) => b.score - a.score);

  if (room.questionCount >= 20) {
    room.state = 'GAME_OVER';
    try { await prisma.gameSession.create({ data: { pin, status: 'completed', questionIds: room.questionIds } }); } catch { /* best effort */ }
    io.to(pin).emit('game:over', { leaderboard });
    return;
  }

  io.to(pin).emit('question:result', { correct, leaderboard });

  room.intermission && clearTimeout(room.intermission);
  room.intermission = setTimeout(async () => {
    room.state = 'QUESTION';
    beginQuestion(io, pin);
  }, 5000);
}