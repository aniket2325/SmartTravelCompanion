const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Document = require('../models/Document')

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads', req.user._id.toString())
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only PDF, JPG, PNG, and WEBP files are allowed'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
})

// GET /api/documents
const getDocs = async (req, res, next) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, data: docs })
  } catch (err) {
    next(err)
  }
}

// POST /api/documents/upload
const uploadDoc = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

    const { name, type, expiresAt } = req.body
    const doc = await Document.create({
      user: req.user._id,
      name: name || req.file.originalname,
      type: type || 'Other',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isEncrypted: true,
    })

    res.status(201).json({ success: true, data: doc })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/documents/:id
const deleteDoc = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id })
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' })

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', req.user._id.toString(), doc.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await doc.deleteOne()
    res.json({ success: true, message: 'Document deleted' })
  } catch (err) {
    next(err)
  }
}

// GET /api/documents/:id/download
const downloadDoc = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id })
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' })

    const filePath = path.join(__dirname, '../../uploads', req.user._id.toString(), doc.filename)
    if (!fs.existsSync(filePath))
      return res.status(404).json({ success: false, message: 'File not found on server' })

    res.download(filePath, doc.originalName || doc.filename)
  } catch (err) {
    next(err)
  }
}

module.exports = { upload, getDocs, uploadDoc, deleteDoc, downloadDoc }