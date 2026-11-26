
const express = require('express');
const Tickets = require('../controllers/ticket');

const router = express.Router();

// Create one controller instance for the application
const tickets = new Tickets();

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['open', 'in_progress', 'closed'];

// POST /tickets - Create a ticket
router.post('/', (req, res) => {
    const { title, priority } = req.body || {};

    const ticket = tickets.create(title, priority);

    if (ticket === null) {
        return res.status(400).json({
            error: 'Invalid title or priority'
        });
    }

    return res.status(201).json(ticket);
});

// GET /tickets - List all tickets or filter by status
router.get('/', (req, res) => {
    const { status } = req.query;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status'
        });
    }

    return res.status(200).json(tickets.list(status));
});

// GET /tickets/:id - Get a ticket
router.get('/:id', (req, res) => {
    const ticket = tickets.get(req.params.id);

    if (!ticket) {
        return res.status(404).json({
            error: 'Ticket not found'
        });
    }

    return res.status(200).json(ticket);
});

// PUT /tickets/:id - Update ticket status
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    // Check ticket existence BEFORE validating status
    if (!tickets.get(id)) {
        return res.status(404).json({
            error: 'Ticket not found'
        });
    }

    const updatedTicket = tickets.updateStatus(id, status);

    if (updatedTicket === null) {
        return res.status(400).json({
            error: 'Invalid status'
        });
    }

    return res.status(200).json(updatedTicket);
});

// DELETE /tickets/:id - Delete a ticket
router.delete('/:id', (req, res) => {
    const deleted = tickets.remove(req.params.id);

    if (!deleted) {
        return res.status(404).json({
            error: 'Ticket not found'
        });
    }

    return res.status(204).end();
});

module.exports = router;
