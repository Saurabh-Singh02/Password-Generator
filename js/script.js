// DOM Elements
const passwordDisplay = document.querySelector("[data-password-display]");
const copyBtn = document.querySelector("[data-copy-btn]");
const copyMsg = document.querySelector("[data-copy-msg]");
const lengthDisplay = document.querySelector("[data-length-display]");
const lengthSlider = document.querySelector("[data-length-slider]");
const uppercaseCb = document.querySelector("#uppercaseCb");
const lowercaseCb = document.querySelector("#lowercaseCb");
const numberCb = document.querySelector("#numberCb");
const symbolCb = document.querySelector("#symbolCb");
const allCheckbox = document.querySelectorAll("input[type=checkbox]");
const indicator = document.querySelector("[data-indicator]");
const strengthText = document.querySelector("[data-strength-text]");
const generateButton = document.querySelector("#generateButton");
const refreshButton = document.querySelector("#refreshButton");

// Character sets
const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "~!@#$%^&*()_-+={[}]|:;<,>.?/";

// Password state
let password = "";
let passwordLength = 10;
let checkCount = 2; // Uppercase and lowercase are checked by default

// Initialize the app
function init() {
    handleSlider();
    countCheckedCb();
    generatePassword();
}

// Update slider display and background
function handleSlider() {
    lengthSlider.value = passwordLength;
    lengthDisplay.innerText = passwordLength;
    
    const min = lengthSlider.min;
    const max = lengthSlider.max;
    const percentage = ((passwordLength - min) * 100) / (max - min);
    lengthSlider.style.background = `linear-gradient(to right, var(--vb-yellow) 0%, var(--vb-yellow) ${percentage}%, var(--dk-violet) ${percentage}%, var(--dk-violet) 100%)`;
}

// Handle slider input
lengthSlider.addEventListener('input', (e) => {
    passwordLength = parseInt(e.target.value);
    handleSlider();
    generatePassword();
});

// Handle checkbox changes
allCheckbox.forEach((checkbox) => {
    checkbox.addEventListener('change', countCheckedCb);
});

function countCheckedCb() {
    checkCount = 0;
    allCheckbox.forEach((checkbox) => {
        if (checkbox.checked) checkCount++;
    });
    
    // Ensure password length is at least equal to checkCount
    if (passwordLength < checkCount) {
        passwordLength = checkCount;
        handleSlider();
    }
    
    generatePassword();
}

// Copy password to clipboard
async function copyContent() {
    try {
        if (!password) {
            copyMsg.textContent = "Generate password first!";
            copyMsg.classList.add("active");
            setTimeout(() => {
                copyMsg.classList.remove("active");
            }, 2000);
            return;
        }
        
        await navigator.clipboard.writeText(password);
        copyMsg.textContent = "Copied!";
        copyMsg.classList.add("active");
        
        setTimeout(() => {
            copyMsg.classList.remove("active");
        }, 2000);
    } catch (err) {
        copyMsg.textContent = "Failed to copy";
        copyMsg.classList.add("active");
        
        setTimeout(() => {
            copyMsg.classList.remove("active");
        }, 2000);
        console.error('Failed to copy: ', err);
    }
}

copyBtn.addEventListener("click", copyContent);

// Generate random numbers
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Character generators
function generateUppercase() {
    return uppercaseLetters.charAt(getRandomInteger(0, uppercaseLetters.length));
}

function generateLowercase() {
    return lowercaseLetters.charAt(getRandomInteger(0, lowercaseLetters.length));
}

function generateNumber() {
    return numbers.charAt(getRandomInteger(0, numbers.length));
}

function generateSymbol() {
    return symbols.charAt(getRandomInteger(0, symbols.length));
}

// Calculate and display password strength
function calcStrength() {
    let hasUpper = uppercaseCb.checked;
    let hasLower = lowercaseCb.checked;
    let hasNumber = numberCb.checked;
    let hasSymbol = symbolCb.checked;
    
    let strength = 0;
    let strengthLabel = "";
    let strengthColor = "";
    
    // Calculate strength score
    if (hasUpper) strength += 1;
    if (hasLower) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSymbol) strength += 1;
    
    // Adjust strength based on length
    if (passwordLength >= 12) strength += 2;
    else if (passwordLength >= 8) strength += 1;
    
    // Determine strength level
    if (strength >= 5) {
        strengthLabel = "Very Strong";
        strengthColor = "var(--success)";
        indicator.style.width = "100%";
    } else if (strength >= 4) {
        strengthLabel = "Strong";
        strengthColor = "var(--success)";
        indicator.style.width = "80%";
    } else if (strength >= 3) {
        strengthLabel = "Medium";
        strengthColor = "var(--warning)";
        indicator.style.width = "60%";
    } else if (strength >= 2) {
        strengthLabel = "Weak";
        strengthColor = "var(--danger)";
        indicator.style.width = "40%";
    } else {
        strengthLabel = "Very Weak";
        strengthColor = "var(--danger)";
        indicator.style.width = "20%";
    }
    
    // Update UI
    strengthText.textContent = strengthLabel;
    strengthText.style.color = strengthColor;
    indicator.style.backgroundColor = strengthColor;
    indicator.style.boxShadow = `0 0 12px 1px ${strengthColor}`;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
}

// Generate password
function generatePassword() {
    // Check if at least one checkbox is selected
    if (checkCount <= 0) {
        passwordDisplay.value = "Select at least one option";
        password = "";
        calcStrength();
        return;
    }
    
    // Ensure password length is sufficient
    if (passwordLength < checkCount) {
        passwordLength = checkCount;
        handleSlider();
    }
    
    // Reset password
    password = "";
    
    // Collect selected character generators
    let checkedCbArray = [];
    if (uppercaseCb.checked) checkedCbArray.push(generateUppercase);
    if (lowercaseCb.checked) checkedCbArray.push(generateLowercase);
    if (numberCb.checked) checkedCbArray.push(generateNumber);
    if (symbolCb.checked) checkedCbArray.push(generateSymbol);
    
    // Add at least one character from each selected type
    for (let i = 0; i < checkedCbArray.length; i++) {
        password += checkedCbArray[i]();
    }
    
    // Fill the rest of the password
    for (let i = 0; i < passwordLength - checkedCbArray.length; i++) {
        let randomIndex = getRandomInteger(0, checkedCbArray.length);
        password += checkedCbArray[randomIndex]();
    }
    
    // Shuffle the password
    password = shuffleArray(Array.from(password));
    
    // Update display
    passwordDisplay.value = password;
    
    // Calculate and display strength
    calcStrength();
}

// Event listeners
generateButton.addEventListener('click', generatePassword);
refreshButton.addEventListener('click', generatePassword);

// Initialize the app
init();
