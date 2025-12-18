const files = {
  profile: 'data/profile.json',
  techniques: 'data/techniques.json',
  expeditions: 'data/expeditions.json',
  resources: 'data/resources.json',
  journal: 'data/journal.json'
};

const dom = {
  profile: document.getElementById('profile'),
  profileStage: document.getElementById('profile-stage'),
  techniques: document.getElementById('technique-list'),
  techniqueCount: document.getElementById('technique-count'),
  expeditions: document.getElementById('expedition'),
  expeditionCount: document.getElementById('expedition-count'),
  resources: document.getElementById('resources'),
  resourceCount: document.getElementById('resource-count'),
  journal: document.getElementById('journal'),
  journalCount: document.getElementById('journal-count'),
  advance: document.getElementById('advance-btn'),
  export: document.getElementById('export-btn')
};

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`无法读取 ${path}`);
  }
  return response.json();
}

function renderProfile(profile) {
  dom.profileStage.textContent = profile.stage;
  const items = [
    { label: '道号', value: profile.title },
    { label: '心法', value: profile.manual },
    { label: '体质', value: profile.constitution },
    { label: '灵根', value: profile.roots.join(' / ') },
    { label: '洞府', value: profile.residence },
    { label: '当前目标', value: profile.focus }
  ];
  dom.profile.innerHTML = items.map(item => `
    <article class="profile-card">
      <p class="eyebrow">${item.label}</p>
      <h3>${item.value}</h3>
    </article>
  `).join('');
}

function renderTechniques(list) {
  dom.techniqueCount.textContent = `${list.length} 条`;
  dom.techniques.innerHTML = list.map(item => `
    <article class="card">
      <span class="tag">${item.tier}</span>
      <h3>${item.name}</h3>
      <p>${item.effect}</p>
      <p class="eyebrow">用时：${item.cycle}</p>
    </article>
  `).join('');
}

function renderExpeditions(list) {
  dom.expeditionCount.textContent = `${list.length} 段`;
  dom.expeditions.innerHTML = list.map(item => `
    <li>
      <p class="eyebrow">${item.time}</p>
      <h3>${item.title}</h3>
      <p>${item.note}</p>
    </li>
  `).join('');
}

function renderResources(list) {
  dom.resourceCount.textContent = `${list.length} 种`;
  dom.resources.innerHTML = list.map(item => `
    <article class="resource">
      <div>
        <p class="eyebrow">${item.category}</p>
        <h3>${item.name}</h3>
      </div>
      <div>
        <p class="eyebrow">数量</p>
        <h3>${item.count}</h3>
      </div>
    </article>
  `).join('');
}

function renderJournal(list) {
  dom.journalCount.textContent = `${list.length} 条`;
  dom.journal.innerHTML = list.map(item => `
    <article>
      <p class="eyebrow">${item.date}</p>
      <h3>${item.title}</h3>
      <p>${item.content}</p>
    </article>
  `).join('');
}

function updateExportText(profile, journal) {
  const lines = [
    `道号：${profile.title}`,
    `境界：${profile.stage}`,
    `心法：${profile.manual}`,
    `洞府：${profile.residence}`,
    '',
    '【日志摘要】',
    ...journal.slice(0, 5).map(item => `${item.date} ${item.title} - ${item.content}`)
  ];
  return lines.join('\n');
}

function saveBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function appendJournal(journal) {
  const now = new Date();
  const record = {
    date: now.toISOString().slice(0, 10),
    title: '闭关小结',
    content: `静心吐纳，灵力稳步提升。(${now.toLocaleTimeString()})`
  };
  return [record, ...journal].slice(0, 12);
}

async function bootstrap() {
  try {
    const [profile, techniques, expeditions, resources, journal] = await Promise.all([
      loadJSON(files.profile),
      loadJSON(files.techniques),
      loadJSON(files.expeditions),
      loadJSON(files.resources),
      loadJSON(files.journal)
    ]);

    renderProfile(profile);
    renderTechniques(techniques);
    renderExpeditions(expeditions);
    renderResources(resources);
    renderJournal(journal);

    dom.advance.addEventListener('click', () => {
      const updatedJournal = appendJournal(journal);
      renderJournal(updatedJournal);
      const note = document.createElement('div');
      note.className = 'pill';
      note.textContent = '闭关完成，日志已追加（仅当前会话）';
      dom.journal.prepend(note);
    });

    dom.export.addEventListener('click', () => {
      const text = updateExportText(profile, journal);
      saveBlob(text, 'cultivation-notes.txt');
    });
  } catch (err) {
    console.error(err);
    const fallback = document.createElement('p');
    fallback.textContent = '数据读取失败，请确认 data/*.json 是否存在。';
    fallback.className = 'pill';
    document.querySelector('main').prepend(fallback);
  }
}

bootstrap();
