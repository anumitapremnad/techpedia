// =============================================
//  TECHPEDIA — script.js
//  Navigation · Scroll Reveal · Quiz Engine
//  Feedback Validation · DOM Manipulation
// =============================================

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', function () { // Waits for the full HTML to load before running any JS
  initNav();          // Sets up the hamburger mobile menu
  initScrollReveal(); // Sets up scroll-triggered fade-in animations
  setActiveNav();     // Highlights the current page's nav link
  setFooterYear();    // Inserts the current year into the footer
});

// =============================================
// NAVIGATION
// =============================================
function initNav() { // Controls the hamburger menu open/close behaviour on mobile
  var hamburger = document.getElementById('hamburger');   // Gets the hamburger button by its ID
  var mobileMenu = document.getElementById('mobileMenu'); // Gets the mobile dropdown menu by its ID
  if (!hamburger || !mobileMenu) return; // Safety check — stops if elements don't exist on this page

  hamburger.addEventListener('click', function () { // Listens for a click on the hamburger icon
    mobileMenu.classList.toggle('open'); // Adds 'open' class if closed, removes it if open — toggles menu
    var spans = hamburger.querySelectorAll('span'); // Gets all 3 bar elements inside the hamburger button
    var isOpen = mobileMenu.classList.contains('open'); // Checks if the menu is now open (true/false)
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : ''; // Rotates top bar to form top of X
    spans[1].style.opacity   = isOpen ? '0' : ''; // Hides middle bar when menu opens
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : ''; // Rotates bottom bar to form bottom of X
  });

  mobileMenu.querySelectorAll('a').forEach(function(link) { // Loops through all links inside mobile menu
    link.addEventListener('click', function() { mobileMenu.classList.remove('open'); }); // Closes menu when any link is clicked
  });
}

