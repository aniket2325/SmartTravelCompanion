const express = require('express')
const router = express.Router()
const { upload, getDocs, uploadDoc, deleteDoc, downloadDoc } = require('../controllers/documentController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/', getDocs)
router.post('/upload', upload.single('file'), uploadDoc)
router.delete('/:id', deleteDoc)
router.get('/:id/download', downloadDoc)

module.exports = router