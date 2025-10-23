const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://lingyuzhou:VALENTINE7987@cluster0.n6spcdu.mongodb.net/NewsMIS?retryWrites=true&w=majority&appName=Cluster0';

const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    author: String,
    publishedDate: Date,
    status: String
});

const News = mongoose.model('News', newsSchema);

const categories = ['Technology', 'Sports', 'Business', 'Entertainment', 'Health', 'Science', 'Politics', 'World'];
const statuses = ['published', 'draft'];

async function generateData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const batchSize = 1000;
        const totalRecords = 10000;
        
        for (let i = 0; i < totalRecords / batchSize; i++) {
            const newsData = [];
            
            for (let j = 0; j < batchSize; j++) {
                const index = i * batchSize + j + 1;
                newsData.push({
                    title: `News Article ${index}: Breaking News Story`,
                    content: `This is the content for news article ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    author: `Author ${Math.floor(Math.random() * 100) + 1}`,
                    publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                    status: statuses[Math.floor(Math.random() * statuses.length)]
                });
            }
            
            await News.insertMany(newsData);
            console.log(`Inserted batch ${i + 1}/${totalRecords / batchSize} (${(i + 1) * batchSize} records)`);
        }
        
        const count = await News.countDocuments();
        console.log(`\nTotal news articles in database: ${count}`);
        
        await mongoose.connection.close();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateData();