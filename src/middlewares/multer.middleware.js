import multer from "multer";

const storage = multer.diskStorage({// This function creates a storage engine to save files directly to disk (the server's file system).
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage: storage
})