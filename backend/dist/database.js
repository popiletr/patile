"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, '../../bipop.sqlite');
exports.db = new sqlite3_1.default.Database(dbPath);
function initDatabase() {
    return new Promise((resolve, reject) => {
        exports.db.serialize(() => {
            // Users table with username, email, password
            exports.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT,
          username TEXT UNIQUE,
          name TEXT NOT NULL,
          emoji TEXT NOT NULL,
          pair_code TEXT UNIQUE NOT NULL,
          apns_token TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // Migrations for existing databases
            exports.db.run(`ALTER TABLE users ADD COLUMN email TEXT`, () => { });
            exports.db.run(`ALTER TABLE users ADD COLUMN username TEXT`, () => { });
            exports.db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`, () => { });
            // Pair Requests (Invitations with approval)
            exports.db.run(`
        CREATE TABLE IF NOT EXISTS pair_requests (
          id TEXT PRIMARY KEY,
          from_user_id TEXT NOT NULL,
          from_username TEXT,
          from_user_name TEXT NOT NULL,
          from_user_emoji TEXT NOT NULL,
          to_user_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            exports.db.run(`ALTER TABLE pair_requests ADD COLUMN from_username TEXT`, () => { });
            // Friendships
            exports.db.run(`
        CREATE TABLE IF NOT EXISTS friendships (
          user_id TEXT NOT NULL,
          friend_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, friend_id)
        )
      `);
            // Drops
            exports.db.run(`
        CREATE TABLE IF NOT EXISTS drops (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL,
          sender_username TEXT,
          sender_name TEXT NOT NULL,
          sender_emoji TEXT NOT NULL,
          recipient_id TEXT NOT NULL DEFAULT 'all',
          type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            exports.db.run(`ALTER TABLE drops ADD COLUMN sender_username TEXT`, () => { });
            exports.db.run(`ALTER TABLE drops ADD COLUMN recipient_id TEXT NOT NULL DEFAULT 'all'`, () => { });
            resolve();
        });
    });
}
