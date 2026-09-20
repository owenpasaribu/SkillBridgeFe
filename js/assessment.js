/**
 * SkillBridge — logika halaman Skill Assessment.
 * Sudah lewat Api.assessment.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  const questionsRes = await Api.assessment.questions();
  renderAssessment(questionsRes.data);
  document.getElementById('submitAssessment').addEventListener('click', () => submitAssessment(questionsRes.data));
});

function renderAssessment(questions) {
  const list = document.getElementById('assessmentList');
  list.innerHTML = questions.map(q => {
    const optionsHtml = q.options.map(opt => `
      <label class="option-row">
        <input type="radio" name="scenario-${q.skill_id}" value="${opt.value}">
        <span class="text-sm">${opt.label}</span>
      </label>`).join('');

    return `
      <div class="assess-item" data-skill="${q.skill_id}">
        <h4>${q.skill_name}</h4>
        <p class="text-sm text-faint">${q.question || `You are given a task that requires ${q.skill_name}. Which statement best describes your ability?`}</p>
        <div class="option-list">${optionsHtml}</div>
        <div class="confidence-row">
          <span class="text-sm text-faint">Confidence</span>
          <input type="range" min="1" max="5" value="3" data-confidence="${q.skill_id}">
          <span class="text-sm" id="confidenceLabel-${q.skill_id}">3/5</span>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', () => {
      document.getElementById(`confidenceLabel-${slider.dataset.confidence}`).textContent = `${slider.value}/5`;
    });
  });
}

async function submitAssessment(questions) {
  const answers = [];
  let hasUnanswered = false;

  questions.forEach(q => {
    const checked = document.querySelector(`input[name="scenario-${q.skill_id}"]:checked`);
    if (!checked) { hasUnanswered = true; return; }
    const confidence = Number(document.querySelector(`input[data-confidence="${q.skill_id}"]`).value);
    answers.push({ skill_id: q.skill_id, scenario_score: Number(checked.value), confidence });
  });

  if (hasUnanswered) {
    alert('Please answer every scenario before submitting.');
    return;
  }

  const res = await Api.assessment.submit(answers);
  if (res.status !== 200) { alert(res.message); return; }

  document.getElementById('successBanner').classList.add('is-visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => { window.location.href = 'skill-gap.html'; }, 1400);
}
