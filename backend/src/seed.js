require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const Admin = require('./models/Admin');
const Event = require('./models/Event');
const TeamMember = require('./models/TeamMember');
const Review = require('./models/Review');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Admin.deleteMany({});
  await Event.deleteMany({});
  await TeamMember.deleteMany({});
  await Review.deleteMany({});

  // NOTE: No default admin created — use /admin/register to create your admin account
  console.log('No default admin created. Visit /admin/register to set up your account.');

  // Seed events
  await Event.insertMany([
    {
      title: 'Kateel Sri Durgaparameshwari Rathotsava',
      description: 'Grand annual chariot festival at Kateel temple with full percussion ensemble.',
      date: new Date('2024-10-24'),
      location: 'Kateel Temple Main Ground',
      category: 'Temple Festival',
      status: 'past',
      membersCount: 20,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGPtV6_zNkF8Cx1jxRB_maU0rLcBklPqKrzS6aDhYMQP6MofAoy2UX4I7MKcrGa5yi6zrXgG3UNqZfjLE4ekx80uvYpSOui47VkKuRFf1wQoISb6wfibDwXehl8itOF-6H2O2skYY3t1qJOfHH3ODyfm9NgzKnol08wJ7tvk4JmMt-ED6SPJdkawTMkVDLYEeoIqmDGeyuccFgL2jcxaBB2WLBt4EC-wrPWVXC2-98v-jXPruAg6OiRlq1ff78hsUwCaCNb7bD9AS',
    },
    {
      title: 'Tech Excellence Awards 2024',
      description: 'Corporate gala performance for technology industry awards ceremony.',
      date: new Date('2024-06-15'),
      location: 'Bangalore, India',
      category: 'Corporate',
      status: 'past',
      membersCount: 12,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHigTTQM9hVzrp6AUq4Mi9EuOBFU9UP8VQrVsW6JbEfOnpHG-VXheR6ae1mKL7VzQkckX9EerVhzkLfsyzhgURXqYMzAObL8sO6h9zX6yPmaVkQ2AWzg6EEH9JB5mqGgWMAzwO2dr5wIDIXn8McIcpa6gS5z5uNHliBXB-r8XVXCE5hMnD7G4FCJrAks2WFKDPpg_sgGh-db19Cl2ksisqeRrEh-o6WQWNXjNPTsOS5E2cpjGmddsjd2S90-8M3ekmE5X_XmobaLkH',
    },
    {
      title: 'Mysuru Dasara Cultural Evening',
      description: 'Cultural performance at the prestigious Mysuru Dasara celebrations.',
      date: new Date('2024-10-12'),
      location: 'Mysuru, Karnataka',
      category: 'Public Event',
      status: 'past',
      membersCount: 15,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoM-E2hl4AfaoF_pxBxBLkKrnEmI3ByB4dNaeAvi3A6oTzQ5MtNuL4NKzScjG5pXBe0_6kgS_769wWIaCRSwfQSGiGjSv0iNutZek3WJzXqg3_UZTW2TYoMgwKS1Oxo3tZo1uouNJGu7vBfEGrnLmZ13Sg6-KKsnHwRsZuJC9GiCQRe07ubdFsPMiTfIV0lS5eSQ827uJQN7KSJXaUZExpkFuFWxuy2sir-l9rU0YTgXabMIMb854G-IpAWCGlbeX3X32nLf0-tA_x',
    },
    {
      title: 'Udupi Krishna Janmashtami',
      description: 'Special performance at Udupi Sri Krishna temple for Janmashtami.',
      date: new Date('2025-08-16'),
      location: 'Udupi, Karnataka',
      category: 'Temple Festival',
      status: 'upcoming',
      membersCount: 18,
      imageUrl: '',
    },
    {
      title: 'Heritage Cultural Night 2025',
      description: 'Annual cultural night celebrating Karnataka heritage.',
      date: new Date('2025-11-20'),
      location: 'Mangalore, Karnataka',
      category: 'Public Event',
      status: 'upcoming',
      membersCount: 25,
      imageUrl: '',
    },
  ]);
  console.log('Events seeded.');

  // Seed team members
  await TeamMember.insertMany([
    {
      name: 'Nandini Kateel',
      role: 'Lead Percussionist',
      experienceLevel: 'Expert',
      yearsOfExperience: 14,
      age: 35,
      bio: 'Founding member and lead percussionist with 14 years of experience in traditional Chende performance.',
      status: 'active',
      performancesCompleted: 500,
      joinedDate: new Date('2010-01-01'),
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCujchVuchvEzEevURzkugiW2Mv21UUd4sLsvEJiH2NX7qhfrJGDfEt5Nq84MWi_cnUYsFY_HhkHFMG1SoQiRO9PDI621q4bGSGcb_6KZgBZzYKD9WRH40e2YXaOkp7mkn8h_mfdTCq__HuqiQ4Wx-5AkF8bWwB4yPzweGvidaGQadFO08W-mdq7yDQc_1EHwyF8CA18vsQ8WSluVS3wxxXoo3C8FR31w-ruPKq1OA7GavKVugZpYmZ9PdwCREzBZFpVH8mCta7isQ7',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Senior Rhythm Master',
      experienceLevel: 'Expert',
      yearsOfExperience: 12,
      age: 38,
      bio: 'Senior rhythm master specializing in complex Chende patterns and temple festival performances.',
      status: 'active',
      performancesCompleted: 420,
      joinedDate: new Date('2011-03-15'),
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJZceZiq2ARmP7NgH6Y_NyRGDceDTtyzyKprk4LfyS8D5_LGioJjuqNv8zieGtvZVhWRStgUxqomDRLIGFiNnEEp7H_XBEvudQpTbuuHtyYBCqXgdWYYvs6wMIrkT3dzGx6ZvnuYM9DnjVK3yLnJg2Hb391GwFNAEDd5aKRJz-ZFrAUvcIMQWUbf37kZLm4s87u41YCpLyKl8gI-1fMNYicHCG_Rt1j5QCOprwEu6Fdw5KpcXxPoqPimYJ4wgcK-AWBzPFqeAk98QG',
    },
    {
      name: 'Ananya Bhat',
      role: 'Chende Artist',
      experienceLevel: 'Intermediate',
      yearsOfExperience: 6,
      age: 26,
      bio: 'Talented Chende artist bringing fresh energy and precision to every performance.',
      status: 'active',
      performancesCompleted: 180,
      joinedDate: new Date('2018-06-01'),
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvrhWIPy4w6L9KK1OcHSywpAIfOIGjInICAgdx7N5zkpOxtIYrggD-cR_N2mEgEsd-dcurG1uplT5F91cR0hzjOne2TGj4Iosp2P6tjaSuHWcA_HOIHjlKMNMwgCwslxOK8ZNMAsGz6KNfel5bIGvUGBw8JWJn58gyMZdt4B8Akwc9hd48nXSIRS8Dd0iZYxneh6MlhbL05vPNWYWSDnWLZZuBqVCadPRCUQI3w3Z38pDLbxEyWrx7uEYynPrL0mPhEp3KFgTwoL9B',
    },
    {
      name: 'Vikram Shetty',
      role: 'Apprentice Artist',
      experienceLevel: 'Beginner',
      yearsOfExperience: 2,
      age: 22,
      bio: 'Enthusiastic apprentice learning the art of Chende under the guidance of senior masters.',
      status: 'active',
      performancesCompleted: 45,
      joinedDate: new Date('2022-09-01'),
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEH1y4W7U-UrqRejIdguRaY9o6TVKGOcxwDaluW4E6k5_8CSuTNb99sFAoY0QSfjJyT8WUYbHKV6ItHQ1AneS_rHKQkVAWW0q3A0bTUuZOuhtmNh9IBthbjIEjWtnNcT543_TgzKxWUFa6-NJUYF6tS-IiVw5tQAvbN5Kzo_lZIDlDT4dhT4Bdw4WFtoDpELFhyJpxfEa42qTIem8ot0PHBYFu2xSwGFIxXMr8afDTQ93eBXVCAibzz-w8WiMrkgbe9yd--p2jmlnv',
    },
  ]);
  console.log('Team members seeded.');

  // Seed reviews
  await Review.insertMany([
    {
      name: 'Suresh Pai',
      message: 'Absolutely mesmerizing performance at our temple festival. The energy and precision of Team Nandini is unmatched. Highly recommended!',
      rating: 5,
      eventType: 'Temple Festival',
      isApproved: true,
    },
    {
      name: 'Priya Nair',
      message: 'We hired them for our corporate event and they were absolutely professional. The guests were blown away by the traditional performance.',
      rating: 5,
      eventType: 'Corporate Event',
      isApproved: true,
    },
    {
      name: 'Ramesh Kamath',
      message: 'The Chende performance at our wedding was the highlight of the evening. Everyone is still talking about it!',
      rating: 5,
      eventType: 'Wedding',
      isApproved: true,
    },
  ]);
  console.log('Reviews seeded.');

  console.log('\nDatabase seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
