const fs = require('fs/promises');
const path = require('path');

const recordsPath = path.join(__dirname, '..', 'data', 'records.json');

function publicPerson(person) {
    const { password, ...safePerson } = person;
    return safePerson;
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
}

async function readRequestBody(request) {
    if (request.body && typeof request.body === 'object') return request.body;

    let body = '';
    for await (const chunk of request) body += chunk;
    return body ? JSON.parse(body) : {};
}

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const credentials = await readRequestBody(request);
        const records = JSON.parse(await fs.readFile(recordsPath, 'utf8'));
        const people = credentials.accountType === 'management'
            ? records.managementPersons
            : credentials.accountType === 'student'
                ? records.students
                : [];
        const identifier = String(credentials.identifier || '').trim();
        const password = String(credentials.password || '');

        if (!identifier || !password || !credentials.method || !people.length) {
            return response.status(200).json({ person: null });
        }

        const normalizedIdentifier = credentials.method === 'phone'
            ? normalizePhone(identifier)
            : normalizeEmail(identifier);
        const person = people.find(candidate => {
            const candidateIdentifier = credentials.method === 'phone'
                ? normalizePhone(candidate.phone || candidate.phoneNumber)
                : normalizeEmail(candidate.email);
            const matchesIdentifier = credentials.method === 'phone'
                ? candidateIdentifier.endsWith(normalizedIdentifier)
                : candidateIdentifier === normalizedIdentifier;
            return matchesIdentifier && candidate.password === password;
        });

        return response.status(200).json({ person: person ? publicPerson(person) : null });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Unable to authenticate account' });
    }
};
