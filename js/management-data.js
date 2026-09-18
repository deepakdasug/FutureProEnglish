const managementDataStore = {
    async authenticate(identifier, password, method) {
        const response = await fetch('/api/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountType: 'management', identifier, password, method })
        });
        if (!response.ok) throw new Error('Unable to authenticate management person.');
        const data = await response.json();
        return data.person;
    }
};