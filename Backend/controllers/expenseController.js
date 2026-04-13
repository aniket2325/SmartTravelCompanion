const Expense = require('../models/Expense')

// GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { tripId, category, startDate, endDate } = req.query
    const filter = { user: req.user._id }
    if (tripId) filter.trip = tripId
    if (category) filter.category = category
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const expenses = await Expense.find(filter).sort({ date: -1 })

    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    res.json({ success: true, data: expenses, total: Math.round(total * 100) / 100, byCategory })
  } catch (err) {
    next(err)
  }
}

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id })
    res.status(201).json({ success: true, data: expense })
  } catch (err) {
    next(err)
  }
}

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    )
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' })
    res.json({ success: true, data: expense })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' })
    res.json({ success: true, message: 'Expense deleted' })
  } catch (err) {
    next(err)
  }
}

// GET /api/expenses/summary
const getSummary = async (req, res, next) => {
  try {
    const { tripId } = req.query
    const filter = { user: req.user._id }
    if (tripId) filter.trip = tripId

    const result = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ])

    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getSummary }