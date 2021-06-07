const faker = require('faker');
const fs = require('fs');

const COUNTRY_DATA = JSON.parse(fs.readFileSync(`${__dirname}/../lib/chile_communes.json`), {
  encoding: 'utf8',
  flag: 'r',
});

const PROPERTY_TYPES = [
  'house',
  'apartment',
  'tent',
  'cabin',
  'lot',
  'farm',
  'room',
  'mansion',
  'business',
  'office',
  'other',
];

const LISTING_TYPES = ['sale', 'rent'];

const PRICE_RANGES = {
  sale: {
    house: [40000, 600000],
    apartment: [60000, 600000],
    tent: [80, 1000],
    cabin: [20000, 240000],
    lot: [6000, 160000],
    farm: [16000, 300000],
    room: [6000, 26000],
    mansion: [600000, 50000000],
    business: [16000, 1000000],
    office: [8000, 30000],
    other: [10000, 100000],
  },
  rent: {
    house: [600, 6000],
    apartment: [500, 5000],
    tent: [80, 200],
    cabin: [400, 3000],
    lot: [400, 2500],
    farm: [1000, 12000],
    room: [200, 600],
    mansion: [4000, 200000],
    business: [2000, 14000],
    office: [400, 6000],
    other: [500, 100000],
  },
};

const SIZE_RANGES = {
  house: [80, 400],
  apartment: [40, 180],
  tent: [2, 18],
  cabin: [30, 80],
  lot: [300, 1000],
  farm: [1000, 20000],
  room: [4, 20],
  mansion: [400, 2000],
  business: [100, 800],
  office: [4, 32],
  other: [1, 1000],
};

const BEDROOMS_RANGES = {
  house: [2, 12],
  apartment: [2, 8],
  tent: [0, 0],
  cabin: [2, 4],
  lot: [0, 0],
  farm: [0, 0],
  room: [1, 1],
  mansion: [10, 40],
  business: [0, 0],
  office: [0, 0],
  other: [0, 0],
};

const BATHROOMS_RANGES = {
  house: [1, 7],
  apartment: [1, 4],
  tent: [0, 0],
  cabin: [1, 3],
  lot: [0, 0],
  farm: [0, 0],
  room: [0, 1],
  mansion: [4, 14],
  business: [0, 4],
  office: [0, 1],
  other: [0, 0],
};

const getRandomRegionCommune = () => {
  const { regions } = COUNTRY_DATA;
  const randomRegion = regions[Math.floor(Math.random() * regions.length)];
  const { communes } = randomRegion;
  const randomCommune = communes[Math.floor(Math.random() * communes.length)];
  return { region: randomRegion.name, commune: randomCommune.name };
};

const getRandomVar = (type, variable) => {
  let range;
  switch (variable) {
    case 'bathrooms':
      range = BATHROOMS_RANGES[type];
      break;
    case 'bedrooms':
      range = BEDROOMS_RANGES[type];
      break;
    case 'size':
      range = SIZE_RANGES[type];
      break;
    case 'price':
      range = PRICE_RANGES[type];
      break;
    default:
      break;
  }
  return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
};

const getRandomPrice = (type, size, listingType) => {
  const priceRange = PRICE_RANGES[listingType][type];
  const sizeRange = SIZE_RANGES[type];
  const pond = (size - sizeRange[0]) / (sizeRange[1] - sizeRange[0]);
  return (priceRange[1] - priceRange[0]) * pond + priceRange[0];
};

const assembleRandomTitle = (type, region, commune) => {
  let title = '';
  // Add adjectives
  for (let i = 0; i < 2; i += 1) {
    if (Math.random() > 0.4) {
      title += `${faker.commerce.productAdjective()} `;
    }
  }
  // Add type
  title += `${type} `;
  // Add location
  if (Math.random() > 0.3) {
    title += `in ${commune} `;
    if (Math.random() > 0.6) title += `(${region}) `;
  }
  return title;
};

const generateRandomProperty = (user) => {
  const randomDate = faker.date.between(user.createdAt, '2021-06-06');
  const type = PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)];
  const { region, commune } = getRandomRegionCommune();
  const listingType = LISTING_TYPES[Math.floor(Math.random() * LISTING_TYPES.length)];
  const size = getRandomVar(type, 'size');
  const property = {
    userId: user.id,
    title: assembleRandomTitle(type, region, commune),
    type,
    bathrooms: getRandomVar(type, 'bathrooms'),
    bedrooms: getRandomVar(type, 'bedrooms'),
    size,
    region,
    commune,
    street: faker.address.streetName(),
    streetNumber: Math.floor(Math.random() * (9999 - 100) + 100),
    description: faker.lorem.words(Math.floor(Math.random() * 256)),
    price: getRandomPrice(type, size, listingType),
    listingType,
    createdAt: randomDate,
    updatedAt: randomDate,
  };
  return property;
};

module.exports = {
  generateRandomProperties: (n = 1, users) => {
    const properties = [];
    for (let i = 0; i < n; i += 1) {
      const user = users[Math.floor(Math.random() * users.length)];
      properties.push(generateRandomProperty(user));
    }
    return properties;
  },
};
