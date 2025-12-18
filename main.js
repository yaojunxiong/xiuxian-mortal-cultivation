const files = {
  quests: 'data/quests.json',
  dialogues: 'data/dialogues.json',
  flags: 'data/flags.json'
};

const dom = {
  questTitle: document.getElementById('quest-title'),
  questGoal: document.getElementById('quest-goal'),
  questConditions: document.getElementById('quest-conditions'),
  questPill: document.getElementById('quest-pill'),
  npcName: document.getElementById('npc-name'),
  npcAvatar: document.getElementById('npc-avatar'),
  npcText: document.getElementById('npc-text'),
  btnNext: document.getElementById('btnNext'),
  yieldBtn: document.getElementById('yield-btn'),
  fightBtn: document.getElementById('fight-btn'),
  areaButtons: document.querySelectorAll('.area'),
  collectBtn: document.getElementById('collect-btn'),
  returnBtn: document.getElementById('return-btn'),
  log: document.getElementById('system-log'),
  locationPill: document.getElementById('location-pill'),
  status: document.getElementById('player-status'),
  bag: document.getElementById('player-bag'),
  summary: document.getElementById('summary-box'),
  rewardPill: document.getElementById('reward-pill'),
  reset: document.getElementById('btnReset'),
  exportBtn: document.getElementById('btnExport'),
  modal: document.getElementById('export-modal'),
  closeModal: document.getElementById('close-modal'),
  exportText: document.getElementById('export-text')
};

const STORAGE_KEY = 'chapter1-progress';
let quests = [];
let dialogues = {};
let flags = {};

const defaultState = {
  activeQuest: 'Q001',
  completed: [],
  location: '山门',
  dialogueIndex: 0,
  herb: 0,
  status: '凡人',
  chapterDone: false,
  branch: null,
  reward: ''
};

let state = loadState();

function loadState() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...defaultState, ...parsed };
  }
  return { ...defaultState };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`无法读取 ${path}`);
  }
  return response.json();
}

function setLog(text) {
  const time = new Date().toLocaleTimeString();
  dom.log.textContent = `[${time}] ${text}`;
}

function currentQuest() {
  return quests.find(q => q.id === state.activeQuest);
}

function renderQuest() {
  const quest = currentQuest();
  if (!quest) return;
  dom.questTitle.textContent = `${quest.id} · ${quest.title}`;
  dom.questGoal.innerHTML = '';
  quest.objectives.forEach(goal => {
    const li = document.createElement('li');
    li.textContent = goal;
    dom.questGoal.appendChild(li);
  });
  dom.questConditions.innerHTML = `触发：${quest.trigger}<br>完成：${quest.completion}`;
  dom.questPill.textContent = state.chapterDone ? '章节已结算' : `进行中：${quest.title}`;
}

function renderStatus() {
  const items = [
    { label: '身份', value: state.status },
    { label: '境界', value: flags.realm || '凡人境' },
    { label: '所在区域', value: state.location },
    { label: '携带功法', value: state.reward || '暂无' }
  ];
  dom.status.innerHTML = items.map(item => `
    <div class="pill">${item.label}：${item.value}</div>
  `).join('');

  const bagList = [
    `灵草：${state.herb} / 3`,
    `外门身份：${state.status}`,
    `章节完成：${state.chapterDone ? '已完成' : '未完成'}`
  ];
  dom.bag.innerHTML = bagList.map(text => `<div>${text}</div>`).join('');
}

function renderDialogue(text) {
  dom.npcText.innerHTML = `<p>${text}</p>`;
}

function npcLinesForQuest(id) {
  switch (id) {
    case 'Q001':
      return dialogues['宗门执事·白须老者'];
    case 'Q002':
      return dialogues['外门弟子·赵三'];
    case 'Q003':
      return dialogues['考核弟子·陈七'];
    default:
      return [];
  }
}

function updateNpcName() {
  const quest = currentQuest();
  if (!quest) return;
  dom.npcName.textContent = quest.npc;
  if (dom.npcAvatar) {
    dom.npcAvatar.setAttribute('title', quest.npc);
  }
}

function handleDialogue() {
  const quest = currentQuest();
  if (!quest) return;
  const lines = npcLinesForQuest(quest.id);
  const line = lines[state.dialogueIndex];
  if (line) {
    renderDialogue(`${quest.npc}：${line}`);
    state.dialogueIndex += 1;
  } else {
    renderDialogue('该说的都说完了。继续完成任务目标吧。');
    if (quest.id === 'Q001') finishQ001();
    if (quest.id === 'Q003') {
      dom.yieldBtn.disabled = false;
      dom.fightBtn.disabled = false;
    }
  }
  saveState();
}

function finishQ001() {
  if (state.completed.includes('Q001')) return;
  state.completed.push('Q001');
  state.status = '外门候补';
  setLog('宗门登记完成，身份更新为外门候补。');
  state.activeQuest = 'Q002';
  state.dialogueIndex = 0;
  saveState();
  renderQuest();
  updateNpcName();
  renderStatus();
}

function checkQ002Completion() {
  if (state.completed.includes('Q002')) return;
  if (state.herb >= 3 && state.location === '外门区') {
    state.completed.push('Q002');
    setLog('灵草已交付，赵三点头认可。');
    state.activeQuest = 'Q003';
    state.dialogueIndex = 0;
    saveState();
    renderQuest();
    updateNpcName();
  }
}

