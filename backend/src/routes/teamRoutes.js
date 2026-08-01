const express = require('express');
const router = express.Router();
const {
  getTeamMembers, getAllTeamMembers, getTeamMemberById,
  createTeamMember, updateTeamMember, deleteTeamMember, applyToJoin,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getTeamMembers);
router.post('/apply', applyToJoin);
router.get('/:id', getTeamMemberById);

// Admin
router.get('/admin/all', protect, getAllTeamMembers);
router.post('/', protect, createTeamMember);
router.put('/:id', protect, updateTeamMember);
router.delete('/:id', protect, deleteTeamMember);

module.exports = router;
