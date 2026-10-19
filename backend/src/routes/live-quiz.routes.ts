import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
type Player = { id: string; name: string; score: number; answered: boolean; connected: boolean; answer?: number; answerTime?: number; joinedAt: number };
type Room = { pin: string; hostId: string; players: Map<string, Player>; nameToSocket: Map<string, string>; state: 'LOBBY'|'COUNTDOWN'|'QUESTION'|'RESULTS'|'GAME_OVER'; used: Set<string>; questionIds: string[]; subjectFilter?: string[]; current?: any; currentStartedAt?: number; timer?: any; intermission?: any; countdownTimer?: any; questionCount: number; countdownSeconds?: number; };

const rooms = new Map<string, Room>();

function makePin() { return Math.floor(100000 + Math.random()*900000).toString(); }

function roomPlayerList(room: Room) {
  return Array.from(room.players.values()).map(p=>({ id:p.id, name:p.name, score:p.score, connected:p.connected }));
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

async function beginQuestion(io: any, pin: string) {
  const room = rooms.get(pin); if (!room) return;
  const q = await randomQuestion(room.used, room.subjectFilter); if (!q) return;
  room.used.add(q.id); room.questionIds.push(q.id); room.current = q; room.currentStartedAt = Date.now(); room.questionCount++;
  room.players.forEach(p => { p.answered=false; p.answer=undefined; p.answerTime=undefined; });
  room.state = 'QUESTION';
  room.timer && clearTimeout(room.timer);
  room.timer = setTimeout(() => endQuestion(pin), 60000);
}

async function endQuestion(pin: string) {
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
    return;
  }

  room.intermission && clearTimeout(room.intermission);
  room.intermission = setTimeout(async () => {
    room.state = 'QUESTION';
    beginQuestion(null, pin);
  }, 5000);
}

function getRoomState(room: Room) {
  return {
    pin: room.pin,
    state: room.state,
    players: roomPlayerList(room),
    questionIndex: room.questionCount,
    countdownSeconds: room.countdownSeconds,
    current: room.current ? { id: room.current.id, text: room.current.text, options: room.current.options } : null,
    timer: room.currentStartedAt ? Math.max(0, 60 - Math.floor((Date.now() - room.currentStartedAt) / 1000)) : 0,
    subjects: room.subjectFilter || [],
  };
}

router.post('/create', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  let pin = makePin();
  while (rooms.has(pin)) pin = makePin();
  const room: Room = { pin, hostId: req.body.hostId || 'host', players: new Map(), nameToSocket: new Map(), state: 'LOBBY', used: new Set(), questionIds: [], questionCount: 0 };
  rooms.set(pin, room);
  try {
    const rows = await prisma.question.findMany({ where: { isActive: true }, select: { subject: true } });
    const subjects = Array.from(new Set(rows.map((r:any)=>r.subject).filter(Boolean)));
    room.subjectFilter = subjects;
    res.json({ success: true, pin, subjects });
  } catch {
    res.json({ success: true, pin, subjects: [] });
  }
});

router.post('/join', async (req: Request, res: Response) => {
  const { pin, name } = req.body;
  const room = rooms.get(pin);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  const trimmed = (name || '').trim();
  if (!trimmed) return res.status(400).json({ success: false, message: 'Enter your name' });

  const existing = Array.from(room.players.values()).find(p => p.name === trimmed);
  if (existing) {
    room.players.delete(existing.id);
    existing.id = Date.now().toString(); existing.connected = true;
    room.players.set(existing.id, existing);
    return res.json({ success: true, playerId: existing.id, state: room.state, players: roomPlayerList(room), reconnected: true });
  }

  if (room.state !== 'LOBBY') {
    return res.status(400).json({ success: false, message: 'Game already started' });
  }

  const player: Player = { id: Date.now().toString(), name: trimmed, score: 0, answered: false, connected: true, joinedAt: Date.now() };
  room.players.set(player.id, player);
  res.json({ success: true, playerId: player.id, state: room.state, players: roomPlayerList(room), reconnected: false });
});

router.get('/room/:pin', async (req: Request, res: Response) => {
  const room = rooms.get(req.params.pin);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.json({ success: true, ...getRoomState(room) });
});

router.post('/start', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  const { pin } = req.body;
  const room = rooms.get(pin);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  if (room.state !== 'LOBBY') return res.status(400).json({ success: false, message: 'Game not in lobby' });
  if (room.players.size === 0) return res.status(400).json({ success: false, message: 'No participants yet' });

  room.state = 'COUNTDOWN';
  room.countdownSeconds = 10;
  room.currentStartedAt = Date.now();

  room.countdownTimer = setInterval(() => {
    const r = rooms.get(pin); if (!r) return;
    r.countdownSeconds = (r.countdownSeconds || 10) - 1;
    if (r.countdownSeconds <= 0) {
      r.countdownTimer && clearInterval(r.countdownTimer);
      r.countdownTimer = undefined;
      beginQuestion(null, pin);
    }
  }, 1000);

  res.json({ success: true, state: 'COUNTDOWN', seconds: 10 });
});

router.post('/answer', async (req: Request, res: Response) => {
  const { pin, answer, playerId } = req.body;
  const room = rooms.get(pin);
  if (!room || room.state !== 'QUESTION') return res.status(400).json({ success: false, message: 'No active question' });
  const p = room.players.get(playerId);
  if (!p || !p.connected || p.answered) return res.status(400).json({ success: false, message: 'Cannot answer' });
  p.answered = true; p.answer = answer; p.answerTime = Date.now() - (room.currentStartedAt || Date.now());
  const connected = Array.from(room.players.values()).filter(x => x.connected);
  const all = connected.length > 0 && connected.every(x => x.answered);
  if (all) {
    room.timer && clearTimeout(room.timer);
    endQuestion(pin);
  }
  res.json({ success: true });
});

router.get('/subjects', async (req: Request, res: Response) => {
  try {
    const rows = await prisma.question.findMany({ where: { isActive: true }, select: { subject: true } });
    const subjects = Array.from(new Set(rows.map((r:any)=>r.subject).filter(Boolean)));
    res.json({ success: true, subjects });
  } catch {
    res.json({ success: true, subjects: [] });
  }
});

router.post('/subjects', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  const { pin, subjects } = req.body;
  const room = rooms.get(pin);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  room.subjectFilter = subjects.filter((s:string)=>s.trim()).map((s:string)=>s.trim());
  res.json({ success: true, subjects: room.subjectFilter });
});

export default router;
