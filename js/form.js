// Form handling JavaScript for Future Pro English website
// Form validation, submission handling, error messages

// Utility function for Excel compatibility
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

// Global variable to store countries-states data
let countriesStatesData = {};

function normalizeSearchValue(value) {
    return value.trim().toLocaleLowerCase();
}

function filterDatalist(datalist, values, query, emptyLabel) {
    const normalizedQuery = normalizeSearchValue(query);
    const matchingValues = values
        .filter(value => !normalizedQuery || normalizeSearchValue(value).includes(normalizedQuery))
        .sort((firstValue, secondValue) => firstValue.localeCompare(secondValue));

    datalist.innerHTML = `<option value="">${emptyLabel}</option>`;
    matchingValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        datalist.appendChild(option);
    });
}

function findCountryName(value) {
    const normalizedValue = normalizeSearchValue(value);
    return Object.keys(countriesStatesData).find(country => normalizeSearchValue(country) === normalizedValue) || '';
}

// Load countries and states data
async function loadCountriesStates() {
    try {
        const response = await fetch('js/countries-states.json');
        const data = await response.json();
        countriesStatesData = data;
        return data;
    } catch (error) {
        console.error('Error loading countries data:', error);
        return {};
    }
}

// Populate country dropdown
async function populateCountryDropdown() {
    const countryInput = document.getElementById('country');
    const countryDatalist = document.getElementById('countries');
    if (!countryInput || !countryDatalist) return;

    // Load data once and store globally
    if (Object.keys(countriesStatesData).length === 0) {
        countriesStatesData = await loadCountriesStates();
    }

    const countries = Object.keys(countriesStatesData);
    filterDatalist(countryDatalist, countries, '', 'Select Country');

    const updateStateSuggestions = function() {
        filterDatalist(countryDatalist, countries, countryInput.value, 'Select Country');
        const selectedCountry = findCountryName(countryInput.value);
        const stateInput = document.getElementById('state');
        const stateDatalist = document.getElementById('states');
        const stateGroup = document.getElementById('stateGroup');
        const cityGroup = document.getElementById('cityGroup');
        const postalCodeGroup = document.getElementById('postalCodeGroup');
        const addressGroup = document.getElementById('addressGroup');
        
        if (stateInput && stateDatalist && stateGroup && selectedCountry && countriesStatesData[selectedCountry]) {
            filterDatalist(stateDatalist, countriesStatesData[selectedCountry], stateInput.value, 'Select State/Province');
            
            // Show all address fields
            stateGroup.style.display = 'block';
            cityGroup.style.display = 'block';
            postalCodeGroup.style.display = 'block';
            addressGroup.style.display = 'block';
        } else {
            // Hide all address fields except country if no country selected
            if (stateGroup) {
                stateGroup.style.display = 'none';
            }
            if (cityGroup) {
                cityGroup.style.display = 'none';
            }
            if (postalCodeGroup) {
                postalCodeGroup.style.display = 'none';
            }
            if (addressGroup) {
                addressGroup.style.display = 'none';
            }
            if (stateDatalist) {
                stateDatalist.innerHTML = '<option value="">Select State/Province</option>';
            }
        }
    };

    countryInput.addEventListener('input', updateStateSuggestions);
    countryInput.addEventListener('change', updateStateSuggestions);

    const stateInput = document.getElementById('state');
    if (stateInput) {
        stateInput.addEventListener('input', updateStateSuggestions);
    }
}

