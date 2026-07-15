const characters = Array.from({ length: 27 }, (_, index) => ({
  id: index + 1,
  image: `assets/characters/character-${String(index + 1).padStart(2, "0")}.png`,
}));

const grid = document.querySelector("#character-grid");
const resultCards = document.querySelector("#result-cards");
const drawButton = document.querySelector("#draw-button");
const drawButtonLabel = drawButton.querySelector(".button-text b");
const specialCharacterId = 13;

function portraitMarkup(character, className, indexLabel = "", skillRoll = null) {
  if (className.includes("result-card")) {
    const skillsMarkup = skillRoll ? `
      <div class="skill-rolls" aria-label="技能抽選結果：${skillRoll.f}、${skillRoll.v}">
        <span class="skill-tag skill-f"><i>F</i>${skillRoll.f.slice(1)}</span>
        <span class="skill-plus">＋</span>
        <span class="skill-tag skill-v"><i>V</i>${skillRoll.v.slice(1)}</span>
      </div>
    ` : `
      <div class="skill-rolls is-pending" aria-hidden="true">
        <span class="skill-tag skill-f"><i>F</i>?</span>
        <span class="skill-plus">＋</span>
        <span class="skill-tag skill-v"><i>V</i>?</span>
      </div>
    `;

    return `
      <article class="${className}" data-character-id="${character.id}">
        ${skillsMarkup}
        <div class="result-portrait">
          <img src="${character.image}" alt="角色 ${String(character.id).padStart(2, "0")}" draggable="false" />
          ${indexLabel ? `<span class="result-index">${indexLabel}</span>` : ""}
        </div>
      </article>
    `;
  }

  return `
    <article class="${className}" data-character-id="${character.id}">
      <img src="${character.image}" alt="角色 ${String(character.id).padStart(2, "0")}" draggable="false" />
    </article>
  `;
}

function renderRoster() {
  grid.innerHTML = characters
    .map((character) => portraitMarkup(character, "character-card"))
    .join("");
}

function pickThree() {
  const pool = [...characters];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, 3);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function rollSkills(character) {
  const maxLevel = character.id === specialCharacterId ? 3 : 2;
  const levels = Array.from({ length: maxLevel }, (_, index) => index + 1);

  return {
    f: `F${randomItem(levels)}`,
    v: `V${randomItem(levels)}`,
  };
}

function renderResults(selected, showSkills = true) {
  resultCards.innerHTML = selected
    .map((character, index) => portraitMarkup(
      character,
      "result-card",
      `0${index + 1}`,
      showSkills ? rollSkills(character) : null,
    ))
    .join("");
}

function markSelected(selected) {
  const selectedIds = new Set(selected.map(({ id }) => id));

  document.querySelectorAll(".character-card").forEach((card) => {
    card.classList.remove("is-rolling-pick");
    card.classList.toggle("is-drawn", selectedIds.has(Number(card.dataset.characterId)));
  });
}

function markRollingSelection(selected) {
  const selectedIds = new Set(selected.map(({ id }) => id));

  document.querySelectorAll(".character-card").forEach((card) => {
    card.classList.remove("is-drawn");
    card.classList.toggle("is-rolling-pick", selectedIds.has(Number(card.dataset.characterId)));
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function drawCharacters({ animate = true } = {}) {
  if (drawButton.disabled) return;

  const selected = pickThree();

  if (!animate) {
    markSelected(selected);
    renderResults(selected);
    return;
  }

  drawButton.disabled = true;
  drawButtonLabel.textContent = "天命流轉";
  resultCards.classList.add("is-rolling");

  const rollingTimer = window.setInterval(() => {
    const rollingSelection = pickThree();
    renderResults(rollingSelection, false);
    markRollingSelection(rollingSelection);
  }, 85);

  await wait(1100);
  window.clearInterval(rollingTimer);

  renderResults(selected);
  markSelected(selected);
  resultCards.classList.remove("is-rolling");
  resultCards.classList.add("has-landed");

  await wait(700);
  resultCards.classList.remove("has-landed");
  drawButton.disabled = false;
  drawButtonLabel.textContent = "抽取角色";
}

drawButton.addEventListener("click", drawCharacters);

renderRoster();
drawCharacters({ animate: false });
