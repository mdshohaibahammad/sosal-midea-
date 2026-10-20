const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'social_autoposter';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    // Automatically create database if not exists
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // Authenticate and sync Sequelize models
    await sequelize.authenticate();
    console.log(`MySQL Connected successfully to ${DB_NAME}`);

    // Load relationships and sync schema
    const { User } = require('../models');
    await sequelize.sync({ alter: true });
    console.log('MySQL Database & Tables Synchronized');

    // Create default test user if database is empty
    const count = await User.count();
    if (count === 0) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
      });
      console.log('Default user created: admin@example.com / password123');
    }
  } catch (err) {
    console.error('MySQL connection error:', err.message);
  }
};

module.exports = { sequelize, connectDB };