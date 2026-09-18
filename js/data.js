const enrollmentDataStore = {
    async getAll() {
        const response = await fetch('/api/students');
        if (!response.ok) throw new Error('Unable to load student records.');
        const data = await response.json();
        return data.students || [];
    },

    async save(enrollment) {
        const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollment)
        });
        if (!response.ok) throw new Error('Unable to save student enrollment.');
        const data = await response.json();
        return data.enrollment;
    },

    async authenticate(identifier, password, method) {
        const response = await fetch('/api/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountType: 'student', identifier, password, method })
        });
        if (!response.ok) throw new Error('Unable to authenticate student.');
        const data = await response.json();
        return data.person;
    }
};