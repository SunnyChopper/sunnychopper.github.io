// Constants
const OPENAI_LOGO = 'https://static.vecteezy.com/system/resources/previews/022/227/364/non_2x/openai-chatgpt-logo-icon-free-png.png';
const ANTHROPIC_LOGO = 'https://www.datocms-assets.com/64244/1685472737-logo.jpg';
const MISTRAL_LOGO = 'https://mistral.ai/images/news/announcing-mistral.png';
const META_LOGO = 'https://pngimg.com/d/meta_PNG1.png';
const GOOGLE_LOGO = 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png';

const USER_INPUT_STEP = 'user-input';
const REQUIREMENT_ANALYSIS_STEP = 'requirement-analysis';
const INITIAL_FILTERING_STEP = 'initial-filtering';
const WEIGHTED_SCORING_STEP = 'weighted-scoring';
const DETAILED_COMPARISON_STEP = 'detailed-comparison';
const RECOMMENDATION_GENERATION_STEP = 'recommendation-generation';
const USER_FEEDBACK_STEP = 'user-feedback';
const RECOMMENDATION_REFINEMENT_STEP = 'recommendation-refinement';

const LOOP_INPUT = 'input';
const LOOP_REFINE = 'refine';

const LOOPS = [LOOP_INPUT, LOOP_REFINE];
const INITIAL_STEP = USER_INPUT_STEP;
const INITIAL_LOOP = LOOP_INPUT;
const STEPS = {
    [USER_INPUT_STEP]: { title: 'User Input Collection', model: 'Gemini 1.5 Flash' },
    [REQUIREMENT_ANALYSIS_STEP]: { title: 'Requirement Analysis', model: 'GPT-4o-mini' },
    [INITIAL_FILTERING_STEP]: { title: 'Initial Model Filtering', model: 'Gemini 1.5 Flash' },
    [WEIGHTED_SCORING_STEP]: { title: 'Weighted Scoring', model: 'Claude 3.5 Sonnet' },
    [DETAILED_COMPARISON_STEP]: { title: 'Detailed Comparison', model: 'GPT-4o' },
    [RECOMMENDATION_GENERATION_STEP]: { title: 'Recommendation Generation', model: 'Claude 3.5 Sonnet' },
    [USER_FEEDBACK_STEP]: { title: 'User Feedback Processing', model: 'Gemini 1.5 Flash' },
    [RECOMMENDATION_REFINEMENT_STEP]: { title: 'Recommendation Refinement', model: 'GPT-4o' }
};
const LOOP_STEPS = {
    [LOOP_INPUT]: [USER_INPUT_STEP, REQUIREMENT_ANALYSIS_STEP, INITIAL_FILTERING_STEP, WEIGHTED_SCORING_STEP, DETAILED_COMPARISON_STEP, RECOMMENDATION_GENERATION_STEP],
    [LOOP_REFINE]: [USER_FEEDBACK_STEP, RECOMMENDATION_REFINEMENT_STEP]
};

let state = {
    currentStep: INITIAL_STEP,
    userInput: {},
    apiResponses: {},
    recommendations: [],
    currentLoop: INITIAL_LOOP
}

