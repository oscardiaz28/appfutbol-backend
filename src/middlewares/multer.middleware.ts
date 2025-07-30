import multer from "multer";
import path from 'node:path'
import fs from 'node:fs'

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename(req, file, cb) {
        const name = `${Date.now()}${path.extname(file.originalname)}`
        cb(null, name)
    },
})
export const upload = multer({storage})