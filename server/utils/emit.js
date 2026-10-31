/**
 * Real vaqt xabarlarini faqat tegishli bo'linmaga (va hammani ko'radiganlarga) yuborish.
 * Har bir socket ulanganda avtomatik xonalarga qo'shiladi (index.js):
 *   'scope:all'      — admin va bo'linma biriktirilmagan bo'limlar
 *   'scope:<canon>'  — masalan "scope:3-bo'linma"
 * Ilgari io.emit(...) hamma ulanganlarga — boshqa bo'linmalarga ham — yuborardi.
 */
const { canon, scopeOf } = require('../middleware/bolinmaScope');

function roomsFor(user) {
    const scope = scopeOf(user);
    return scope === null ? ['scope:all'] : scope.map((b) => `scope:${b}`);
}

function emitScoped(io, bolinma, event, payload) {
    if (!io) return;
    const c = canon(bolinma);
    if (!c) return io.to('scope:all').emit(event, payload); // bo'linmasiz — faqat umumiy ko'ruvchilarga
    io.to('scope:all').to(`scope:${c}`).emit(event, payload);
}

module.exports = { roomsFor, emitScoped };