// Function to populate Date of Birth dropdowns
function populateDateOfBirthDropdowns() {
    const dobDay = document.getElementById('dobDay');
    const dobYear = document.getElementById('dobYear');

    if (dobDay && dobYear) {
        // Clear existing options except the first one
        while (dobDay.children.length > 1) {
            dobDay.removeChild(dobDay.lastChild);
        }
        while (dobYear.children.length > 1) {
            dobYear.removeChild(dobYear.lastChild);
        }
        
        // Populate days (1-31)
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            dobDay.appendChild(option);
        }

        // Populate years (1920 to current year)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1920; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            dobYear.appendChild(option);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Populate dropdowns on page load
    populateDateOfBirthDropdowns();
    populateCountryDropdown();

    // Enrollment form enhancements
    const enrollForm = document.getElementById('enrollForm');
    const submitBtn = document.getElementById('submitBtn');
    const summaryContent = document.getElementById('summaryContent');

    if (enrollForm) {
        // Form validation
        function validateField(field) {
            const isValid = field.checkValidity();
            const formGroup = field.closest('.form-group');
            
            if (formGroup) {
                if (isValid) {
                    field.classList.remove('invalid');
                    field.classList.add('valid');
                } else {
                    field.classList.remove('valid');
                    field.classList.add('invalid');
                }
            }
            
            return isValid;
        }

        function validateForm() {
            const requiredFields = enrollForm.querySelectorAll('[required]');
            let allValid = true;
            
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    allValid = false;
                }
            });
            
            // Check date of birth
            const dobDay = document.getElementById('dobDay');
            const dobMonth = document.getElementById('dobMonth');
            const dobYear = document.getElementById('dobYear');
            const dobError = document.getElementById('dobError');
            
            if (dobDay && dobMonth && dobYear) {
                const dobValid = dobDay.value && dobMonth.value && dobYear.value;
                if (!dobValid) {
                    allValid = false;
                    if (dobError) {
                        dobError.style.display = 'block';
                    }
                } else {
                    if (dobError) {
                        dobError.style.display = 'none';
                    }
                }
            }
            
            // Enable/disable submit button
            if (submitBtn) {
                submitBtn.disabled = !allValid;
            }
            
            return allValid;
        }

        function updateSummary() {
            if (!summaryContent) return;
            
            const formData = new FormData(enrollForm);
            const summaryData = {};
            
            formData.forEach((value, key) => {
                if (value && value.trim() !== '') {
                    summaryData[key] = value;
                }
            });
            
            // Combine date of birth
            if (summaryData.dobDay && summaryData.dobMonth && summaryData.dobYear) {
                summaryData.dateOfBirth = `${summaryData.dobYear}-${summaryData.dobMonth}-${summaryData.dobDay}`;
                delete summaryData.dobDay;
                delete summaryData.dobMonth;
                delete summaryData.dobYear;
            }
            
            // Create readable labels
            const labels = {
                fullName: 'Full Name',
                dateOfBirth: 'Date of Birth',
                gender: 'Gender',
                phoneNumber: 'Phone Number',
                email: 'Email Address',
                country: 'Country',
                state: 'State/Province',
                city: 'City',
                postalCode: 'Postal Code',
                localAddress: 'Local Address',
                schedule: 'Preferred Schedule',
                startDate: 'Preferred Start Date',
                hearAboutUs: 'How did you hear about us',
                englishLevel: 'English Level',
                specialRequirements: 'Special Requirements'
            };
            
            if (Object.keys(summaryData).length === 0) {
                summaryContent.innerHTML = '<p class="summary-placeholder">Complete all sections to see your enrollment summary</p>';
                return;
            }
            
            let summaryHTML = '';
            for (const [key, value] of Object.entries(summaryData)) {
                if (labels[key] && value !== 'on' && key !== 'localAddress') { // Skip checkbox values and optional address
                    summaryHTML += `
                        <div class="summary-item">
                            <div class="summary-label">${labels[key]}</div>
                            <div class="summary-value">${value}</div>
                        </div>
                    `;
                }
                // Only show local address if it has a value
                if (key === 'localAddress' && value && value.trim() !== '') {
                    summaryHTML += `
                        <div class="summary-item">
                            <div class="summary-label">${labels[key]}</div>
                            <div class="summary-value">${value}</div>
                        </div>
                    `;
                }
            }
            
            summaryContent.innerHTML = summaryHTML;
        }

        // Add event listeners for real-time validation (only on submit)
        const inputs = enrollForm.querySelectorAll('input:not([list]):not(#state), select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Clear invalid state when user starts typing
                input.classList.remove('invalid');
                // Don't validate the entire form on input - only validate this specific field
                if (input.value && input.value.trim() !== '') {
                    const isValid = input.checkValidity();
                    if (isValid) {
                        input.classList.add('valid');
                    } else {
                        input.classList.remove('valid');
                    }
                }
                updateSummary();
            });
            
            input.addEventListener('blur', () => {
                // Don't validate on blur - only validate on submit
                // This prevents showing errors when user leaves empty required fields
            });
        });

        // Special handling for country input (datalist)
        const countryInput = document.getElementById('country');
        if (countryInput) {
            countryInput.addEventListener('input', () => {
                countryInput.classList.remove('invalid');
                const countryValue = countryInput.value.trim();
                if (countryValue) {
                    countryInput.classList.add('valid');
                } else {
                    countryInput.classList.remove('valid');
                }
                updateSummary();
            });
        }

        // Special handling for phone country code input (datalist)
        const phoneCountryCode = document.getElementById('phoneCountryCode');
        if (phoneCountryCode) {
            phoneCountryCode.addEventListener('input', () => {
                phoneCountryCode.classList.remove('invalid');
                // Validate that it starts with +
                if (phoneCountryCode.value && phoneCountryCode.value.trim() !== '') {
                    if (phoneCountryCode.value.startsWith('+')) {
                        phoneCountryCode.classList.add('valid');
                    } else {
                        phoneCountryCode.classList.remove('valid');
                    }
                }
                updateSummary();
            });
        }

        // Special handling for state input (datalist)
        const stateInput = document.getElementById('state');
        if (stateInput) {
            stateInput.addEventListener('input', () => {
                stateInput.classList.remove('invalid');
                if (stateInput.value && stateInput.value.trim() !== '') {
                    stateInput.classList.add('valid');
                } else {
                    stateInput.classList.remove('valid');
                }
                updateSummary();
            });
        }

        // Form progress tracking is not used on the current enrollment layout.
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm && formSuccess) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide the form
            contactForm.style.display = 'none';
            
            // Show success message
            formSuccess.classList.add('show');
            
            // Optionally reset the form
            contactForm.reset();
        });
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    const toast = document.getElementById('toast');
    const loginMethod = document.getElementById('loginMethod');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const accountType = document.getElementById('accountType');
    const loginSubtitle = document.getElementById('loginSubtitle');
    const loginRole = document.getElementById('loginRole');

    if (loginForm && toast && loginMethod && loginIdentifier && accountType) {
        accountType.addEventListener('change', function() {
            const isManagementLogin = this.value === 'management';
            if (!this.value) {
                loginSubtitle.textContent = 'Choose your account type to continue';
                loginRole.textContent = 'Choose account type';
                return;
            }

            loginSubtitle.textContent = isManagementLogin
                ? 'Access your Future Pro management portal'
                : 'Access your Future Pro student portal';
            loginRole.textContent = isManagementLogin ? 'Management access' : 'Student access';
        });

        loginMethod.addEventListener('change', function() {
            if (!this.value) {
                loginIdentifier.type = 'text';
                loginIdentifier.placeholder = 'Choose email or phone first';
                return;
            }

            const isPhoneLogin = this.value === 'phone';
            loginIdentifier.type = isPhoneLogin ? 'tel' : 'email';
            loginIdentifier.placeholder = isPhoneLogin ? 'Enter phone number' : 'Enter email address';
        });

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!accountType.value || !loginMethod.value) {
                const toastMessage = toast.querySelector('.toast-message');
                toastMessage.textContent = !accountType.value
                    ? 'Please choose an account type.'
                    : 'Please choose a sign-in method.';
                toast.classList.add('show');
                setTimeout(function() {
                    toast.classList.remove('show');
                }, 3000);
                return;
            }

            const password = document.getElementById('password').value;
            const person = accountType.value === 'management'
                ? await managementDataStore.authenticate(
                    loginIdentifier.value,
                    password,
                    loginMethod.value
                )
                : await enrollmentDataStore.authenticate(
                    loginIdentifier.value,
                    password,
                    loginMethod.value
                );

            const toastMessage = toast.querySelector('.toast-message');
            if (person) {
                const accountLabel = accountType.value === 'management' ? person.title : 'student';
                toastMessage.textContent = `Welcome, ${person.fullName || person.name}. You are signed in as ${accountLabel}.`;
                toast.classList.add('show');
                if (accountType.value === 'management') {
                    sessionStorage.setItem('futureProManagementSession', JSON.stringify(person));
                    window.location.href = 'management.html';
                    return;
                }
                loginForm.reset();
                loginMethod.dispatchEvent(new Event('change'));
            } else {
                toastMessage.textContent = 'Invalid email or phone number and password.';
                toast.classList.add('show');
            }

            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.remove('show');
            }, 3000);
        });
    }

    // Enrollment form handling with Excel export
    const enrollmentFormSubmit = document.getElementById('enrollForm');
    const enrollSuccess = document.getElementById('enrollSuccess');
    const closeEnrollmentModal = document.getElementById('closeEnrollmentModal');
    const returnHomeButton = document.getElementById('returnHomeButton');
    const enrollmentSuccessMessage = document.getElementById('enrollmentSuccessMessage');

    if (enrollmentFormSubmit && enrollSuccess) {
        function closeEnrollmentSuccess() {
            enrollSuccess.hidden = true;
            document.body.classList.remove('modal-open');
        }

        closeEnrollmentModal.addEventListener('click', closeEnrollmentSuccess);
        returnHomeButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        enrollSuccess.addEventListener('click', function(event) {
            if (event.target === enrollSuccess) closeEnrollmentSuccess();
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !enrollSuccess.hidden) closeEnrollmentSuccess();
        });

        enrollmentFormSubmit.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate all required fields first
            const requiredFields = enrollmentFormSubmit.querySelectorAll('[required]');
            let allValid = true;
            let firstInvalidField = null;
            
            requiredFields.forEach(field => {
                // Skip hidden address fields if no country selected
                if (field.id === 'state' || field.id === 'city' || field.id === 'postalCode' || field.id === 'localAddress') {
                    const stateGroup = document.getElementById('stateGroup');
                    if (stateGroup && stateGroup.style.display === 'none') {
                        return; // Skip validation for hidden address fields
                    }
                }
                
                // Skip optional field (localAddress)
                if (field.id === 'localAddress' && !field.hasAttribute('required')) {
                    return;
                }
                
                // Skip state validation if hidden (already handled above, but double-check)
                if (field.id === 'state') {
                    const stateGroup = document.getElementById('stateGroup');
                    if (stateGroup && stateGroup.style.display === 'none') {
                        return;
                    }
                }
                
                const isValid = field.checkValidity();
                const formGroup = field.closest('.form-group');
                
                if (!isValid) {
                    allValid = false;
                    field.classList.add('invalid');
                    if (formGroup) {
                        formGroup.classList.add('invalid');
                    }
                    if (!firstInvalidField) {
                        firstInvalidField = field;
                    }
                } else {
                    field.classList.remove('invalid');
                    if (formGroup) {
                        formGroup.classList.remove('invalid');
                    }
                }
            });
            
            // Check date of birth
            const dobDay = document.getElementById('dobDay');
            const dobMonth = document.getElementById('dobMonth');
            const dobYear = document.getElementById('dobYear');
            
            if (dobDay && dobMonth && dobYear) {
                const dobValid = dobDay.value && dobMonth.value && dobYear.value;
                if (!dobValid) {
                    allValid = false;
                    dobDay.classList.add('invalid');
                    dobMonth.classList.add('invalid');
                    dobYear.classList.add('invalid');
                    if (!firstInvalidField) {
                        firstInvalidField = dobDay;
                    }
                } else {
                    dobDay.classList.remove('invalid');
                    dobMonth.classList.remove('invalid');
                    dobYear.classList.remove('invalid');
                }
            }
            
            // Check country input (datalist validation)
            const countryInput = document.getElementById('country');
            if (countryInput) {
                const countryValue = countryInput.value.trim();
                const matchingCountry = findCountryName(countryValue);
                
                if (countryValue && !matchingCountry) {
                    allValid = false;
                    countryInput.classList.add('invalid');
                    if (!firstInvalidField) {
                        firstInvalidField = countryInput;
                    }
                } else if (countryValue) {
                    countryInput.classList.remove('invalid');
                }
            }
            
            // Check state input (datalist validation)
            const stateInput = document.getElementById('state');
            const stateGroup = document.getElementById('stateGroup');
            if (stateInput && stateGroup && stateGroup.style.display !== 'none') {
                const stateValue = stateInput.value.trim();
                const countryInput = document.getElementById('country');
                const selectedCountry = countryInput ? countryInput.value : '';
                const matchingCountry = findCountryName(selectedCountry);
                
                if (stateValue && matchingCountry && countriesStatesData[matchingCountry]) {
                    const validStates = countriesStatesData[matchingCountry];
                    const stateValid = validStates.some(state => normalizeSearchValue(state) === normalizeSearchValue(stateValue));
                    
                    if (!stateValid) {
                        allValid = false;
                        stateInput.classList.add('invalid');
                        if (!firstInvalidField) {
                            firstInvalidField = stateInput;
                        }
                    } else {
                        stateInput.classList.remove('invalid');
                    }
                } else if (stateValue && stateGroup.style.display !== 'none') {
                    allValid = false;
                    stateInput.classList.add('invalid');
                    if (!firstInvalidField) {
                        firstInvalidField = stateInput;
                    }
                }
            } else if (stateInput && stateGroup && stateGroup.style.display === 'none') {
                // State is hidden, skip validation
            }
            
            // Check phone number format
            const phoneCountryCode = document.getElementById('phoneCountryCode');
            const phoneNumber = document.getElementById('phoneNumber');
            const phoneError = document.getElementById('phoneError');
            
            if (phoneCountryCode && phoneNumber) {
                const countryCodeValid = phoneCountryCode.value && phoneCountryCode.value.trim() !== '' && phoneCountryCode.value.startsWith('+');
                const phoneValid = phoneNumber.value && phoneNumber.value.trim() !== '' && /^\d{6,15}$/.test(phoneNumber.value.replace(/[\s-]/g, ''));
                
                if (!countryCodeValid || !phoneValid) {
                    allValid = false;
                    if (!countryCodeValid) {
                        phoneCountryCode.classList.add('invalid');
                    }
                    if (!phoneValid) {
                        phoneNumber.classList.add('invalid');
                    }
                    if (phoneError) {
                        phoneError.style.display = 'block';
                    }
                    if (!firstInvalidField) {
                        firstInvalidField = countryCodeValid ? phoneNumber : phoneCountryCode;
                    }
                } else {
                    phoneCountryCode.classList.remove('invalid');
                    phoneNumber.classList.remove('invalid');
                    if (phoneError) {
                        phoneError.style.display = 'none';
                    }
                }
            }
            
            // If form is invalid, scroll to first invalid field and stop
            if (!allValid) {
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalidField.focus();
                }
                return;
            }
            
            // Collect form data manually to handle all input types
            const data = {};
            
            // Get all form elements
            const formElements = enrollmentFormSubmit.elements;
            
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                
                // Skip buttons and non-form elements
                if (element.type === 'submit' || element.type === 'button') continue;
                
                // Handle different input types
                if (element.type === 'radio') {
                    if (element.checked) {
                        data[element.name] = element.value;
                    }
                } else if (element.type === 'checkbox') {
                    data[element.name] = element.checked;
                } else if (element.name) {
                    data[element.name] = element.value;
                }
            }
            
            // Combine date of birth fields into a single date string
            if (data.dobDay && data.dobMonth && data.dobYear) {
                data.dateOfBirth = `${data.dobYear}-${data.dobMonth}-${data.dobDay}`;
                delete data.dobDay;
                delete data.dobMonth;
                delete data.dobYear;
            }
            
            // Combine phone country code and phone number
            if (data.phoneCountryCode && data.phoneNumber) {
                data.phoneNumber = `${data.phoneCountryCode} ${data.phoneNumber}`;
                delete data.phoneCountryCode;
            }
            
            // Add timestamp
            data.submissionDate = new Date().toISOString();

            await enrollmentDataStore.save(data);

            try {
                // Hide the form and show success message
                enrollmentFormSubmit.style.display = 'none';
                enrollmentSuccessMessage.textContent = 'Thank you for enrolling, our team will connect with you soon.';
                enrollSuccess.hidden = false;
                document.body.classList.add('modal-open');

                // Reset the form
                enrollmentFormSubmit.reset();
                populateDateOfBirthDropdowns();
                
            } catch (error) {
                console.error('Error saving enrollment:', error);
                alert('There was an error saving your enrollment. Please try again.');
            }
        });
    }
});
