// Load quiz data from external JSON file
async function loadQuizData() {
    try {
        const response = await fetch('quizData.json');
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        document.getElementById('content').innerHTML = `
            <div class="error-text">
                <p>Failed to load quiz data. Please refresh the page or try again later.</p>
            </div>
        `;
    }
}

// Quiz state
let currentStep = 0;
let quizData = null;
let userData = {
    projectScope: "",
    releasePlan: [],
    consumers: [],
    feedbackMethods: [],
    acceptanceCriteria: ""
};

// Initialize the quiz
async function initQuiz() {
    try {
        // Load quiz data
        quizData = await loadQuizData();
        if (!quizData) return;
        
        // Set the quiz title
        document.getElementById('quiz-title').textContent = quizData.title;
        
        // Set total steps
        document.getElementById('total-steps').textContent = quizData.steps.length;
        
        // Render the first step
        renderCurrentStep();
        updateNavButtons();
        updateProgressBar();
        
        // Set up event listeners for navigation buttons
        document.getElementById('back-button').addEventListener('click', function() {
            if (currentStep > 0) {
                currentStep--;
                renderCurrentStep();
                updateNavButtons();
                updateProgressBar();
            }
        });
        
        document.getElementById('continue-button').addEventListener('click', function() {
            if (currentStep < quizData.steps.length - 1) {
                currentStep++;
                renderCurrentStep();
                updateNavButtons();
                updateProgressBar();
                
                // Update button text for the final step
                if (currentStep === quizData.steps.length - 1) {
                    this.innerHTML = 'NEXT LESSON <i class="fas fa-arrow-right"></i>';
                }
            } else {
                // Quiz completed
                alert("Quiz completed! In a real app, this would take you to the next lesson.");
            }
        });
    } catch (error) {
        console.error('Quiz initialization error:', error);
        document.getElementById('content').innerHTML = `
            <div class="error-text">
                <p>An error occurred while initializing the quiz. Please refresh the page.</p>
            </div>
        `;
    }
}

// Render the current step
function renderCurrentStep() {
    const contentDiv = document.getElementById('content');
    const step = quizData.steps[currentStep];
    
    // Update current step number display
    document.getElementById('current-step').textContent = currentStep + 1;
    
    // Clear previous content
    contentDiv.innerHTML = '';
    
    // Render text paragraphs
    if (step.content.text) {
        step.content.text.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        });
    }
    
    // Render image if present
    if (step.content.image) {
        const imgContainer = document.createElement('div');
        imgContainer.style.textAlign = 'center';
        imgContainer.style.margin = '30px 0';
        
        const img = document.createElement('img');
        img.src = step.content.image;
        img.alt = 'Step image';
        img.className = 'quiz-image';
        
        imgContainer.appendChild(img);
        contentDiv.appendChild(imgContainer);
    }
    
    // Render buttons if present
    if (step.content.buttons) {
        const btnContainer = document.createElement('div');
        btnContainer.style.textAlign = 'center';
        
        step.content.buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.id = button.id;
            btn.textContent = button.text;
            btn.className = 'submit-button';
            
            btn.addEventListener('click', function() {
                if (button.action === 'alert') {
                    alert(button.actionData);
                } else if (button.action === 'download') {
                    // In a real app, this would trigger a download
                    alert(`Download would start for: ${button.actionData}`);
                }
            });
            
            btnContainer.appendChild(btn);
        });
        
        contentDiv.appendChild(btnContainer);
    }
    
    // Render drag and drop if present
    if (step.content.dragItems && step.content.dropZones) {
        renderDragAndDrop(contentDiv, step);
    }
    
    // Render sequence drag and drop if present
    if (step.content.dragItems && step.content.sequenceDropZone) {
        renderSequenceDragAndDrop(contentDiv, step);
    }
    
    // Render checkbox options if present
    if (step.content.checkboxItems) {
        renderCheckboxes(contentDiv, step);
    }
    
    // Render radio options if present
    if (step.content.radioItems) {
        renderRadioButtons(contentDiv, step);
    }
    
    // Render sections if present
    if (step.content.sections) {
        renderSections(contentDiv, step.content.sections);
    }
    
    // Render star icon for completion page
    if (step.content.starIcon) {
        const starDiv = document.createElement('div');
        starDiv.className = 'star';
        starDiv.innerHTML = '<i class="fas fa-star"></i>';
        contentDiv.appendChild(starDiv);
    }
    
    // Render download button for completion page
    if (step.content.downloadButton) {
        const button = step.content.downloadButton;
        const downloadBtn = document.createElement('button');
        downloadBtn.id = button.id;
        downloadBtn.className = 'download-button';
        downloadBtn.innerHTML = `${button.text} <i class="fas fa-download"></i>`;
        
        downloadBtn.addEventListener('click', function() {
            if (button.action === 'download') {
                // In a real app, this would trigger a download
                alert(`Download would start for: ${button.actionData}`);
            }
        });
        
        contentDiv.appendChild(downloadBtn);
    }
    
    // Render small text for completion page
    if (step.content.smallText) {
        const smallTextP = document.createElement('p');
        smallTextP.className = 'small-text';
        smallTextP.textContent = step.content.smallText;
        contentDiv.appendChild(smallTextP);
    }
    
    // Add animations and transitions
    setTimeout(() => {
        contentDiv.querySelectorAll('p, .section, .drag-item, .drop-zone').forEach(el => {
            el.style.opacity = '1';
        });
    }, 50);
}

