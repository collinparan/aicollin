// AI Collin - Professional Website JavaScript
// Space AI Pioneer Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation functionality
    initNavigation();
    
    // Form handling
    initFormHandling();
    
    // Smooth scrolling
    initSmoothScrolling();
    
    // Animation observers
    initScrollAnimations();
    
    // Contact form validation
    initFormValidation();
});

// Navigation initialization
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll('.credential-card, .service-card, .credential-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form handling and validation
function initFormHandling() {
    const form = document.querySelector('.inquiry-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }
}

function initFormValidation() {
    const inputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    clearFieldError(field);
    
    // Required field validation
    if (field.required && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required.`;
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // Show error if validation failed
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#ff6b6b';
    field.style.background = '#fff5f5';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.5rem';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '#e2e8f0';
    field.style.background = '#ffffff';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function getFieldLabel(fieldName) {
    const labels = {
        'name': 'Name',
        'email': 'Email',
        'company': 'Company',
        'project-type': 'Project Type',
        'message': 'Message'
    };
    return labels[fieldName] || fieldName;
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        showFormMessage('Please correct the errors above.', 'error');
        return;
    }
    
    // Prepare submission data
    const submissionData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company') || 'Not specified',
        projectType: formData.get('project-type'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        source: 'aicollin.com'
    };
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending Inquiry...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual endpoint)
    simulateFormSubmission(submissionData)
        .then(response => {
            if (response.success) {
                showFormMessage('Thank you for your inquiry! Collin will review your message and respond within 24 hours.', 'success');
                form.reset();
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showFormMessage('There was an error sending your inquiry. Please try again or contact us directly.', 'error');
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
}

function simulateFormSubmission(data) {
    // In a real implementation, this would send to your backend
    // For now, we'll simulate a successful submission
    return new Promise((resolve) => {
        console.log('Form submission data:', data);
        
        // Store in localStorage for demonstration
        const submissions = JSON.parse(localStorage.getItem('inquiries') || '[]');
        submissions.push(data);
        localStorage.setItem('inquiries', JSON.stringify(submissions));
        
        setTimeout(() => {
            resolve({ success: true, message: 'Inquiry submitted successfully' });
        }, 1500);
    });
}

function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.padding = '1rem';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.marginBottom = '1rem';
    messageDiv.style.fontWeight = '500';
    
    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
    
    // Insert at the top of the form
    const form = document.querySelector('.inquiry-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Additional interactive features
function initSpaceAnimations() {
    // Enhanced space station animation on scroll
    const spaceStation = document.querySelector('.space-station');
    
    if (spaceStation) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            spaceStation.style.transform = `translateY(${parallax}px) rotate(${scrolled * 0.1}deg)`;
        });
    }
}

// Stats counter animation
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
}

function animateNumber(element) {
    const text = element.textContent;
    if (text.includes('+')) {
        const number = parseInt(text);
        let current = 0;
        const increment = number / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 50);
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initSpaceAnimations();
    initStatsCounter();
});

// Console welcome message for developers
console.log(`
🚀 AI Collin - Space AI Pioneer
================================

Interested in the code? This website showcases:
- Space-grade CSS animations
- Professional responsive design  
- Modern JavaScript interactions
- Performance-optimized loading

Built by the engineer who put the first LLM in space.
Contact: Professional inquiries welcome at aicollin.com

Want to work together? Let's build something amazing! 🛰️
`);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        handleFormSubmission,
        showFormMessage
    };
}