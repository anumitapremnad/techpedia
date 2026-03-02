// =============================================
//  TECHPEDIA — script.js
//  Navigation · Scroll Reveal · Quiz Engine
//  Feedback Validation · DOM Manipulation
// =============================================

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initScrollReveal();
  setActiveNav();
  setFooterYear();
});

// =============================================
// NAVIGATION
// =============================================
function initNav() {
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', function () {
    mobileMenu.classList.toggle('open');
    var spans = hamburger.querySelectorAll('span');
    var isOpen = mobileMenu.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() { mobileMenu.classList.remove('open'); });
  });
}

function setActiveNav() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .nav-mobile-menu a').forEach(function(a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initScrollReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  els.forEach(function(el) { el.classList.add('hidden'); });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('hidden');
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08 });

  els.forEach(function(el) { observer.observe(el); });
}

// =============================================
// QUIZ ENGINE
// =============================================
function initQuiz(quizId, questions) {
  var container   = document.getElementById(quizId);
  if (!container) return;

  var state = { current: 0, score: 0, answered: false };

  function render() {
    var q = questions[state.current];
    container.innerHTML = '';

    // Progress bar
    var pct = Math.round((state.current / questions.length) * 100);
    var progressWrap = el('div', 'quiz-progress-bar-wrap');
    var progressBar  = el('div', 'quiz-progress-bar');
    progressBar.style.width = pct + '%';
    progressWrap.appendChild(progressBar);
    container.appendChild(progressWrap);

    // Question card
    var qCard = el('div', 'quiz-question active');

    var qNum = el('span', 'quiz-q-num');
    qNum.textContent = 'Question ' + (state.current + 1) + ' of ' + questions.length;

    var qText = el('div', 'quiz-question-text');
    qText.textContent = q.question;

    var opts = el('div', 'quiz-options');
    q.options.forEach(function(opt, i) {
      var btn = el('button', 'quiz-option');
      btn.textContent = opt;
      btn.addEventListener('click', function() {
        if (state.answered) return;
        state.answered = true;
        var correct = (i === q.answer);
        if (correct) state.score++;

        // Style all options
        q.options.forEach(function(_, j) {
          var allBtns = opts.querySelectorAll('.quiz-option');
          allBtns[j].classList.add('disabled');
          if (j === q.answer) allBtns[j].classList.add('correct');
          else if (j === i && !correct) allBtns[j].classList.add('wrong');
        });

        // Feedback
        feedback.textContent = correct ? '✓ Correct! ' + q.explanation : '✗ Not quite. ' + q.explanation;
        feedback.className   = 'quiz-feedback show ' + (correct ? 'correct' : 'wrong');
      });
      opts.appendChild(btn);
    });

    var feedback = el('div', 'quiz-feedback');

    qCard.appendChild(qNum);
    qCard.appendChild(qText);
    qCard.appendChild(opts);
    qCard.appendChild(feedback);
    container.appendChild(qCard);

    // Nav row
    var nav = el('div', 'quiz-nav');
    var progText = el('span', 'quiz-progress-text');
    progText.textContent = 'Score: ' + state.score + ' / ' + questions.length;

    var nextBtn = el('button', 'btn btn-primary');
    nextBtn.textContent = state.current < questions.length - 1 ? 'Next →' : 'See Results';
    nextBtn.addEventListener('click', function() {
      if (!state.answered) return;
      if (state.current < questions.length - 1) {
        state.current++;
        state.answered = false;
        render();
      } else {
        showResult();
      }
    });

    nav.appendChild(progText);
    nav.appendChild(nextBtn);
    container.appendChild(nav);
  }

  function showResult() {
    container.innerHTML = '';
    var res = el('div', 'quiz-result show');
    var pct = Math.round((state.score / questions.length) * 100);

    var score = el('span', 'quiz-result-score');
    score.textContent = state.score + '/' + questions.length;

    var label = el('p', 'quiz-result-label');
    label.textContent = pct + '% correct';

    var msg = el('p', 'quiz-result-msg');
    if (pct === 100)     msg.textContent = '🏆 Perfect score! You\'re a master!';
    else if (pct >= 70)  msg.textContent = '🎉 Great job! Solid understanding.';
    else if (pct >= 40)  msg.textContent = '📖 Good effort! Review the content and try again.';
    else                 msg.textContent = '💡 Keep studying — you\'ll get there!';

    var retry = el('button', 'btn btn-primary');
    retry.textContent = '↺ Try Again';
    retry.addEventListener('click', function() {
      state.current = 0; state.score = 0; state.answered = false;
      render();
    });

    res.appendChild(score);
    res.appendChild(label);
    res.appendChild(msg);
    res.appendChild(retry);
    container.appendChild(res);
  }

  render();
}

