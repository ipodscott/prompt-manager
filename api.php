<?php
header('Content-Type: application/json');

define('DATA_DIR', __DIR__ . '/data/');

if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        listPrompts();
        break;
    case 'create':
        createPrompt();
        break;
    case 'update':
        updatePrompt();
        break;
    case 'delete':
        deletePrompt();
        break;
    default:
        jsonResponse(false, 'Invalid action');
}

function listPrompts() {
    $prompts = [];
    $files = glob(DATA_DIR . 'prompt_*.json');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $prompt = json_decode($content, true);
        if ($prompt) {
            $prompts[] = $prompt;
        }
    }
    
    usort($prompts, function($a, $b) {
        return $b['created_at'] <=> $a['created_at'];
    });
    
    jsonResponse(true, 'Prompts loaded successfully', ['prompts' => $prompts]);
}

function createPrompt() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!validateInput($input)) {
        jsonResponse(false, 'Invalid input data');
        return;
    }
    
    $id = uniqid('prompt_');
    $timestamp = time();
    
    $prompt = [
        'id' => $id,
        'title' => sanitizeInput($input['title']),
        'details' => isset($input['details']) ? sanitizeInput($input['details']) : '',
        'category' => sanitizeInput($input['category']),
        'application' => sanitizeInput($input['application']),
        'prompt' => sanitizeInput($input['prompt'], false),
        'created_at' => $timestamp,
        'updated_at' => $timestamp
    ];
    
    $filename = DATA_DIR . "prompt_{$timestamp}_{$id}.json";
    
    if (file_put_contents($filename, json_encode($prompt, JSON_PRETTY_PRINT))) {
        jsonResponse(true, 'Prompt created successfully', ['prompt' => $prompt]);
    } else {
        jsonResponse(false, 'Failed to save prompt');
    }
}

function updatePrompt() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!validateInput($input) || empty($input['id'])) {
        jsonResponse(false, 'Invalid input data');
        return;
    }
    
    $existingFile = findPromptFile($input['id']);
    if (!$existingFile) {
        jsonResponse(false, 'Prompt not found');
        return;
    }
    
    $existingData = json_decode(file_get_contents($existingFile), true);
    
    $prompt = [
        'id' => $existingData['id'],
        'title' => sanitizeInput($input['title']),
        'details' => isset($input['details']) ? sanitizeInput($input['details']) : '',
        'category' => sanitizeInput($input['category']),
        'application' => sanitizeInput($input['application']),
        'prompt' => sanitizeInput($input['prompt'], false),
        'created_at' => $existingData['created_at'],
        'updated_at' => time()
    ];
    
    if (file_put_contents($existingFile, json_encode($prompt, JSON_PRETTY_PRINT))) {
        jsonResponse(true, 'Prompt updated successfully', ['prompt' => $prompt]);
    } else {
        jsonResponse(false, 'Failed to update prompt');
    }
}

function deletePrompt() {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        jsonResponse(false, 'Prompt ID required');
        return;
    }
    
    $file = findPromptFile($id);
    if (!$file) {
        jsonResponse(false, 'Prompt not found');
        return;
    }
    
    if (unlink($file)) {
        jsonResponse(true, 'Prompt deleted successfully');
    } else {
        jsonResponse(false, 'Failed to delete prompt');
    }
}

function findPromptFile($id) {
    $files = glob(DATA_DIR . 'prompt_*.json');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $prompt = json_decode($content, true);
        if ($prompt && $prompt['id'] === $id) {
            return $file;
        }
    }
    
    return null;
}

function validateInput($input) {
    return !empty($input['title']) && 
           !empty($input['category']) && 
           !empty($input['application']) && 
           !empty($input['prompt']);
}

function sanitizeInput($input, $stripTags = true) {
    $input = trim($input);
    if ($stripTags) {
        $input = strip_tags($input);
    }
    return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
}

function jsonResponse($success, $message, $data = []) {
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));
    exit;
}