// Render drag and drop functionality
function renderDragAndDrop(container, step) {
    // Use template for drag and drop
    const template = document.getElementById('drag-drop-template');
    const dragDropContent = template.content.cloneNode(true);
    
    const dragItemsContainer = dragDropContent.querySelector('.drag-items-container');
    const dropZone = dragDropContent.querySelector('.drop-zone');
    const headerElement = dragDropContent.querySelector('.green-header');
    const feedbackContainer = dragDropContent.querySelector('.feedback-container');
    
    // Set up header text
    headerElement.textContent = step.content.dropZones[0].headerText;
    
    // Create drag items
    step.content.dragItems.forEach(item => {
        const dragItem = document.createElement('div');
        dragItem.className = 'drag-item';
        dragItem.id = item.id;
        dragItem.textContent = item.text;
        dragItem.draggable = true;
        
        dragItem.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', item.id);
        });
        
        dragItemsContainer.appendChild(dragItem);
    });
    
    // Set up drop zone
    dropZone.id = step.content.dropZones[0].id;
    
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const draggedItemId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(draggedItemId);
        const dropZoneObj = step.content.dropZones[0];
        
        // Check if the answer is correct
        if (draggedItemId === dropZoneObj.correctId) {
            // Clear the drop zone first
            dropZone.innerHTML = '';
            
            // Create a success item
            const successItem = document.createElement('div');
            successItem.className = 'success-item';
            successItem.textContent = draggedItem.textContent;
            dropZone.appendChild(successItem);
            
            // Save the answer to user data
            userData.projectScope = draggedItem.textContent;
            
            // Hide the drag item
            draggedItem.style.display = 'none';
            
            // Show success feedback
            feedbackContainer.innerHTML = `<div class="success-text">${dropZoneObj.feedbackCorrect}</div>`;
            
            // Enable continue button
            document.getElementById('continue-button').disabled = false;
        } else {
            // Show error feedback
            feedbackContainer.innerHTML = `<div class="error-text">${dropZoneObj.feedbackIncorrect}</div>`;
        }
    });
    
    container.appendChild(dragDropContent);
    
    // Disable continue button until correct answer is provided
    document.getElementById('continue-button').disabled = true;
}

// Render sequence drag and drop functionality
function renderSequenceDragAndDrop(container, step) {
    const template = document.getElementById('sequence-template');
    const sequenceContent = template.content.cloneNode(true);
    
    const dragItemsContainer = sequenceContent.querySelector('.drag-items-container');
    const sequenceDropZone = sequenceContent.querySelector('.sequence-drop-zone');
    const headerElement = sequenceContent.querySelector('.green-header');
    const feedbackContainer = sequenceContent.querySelector('.feedback-container');
    
    // Set up header text
    headerElement.textContent = step.content.sequenceDropZone.headerText;
    
    // Create drag items
    step.content.dragItems.forEach(item => {
        const dragItem = document.createElement('div');
        dragItem.className = 'drag-item';
        dragItem.id = item.id;
        dragItem.textContent = item.text;
        dragItem.draggable = true;
        
        dragItem.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', item.id);
        });
        
        dragItemsContainer.appendChild(dragItem);
    });
    
    // Set up sequence drop zone
    sequenceDropZone.id = step.content.sequenceDropZone.id;
    const droppedItems = [];
    
    sequenceDropZone.addEventListener('dragover', e => {
        e.preventDefault();
        sequenceDropZone.classList.add('drag-over');
    });
    
    sequenceDropZone.addEventListener('dragleave', () => {
        sequenceDropZone.classList.remove('drag-over');
    });
    
    sequenceDropZone.addEventListener('drop', e => {
        e.preventDefault();
        sequenceDropZone.classList.remove('drag-over');
        
        const draggedItemId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(draggedItemId);
        
        // Only allow dropping if the item hasn't been dropped already
        if (!droppedItems.includes(draggedItemId)) {
            // Create a success item
            const successItem = document.createElement('div');
            successItem.className = 'success-item';
            successItem.textContent = draggedItem.textContent;
            successItem.setAttribute('data-id', draggedItemId);
            sequenceDropZone.appendChild(successItem);
            
            // Add to dropped items and hide the original
            droppedItems.push(draggedItemId);
            draggedItem.style.display = 'none';
            
            // Check if all items have been dropped
            if (droppedItems.length === step.content.dragItems.length) {
                checkSequence(step, sequenceDropZone, feedbackContainer);
            }
        }
    });
    
    container.appendChild(sequenceContent);
    
    // Disable continue button until correct sequence is provided
    document.getElementById('continue-button').disabled = true;
}

