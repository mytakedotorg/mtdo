const underTest = require('./app');
const request = require('supertest');
const toMatchImageSnapshot = require('jest-image-snapshot');

/*
expect.extend({ toMatchImageSnapshot });

describe("node.mytake.org smoketest", () => {
    test('test for document', async () => {
        const response = await request(app).get('someUrl');
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchImageSnapshot();
    });
});
*/
