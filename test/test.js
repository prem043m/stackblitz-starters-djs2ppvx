const assert = require('assert');
const request = require('supertest');
const app = require('../app.js');
const Tickets = require('../controllers/ticket.js');

describe('Tickets controller', function() {
    let tickets;

    beforeEach(function() {
        tickets = new Tickets();
    });

    it('create() should return a ticket with defaults', function() {
        const t = tickets.create('Printer is broken');
        assert.deepStrictEqual(t, {
            id: 1,
            title: 'Printer is broken',
            priority: 'low',
            status: 'open'
        });
    });

    it('create() should assign incrementing IDs and store tickets', function() {
        tickets.create('A');
        const second = tickets.create('B', 'high');
        assert.strictEqual(second.id, 2);
        assert.strictEqual(second.priority, 'high');
        assert.strictEqual(tickets.list().length, 2);
    });

    it('create() should return null for an empty or non-string title', function() {
        assert.strictEqual(tickets.create(''), null);
        assert.strictEqual(tickets.create('   '), null);
        assert.strictEqual(tickets.create(undefined), null);
        assert.strictEqual(tickets.create(42), null);
        assert.strictEqual(tickets.list().length, 0);
    });

    it('create() should return null for an invalid priority', function() {
        assert.strictEqual(tickets.create('A', 'urgent'), null);
        assert.strictEqual(tickets.nextId, 1);
    });

    it('get() should find a ticket by numeric or string ID', function() {
        tickets.create('A');
        assert.strictEqual(tickets.get(1).title, 'A');
        assert.strictEqual(tickets.get('1').title, 'A');
        assert.strictEqual(tickets.get(99), undefined);
    });

    it('updateStatus() should distinguish not found from invalid', function() {
        tickets.create('A');
        assert.strictEqual(tickets.updateStatus(99, 'closed'), undefined);
        assert.strictEqual(tickets.updateStatus(1, 'done'), null);
        assert.strictEqual(tickets.updateStatus(1, 'in_progress').status, 'in_progress');
    });

    it('remove() should delete a ticket and not reuse its ID', function() {
        tickets.create('A');
        assert.strictEqual(tickets.remove(1), true);
        assert.strictEqual(tickets.remove(1), false);
        assert.strictEqual(tickets.create('B').id, 2);
    });
});

describe('POST /tickets', function() {
    it('should create a new ticket with default priority', function(done) {
        request(app)
            .post('/tickets')
            .send({ title: 'Cannot log in' })
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);

                assert.strictEqual(res.body.id, 1);
                assert.strictEqual(res.body.title, 'Cannot log in');
                assert.strictEqual(res.body.priority, 'low');
                assert.strictEqual(res.body.status, 'open');
                done();
            });
    });

    it('should create a ticket with a given priority and a unique ID', function(done) {
        request(app)
            .post('/tickets')
            .send({ title: 'Server is down', priority: 'high' })
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);

                assert.strictEqual(res.body.id, 2);
                assert.strictEqual(res.body.priority, 'high');
                done();
            });
    });

    it('should reject a missing title', function(done) {
        request(app)
            .post('/tickets')
            .send({ priority: 'high' })
            .expect(400, done);
    });

    it('should reject an invalid priority', function(done) {
        request(app)
            .post('/tickets')
            .send({ title: 'Something', priority: 'urgent' })
            .expect(400, done);
    });
});

describe('GET /tickets', function() {
    it('should return all tickets', function(done) {
        request(app)
            .get('/tickets')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                assert.ok(Array.isArray(res.body));
                assert.strictEqual(res.body.length, 2);
                assert.strictEqual(res.body[0].title, 'Cannot log in');
                done();
            });
    });

    it('should filter tickets by status', function(done) {
        request(app)
            .put('/tickets/2')
            .send({ status: 'closed' })
            .expect(200)
            .end(function(err) {
                if (err) return done(err);

                request(app)
                    .get('/tickets?status=closed')
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        assert.strictEqual(res.body.length, 1);
                        assert.strictEqual(res.body[0].id, 2);
                        assert.strictEqual(res.body[0].status, 'closed');
                        done();
                    });
            });
    });

    it('should reject an invalid status filter', function(done) {
        request(app)
            .get('/tickets?status=done')
            .expect(400, done);
    });
});

describe('GET /tickets/:id', function() {
    it('should return an existing ticket', function(done) {
        request(app)
            .get('/tickets/1')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                assert.strictEqual(res.body.id, 1);
                assert.strictEqual(res.body.title, 'Cannot log in');
                done();
            });
    });

    it('should return 404 for an unknown ticket', function(done) {
        request(app)
            .get('/tickets/999')
            .expect(404, done);
    });
});

describe('PUT /tickets/:id', function() {
    it('should update the status of an existing ticket', function(done) {
        request(app)
            .put('/tickets/1')
            .send({ status: 'in_progress' })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                assert.strictEqual(res.body.id, 1);
                assert.strictEqual(res.body.title, 'Cannot log in');
                assert.strictEqual(res.body.status, 'in_progress');
                done();
            });
    });

    it('should reject an invalid status', function(done) {
        request(app)
            .put('/tickets/1')
            .send({ status: 'done' })
            .expect(400, done);
    });

    it('should return 404 for an unknown ticket', function(done) {
        request(app)
            .put('/tickets/999')
            .send({ status: 'closed' })
            .expect(404, done);
    });
});

describe('DELETE /tickets/:id', function() {
    it('should delete an existing ticket', function(done) {
        request(app)
            .delete('/tickets/2')
            .expect(204)
            .end(function(err) {
                if (err) return done(err);

                request(app)
                    .get('/tickets/2')
                    .expect(404, done);
            });
    });

    it('should return 404 when deleting an unknown ticket', function(done) {
        request(app)
            .delete('/tickets/999')
            .expect(404, done);
    });
});
