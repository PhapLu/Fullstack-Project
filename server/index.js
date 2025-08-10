import server from './src/app.js'

const PORT = process.env.PORT || 3052;
server.listen(process.env.PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});


