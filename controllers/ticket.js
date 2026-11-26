
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['open', 'in_progress', 'closed'];

class Tickets {
    constructor() {
        // In-memory storage for tickets
        this.tickets = [];

        // Keep track of the next unique ID
        this.nextId = 1;
    }

    // Create a new ticket
    create(title, priority) {
        // Validate title
        if (typeof title !== 'string' || title.trim() === '') {
            return null;
        }

        // Default priority
        if (priority === undefined) {
            priority = 'low';
        }

        // Validate priority
        if (!VALID_PRIORITIES.includes(priority)) {
            return null;
        }

        // Create ticket
        const ticket = {
            id: this.nextId++,
            title: title.trim(),
            priority: priority,
            status: 'open'
        };

        // Store and return ticket
        this.tickets.push(ticket);

        return ticket;
    }

    // Return all tickets, optionally filtered by status
    list(status) {
        if (status === undefined) {
            return this.tickets;
        }

        return this.tickets.filter(ticket => ticket.status === status);
    }

    // Get a ticket by ID
    get(id) {
        return this.tickets.find(ticket => ticket.id === Number(id));
    }

    // Update the status of a ticket
    updateStatus(id, status) {
        const ticket = this.get(id);

        if (!ticket) {
            return undefined;
        }

        if (!VALID_STATUSES.includes(status)) {
            return null;
        }

        ticket.status = status;

        return ticket;
    }

    // Delete a ticket
    remove(id) {
        const index = this.tickets.findIndex(
            ticket => ticket.id === Number(id)
        );

        if (index === -1) {
            return false;
        }

        this.tickets.splice(index, 1);
        return true;
    }
}

module.exports = Tickets;
