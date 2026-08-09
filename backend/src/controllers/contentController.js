const SiteContent = require('../models/SiteContent');

const defaultContent = {
  hero: {
    title: 'Nandini Chende Kateel',
    subtitle: 'Rhythm of Tradition, Beat of Excellence.',
    description: 'Experience the majestic resonance of Kateel\'s finest percussion ensemble.',
    logoUrl: '',
  },
  about: {
    title: 'About Team Nandini Chende Kateel',
    description: 'Established in the sacred town of Kateel in 2010, Team Nandini Chende Kateel has become a hallmark of percussive excellence.',
    heritageLabel: 'Our Heritage',
    heritageTitle: 'Preserving the Percussive Art of Karnataka',
    heritageDescription: 'Team Nandini Chende Kateel is more than just a musical group; we are the custodians of a rhythmic legacy. For over a decade, we have brought the thunderous energy of the Chende to festivals, temples, and corporate stages across India.',
    heritageImageUrl: '',
    founderName: 'Kiran Anchan',
    founderTitle: 'Founder & Team Owner',
    founderBio: 'Kiran Anchan is the visionary behind Team Nandini Chende Kateel. With over a decade of dedication to the art of percussion, he has led the team to perform at prestigious events across the country.',
    founderImageUrl: '',
    teamImageUrl: '',
    stats: {
      eventsCount: '2000+',
      foundedYear: 'Since 2010',
      location: 'Kateel',
    },
  },
  contact_info: {
    address: 'Kateel Temple Road, Kateel, Mangalore, Karnataka - 574148',
    phone: '+91 98765 43210',
    email: 'contact@nandinichende.com',
  },
  social_links: {
    facebook: '#',
    instagram: '#',
    youtube: '#',
    whatsapp: '#',
  },
  general: {
    siteName: 'Team Nandini Chende Kateel',
    tagline: 'Preserving the Rhythmic Heritage of Karnataka',
    metaDescription: 'Team Nandini Chende Kateel - Traditional Chende percussion ensemble from Kateel, Karnataka.',
  },
  pricing: {
    pricePerMember: 1000,
    distanceSurchargePerKm: 150,
    freeDistanceKm: 5,
  },
  offers: {
    items: [],
    // Each item: { id, title, subtitle, discountPercent, imageUrl, urgencyText, active, expiresAt }
  },
  owner: {
    name: 'Kiran Anchan',
    phone1: '',
    phone2: '',
    email: '',
  },
  packages: {
    items: [
      { members: 6,  label: '6 Members',  fakeMultiplier: 1.20, enabled: true },
      { members: 8,  label: '8 Members',  fakeMultiplier: 1.18, enabled: true },
      { members: 12, label: '12 Members', fakeMultiplier: 1.15, enabled: true },
      { members: 15, label: '15 Members', fakeMultiplier: 1.15, enabled: true },
      { members: 18, label: '18 Members', fakeMultiplier: 1.12, enabled: true },
      { members: 21, label: '21 Members', fakeMultiplier: 1.12, enabled: true },
      { members: 24, label: '24 Members', fakeMultiplier: 1.10, enabled: true },
      { members: 30, label: '30 Members', fakeMultiplier: 1.10, enabled: true },
    ],
  },
};

// @desc    Get site content by section (public)
// @route   GET /api/content/:section
// @access  Public
const getContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    let content = await SiteContent.findOne({ section });

    if (!content) {
      const defaultData = defaultContent[section];
      if (!defaultData) {
        return res.status(404).json({ success: false, message: 'Content section not found.' });
      }
      return res.status(200).json({ success: true, section, data: defaultData });
    }

    res.status(200).json({ success: true, section, data: content.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all site content (public)
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res, next) => {
  try {
    const contentDocs = await SiteContent.find();
    const result = { ...defaultContent };

    contentDocs.forEach((doc) => {
      result[doc.section] = doc.data;
    });

    res.status(200).json({ success: true, content: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site content (admin)
// @route   PUT /api/content/:section
// @access  Private
const updateContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['hero', 'about', 'contact_info', 'social_links', 'general', 'pricing', 'offers', 'owner', 'packages', 'beats'];

    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid content section.' });
    }

    const content = await SiteContent.findOneAndUpdate(
      { section },
      { section, data: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Content updated successfully.', content });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContent, getAllContent, updateContent };
