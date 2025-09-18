import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import ideasData from './ideas.json' assert { type: 'json' };

dotenv.config();

const importData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing ideas
        await Idea.deleteMany();
        console.log('Cleared existing ideas');

        // Create a demo user if one doesn't exist
        let demoUser = await User.findOne({ email: 'demo@example.com' });
        if (!demoUser) {
            demoUser = await User.create({
                name: 'Demo User',
                email: 'demo@example.com',
                password: 'password123' // This will be hashed by the User model
            });
            console.log('Created demo user');
        }

        // Add user reference to each idea and import
        const ideasWithUser = ideasData.map(idea => ({
            ...idea,
            user: demoUser._id
        }));

        const importedIdeas = await Idea.insertMany(ideasWithUser);
        console.log(`Imported ${importedIdeas.length} ideas successfully`);

        process.exit();
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

importData();
