require('dotenv').config();
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const resetAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || 'qwerty10';
  const password = process.env.ADMIN_PASSWORD || username;

  await connectDB();

  const existingAdmins = await Admin.find({});
  const targetAdmin = existingAdmins.find((admin) => admin.username === username);

  if (targetAdmin) {
    targetAdmin.password = password;
    await targetAdmin.save();
  } else {
    await Admin.deleteMany({});
    await Admin.create({ username, password });
  }

  console.log(`Admin credentials set to ${username} / ${password}`);
  process.exit(0);
};

resetAdmin().catch((error) => {
  console.error('Reset admin error:', error);
  process.exit(1);
});