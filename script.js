document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('usageChart');
  const ctx = canvas.getContext('2d');

  // Elements
  const goalCircle = document.querySelector('.goal-circle');
  const goalLitres = document.querySelector('.goal-litres');
  const tipText = document.querySelector('.tip-text p');
  const editBtn = document.querySelector('.edit-goal-btn');
  const goalInput = document.querySelector('.goal-edit-input');
  const saveBtn = document.querySelector('.goal-save-btn');
  const cancelBtn = document.querySelector('.goal-cancel-btn');
  const goalValueRow = document.querySelector('.goal-value-row');

  // State
  let data = null;
  let points = [];
  let hoveredIndex = null;
  let todayIndex = new Date().getDay();
  let selectedIndex = todayIndex;
  let days = [], usage = [], tips = [], goal = 0;
  let originalGoal = 0;

  // Tooltip element
  let tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.background = '#fff';
  tooltip.style.border = '1px solid #3ec6c1';
  tooltip.style.borderRadius = '8px';
  tooltip.style.padding = '4px 10px';
  tooltip.style.fontSize = '0.98rem';
  tooltip.style.color = '#222';
  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = 10;
  document.body.appendChild(tooltip);

  // Fetch data from JSON
  fetch('data.json')
    .then(response => response.json())
    .then(json => {
      data = json;
      days = data.days;
      usage = data.usage;
      tips = data.tips;
      goal = data.goal;
      originalGoal = goal;
      todayIndex = new Date().getDay();
      selectedIndex = todayIndex;
      resizeCanvas();
      updateGoalRing(selectedIndex);
    });

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth - 16;
    canvas.height = 120;
    if (usage.length > 0) drawChart();
  }

  function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background area
    ctx.fillStyle = '#dbe6e6';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    points = [];
    for (let i = 0; i < usage.length; i++) {
      const x = (canvas.width / (usage.length - 1)) * i;
      const y = canvas.height - (usage[i] / 1000) * (canvas.height - 30) - 10;
      points.push({ x, y });
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#3ec6c1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw goal line
    const goalY = canvas.height - (goal / 1000) * (canvas.height - 30) - 10;
    ctx.strokeStyle = '#888';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, goalY);
    ctx.lineTo(canvas.width, goalY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw dots
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = (i === todayIndex) ? '#3ec6c1' : '#fff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3ec6c1';
      ctx.stroke();
      // Highlight hovered dot
      if (i === hoveredIndex) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 9, 0, 2 * Math.PI);
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Highlight selected dot
      if (i === selectedIndex) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 12, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3ec6c1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  function updateGoalRing(index) {
    if (!usage.length) return;
    // Remove any existing SVG
    goalCircle.innerHTML = '<span class="icon-water"></span>';
    // Draw SVG ring
    const size = 56, stroke = 6, radius = (size - stroke) / 2, center = size / 2;
    const used = usage[index];
    const percent = Math.min(used / goal, 1);
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.innerHTML = `
      <circle cx="${center}" cy="${center}" r="${radius}" stroke="#e6e1d9" stroke-width="${stroke}" fill="none"/>
      <circle cx="${center}" cy="${center}" r="${radius}" stroke="#3ec6c1" stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    `;
    goalCircle.prepend(svg);
    // Update text
    goalLitres.textContent = `${used}L / ${goal}L`;
    if (used > goal) {
      goalLitres.style.color = '#e74c3c';
    } else {
      goalLitres.style.color = '#00aaff';
    }
    // Update tip
    tipText.textContent = tips[index];
  }

  function showTooltip(index, event) {
    if (index == null || !usage.length) {
      tooltip.style.display = 'none';
      return;
    }
    tooltip.textContent = `${days[index]}: ${usage[index]}L`;
    // Position tooltip above the point
    const rect = canvas.getBoundingClientRect();
    const point = points[index];
    tooltip.style.left = `${rect.left + point.x - tooltip.offsetWidth / 2 + 8}px`;
    tooltip.style.top = `${rect.top + point.y - 36}px`;
    tooltip.style.display = 'block';
  }

  function getHoveredIndex(mouseX, mouseY) {
    for (let i = 0; i < points.length; i++) {
      const dx = mouseX - points[i].x;
      const dy = mouseY - points[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < 14) {
        return i;
      }
    }
    return null;
  }

  // --- Goal Edit Interactivity ---
  function showGoalEdit() {
    goalInput.value = goal;
    goalInput.style.display = '';
    saveBtn.style.display = '';
    cancelBtn.style.display = '';
    goalLitres.style.display = 'none';
    editBtn.style.display = 'none';
    goalInput.focus();
  }
  function hideGoalEdit() {
    goalInput.style.display = 'none';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    goalLitres.style.display = '';
    editBtn.style.display = '';
  }
  editBtn.addEventListener('click', showGoalEdit);
  cancelBtn.addEventListener('click', function() {
    hideGoalEdit();
  });
  saveBtn.addEventListener('click', function() {
    const newGoal = parseInt(goalInput.value, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      goal = newGoal;
      if (data) data.goal = newGoal;
      updateGoalRing(selectedIndex);
      drawChart();
      // Try to update data.json (will only work if served by a backend that allows PUT/PATCH)
      fetch('data.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 2)
      }).catch(() => {}); // Silently fail if not supported
    }
    hideGoalEdit();
  });
  goalInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveBtn.click();
    if (e.key === 'Escape') cancelBtn.click();
  });

  // --- Chart Interactivity ---
  canvas.addEventListener('mousemove', function (e) {
    if (!usage.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const idx = getHoveredIndex(mouseX, mouseY);
    if (idx !== hoveredIndex) {
      hoveredIndex = idx;
      drawChart();
      showTooltip(idx, e);
    }
  });

  canvas.addEventListener('mouseleave', function () {
    if (!usage.length) return;
    hoveredIndex = null;
    drawChart();
    tooltip.style.display = 'none';
    // Restore to today
    selectedIndex = todayIndex;
    updateGoalRing(selectedIndex);
  });

  // Click to select a day
  canvas.addEventListener('mousedown', function (e) {
    if (!usage.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const idx = getHoveredIndex(mouseX, mouseY);
    if (idx != null) {
      selectedIndex = idx;
      updateGoalRing(selectedIndex);
      drawChart();
    }
  });

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    if (!usage.length) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    const idx = getHoveredIndex(mouseX, mouseY);
    hoveredIndex = idx;
    if (idx != null) {
      selectedIndex = idx;
      updateGoalRing(selectedIndex);
      drawChart();
    }
    showTooltip(idx, e);
  });
  canvas.addEventListener('touchend', function () {
    if (!usage.length) return;
    hoveredIndex = null;
    drawChart();
    tooltip.style.display = 'none';
  });

  window.addEventListener('resize', function () {
    if (!usage.length) return;
    tooltip.style.display = 'none';
    hoveredIndex = null;
    resizeCanvas();
    updateGoalRing(selectedIndex);
  });

  // --- Sign Up Modal Interactivity ---
  const signupBtn = document.querySelector('.signup-btn');
  const signupModal = document.querySelector('.signup-modal');
  const signupName = document.getElementById('signup-name');
  const signupGoal = document.getElementById('signup-goal');
  const signupSaveBtn = document.querySelector('.signup-save-btn');
  const signupCancelBtn = document.querySelector('.signup-cancel-btn');
  const usernameSpan = document.querySelector('.username');

  // Signed-in state
  const headerRow = document.querySelector('.header-row');
  let signedIn = false;
  let signedInName = '';
  let signedInIndicator = null;

  function updateSignedInUI(name) {
    signedIn = true;
    signedInName = name;
    usernameSpan.textContent = name;
    signupBtn.style.display = 'none';
    // Add signed-in indicator if not present
    if (!signedInIndicator) {
      signedInIndicator = document.createElement('span');
      signedInIndicator.className = 'signed-in-indicator';
      signedInIndicator.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="8" r="4" fill="#3ec6c1"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" fill="#3ec6c1"/></svg>Signed in as <strong>${name}</strong> <button class='signout-btn' title='Sign out'>Sign Out</button>`;
      headerRow.appendChild(signedInIndicator);
      // Add sign out event
      signedInIndicator.querySelector('.signout-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        clearSignedInUI();
      });
    } else {
      signedInIndicator.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="8" r="4" fill="#3ec6c1"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" fill="#3ec6c1"/></svg>Signed in as <strong>${name}</strong> <button class='signout-btn' title='Sign out'>Sign Out</button>`;
      signedInIndicator.querySelector('.signout-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        clearSignedInUI();
      });
    }
  }
  function clearSignedInUI() {
    signedIn = false;
    signedInName = '';
    usernameSpan.textContent = '';
    signupBtn.style.display = '';
    if (signedInIndicator) {
      signedInIndicator.remove();
      signedInIndicator = null;
    }
    // Remove from localStorage
    localStorage.removeItem('waterapp_user');
  }
  // On load, check localStorage
  const storedUser = localStorage.getItem('waterapp_user');
  if (storedUser) {
    const userObj = JSON.parse(storedUser);
    updateSignedInUI(userObj.name);
    if (userObj.goal) {
      goal = userObj.goal;
      if (data) data.goal = userObj.goal;
      updateGoalRing(selectedIndex);
      drawChart();
    }
  }

  function showSignupModal() {
    signupModal.style.display = 'flex';
    signupName.value = signedIn ? signedInName : (usernameSpan.textContent || '');
    signupGoal.value = goal;
    setTimeout(() => signupName.focus(), 100);
  }
  function hideSignupModal() {
    signupModal.style.display = 'none';
  }
  signupBtn.addEventListener('click', showSignupModal);
  signupCancelBtn.addEventListener('click', hideSignupModal);
  signupModal.addEventListener('click', function(e) {
    if (e.target === signupModal) hideSignupModal();
  });
  signupSaveBtn.addEventListener('click', function() {
    const name = signupName.value.trim();
    const newGoal = parseInt(signupGoal.value, 10);
    if (!name) {
      signupName.focus();
      return;
    }
    if (isNaN(newGoal) || newGoal < 1) {
      signupGoal.focus();
      return;
    }
    updateSignedInUI(name);
    goal = newGoal;
    if (data) {
      data.goal = newGoal;
      data.username = name;
    }
    // Persist to localStorage
    localStorage.setItem('waterapp_user', JSON.stringify({ name, goal: newGoal }));
    updateGoalRing(selectedIndex);
    drawChart();
    hideSignupModal();
    // Try to update data.json (will only work if served by a backend that allows PUT/PATCH)
    fetch('data.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    }).catch(() => {});
  });
}); 