// UI Update Functions
function renderUserInputForm() {
    const container = document.getElementById('llm-model-selection-container');
    const supportedModels = [
        { name: 'GPT-4o', logo: OPENAI_LOGO },
        { name: 'GPT-4o-mini', logo: OPENAI_LOGO },
        { name: 'Claude 3.5 Sonnet', logo: ANTHROPIC_LOGO },
        { name: 'Mistral Large 2', logo: MISTRAL_LOGO },
        { name: 'Llama 3.1 405B', logo: META_LOGO },
        { name: 'Llama 3.1 70B', logo: META_LOGO },
        { name: 'Gemini 1.5 Pro', logo: GOOGLE_LOGO },
        { name: 'Gemini 1.5 Flash', logo: GOOGLE_LOGO }
    ];

    const formHTML = `
        <div class="llm-form-container">
            <h2 class="llm-form-title">Describe Your Task</h2>
            <textarea id="user-task-input" class="llm-form-textarea" placeholder="Describe the task you'd like to automate or semi-automate using LLMs..."></textarea>
            <p class="llm-form-subtitle">Supported models:</p>
            <div class="llm-model-badges">
                ${supportedModels.map(model => `
                    <div class="llm-model-badge">
                        <img src="${model.logo}" alt="${model.name} logo" class="llm-model-logo">
                        <span class="llm-model-name">${model.name}</span>
                    </div>
                `).join('')}
            </div>
            <div class="llm-form-buttons">
                <button id="clear-button" class="llm-form-button llm-form-button-secondary">Clear</button>
                <button id="submit-button" class="llm-form-button llm-form-button-primary">Submit</button>
            </div>
        </div>
    `;

    container.innerHTML = formHTML;

    // Add event listeners
    const userTaskInput = document.getElementById('user-task-input');
    const clearButton = document.getElementById('clear-button');
    const submitButton = document.getElementById('submit-button');

    clearButton.addEventListener('click', () => {
        userTaskInput.value = '';
    });

    submitButton.addEventListener('click', () => {
        const userTask = userTaskInput.value.trim();
        if (userTask) {
            // Disable form and show loading spinner
            userTaskInput.disabled = true;
            clearButton.disabled = true;
            submitButton.disabled = true;
            renderLoadingSpinner();

            // Process the user input (you can replace this with your actual processing logic)
            processUserInput(userTask);
        } else {
            alert('Please enter a task description.');
        }
    });

    // Add CSS styles
    const styles = `
        <style>
            .llm-form-container {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .llm-form-title {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .llm-form-subtitle {
                font-size: 14px;
                font-family: 'Arial', sans-serif;
                color: #666;
                margin-bottom: 10px;
            }
            .llm-model-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
            }
            .llm-model-badge {
                display: flex;
                align-items: center;
                background-color: #f0f0f0;
                border-radius: 20px;
                padding: 5px 10px;
                font-size: 12px;
            }
            .llm-model-logo {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            .llm-model-name {
                white-space: nowrap;
            }
            .llm-form-textarea {
                width: 100%;
                height: 150px;
                padding: 10px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
                resize: vertical;
            }
            .llm-form-buttons {
                display: flex;
                justify-content: flex-end;
                margin-top: 10px;
            }
            .llm-form-button {
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                border: none;
                border-radius: 4px;
                margin-left: 10px;
            }
            .llm-form-button-primary {
                background-color: #007bff;
                color: white;
            }
            .llm-form-button-secondary {
                background-color: #6c757d;
                color: white;
            }
            @media (max-width: 600px) {
                .llm-form-container {
                    padding: 10px;
                }
                .llm-form-title {
                    font-size: 20px;
                }
                .llm-form-subtitle {
                    font-size: 12px;
                }
                .llm-model-badges {
                    gap: 5px;
                }
                .llm-model-badge {
                    font-size: 10px;
                }
                .llm-model-logo {
                    width: 15px;
                    height: 15px;
                }
                .llm-form-textarea {
                    height: 120px;
                }
                .llm-form-button {
                    padding: 8px 16px;
                    font-size: 14px;
                }
            }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
}

function renderLoadingSpinner() {
    const container = document.getElementById('llm-model-selection-container');
    const spinnerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p style="font-size: 16px; font-weight: bold; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Processing your request...</p>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', spinnerHTML);

    const spinnerStyles = `
        <style>
            .loading-spinner {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 20px;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', spinnerStyles);
}

function renderProgressBar() {
    const container = document.getElementById('llm-model-selection-container');
    const progressHTML = `
        <div class="progress-container">
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p class="current-step">Current step: User Input Collection</p>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', progressHTML);

    const progressStyles = `
        <style>
            .progress-container {
                margin-top: 20px;
                font-family: Arial, sans-serif;
                max-width: 90vw;
                min-width: 480px;
                margin: 0 auto;
                padding: 20px;
            }
            .progress {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 90vw;
                min-width: 480px;
                height: 20px;
                margin-bottom: 10px;
            }
            .current-step {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', progressStyles);
}

function renderError(errorMessage) {
    const container = document.getElementById('llm-model-selection-container');
    const errorHTML = `
        <div class="error-container">
            <h3 class="error-title">An Error Occurred</h3>
            <p class="error-message">${errorMessage}</p>
            <button id="retry-button" class="llm-form-button llm-form-button-primary">Retry</button>
        </div>
    `;
    container.innerHTML = errorHTML;

    const errorStyles = `
        <style>
            .error-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 90vw;
                min-width: 480px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffebee;
                border: 1px solid #ffcdd2;
                border-radius: 4px;
            }
            .error-title {
                color: #d32f2f;
                margin-top: 0;
            }
            .error-message {
                color: #b71c1c;
            }
            #retry-button {
                margin-top: 15px;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', errorStyles);

    const retryButton = document.getElementById('retry-button');
    retryButton.addEventListener('click', () => {
        // Reset the state and restart the process
        state = {
            currentStep: INITIAL_STEP,
            userInput: {},
            apiResponses: {},
            recommendations: [],
            currentLoop: INITIAL_LOOP
        };
        renderUserInputForm();
    });
}

function renderRecommendations(primaryRecommendation, alternativeRecommendations, finalConsiderations) {
    const container = document.getElementById('llm-model-selection-container');
    const recommendationsHTML = `
        <div class="recommendations-container">
            <h2 class="recommendations-title">Recommendations</h2>
            <div class="primary-recommendation">
                <h3>Primary Recommendation</h3>
                ${renderRecommendationCard(primaryRecommendation, true)}
            </div>
            <div class="alternative-recommendations">
                <h3>Alternative Recommendations</h3>
                <div class="recommendation-grid">
                    ${alternativeRecommendations.map((recommendation, index) => 
                        renderRecommendationCard(recommendation, false, index)
                    ).join('')}
                </div>
            </div>
            <div class="final-considerations">
                <h3>Final Considerations</h3>
                ${renderFinalConsiderations(finalConsiderations)}
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', recommendationsHTML);

    const styles = `
        <style>
            .final-output-structure {
                margin-top: 20px;
            }
            .toggle-json-btn {
                background-color: #f0f0f0;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }
            .toggle-json-btn:hover {
                background-color: #e0e0e0;
            }
            .json-structure {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 15px;
                margin-top: 10px;
                overflow-x: auto;
            }
            .json-structure code {
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
            }
            .recommendations-container {
                font-family: 'Segoe UI', Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .recommendations-title {
                font-size: 28px;
                margin-bottom: 30px;
                text-align: center;
                color: #333;
            }
            .primary-recommendation, .alternative-recommendations, .final-considerations {
                margin-bottom: 40px;
            }
            .recommendation-card, .consideration-card {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 25px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            .recommendation-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }
            .recommendation-card h4, .consideration-card h5 {
                margin-top: 0;
                color: #2c3e50;
                font-size: 22px;
                margin-bottom: 15px;
            }
            .recommendation-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
            }
            .pros-cons {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            .pros, .cons {
                flex-basis: 48%;
            }
            .pros ul, .cons ul {
                padding-left: 20px;
                margin: 10px 0;
            }
            .final-considerations {
                background-color: #f8f9fa;
                border-radius: 12px;
                padding: 30px;
            }
            .refine-button {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 20px;
                transition: background-color 0.3s ease;
            }
            .refine-button:hover {
                background-color: #2980b9;
            }
            .task-accordion {
                margin-bottom: 15px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .task-accordion-btn {
                width: 100%;
                text-align: left;
                padding: 15px;
                background-color: #f8f9fa;
                border: none;
                outline: none;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                transition: background-color 0.3s ease;
            }
            .task-accordion-btn:hover {
                background-color: #e9ecef;
            }
            .task-accordion-content {
                padding: 20px;
                display: none;
            }
            .task-accordion.active .task-accordion-content {
                display: block;
            }
            .io-section {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
            }
            .input-section, .output-section {
                flex-basis: 48%;
            }
            .contract-details {
                margin-top: 10px;
            }
            .contract-details summary {
                cursor: pointer;
                color: #3498db;
                font-weight: bold;
            }
            .contract-details pre {
                background-color: #f1f3f5;
                padding: 15px;
                border-radius: 6px;
                overflow-x: auto;
                margin-top: 10px;
            }
            .contract-details code {
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
            }
            h6 {
                font-size: 18px;
                color: #34495e;
                margin-bottom: 10px;
            }
            @media (max-width: 768px) {
                .recommendations-container {
                    padding: 15px;
                }
                .recommendation-grid {
                    grid-template-columns: 1fr;
                }
                .pros-cons {
                    flex-direction: column;
                }
                .pros, .cons {
                    flex-basis: 100%;
                    margin-bottom: 15px;
                }
                .io-section {
                    flex-direction: column;
                }
                .input-section, .output-section {
                    flex-basis: 100%;
                    margin-bottom: 15px;
                }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);

    // Add event listeners for refine buttons and accordions
    addEventListeners();
}

function renderRecommendationCard(recommendation, isPrimary, index = 0) {
    return `
        <div class="recommendation-card" data-recommendation-type="${isPrimary ? 'primary' : 'alternative'}" data-recommendation-index="${index}">
            <h4>${recommendation.type === 'single-model' ? 'Single Model' : 'Multi-Model'}</h4>
            <p><strong>Models:</strong> ${recommendation.models.join(', ')}</p>
            <p><strong>Justification:</strong> ${recommendation.justification}</p>
            ${!isPrimary ? `
                <div class="pros-cons">
                    <div class="pros">
                        <h5>Pros:</h5>
                        <ul>
                            ${recommendation.pros.map(pro => `<li>${pro}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="cons">
                        <h5>Cons:</h5>
                        <ul>
                            ${recommendation.cons.map(con => `<li>${con}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
            <h5>Workflow:</h5>
            <p><strong>Overview:</strong> ${recommendation.workflow.overview}</p>
            <div class="workflow-tasks">
                ${recommendation.workflow.tasks.map(renderTaskAccordion).join('')}
            </div>
            <h5>Final Output Structure:</h5>
            <div class="final-output-structure">
                <button class="toggle-json-btn">Toggle JSON Structure</button>
                <pre class="json-structure" style="display: none;"><code class="json">${JSON.stringify(JSON.parse(recommendation.final_output_structure), null, 2)}</code></pre>
            </div>
            <button class="refine-button">Refine Recommendation</button>
        </div>
    `;
}

function renderTaskAccordion(task) {
    return `
        <div class="task-accordion">
            <button class="task-accordion-btn">${task.name}</button>
            <div class="task-accordion-content">
                <p><strong>Description:</strong> ${task.description}</p>
                <p><strong>Model:</strong> ${task.model}</p>
                <div class="io-section">
                    <div class="input-section">
                        <h6>Input:</h6>
                        <p>${task.input}</p>
                        <details class="contract-details">
                            <summary>Input Contract</summary>
                            <pre><code class="json">${JSON.stringify(JSON.parse(task.input_contract), null, 2)}</code></pre>
                        </details>
                    </div>
                    <div class="output-section">
                        <h6>Output:</h6>
                        <p>${task.output}</p>
                        <details class="contract-details">
                            <summary>Output Contract</summary>
                            <pre><code class="json">${JSON.stringify(JSON.parse(task.output_contract), null, 2)}</code></pre>
                        </details>
                    </div>
                </div>
                <p><strong>Next Step:</strong> ${task.next_step}</p>
            </div>
        </div>
    `;
}

function renderFinalConsiderations(finalConsiderations) {
    return `
        <div class="consideration-card">
            <h5>Implementation Notes:</h5>
            <p>${finalConsiderations.implementation_notes}</p>
        </div>
        <div class="consideration-card">
            <h5>Potential Challenges:</h5>
            <p>${finalConsiderations.potential_challenges}</p>
        </div>
        <div class="consideration-card">
            <h5>Future Scalability:</h5>
            <p>${finalConsiderations.future_scalability}</p>
        </div>
        <div class="consideration-card">
            <h5>Innovative Ideas:</h5>
            <ul>
                ${finalConsiderations.innovative_ideas.map(idea => `<li>${idea}</li>`).join('')}
            </ul>
        </div>
    `;
}

function addEventListeners() {
    // Add event listeners for refine buttons
    const refineButtons = document.querySelectorAll('.refine-button');
    refineButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.recommendation-card');
            const recommendationType = card.dataset.recommendationType;
            const recommendationIndex = card.dataset.recommendationIndex;
            handleRefinement(recommendationType, recommendationIndex);
        });
    });

    // Add event listeners for accordions
    const accordionButtons = document.querySelectorAll('.task-accordion-btn');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accordion = button.parentElement;
            accordion.classList.toggle('active');
        });
    });

    // Add event listeners for JSON structure toggles
    const toggleJsonButtons = document.querySelectorAll('.toggle-json-btn');
    toggleJsonButtons.forEach(button => {
        button.addEventListener('click', () => {
            const jsonStructure = button.nextElementSibling;
            jsonStructure.style.display = jsonStructure.style.display === 'none' ? 'block' : 'none';
        });
    });
}

