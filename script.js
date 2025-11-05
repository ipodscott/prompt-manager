// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// PWA Install prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.id = 'installButton';
installButton.className = 'install-button';
installButton.textContent = 'Install App';
installButton.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button
    installButton.style.display = 'block';
});

installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    installButton.style.display = 'none';
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    // Login functionality
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('passwordInput');
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const loginError = document.getElementById('loginError');
    const CORRECT_PASSWORD = 'Password1!';

    // Check if already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showMainContent();
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const enteredPassword = passwordInput.value;
        
        if (enteredPassword === CORRECT_PASSWORD) {
            sessionStorage.setItem('isLoggedIn', 'true');
            showMainContent();
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    });

    function showMainContent() {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';
        initializeApp();
    }

    // Main app functionality
    function initializeApp() {
        const promptForm = document.getElementById('promptForm');
        const promptsList = document.getElementById('promptsList');
        const applicationFilter = document.getElementById('applicationFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const clearFiltersBtn = document.getElementById('clearFilters');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        let allPrompts = [];
        let editingPromptId = null;

        // Logout functionality
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('isLoggedIn');
                location.reload();
            }
        });

        // Add install button to header
        const header = document.querySelector('header');
        if (header && installButton) {
            header.appendChild(installButton);
        }

        loadPrompts();

    promptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        savePrompt();
    });

    cancelBtn.addEventListener('click', function() {
        resetForm();
    });

    applicationFilter.addEventListener('change', function() {
        handleApplicationChange();
    });

    categoryFilter.addEventListener('change', function() {
        filterPromptsBySelection();
    });

    clearFiltersBtn.addEventListener('click', function() {
        clearFilters();
    });

    function loadPrompts() {
        showListLoader(true);
        fetch('api.php?action=list')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    allPrompts = data.prompts;
                    populateApplicationDropdown();
                    // Don't display prompts initially
                } else {
                    showMessage('Error loading prompts: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error loading prompts', 'error');
            })
            .finally(() => {
                showListLoader(false);
            });
    }

    function populateApplicationDropdown() {
        const applications = [...new Set(allPrompts.map(p => p.application))].sort();
        
        applicationFilter.innerHTML = '<option value="">Select Application</option>';
        applications.forEach(app => {
            const option = document.createElement('option');
            option.value = app;
            option.textContent = app;
            applicationFilter.appendChild(option);
        });
    }

    function handleApplicationChange() {
        const selectedApp = applicationFilter.value;
        
        if (!selectedApp) {
            categoryFilter.innerHTML = '<option value="">Select Category</option>';
            categoryFilter.disabled = true;
            promptsList.innerHTML = '<div class="no-prompts-message">Please select an application and category to view prompts.</div>';
            return;
        }

        // Get categories for selected application
        const categories = [...new Set(
            allPrompts
                .filter(p => p.application === selectedApp)
                .map(p => p.category)
        )].sort();

        categoryFilter.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        
        categoryFilter.disabled = false;
        promptsList.innerHTML = '<div class="no-prompts-message">Please select a category to view prompts.</div>';
    }

    function filterPromptsBySelection() {
        const selectedApp = applicationFilter.value;
        const selectedCat = categoryFilter.value;

        if (!selectedApp || !selectedCat) {
            promptsList.innerHTML = '<div class="no-prompts-message">Please select both application and category to view prompts.</div>';
            return;
        }

        const filteredPrompts = allPrompts.filter(p => 
            p.application === selectedApp && p.category === selectedCat
        );

        displayPrompts(filteredPrompts);
    }

    function clearFilters() {
        applicationFilter.value = '';
        categoryFilter.value = '';
        categoryFilter.disabled = true;
        promptsList.innerHTML = '<div class="no-prompts-message">Please select an application and category to view prompts.</div>';
    }

    function displayPrompts(prompts) {
        if (prompts.length === 0) {
            promptsList.innerHTML = '<div class="loading">No prompts saved yet. Create your first prompt!</div>';
            return;
        }

        promptsList.innerHTML = prompts.map(prompt => `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="prompt-header" onclick="togglePrompt('${prompt.id}')">
                    <div class="prompt-header-content">
                        <h3>${escapeHtml(prompt.title)}</h3>
                        <p class="prompt-details">${escapeHtml(prompt.details || '')}</p>
                    </div>
                    <span class="prompt-toggle-icon">▶</span>
                </div>
                <div class="prompt-content" id="content-${prompt.id}" style="display: none;">
                    <div class="prompt-meta">
                        <span class="meta-item"><strong>Category:</strong> ${escapeHtml(prompt.category)}</span>
                        <span class="meta-item"><strong>App:</strong> ${escapeHtml(prompt.application)}</span>
                    </div>
                    <div class="prompt-text">${escapeHtml(prompt.prompt)}</div>
                </div>
                <div class="prompt-actions">
                    <button class="btn-edit" onclick="editPrompt('${prompt.id}')">Edit</button>
                    <button class="btn-delete" onclick="deletePrompt('${prompt.id}')">Delete</button>
                    <button class="btn-copy" onclick="copyPrompt('${prompt.id}')">Copy Prompt</button>
                </div>
            </div>
        `).join('');
    }

    function savePrompt() {
        const formData = new FormData(promptForm);
        const promptData = {
            title: formData.get('title'),
            details: formData.get('details'),
            category: formData.get('category'),
            application: formData.get('application'),
            prompt: formData.get('prompt')
        };

        const action = editingPromptId ? 'update' : 'create';
        if (editingPromptId) {
            promptData.id = editingPromptId;
        }

        showButtonLoader(true);
        
        fetch(`api.php?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promptData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showFormFeedback(`Prompt ${action === 'create' ? 'created' : 'updated'} successfully!`, 'success');
                resetForm();
                loadPrompts();
                // Maintain current filter selection after save
                setTimeout(() => {
                    if (applicationFilter.value && categoryFilter.value) {
                        filterPromptsBySelection();
                    }
                }, 100);
            } else {
                showFormFeedback('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showFormFeedback('Error saving prompt', 'error');
        })
        .finally(() => {
            showButtonLoader(false);
        });
    }

    window.editPrompt = function(id) {
        const prompt = allPrompts.find(p => p.id === id);
        if (!prompt) return;

        document.getElementById('promptId').value = prompt.id;
        document.getElementById('title').value = prompt.title;
        document.getElementById('details').value = prompt.details || '';
        document.getElementById('category').value = prompt.category;
        document.getElementById('application').value = prompt.application;
        document.getElementById('prompt').value = prompt.prompt;

        editingPromptId = id;
        submitBtn.querySelector('.btn-text').textContent = 'Update Prompt';
        cancelBtn.style.display = 'inline-block';
        
        document.querySelector('.prompt-form-section h2').textContent = 'Edit Prompt';
        window.scrollTo(0, 0);
    };

    window.deletePrompt = function(id) {
        if (!confirm('Are you sure you want to delete this prompt?')) {
            return;
        }

        fetch(`api.php?action=delete&id=${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Prompt deleted successfully!', 'success');
                loadPrompts();
            } else {
                showMessage('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error deleting prompt', 'error');
        });
    };

    window.copyPrompt = function(id) {
        const prompt = allPrompts.find(p => p.id === id);
        if (!prompt) return;

        navigator.clipboard.writeText(prompt.prompt)
            .then(() => {
                showCopyFeedback(id, 'Prompt copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                showCopyFeedback(id, 'Failed to copy prompt', 'error');
            });
    };

    window.togglePrompt = function(id) {
        const content = document.getElementById(`content-${id}`);
        const card = document.querySelector(`[data-id="${id}"]`);
        const icon = card.querySelector('.prompt-toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.style.transform = 'rotate(90deg)';
            card.classList.add('expanded');
        } else {
            content.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
            card.classList.remove('expanded');
        }
    };


    function resetForm() {
        promptForm.reset();
        document.getElementById('promptId').value = '';
        editingPromptId = null;
        submitBtn.querySelector('.btn-text').textContent = 'Save Prompt';
        cancelBtn.style.display = 'none';
        document.querySelector('.prompt-form-section h2').textContent = 'Create/Edit Prompt';
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    function showCopyFeedback(promptId, message, type) {
        // Remove any existing copy feedback
        const existingFeedback = document.querySelector('.copy-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const promptCard = document.querySelector(`[data-id="${promptId}"]`);
        if (!promptCard) return;

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `copy-feedback ${type}`;
        feedbackDiv.textContent = message;
        
        // Insert feedback after the prompt-actions div
        const actionsDiv = promptCard.querySelector('.prompt-actions');
        actionsDiv.insertAdjacentElement('afterend', feedbackDiv);
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 3000);
    }

    function showFormFeedback(message, type) {
        // Remove any existing form feedback
        const existingFeedback = document.querySelector('.form-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const formActions = document.querySelector('.form-actions');
        if (!formActions) return;

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `form-feedback ${type}`;
        feedbackDiv.textContent = message;
        
        // Insert feedback after the form-actions div
        formActions.insertAdjacentElement('afterend', feedbackDiv);
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 3000);
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function showButtonLoader(show) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        if (show) {
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
            submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    function showListLoader(show) {
        const loader = document.getElementById('listLoader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }
    } // End of initializeApp
});