function setActiveNav() { // Highlights the nav link that matches the current page
  var page = window.location.pathname.split('/').pop() || 'index.html'; // Gets current filename from URL e.g. 'dns.html'
  document.querySelectorAll('.nav-menu a, .nav-mobile-menu a').forEach(function(a) { // Loops through all nav links
    if (a.getAttribute('href') === page) a.classList.add('active'); // Adds 'active' class if link matches current page
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initScrollReveal() { // Animates elements into view as the user scrolls down the page
  var els = document.querySelectorAll('.reveal'); // Gets all elements with the 'reveal' class
  if (!els.length) return; // If no reveal elements exist on this page, stop
  els.forEach(function(el) { el.classList.add('hidden'); }); // Initially hides all reveal elements (opacity 0, shifted down)

  var observer = new IntersectionObserver(function(entries) { // Creates observer that watches when elements enter the viewport
    entries.forEach(function(entry) { // Loops through each observed element
      if (entry.isIntersecting) { // Checks if element has scrolled into the visible screen area
        entry.target.classList.remove('hidden'); // Removes hidden class to trigger CSS fade-in
        entry.target.classList.add('visible');   // Adds visible class which completes the animation
      }
    });
  }, { threshold: 0.08 }); // Triggers when at least 8% of the element is visible

  els.forEach(function(el) { observer.observe(el); }); // Tells observer to start watching every reveal element
}

// =============================================
// QUIZ ENGINE
// =============================================
function initQuiz(quizId, questions) { // Reusable quiz function — takes container ID and array of question objects
  var container = document.getElementById(quizId); // Finds the HTML div where the quiz will be built
  if (!container) return; // Safety check — stops if container doesn't exist

  var state = { current: 0, score: 0, answered: false }; // Tracks current question index, score, and if answered

  function render() { // Builds and displays the current question on screen
    var q = questions[state.current]; // Gets the current question object from the array
    container.innerHTML = ''; // Clears previous question content from the container

    // Progress bar
    var pct = Math.round((state.current / questions.length) * 100); // Calculates percentage of quiz completed
    var progressWrap = el('div', 'quiz-progress-bar-wrap'); // Creates the grey background track for the bar
    var progressBar  = el('div', 'quiz-progress-bar');       // Creates the crimson filled progress bar
    progressBar.style.width = pct + '%'; // Sets bar width to match completion percentage
    progressWrap.appendChild(progressBar); // Places filled bar inside the track
    container.appendChild(progressWrap);   // Adds progress bar to quiz container

    // Question card
    var qCard = el('div', 'quiz-question active'); // Creates the question card and marks it active (visible)

    var qNum = el('span', 'quiz-q-num'); // Creates the "Question X of Y" label
    qNum.textContent = 'Question ' + (state.current + 1) + ' of ' + questions.length; // Sets counter text

    var qText = el('div', 'quiz-question-text'); // Creates the element that shows the question text
    qText.textContent = q.question; // Sets the actual question text from the question object

    var opts = el('div', 'quiz-options'); // Creates container for all answer option buttons
    q.options.forEach(function(opt, i) { // Loops through each answer option
      var btn = el('button', 'quiz-option'); // Creates a button for this option
      btn.textContent = opt; // Sets button text to the option text
      btn.addEventListener('click', function() { // Listens for click on this answer button
        if (state.answered) return; // If already answered, ignore click — prevents double answering
        state.answered = true; // Marks question as answered
        var correct = (i === q.answer); // Checks if clicked option index matches correct answer
        if (correct) state.score++; // Increments score if answer is correct

        // Style all options
        q.options.forEach(function(_, j) { // Loops through all buttons to apply styling
          var allBtns = opts.querySelectorAll('.quiz-option'); // Gets all option buttons
          allBtns[j].classList.add('disabled'); // Disables all buttons after answer selected
          if (j === q.answer) allBtns[j].classList.add('correct'); // Highlights correct answer green
          else if (j === i && !correct) allBtns[j].classList.add('wrong'); // Highlights wrong selection red
        });

        // Feedback
        feedback.textContent = correct ? '✓ Correct! ' + q.explanation : '✗ Not quite. ' + q.explanation; // Shows explanation
        feedback.className   = 'quiz-feedback show ' + (correct ? 'correct' : 'wrong'); // Applies green or red styling
      });
      opts.appendChild(btn); // Adds option button to the options container
    });

    var feedback = el('div', 'quiz-feedback'); // Creates the explanation feedback box

    qCard.appendChild(qNum);      // Adds question counter to card
    qCard.appendChild(qText);     // Adds question text to card
    qCard.appendChild(opts);      // Adds all option buttons to card
    qCard.appendChild(feedback);  // Adds feedback box to card
    container.appendChild(qCard); // Adds complete question card to quiz container

    // Nav row
    var nav = el('div', 'quiz-nav'); // Creates the bottom row with score and Next button
    var progText = el('span', 'quiz-progress-text'); // Creates the score display
    progText.textContent = 'Score: ' + state.score + ' / ' + questions.length; // Sets score text

    var nextBtn = el('button', 'btn btn-primary'); // Creates the Next / See Results button
    nextBtn.textContent = state.current < questions.length - 1 ? 'Next →' : 'See Results'; // Shows Next or See Results
    nextBtn.addEventListener('click', function() { // Listens for click on Next button
      if (!state.answered) return; // Forces user to answer before moving on
      if (state.current < questions.length - 1) { // If more questions remain
        state.current++;        // Move to next question
        state.answered = false; // Reset answered flag for next question
        render();               // Re-render quiz with next question
      } else {
        showResult(); // All questions done — show final result screen
      }
    });

    nav.appendChild(progText);  // Adds score text to nav row
    nav.appendChild(nextBtn);   // Adds Next button to nav row
    container.appendChild(nav); // Adds nav row to quiz container
  }

  function showResult() { // Displays the final result screen after all questions
    container.innerHTML = ''; // Clears the last question
    var res = el('div', 'quiz-result show'); // Creates result card and makes it visible
    var pct = Math.round((state.score / questions.length) * 100); // Calculates final percentage

    var score = el('span', 'quiz-result-score'); // Creates large score display
    score.textContent = state.score + '/' + questions.length; // Shows e.g. "5/7"

    var label = el('p', 'quiz-result-label'); // Creates percentage label
    label.textContent = pct + '% correct'; // Shows percentage

    var msg = el('p', 'quiz-result-msg'); // Creates motivational message
    if (pct === 100)     msg.textContent = '🏆 Perfect score! You\'re a master!';        // 100% message
    else if (pct >= 70)  msg.textContent = '🎉 Great job! Solid understanding.';          // 70%+ message
    else if (pct >= 40)  msg.textContent = '📖 Good effort! Review the content and try again.'; // 40%+ message
    else                 msg.textContent = '💡 Keep studying — you\'ll get there!';       // Below 40% message

    var retry = el('button', 'btn btn-primary'); // Creates Try Again button
    retry.textContent = '↺ Try Again'; // Sets button text
    retry.addEventListener('click', function() { // Listens for click on Try Again
      state.current = 0; state.score = 0; state.answered = false; // Resets all quiz state
      render(); // Restarts quiz from first question
    });

    res.appendChild(score);      // Adds score to result card
    res.appendChild(label);      // Adds percentage to result card
    res.appendChild(msg);        // Adds message to result card
    res.appendChild(retry);      // Adds Try Again button to result card
    container.appendChild(res);  // Adds complete result card to container
  }

  render(); // Starts the quiz by rendering the first question
}

// Helper — create element with class
function el(tag, className) { // Shortcut to create an HTML element with a class — used throughout quiz engine
  var e = document.createElement(tag); // Creates a new HTML element of the given type e.g. 'div', 'button'
  if (className) e.className = className; // Sets the class name on the element
  return e; // Returns the created element to be used by the caller
}

// =============================================
// FEEDBACK FORM VALIDATION
// =============================================
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } // Regex — returns true if value is a valid email format
function isValidPhone(v)  { return /^[0-9]{10}$/.test(v.replace(/[\s\-\(\)]/g,'')); } // Regex — strips symbols then checks for exactly 10 digits

function showFieldError(id, msg) { // Shows a red error message below a specific form field
  var f = document.getElementById(id);         // Gets the form field element
  var e = document.getElementById(id + 'Err'); // Gets its associated error message element
  if (f) { f.classList.add('error'); f.classList.remove('success'); } // Adds red border, removes green border
  if (e) { e.textContent = msg; e.classList.add('visible'); }         // Sets error text and makes it visible
}
function clearFieldError(id) { // Removes error styling from a field and shows green success border
  var f = document.getElementById(id);         // Gets the form field element
  var e = document.getElementById(id + 'Err'); // Gets its error message element
  if (f) { f.classList.remove('error'); f.classList.add('success'); } // Removes red, adds green border
  if (e) { e.classList.remove('visible'); }                           // Hides the error message
}
function showAlert(id, type, msg) { // Shows a success or error banner at the top of the form
  var a = document.getElementById(id); // Gets the alert element
  if (!a) return; // Safety check
  a.className = 'alert alert-' + type + ' visible'; // Sets class to alert-success or alert-error and makes visible
  a.textContent = msg; // Sets the alert message text
  setTimeout(function() { a.classList.remove('visible'); }, 5000); // Auto-hides after 5 seconds
}

function validateFeedback(e) { // Main validation function — runs when user clicks Submit
  e.preventDefault(); // Prevents the form from actually submitting and refreshing the page
  var ok = true; // Validation flag — starts true, set to false if any field fails

  var name    = document.getElementById('fbName');    // Gets the Full Name input
  var email   = document.getElementById('fbEmail');   // Gets the Email input
  var phone   = document.getElementById('fbPhone');   // Gets the Phone input
  var subject = document.getElementById('fbSubject'); // Gets the Subject dropdown
  var message = document.getElementById('fbMessage'); // Gets the Message textarea
  var rating  = document.querySelector('input[name="rating"]:checked'); // Gets selected star rating radio

  if (!name || name.value.trim().length < 2) { // Checks name is at least 2 characters
    showFieldError('fbName', 'Please enter your name.'); ok = false; // Shows error, marks form invalid
  } else { clearFieldError('fbName'); } // Clears error if valid

  if (!email || !isValidEmail(email.value.trim())) { // Checks email matches valid format
    showFieldError('fbEmail', 'Enter a valid email address.'); ok = false; // Shows error
  } else { clearFieldError('fbEmail'); } // Clears error if valid

  if (phone && phone.value.trim() && !isValidPhone(phone.value.trim())) { // Phone optional — only validates if filled
    showFieldError('fbPhone', 'Enter a valid 10-digit phone number.'); ok = false; // Shows error if invalid
  } else if (phone) { clearFieldError('fbPhone'); } // Clears error if empty or valid

  if (!subject || subject.value === '') { // Checks if user selected a subject from dropdown
    showFieldError('fbSubject', 'Please select a subject.'); ok = false; // Shows error
  } else { clearFieldError('fbSubject'); } // Clears error if selected

  if (!message || message.value.trim().length < 10) { // Checks message is at least 10 characters
    showFieldError('fbMessage', 'Message must be at least 10 characters.'); ok = false; // Shows error
  } else { clearFieldError('fbMessage'); } // Clears error if valid

  if (!rating) { // Checks if a star rating was selected
    var rErr = document.getElementById('ratingErr'); // Gets the rating error element
    if (rErr) { rErr.textContent = 'Please select a rating.'; rErr.classList.add('visible'); } // Shows rating error
    ok = false; // Marks form invalid
  } else {
    var rErr = document.getElementById('ratingErr'); // Gets rating error element
    if (rErr) rErr.classList.remove('visible'); // Hides error if rating selected
  }

  if (ok) { // All fields passed validation
    showAlert('fbAlert', 'success', '✓ Thank you! Your feedback has been received.'); // Shows green success banner
    e.target.reset(); // Resets all form fields to empty
    document.querySelectorAll('#feedbackForm .success').forEach(function(el) { el.classList.remove('success'); }); // Removes green borders after reset
  } else {
    showAlert('fbAlert', 'error', '✗ Please fix the highlighted fields.'); // Shows red error banner
  }
  return false; // Prevents any server submission
}

// Char counter
function updateCharCount(el) { // Counts characters in message textarea and enforces 500 char limit
  var count = el.value.length; // Gets current character count
  var counter = document.getElementById('charCount'); // Gets the counter display element
  if (counter) counter.textContent = count; // Updates the counter display
  if (count > 500) el.value = el.value.substring(0, 500); // Trims to 500 chars if exceeded
}

// ── Footer year ──
function setFooterYear() { // Automatically inserts the current year into the footer
  var el = document.getElementById('year'); // Gets the span with id="year"
  if (el) el.textContent = new Date().getFullYear(); // Sets it to the current year e.g. 2026
}
