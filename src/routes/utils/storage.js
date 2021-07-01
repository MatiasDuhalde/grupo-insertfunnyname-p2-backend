require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

// Load environment variables
const { GOOGLE_STORAGE_CREDS_PATH, GOOGLE_PROJECT_ID, GOOGLE_STORAGE_BUCKET_ID } = process.env;

if (!GOOGLE_PROJECT_ID || !GOOGLE_STORAGE_CREDS_PATH) {
  throw Error('Missing Google Cloud Storage environment variables');
}

if (!GOOGLE_STORAGE_BUCKET_ID) {
  throw Error('Missing Google Cloud Storage Bucket ID environment variable');
}

const storage = new Storage({
  keyFilename: GOOGLE_STORAGE_CREDS_PATH,
  projectId: GOOGLE_PROJECT_ID,
});

const imagesBucket = storage.bucket(GOOGLE_STORAGE_BUCKET_ID);

const uploadImage = async (imagePath) => {
  console.log(imagePath);
  return imagesBucket.upload(imagePath);
};

module.exports = { uploadImage };
