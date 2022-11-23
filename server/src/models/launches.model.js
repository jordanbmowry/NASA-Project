const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100, // flight_number
  mission: 'Kepler Exploration X', // name
  rocket: 'Explorer IS1', // rocket.name
  launchDate: new Date('December 27, 2030'), // date_local
  target: 'Kepler-442 b', // not applicable
  customers: ['ZTM', 'NASA'], // payload.customers
  upcoming: true, // upcoming
  success: true, // success
};

saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function loadLaunchData() {
  console.log('downloading launch data');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    pagination: false,
    options: {
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

  if (latestLaunch.flightNumber) {
    return latestFlightNumber + 1;
  }
  return DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches() {
  return await launchesDatabase.find(
    {},
    {
      __id: 0,
      __v: 0,
    }
  );
}

async function existsLaunchWithId(id) {
  return await launchesDatabase.findOne({
    flightNumber: id,
  });
}

async function abortLaunchById(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  console.log(aborted);
  return aborted.matchedCount === 1;
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet was found.');
  }

  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = await getLatestFlightNumber();
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

module.exports = {
  loadLaunchData,
  scheduleNewLaunch,
  existsLaunchWithId,
  getAllLaunches,
  abortLaunchById,
};
