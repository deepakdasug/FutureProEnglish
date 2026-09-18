const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const rootDirectory = __dirname;
const dataFile = path.join(rootDirectory, 'data', 'records.json');
const port = 8000;

async function readRecords() {
    return JSON.parse(await fs.readFile(dataFile, 'utf8'));
}

async function writeRecords(records) {
    await fs.writeFile(dataFile, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function publicPerson(person) {
    const { password, ...safePerson } = person;
    return safePerson;
}

function createStudentId(students) {
    const highestId = students.reduce((highest, student) => {
        const match = String(student.id || '').match(/^STU-(\d+)$/);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    return `STU-${String(highestId + 1).padStart(3, '0')}`;
}

function createManagementId(managementPersons) {
    const highestId = managementPersons.reduce((highest, person) => {
        const match = String(person.id || '').match(/^MNG-(\d+)$/);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    return `MNG-${String(highestId + 1).padStart(3, '0')}`;
}

async function readRequestBody(request) {
    let body = '';
    for await (const chunk of request) body += chunk;
    return body ? JSON.parse(body) : {};
}

async function handleApi(request, response) {
    if (request.method === 'GET' && request.url === '/api/students') {
        const records = await readRecords();
        return sendJson(response, 200, { students: records.students.map(publicPerson) });
    }

    if (request.method === 'GET' && request.url === '/api/management-data') {
        const records = await readRecords();
        return sendJson(response, 200, {
            students: records.students.map(publicPerson),
            managementPersons: records.managementPersons.map(publicPerson)
        });
    }

    if (request.method === 'POST' && request.url === '/api/enrollments') {
        const enrollment = await readRequestBody(request);
        const records = await readRecords();
        const savedEnrollment = {
            id: enrollment.id || createStudentId(records.students),
            ...enrollment,
            submissionDate: enrollment.submissionDate || new Date().toISOString()
        };
        records.students.push(savedEnrollment);
        await writeRecords(records);
        return sendJson(response, 201, { enrollment: savedEnrollment });
    }

    if (request.method === 'POST' && request.url === '/api/authenticate') {
        const credentials = await readRequestBody(request);
        const records = await readRecords();
        const people = credentials.accountType === 'management'
            ? records.managementPersons
            : records.students;
        const normalizedIdentifier = String(credentials.identifier || '').trim().toLocaleLowerCase();
        const normalizedPhone = String(credentials.identifier || '').replace(/\D/g, '');
        const person = people.find(candidate => {
            const candidatePhone = String(candidate.phone || candidate.phoneNumber || '').replace(/\D/g, '');
            const matchesIdentifier = credentials.method === 'phone'
                ? candidatePhone.endsWith(normalizedPhone)
                : String(candidate.email || '').toLocaleLowerCase() === normalizedIdentifier;
            return matchesIdentifier && candidate.password === credentials.password;
        });

        return sendJson(response, 200, { person: person ? publicPerson(person) : null });
    }

    if (request.method === 'POST' && request.url === '/api/management-persons') {
        const person = await readRequestBody(request);
        const records = await readRecords();
        const savedPerson = {
            id: createManagementId(records.managementPersons),
            name: person.name,
            phone: person.phone,
            email: person.email,
            password: person.password,
            title: person.title
        };
        records.managementPersons.push(savedPerson);
        await writeRecords(records);
        return sendJson(response, 201, { person: publicPerson(savedPerson) });
    }

    return sendJson(response, 404, { error: 'API route not found' });
}

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml'
};

async function serveStatic(request, response) {
    const requestedPath = decodeURIComponent(request.url.split('?')[0]);
    const relativePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = path.resolve(rootDirectory, `.${relativePath}`);
    if (!filePath.startsWith(rootDirectory)) return sendJson(response, 403, { error: 'Forbidden' });

    try {
        const file = await fs.readFile(filePath);
        response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
        response.end(file);
    } catch (error) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
    }
}

const server = http.createServer(async (request, response) => {
    try {
        if (request.url.startsWith('/api/')) await handleApi(request, response);
        else await serveStatic(request, response);
    } catch (error) {
        console.error(error);
        sendJson(response, 500, { error: 'Server error' });
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Future Pro English running at http://localhost:${port}`);
    console.log(`Mobile preview available at http://192.168.1.148:${port}`);
});
