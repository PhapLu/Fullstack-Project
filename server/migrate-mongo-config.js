import  dotenv from 'dotenv'
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
        }
    },

    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
    useFileHash: false,
    moduleSystem: 'commonjs',
};

export default config;
