require('dotenv').config();

const { CLIENT_URL } = process.env;

const clientUrls = {
  logo: 'onlylogo.png',
  properties: 'properties',
  profile: 'profile',
  createProperty: 'properties/new',
};

Object.keys(clientUrls).forEach((url) => {
  clientUrls[url] = `${CLIENT_URL}/${clientUrls[url]}`;
});

module.exports = {
  clientUrls,
};
