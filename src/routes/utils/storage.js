require('dotenv').config();

const FileType = require('file-type');
const CRC32 = require('crc-32');
const { Storage } = require('@google-cloud/storage');
const ApiError = require('./apiError');

// Load environment variables
const { GOOGLE_STORAGE_CREDS_PATH, GOOGLE_PROJECT_ID, GOOGLE_STORAGE_BUCKET_ID } = process.env;

if (!GOOGLE_PROJECT_ID || !GOOGLE_STORAGE_CREDS_PATH) {
  throw Error('Missing Google Cloud Storage environment variables');
}

if (!GOOGLE_STORAGE_BUCKET_ID) {
  throw Error('Missing Google Cloud Storage Bucket ID environment variable');
}

const PROFILE_PICTURE_SIZE_LIMIT = 200000; // 200kB

const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/bmp'];

const storage = new Storage({
  keyFilename: GOOGLE_STORAGE_CREDS_PATH,
  projectId: GOOGLE_PROJECT_ID,
});

const imagesBucket = storage.bucket(GOOGLE_STORAGE_BUCKET_ID);

const validateImageFormat = async (imageFile) => {
  const fileType = await FileType.fromFile(imageFile.path);
  if (!fileType || !SUPPORTED_FORMATS.includes(fileType.mime)) {
    throw new ApiError(400, 'File type not supported');
  }
  return fileType;
};

const uploadImage = async (imageFile, bucketPath) => {
  const uploadConfig = {
    destination: bucketPath || imageFile.name,
  };
  const { path } = imageFile;
  return imagesBucket.upload(path, uploadConfig);
};

const uploadProfileImage = async (user, imageFile) => {
  if (imageFile.size > PROFILE_PICTURE_SIZE_LIMIT) {
    throw new ApiError(
      400,
      `Profile picture cannot size cannot be larger than ${PROFILE_PICTURE_SIZE_LIMIT / 1000} kB`,
    );
  }
  const fileType = await validateImageFormat(imageFile);
  const username = user.email.split('@')[0];
  const imageHash = Math.abs(CRC32.str(`${username}${new Date()}`));
  const bucketPath = `profile/${username}-${imageHash}.${fileType.ext}`;
  const res = await uploadImage(imageFile, bucketPath);
  const newFile = res[0];
  return newFile.publicUrl();
};

const deleteImage = async (imageUrl) => {
  const url = new URL(imageUrl);
  const imageName = url.pathname.replace(GOOGLE_STORAGE_BUCKET_ID, '').slice(2);
  return imagesBucket.file(imageName).delete();
};

const deleteProfileImage = async (user) => {
  const url = user.avatarLink;
  if (url.includes(GOOGLE_STORAGE_BUCKET_ID)) {
    await deleteImage(url);
  }
};

module.exports = { uploadProfileImage, deleteProfileImage };