async function getRefinedRecommendation(recommendationType, recommendationIndex, feedback) {
    // This function should call your LLM API to get the refined recommendation
    // For now, we'll return a mock response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                type: 'single-model',
                models: ['GPT-4'],
                justification: 'Based on your feedback, we\'ve adjusted the recommendation...',
                workflow: 'Updated workflow based on feedback...',
                pros: ['Improved accuracy', 'Better aligned with project goals'],
                cons: ['Slightly higher cost']
            });
        }, 2000);
    });
}

function updateRecommendationCard(recommendationType, recommendationIndex, refinedRecommendation) {
    const selector = recommendationType === 'primary' 
        ? '.primary-recommendation .recommendation-card' 
        : `.alternative-recommendations .recommendation-card[data-recommendation-index="${recommendationIndex}"]`;
    
    const card = document.querySelector(selector);
    if (card) {
        card.innerHTML = `
            <h4>${refinedRecommendation.type === 'single-model' ? 'Single Model' : 'Multi-Model'}</h4>
            <p><strong>Models:</strong> ${refinedRecommendation.models.join(', ')}</p>
            <p><strong>Justification:</strong> ${refinedRecommendation.justification}</p>
            <p><strong>Workflow:</strong> ${refinedRecommendation.workflow}</p>
            <div class="pros-cons">
                <div class="pros">
                    <h5>Pros:</h5>
                    <ul>
                        ${refinedRecommendation.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h5>Cons:</h5>
                    <ul>
                        ${refinedRecommendation.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <button class="refine-button">Refine Recommendation</button>
        `;
    }
}

