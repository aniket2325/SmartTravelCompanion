const User = require('../models/User')

const ALL_BADGES = [
  { id: 'first_flight',    name: 'First Flight',     icon: '✈️',  xp: 50,   rarity: 'common',    desc: 'Booked your first trip',                 condition: 'tripsCount >= 1' },
  { id: 'explorer',        name: 'Explorer',         icon: '🗺️',  xp: 150,  rarity: 'uncommon',  desc: 'Visited 5+ countries',                   condition: 'tripsCount >= 5' },
  { id: 'solo_traveller',  name: 'Solo Traveller',   icon: '🧳',  xp: 200,  rarity: 'uncommon',  desc: 'Completed a solo trip',                  condition: 'manual' },
  { id: 'budget_master',   name: 'Budget Master',    icon: '💰',  xp: 300,  rarity: 'rare',      desc: 'Spent under budget on 3 trips',          condition: 'manual' },
  { id: 'safety_pro',      name: 'Safety Pro',       icon: '🛡️',  xp: 75,   rarity: 'common',    desc: 'Set up emergency contacts',              condition: 'emergencyContacts >= 1' },
  { id: 'doc_keeper',      name: 'Document Keeper',  icon: '📂',  xp: 100,  rarity: 'common',    desc: 'Uploaded all travel documents',          condition: 'manual' },
  { id: 'mountain_lover',  name: 'Mountain Lover',   icon: '🏔️',  xp: 400,  rarity: 'rare',      desc: 'Visited 3+ mountain destinations',       condition: 'manual' },
  { id: 'beach_bum',       name: 'Beach Bum',        icon: '🏖️',  xp: 250,  rarity: 'uncommon',  desc: 'Visited 5+ beach destinations',          condition: 'manual' },
  { id: 'globetrotter',    name: 'Globetrotter',     icon: '🌍',  xp: 1000, rarity: 'legendary', desc: 'Visited 15+ countries',                  condition: 'tripsCount >= 15' },
  { id: 'ai_pioneer',      name: 'AI Pioneer',       icon: '🤖',  xp: 350,  rarity: 'rare',      desc: 'Generated 5 AI itineraries',             condition: 'manual' },
  { id: 'culture_vulture', name: 'Culture Vulture',  icon: '🏛️',  xp: 500,  rarity: 'rare',      desc: 'Visited 10+ UNESCO heritage sites',      condition: 'manual' },
  { id: 'night_owl',       name: 'Night Owl',        icon: '🌙',  xp: 200,  rarity: 'uncommon',  desc: 'Booked 3+ overnight flights',            condition: 'manual' },
]

const XP_PER_LEVEL = 500

// GET /api/rewards
const getRewards = async (req, res) => {
  const user = req.user
  const level = Math.floor(user.xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = user.xp % XP_PER_LEVEL

  const badges = ALL_BADGES.map(b => ({
    ...b,
    earned: user.badges.includes(b.id),
  }))

  res.json({
    success: true,
    data: {
      xp: user.xp,
      level,
      xpIntoLevel,
      xpForNextLevel: XP_PER_LEVEL,
      badges,
      stats: {
        tripsCount: user.tripsCount,
        badgesEarned: user.badges.length,
        totalBadges: ALL_BADGES.length,
      },
    },
  })
}

// POST /api/rewards/award-badge
const awardBadge = async (req, res, next) => {
  try {
    const { badgeId } = req.body
    const badge = ALL_BADGES.find(b => b.id === badgeId)
    if (!badge) return res.status(404).json({ success: false, message: 'Badge not found' })
    if (req.user.badges.includes(badgeId))
      return res.json({ success: true, message: 'Badge already earned', alreadyEarned: true })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { badges: badgeId }, $inc: { xp: badge.xp } },
      { new: true }
    )

    res.json({ success: true, message: `Badge "${badge.name}" awarded! +${badge.xp} XP`, data: { badge, xp: user.xp } })
  } catch (err) {
    next(err)
  }
}

// POST /api/rewards/add-xp
const addXP = async (req, res, next) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { xp: amount } },
      { new: true }
    )
    res.json({ success: true, data: { xp: user.xp, added: amount, reason } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getRewards, awardBadge, addXP }