// Check if sequence is correct
function checkSequence(step, sequenceDropZone, feedbackContainer) {
    const dropZoneObj = step.content.sequenceDropZone;
    const correctSequence = dropZoneObj.correctSequence;
    
    // Get current sequence
    const currentSequence = [];
    sequenceDropZone.querySelectorAll('.success-item').forEach(item => {
        currentSequence.push(item.textContent);
    });
    
    // Convert array to string for comparison
    const currentSeqString = currentSequence.join(',');
    const correctSeqString = correctSequence.join(',');
    
    if (currentSeqString === correctSeqString) {
        // Success
        feedbackContainer.innerHTML = `<div class="success-text">${dropZoneObj.feedbackCorrect}</div>`;
        
        // Save the sequence to user data
        userData.releasePlan = [...currentSequence];
        
        // Enable continue button
        document.getElementById('continue-button').disabled = false;
    } else {
        // Error
        feedbackContainer.innerHTML = `<div class="error-text">${dropZoneObj.feedbackIncorrect}</div>`;
        
        // Reset sequence
        setTimeout(() => {
            resetSequence(step, sequenceDropZone);
        }, 1500);
    }
}

// Reset the sequence
function resetSequence(step, sequenceDropZone) {
    // Clear drop zone
    sequenceDropZone.innerHTML = '';
    
    // Show all drag items again
    step.content.dragItems.forEach(item => {
        const dragItem = document.getElementById(item.id);
        dragItem.style.display = 'block';
    });
    
    // Reset dropped items
    droppedItems = [];
}

// Render checkboxes
function renderCheckboxes(container, step) {
    const template = document.getElementById('checkbox-template');
    const checkboxContent = template.content.cloneNode(true);
    
    const checkboxOptions = checkboxContent.querySelector('.checkbox-options');
    const headerElement = checkboxContent.querySelector('.green-header');
    const feedbackContainer = checkboxContent.querySelector('.feedback-container');
    const submitButton = checkboxContent.querySelector('.submit-button');
    
    // Set up header text
    headerElement.textContent = step.content.headerText;
    
    // Create checkboxes
    step.content.checkboxItems.forEach(item => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.id;
        checkbox.dataset.correct = item.correct;
        
        const label = document.createElement('label');
        label.htmlFor = item.id;
        label.textContent = item.text;
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        checkboxOptions.appendChild(checkboxDiv);
    });
    
    // Add event listener to submit button
    submitButton.addEventListener('click', function() {
        checkCheckboxes(step, checkboxOptions, feedbackContainer);
    });
    
    container.appendChild(checkboxContent);
    
    // Disable continue button until correct answer is provided
    document.getElementById('continue-button').disabled = true;
}

// Check checkbox answers
function checkCheckboxes(step, checkboxOptions, feedbackContainer) {
    let allCorrect = true;
    const selectedItems = [];
    
    // Check all checkboxes
    checkboxOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const isChecked = checkbox.checked;
        const shouldBeChecked = checkbox.dataset.correct === 'true';
        
        if (isChecked !== shouldBeChecked) {
            allCorrect = false;
        }
        
        if (isChecked) {
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            selectedItems.push(label.textContent);
        }
    });
    
    if (allCorrect) {
        // Success
        feedbackContainer.innerHTML = `<div class="success-text">${step.content.feedbackCorrect}</div>`;
        
        // Save selected items to user data
        if (step.id === 'consumers') {
            userData.consumers = selectedItems;
        } else if (step.id === 'feedback-methods') {
            userData.feedbackMethods = selectedItems;
        }
        
        // Enable continue button
        document.getElementById('continue-button').disabled = false;
    } else {
        // Error
        feedbackContainer.innerHTML = `<div class="error-text">${step.content.feedbackIncorrect}</div>`;
    }
}