// Helper — create element with class
function el(tag, className) {
  var e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

// =============================================
// FEEDBACK FORM VALIDATION
// =============================================
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v)  { return /^[0-9]{10}$/.test(v.replace(/[\s\-\(\)]/g,'')); }

function showFieldError(id, msg) {
  var f = document.getElementById(id);
  var e = document.getElementById(id + 'Err');
  if (f) { f.classList.add('error'); f.classList.remove('success'); }
  if (e) { e.textContent = msg; e.classList.add('visible'); }
}
function clearFieldError(id) {
  var f = document.getElementById(id);
  var e = document.getElementById(id + 'Err');
  if (f) { f.classList.remove('error'); f.classList.add('success'); }
  if (e) { e.classList.remove('visible'); }
}
function showAlert(id, type, msg) {
  var a = document.getElementById(id);
  if (!a) return;
  a.className = 'alert alert-' + type + ' visible';
  a.textContent = msg;
  setTimeout(function() { a.classList.remove('visible'); }, 5000);
}

function validateFeedback(e) {
  e.preventDefault();
  var ok = true;

  var name    = document.getElementById('fbName');
  var email   = document.getElementById('fbEmail');
  var phone   = document.getElementById('fbPhone');
  var subject = document.getElementById('fbSubject');
  var message = document.getElementById('fbMessage');
  var rating  = document.querySelector('input[name="rating"]:checked');

  if (!name || name.value.trim().length < 2) {
    showFieldError('fbName', 'Please enter your name.'); ok = false;
  } else { clearFieldError('fbName'); }

  if (!email || !isValidEmail(email.value.trim())) {
    showFieldError('fbEmail', 'Enter a valid email address.'); ok = false;
  } else { clearFieldError('fbEmail'); }

  if (phone && phone.value.trim() && !isValidPhone(phone.value.trim())) {
    showFieldError('fbPhone', 'Enter a valid 10-digit phone number.'); ok = false;
  } else if (phone) { clearFieldError('fbPhone'); }

  if (!subject || subject.value === '') {
    showFieldError('fbSubject', 'Please select a subject.'); ok = false;
  } else { clearFieldError('fbSubject'); }

  if (!message || message.value.trim().length < 10) {
    showFieldError('fbMessage', 'Message must be at least 10 characters.'); ok = false;
  } else { clearFieldError('fbMessage'); }

  if (!rating) {
    var rErr = document.getElementById('ratingErr');
    if (rErr) { rErr.textContent = 'Please select a rating.'; rErr.classList.add('visible'); }
    ok = false;
  } else {
    var rErr = document.getElementById('ratingErr');
    if (rErr) rErr.classList.remove('visible');
  }

  if (ok) {
    showAlert('fbAlert', 'success', '✓ Thank you! Your feedback has been received.');
    e.target.reset();
    document.querySelectorAll('#feedbackForm .success').forEach(function(el) { el.classList.remove('success'); });
  } else {
    showAlert('fbAlert', 'error', '✗ Please fix the highlighted fields.');
  }
  return false;
}

// Char counter
function updateCharCount(el) {
  var count = el.value.length;
  var counter = document.getElementById('charCount');
  if (counter) counter.textContent = count;
  if (count > 500) el.value = el.value.substring(0, 500);
}

// ── Footer year ──
function setFooterYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
