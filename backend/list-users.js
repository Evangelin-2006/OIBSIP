require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email isVerified isAdmin');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`${user.name} - ${user.email} - Verified: ${user.isVerified} - Admin: ${user.isAdmin}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.log('Error:', error.message);
  }
}

listUsers();