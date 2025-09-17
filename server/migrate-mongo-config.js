// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import dotenv from "dotenv";
dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGO_URI,
    databaseName: process.env.DB_NAME,

    options: {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      //   connectTimeoutMS: 60000,
      //   socketTimeoutMS: 60000,
    },
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: "commonjs",
};

export default config;