// Render radio buttons
function renderRadioButtons(container, step) {
    const template = document.getElementById('radio-template');
    const radioContent = template.content.cloneNode(true);
    
    const radioOptions = radioContent.querySelector('.radio-options');
    const headerElement = radioContent.querySelector('.green-header');
    const feedbackContainer = radioContent.querySelector('.feedback-container');
    const submitButton = radioContent.querySelector('.submit-button');
    
    // Set up header text
    headerElement.textContent = step.content.headerText;
    
    // Create radio buttons
    const radioName = `radio-group-${step.id}`;
    step.content.radioItems.forEach(item => {
        const radioDiv = document.createElement('div');
        radioDiv.className = 'radio-item';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = item.id;
        radio.name = radioName;
        radio.dataset.correct = item.correct;
        
        const label = document.createElement('label');
        label.htmlFor = item.id;
        label.textContent = item.text;
        
        radioDiv.appendChild(radio);
        radioDiv.appendChild(label);
        radioOptions.appendChild(radioDiv);
    });
    
    // Add event listener to submit button
    submitButton.addEventListener('click', function() {
        checkRadioButtons(step, radioOptions, feedbackContainer);
    });
    
    container.appendChild(radioContent);
    
    // Disable continue button until correct answer is provided
    document.getElementById('continue-button').disabled = true;
}

// Check radio button answers
function checkRadioButtons(step, radioOptions, feedbackContainer) {
    let selectedRadio = radioOptions.querySelector('input[type="radio"]:checked');
    
    if (!selectedRadio) {
        feedbackContainer.innerHTML = `<div class="error-text">Please select an answer.</div>`;
        return;
    }
    
    if (selectedRadio.dataset.correct === 'true') {
        // Success
        feedbackContainer.innerHTML = `<div class="success-text">${step.content.feedbackCorrect}</div>`;
        
        // Save selected item to user data
        const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
        userData.acceptanceCriteria = label.textContent;
        
        // Enable continue button
        document.getElementById('continue-button').disabled = false;
    } else {
        // Error
        feedbackContainer.innerHTML = `<div class="error-text">${step.content.feedbackIncorrect}</div>`;
    }
}

// Render sections
function renderSections(container, sections) {
    sections.forEach(section => {
        const template = document.getElementById('section-template');
        const sectionContent = template.content.cloneNode(true);
        
        const headerElement = sectionContent.querySelector('.green-header');
        const contentBox = sectionContent.querySelector('.content-box');
        
        // Set header text
        headerElement.textContent = section.headerText;
        
        // Add content
        if (section.content) {
            contentBox.textContent = section.content;
        } else if (section.items) {
            section.items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                contentBox.appendChild(div);
            });
        }
        
        container.appendChild(sectionContent);
    });
}

// Update navigation buttons based on current step
function updateNavButtons() {
    const backButton = document.getElementById('back-button');
    const continueButton = document.getElementById('continue-button');
    
    // Disable back button on first step
    backButton.disabled = currentStep === 0;
    
    // Update continue button text on final step
    if (currentStep === quizData.steps.length - 1) {
        continueButton.innerHTML = 'NEXT LESSON <i class="fas fa-arrow-right"></i>';
    } else {
        continueButton.innerHTML = 'التالي <i class="fas fa-arrow-lift"></i>';
    }
    
    // Enable continue button for intro steps and disable for interactive steps
    const currentStepData = quizData.steps[currentStep];
    const hasInteraction = 
        (currentStepData.content.dragItems && (currentStepData.content.dropZones || currentStepData.content.sequenceDropZone)) ||
        currentStepData.content.checkboxItems ||
        currentStepData.content.radioItems;
    
    continueButton.disabled = hasInteraction && !isStepCompleted(currentStepData);
}

// Check if the current step has been completed
function isStepCompleted(step) {
    if (step.id === 'project-scope') {
        return userData.projectScope !== "";
    } else if (step.id === 'release-plan') {
        return userData.releasePlan.length > 0;
    } else if (step.id === 'consumers') {
        return userData.consumers.length > 0;
    } else if (step.id === 'feedback-methods') {
        return userData.feedbackMethods.length > 0;
    } else if (step.id === 'acceptance-criteria') {
        return userData.acceptanceCriteria !== "";
    }
    
    return true; // Non-interactive steps are always "completed"
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = (currentStep / (quizData.steps.length - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', initQuiz);