function addToRefinementHistory(refinedRecommendation) {
    const historyContainer = document.getElementById('refinement-history');
    const historyItem = document.createElement('details');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <summary>Refinement ${historyContainer.children.length + 1}</summary>
        <div>
            <p><strong>Models:</strong> ${refinedRecommendation.models.join(', ')}</p>
            <p><strong>Justification:</strong> ${refinedRecommendation.justification}</p>
            <p><strong>Workflow:</strong> ${refinedRecommendation.workflow}</p>
            <div class="pros-cons">
                <div class="pros">
                    <h5>Pros:</h5>
                    <ul>
                        ${refinedRecommendation.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h5>Cons:</h5>
                    <ul>
                        ${refinedRecommendation.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    historyContainer.prepend(historyItem);
}

renderUserInputForm();

function stopLoadingSpinner() {
    // Stop showing the loading spinner
    const spinner = document.querySelector('.loading-spinner');
    const progressContainer = document.querySelector('.progress-container');
    if (spinner) {
        spinner.remove();
    }
    if (progressContainer) {
        progressContainer.remove();
    }
}

// Input Handlers
async function processUserInput(userTask) {
    let modelInputJson = {};
    let modelInputJsonString = '';
    const loopSteps = LOOP_STEPS[LOOP_INPUT].length + 1;
    let currentStep = 0;
    if (loopSteps > 1) {
        renderProgressBar();
    }

    function updateProgressBar(step, stepName) {
        currentStep = step;
        const progressPercentage = (currentStep / loopSteps) * 100;
        const progressBar = document.querySelector('.progress-bar');
        const currentStepElement = document.querySelector('.current-step');

        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
        currentStepElement.textContent = `Current step: ${stepName}`;
    }

    // 1. User Input Collection
    updateProgressBar(1, STEPS[USER_INPUT_STEP].title);
    const refinedUserInput = await callGemini(GEMINI_1_5_FLASH, userInputSystemPrompt, userTask, true);
    if (!refinedUserInput) {
        stopLoadingSpinner();
        renderError('Error processing user input. Please try again.');
        return;
    }
    console.log(refinedUserInput);

    // 2. Requirement Analysis
    updateProgressBar(2, STEPS[REQUIREMENT_ANALYSIS_STEP].title);
    const requirementsAnalysis = await callOpenAI(OPENAI_GPT_4O_MINI, requirementAnalysisSystemPrompt, refinedUserInput, true);
    if (!requirementsAnalysis) {
        stopLoadingSpinner();
        renderError('Error processing requirements analysis. Please try again.');
        return;
    }
    console.log(requirementsAnalysis);
    
    let prioritizedCharacteristics;
    let additionalConsiderations;
    try {
        const parsedRequirementsAnalysis = JSON.parse(requirementsAnalysis);
        prioritizedCharacteristics = parsedRequirementsAnalysis.prioritized_characteristics;
        additionalConsiderations = parsedRequirementsAnalysis.additional_considerations;
    } catch (error) {
        console.error('Error parsing requirements analysis:', error);
        stopLoadingSpinner();
        renderError('Error parsing requirements analysis. Please try again.');
        return;
    }

    // 3. Initial Model Filtering
    updateProgressBar(3, STEPS[INITIAL_FILTERING_STEP].title);
    modelInputJson = {
        prioritized_characteristics: prioritizedCharacteristics,
        additional_considerations: additionalConsiderations,
        model_dataset: modelDataset
    };
    modelInputJsonString = JSON.stringify(modelInputJson);
    const initialModelFiltering = await callOpenAI(OPENAI_GPT_4O_MINI, initialModelFilteringSystemPrompt, modelInputJsonString, true);
    if (!initialModelFiltering) {
        stopLoadingSpinner();
        renderError('Error processing initial model filtering. Please try again.');
        return;
    }
    console.log(initialModelFiltering);

    let topThreeModels;
    let eliminatedModels;
    try {
        const parsedInitialModelFiltering = JSON.parse(initialModelFiltering);
        topThreeModels = parsedInitialModelFiltering.top_3_models;
        eliminatedModels = parsedInitialModelFiltering.eliminated_models;
    } catch (error) {
        console.error('Error parsing initial model filtering:', error);
        stopLoadingSpinner();
        renderError('Error parsing initial model filtering. Please try again.');
        return;
    }
    
    // 4. Weighted Scoring
    updateProgressBar(4, STEPS[WEIGHTED_SCORING_STEP].title);
    modelInputJson = {
        prioritized_characteristics: prioritizedCharacteristics,
        top_3_models: topThreeModels,
        model_dataset: modelDataset
    };
    modelInputJsonString = JSON.stringify(modelInputJson);
    const weightedScoring = await callAnthropic(ANTHROPIC_CLAUDE_3_5_SONNET, weightedScoringSystemPrompt, modelInputJsonString, true);
    if (!weightedScoring) {
        stopLoadingSpinner();
        renderError('Error processing weighted scoring. Please try again.');
        return;
    }
    console.log(weightedScoring);

    let characteristicWeights;
    let modelScores;
    let scoringAnalysis;
    try {
        const parsedWeightedScoring = JSON.parse(weightedScoring);
        characteristicWeights = parsedWeightedScoring.characteristic_weights;
        modelScores = parsedWeightedScoring.model_scores;
        scoringAnalysis = parsedWeightedScoring.scoring_analysis;
    } catch (error) {
        console.error('Error parsing weighted scoring:', error);
        stopLoadingSpinner();
        renderError('Error parsing weighted scoring. Please try again.');
        return;
    }

    // 5. Detailed Comparison
    updateProgressBar(5, STEPS[DETAILED_COMPARISON_STEP].title);
    modelInputJson = {
        prioritized_characteristics: prioritizedCharacteristics,
        top_3_models: topThreeModels,
        model_scores: modelScores,
        scoring_analysis: scoringAnalysis
    };
    modelInputJsonString = JSON.stringify(modelInputJson);
    const detailedComparison = await callOpenAI(OPENAI_GPT_4O, detailedComparisonSystemPrompt, modelInputJsonString, true);
    if (!detailedComparison) {
        stopLoadingSpinner();
        renderError('Error processing detailed comparison. Please try again.');
        return;
    }
    console.log(detailedComparison);

    let modelComparisons;
    let comparitiveAnalysis;
    try {
        const parsedDetailedComparison = JSON.parse(detailedComparison);
        modelComparisons = parsedDetailedComparison.model_comparisons;
        comparitiveAnalysis = parsedDetailedComparison.comparitive_analysis;
    } catch (error) {
        console.error('Error parsing detailed comparison:', error);
        stopLoadingSpinner();
        renderError('Error parsing detailed comparison. Please try again.');
        return;
    }

    // 6. Recommendation Generation
    updateProgressBar(6, STEPS[RECOMMENDATION_GENERATION_STEP].title);
    modelInputJson = {
        top_3_models: topThreeModels,
        comparitive_analysis: comparitiveAnalysis,
        user_task: userTask
    };
    modelInputJsonString = JSON.stringify(modelInputJson);
    const recommendationGeneration = await callAnthropic(ANTHROPIC_CLAUDE_3_5_SONNET, recommendationGenerationSystemPrompt, modelInputJsonString, true);
    if (!recommendationGeneration) {
        stopLoadingSpinner();
        renderError('Error processing recommendation generation. Please try again.');
        return;
    }
    console.log(recommendationGeneration);

    let primaryRecommendation;
    let alternativeRecommendations;
    let finalConsiderations;
    try {
        const parsedRecommendationGeneration = JSON.parse(recommendationGeneration);
        primaryRecommendation = parsedRecommendationGeneration.primary_recommendation;
        alternativeRecommendations = parsedRecommendationGeneration.alternative_recommendations;
        finalConsiderations = parsedRecommendationGeneration.final_considerations;
    } catch (error) {
        console.error('Error parsing recommendation generation:', error);
        stopLoadingSpinner();
        renderError('Error parsing recommendation generation. Please try again.');
        return;
    }

    // Show the results
    renderRecommendations(primaryRecommendation, alternativeRecommendations, finalConsiderations);
    stopLoadingSpinner();

    // Re-enable the form
    const userTaskInput = document.getElementById('user-task-input');
    userTaskInput.disabled = false;
    const clearButton = document.getElementById('clear-button');
    clearButton.disabled = false;
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = false;
}

function handleRefinement(recommendationType, recommendationIndex) {
    const modal = document.createElement('div');
    modal.className = 'refinement-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h3>Refine Recommendation</h3>
            <textarea id="refinement-feedback" placeholder="Enter your feedback here..."></textarea>
            <button id="submit-refinement">Submit</button>
            <div id="refinement-history"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalStyles = `
        <style>
            .refinement-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background-color: white;
                padding: 30px;
                border-radius: 12px;
                width: 80%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
            }
            #refinement-feedback {
                width: 100%;
                height: 120px;
                margin-bottom: 20px;
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                resize: vertical;
                transition: border-color 0.3s ease;
            }
            #refinement-feedback:focus {
                outline: none;
                border-color: #007bff;
            }
            #submit-refinement {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s ease;
            }
            #submit-refinement:hover {
                background-color: #0056b3;
            }
            #refinement-history {
                margin-top: 30px;
            }
            .history-item {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            }
            .history-item summary {
                cursor: pointer;
                font-weight: bold;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', modalStyles);

    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const submitButton = document.getElementById('submit-refinement');
    submitButton.addEventListener('click', async () => {
        const feedback = document.getElementById('refinement-feedback').value;
        if (feedback.trim() === '') {
            alert('Please enter your feedback before submitting.');
            return;
        }

        // Show loading indicator
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            // Call the LLM API to get the refined recommendation
            const refinedRecommendation = await getRefinedRecommendation(recommendationType, recommendationIndex, feedback);

            // Update the recommendation card with the new data
            updateRecommendationCard(recommendationType, recommendationIndex, refinedRecommendation);

            // Add the new recommendation to the history
            addToRefinementHistory(refinedRecommendation);

            // Clear the feedback textarea
            document.getElementById('refinement-feedback').value = '';
        } catch (error) {
            console.error('Error refining recommendation:', error);
            alert('An error occurred while refining the recommendation. Please try again.');
        } finally {
            // Reset the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });
}