function completeChapter(choice) {
  if (state.chapterDone) return;
  state.branch = choice;
  state.chapterDone = true;
  state.reward = '《清风吐纳》';
  state.completed.push('Q003');
  dom.yieldBtn.disabled = true;
  dom.fightBtn.disabled = true;
  setLog(`你选择了${choice === 'yield' ? '退让' : '硬拼'}，初战考验结束。`);
  renderStatus();
  renderSummary();
  renderQuest();
  saveState();
}

function renderSummary() {
  if (!state.chapterDone) {
    dom.summary.textContent = '完成初战考验后显示奖励与结语。';
    dom.rewardPill.textContent = '未完成';
    return;
  }
  const branchText = state.branch === 'yield'
    ? '嗯，知道退，说明你有命修仙。'
    : '记住这次疼，下次别犯。';
  dom.summary.innerHTML = `
    <p><strong>考核弟子·陈七：</strong>${branchText}</p>
    <p><strong>奖励：</strong>${state.reward} 已收入背包。</p>
    <p><strong>宗门执事：</strong>若你能活过外门三月，再谈修行二字。</p>
  `;
  dom.rewardPill.textContent = '章节完成';
}

function updateButtons() {
  dom.collectBtn.disabled = state.location !== '后山采药区' || state.completed.includes('Q002');
  dom.returnBtn.disabled = state.location !== '后山采药区';
  const atQ003 = state.activeQuest === 'Q003' && state.location === '考核石台';
  dom.yieldBtn.disabled = !atQ003 || state.chapterDone;
  dom.fightBtn.disabled = !atQ003 || state.chapterDone;
}

function enterArea(area) {
  state.location = area;
  dom.locationPill.textContent = area;
  setLog(`你来到了${area}。`);
  if (state.activeQuest === 'Q002' && area === '后山采药区') {
    state.dialogueIndex = 0;
    handleDialogue();
  }
  if (state.activeQuest === 'Q003' && area === '考核石台') {
    state.dialogueIndex = 0;
    handleDialogue();
  }
  updateButtons();
  renderStatus();
  checkQ002Completion();
  saveState();
}

function collectHerb() {
  if (state.location !== '后山采药区') return;
  state.herb = Math.min(state.herb + 1, 5);
  setLog(`采集到一株灵草，当前数量：${state.herb}/3。`);
  renderStatus();
  saveState();
}

function goBackOuter() {
  state.location = '外门区';
  dom.locationPill.textContent = '外门区';
  setLog('返回外门区，准备交付灵草。');
  checkQ002Completion();
  updateButtons();
  renderStatus();
  saveState();
}

function resetProgress() {
  state = { ...defaultState };
  localStorage.removeItem(STORAGE_KEY);
  setLog('进度已重置，重新从宗门山门开始。');
  renderQuest();
  renderStatus();
  renderDialogue('尚未触发对话');
  renderSummary();
  updateButtons();
}

function buildExportText() {
  const parts = quests.map(q => {
    const npcTalk = npcLinesForQuest(q.id).map((line, idx) => `${idx + 1}. ${line}`).join('\n');
    let extra = '';
    if (q.id === 'Q003') {
      extra = '\n【分支台词】\n- 退让：嗯，知道退，说明你有命修仙。\n- 硬拼：记住这次疼，下次别犯。';
    }
    return `${q.id} ${q.title}\n目标：${q.objectives.join(' / ')}\n触发：${q.trigger}\n完成：${q.completion}\n【${q.npc}】\n${npcTalk}${extra}`;
  });
  return parts.join('\n\n');
}

function openExport() {
  const text = buildExportText();
  dom.exportText.value = text;
  dom.modal.setAttribute('aria-hidden', 'false');
}

function closeExport() {
  dom.modal.setAttribute('aria-hidden', 'true');
}

async function bootstrap() {
  try {
    [quests, dialogues, flags] = await Promise.all([
      loadJSON(files.quests),
      loadJSON(files.dialogues),
      loadJSON(files.flags)
    ]);
    updateNpcName();
    renderQuest();
    renderStatus();
    renderSummary();
    updateButtons();
    dom.locationPill.textContent = state.location;
    dom.npcText.textContent = '点击“对话下一句”开始交流。';

    dom.btnNext.addEventListener('click', handleDialogue);
    dom.yieldBtn.addEventListener('click', () => completeChapter('yield'));
    dom.fightBtn.addEventListener('click', () => completeChapter('fight'));
    dom.collectBtn.addEventListener('click', collectHerb);
    dom.returnBtn.addEventListener('click', goBackOuter);
    dom.reset.addEventListener('click', resetProgress);
    dom.exportBtn.addEventListener('click', openExport);
    dom.closeModal.addEventListener('click', closeExport);
    dom.modal.addEventListener('click', (e) => {
      if (e.target === dom.modal) closeExport();
    });

    dom.areaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const area = btn.getAttribute('data-area');
        if (!area) return;
        enterArea(area);
      });
    });
  } catch (err) {
    console.error(err);
    dom.log.textContent = '数据读取失败，请确认 data/*.json 是否存在。';
  }
}

bootstrap();
