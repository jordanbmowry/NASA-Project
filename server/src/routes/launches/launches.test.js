const request = require('supertest');
const app = require('../../app.js');
const { mongoConnect, mongoDisconnect } = require('../../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Lauches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launches', () => {
    const payloadWithDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2028',
    };
    const payloadWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(payloadWithDate)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(payloadWithDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject({
        mission: 'USS Enterprise',
        rocket: 'NCC 1701-D',
        target: 'Kepler-62 f',
      });
    });

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'invalid',
    };

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send()
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
