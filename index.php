<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Prompt Manager</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Prompt Manager">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    
    <!-- iOS Icons -->
    <link rel="apple-touch-icon" href="icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="72x72" href="icons/icon-72x72.png">
    <link rel="apple-touch-icon" sizes="96x96" href="icons/icon-96x96.png">
    <link rel="apple-touch-icon" sizes="144x144" href="icons/icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="192x192" href="icons/icon-192x192.png">
    
    <!-- Android Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192x192.png">
    <link rel="icon" type="image/png" sizes="96x96" href="icons/icon-96x96.png">
    <link rel="icon" type="image/png" sizes="32x32" href="icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icons/icon-16x16.png">
    
    <!-- Manifest -->
    <link rel="manifest" href="manifest.json">
    
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="loginScreen" class="login-container">
        <div class="login-box">
            <h2>AI Prompt Manager</h2>
            <form id="loginForm">
                <div class="form-group">
                    <input type="password" id="passwordInput" placeholder="Enter password" required>
                </div>
                <button type="submit" class="login-btn">Login</button>
                <div id="loginError" class="login-error" style="display: none;">Incorrect password</div>
            </form>
        </div>
    </div>

    <div class="container" id="mainContent" style="display: none;">
        <header>
            <h1>AI Prompt Manager</h1>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        </header>

        <div class="content-wrapper">
            <section class="prompt-form-section">
                <h2>Create/Edit Prompt</h2>
                <form id="promptForm">
                    <input type="hidden" id="promptId" name="promptId">
                    
                    <div class="form-group">
                        <label for="title">Title:</label>
                        <input type="text" id="title" name="title" required>
                    </div>

                    <div class="form-group">
                        <label for="details">Details:</label>
                        <input type="text" id="details" name="details" 
                               placeholder="Brief summary of what this prompt does">
                    </div>

                    <div class="form-group">
                        <label for="category">Category:</label>
                        <input type="text" id="category" name="category" required 
                               placeholder="e.g., Writing, Coding, Analysis">
                    </div>

                    <div class="form-group">
                        <label for="application">Application:</label>
                        <input type="text" id="application" name="application" required 
                               placeholder="e.g., ChatGPT, Claude, Bard">
                    </div>

                    <div class="form-group">
                        <label for="prompt">Prompt:</label>
                        <textarea id="prompt" name="prompt" rows="8" required 
                                  placeholder="Enter your AI prompt here..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" id="submitBtn">
                            <span class="btn-text">Save Prompt</span>
                            <span class="btn-spinner" style="display:none;">⏳ Processing...</span>
                        </button>
                        <button type="button" id="cancelBtn" style="display:none;">Cancel Edit</button>
                    </div>
                </form>
            </section>

            <section class="prompts-list-section">
                <div class="list-header">
                    <h2>Saved Prompts</h2>
                </div>
                
                <div class="filter-container">
                    <div class="filter-group">
                        <label for="applicationFilter">Application:</label>
                        <select id="applicationFilter">
                            <option value="">Select Application</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="categoryFilter">Category:</label>
                        <select id="categoryFilter" disabled>
                            <option value="">Select Category</option>
                        </select>
                    </div>
                    
                    <button id="clearFilters" class="btn-clear">Clear Filters</button>
                </div>
                
                <div id="promptsList" class="prompts-grid">
                    <div class="loading-overlay" id="listLoader" style="display:none;">
                        <div class="spinner-container">
                            <div class="spinner"></div>
                            <p>Loading prompts...</p>
                        </div>
                    </div>
                    <div class="no-prompts-message">
                        Please select an application and category to view prompts.
                    </div>
                </div>
            </section>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>