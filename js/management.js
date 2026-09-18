const managementSession = JSON.parse(sessionStorage.getItem('futureProManagementSession') || 'null');
const tableWrapper = document.getElementById('studentDataTableWrapper');
const table = document.querySelector('.student-data-table');
const tableHead = document.getElementById('studentDataTableHead');
const tableBody = document.getElementById('studentDataTableBody');
const emptyState = document.getElementById('studentDataEmpty');
let managementData = { students: [], managementPersons: [] };

if (!managementSession) {
    window.location.href = 'login.html';
}

document.getElementById('managementWelcome').textContent = managementSession
    ? `Signed in as ${managementSession.name} (${managementSession.title})`
    : '';

document.getElementById('logoutManagement').addEventListener('click', () => {
    sessionStorage.removeItem('futureProManagementSession');
    window.location.href = 'login.html';
});

document.getElementById('enrollStudent').addEventListener('click', () => {
    window.location.href = 'enroll.html';
});

const managementPersonForm = document.getElementById('managementPersonForm');
document.getElementById('assignManagementPerson').addEventListener('click', () => {
    managementPersonForm.hidden = false;
});

document.getElementById('cancelManagementPerson').addEventListener('click', () => {
    managementPersonForm.reset();
    managementPersonForm.hidden = true;
});

managementPersonForm.addEventListener('submit', async event => {
    event.preventDefault();
    const response = await fetch('/api/management-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(managementPersonForm)))
    });
    if (response.ok) {
        managementPersonForm.reset();
        managementPersonForm.hidden = true;
        await loadManagementData();
    }
});

async function loadManagementData() {
    const response = await fetch('/api/management-data');
    if (!response.ok) throw new Error('Unable to load management data.');
    managementData = await response.json();
}

function sortedStudents() {
    return [...managementData.students].sort((firstStudent, secondStudent) => {
        const firstId = Number(String(firstStudent.id).replace(/\D/g, ''));
        const secondId = Number(String(secondStudent.id).replace(/\D/g, ''));
        return firstId - secondId || new Date(firstStudent.submissionDate || 0) - new Date(secondStudent.submissionDate || 0);
    });
}

function renderStudents() {
    const students = sortedStudents();
    const preferredColumns = [
        'id', 'fullName', 'dateOfBirth', 'gender', 'phoneNumber', 'email',
        'country', 'state', 'city', 'postalCode', 'localAddress', 'schedule',
        'startDate', 'hearAboutUs', 'englishLevel', 'specialRequirements',
        'submissionDate'
    ];
    const studentColumns = [...new Set(students.flatMap(student => Object.keys(student)))]
        .filter(column => column !== 'password')
        .sort((firstColumn, secondColumn) => {
            const firstIndex = preferredColumns.indexOf(firstColumn);
            const secondIndex = preferredColumns.indexOf(secondColumn);
            return (firstIndex === -1 ? preferredColumns.length : firstIndex) -
                (secondIndex === -1 ? preferredColumns.length : secondIndex);
        });

    tableHead.replaceChildren();
    const headerRow = document.createElement('tr');
    studentColumns.forEach(column => {
        const header = document.createElement('th');
        header.scope = 'col';
        header.textContent = column
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, character => character.toUpperCase());
        headerRow.appendChild(header);
    });
    tableHead.appendChild(headerRow);

    tableBody.replaceChildren();
    students.forEach(student => {
        const row = document.createElement('tr');
        studentColumns.forEach(column => {
            const cell = document.createElement('td');
            const value = student[column];
            cell.textContent = column === 'submissionDate' && value
                ? new Date(value).toLocaleString()
                : value || '-';
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
    table.hidden = students.length === 0;
    emptyState.hidden = students.length > 0;
}

document.getElementById('showStudentData').addEventListener('click', async () => {
    await loadManagementData();
    renderStudents();
    tableWrapper.hidden = false;
});

document.getElementById('downloadStudentData').addEventListener('click', async () => {
    await loadManagementData();
    const exportRows = sortedStudents().map(({ password, ...student }) => student);
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `FuturePro_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
});
