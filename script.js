const memes = [
  {
    title: "The Model Said It Was Nearly Done",
    category: "AI",
    summary: "That familiar pause between confident progress and a totally new stack trace.",
    tags: ["agents", "workflow"],
    signal: "0.92",
    color: "#dff7ec",
  },
  {
    title: "Localhost Confidence",
    category: "Dev",
    summary: "Everything is perfect until the deploy preview develops a personality.",
    tags: ["deploy", "frontend"],
    signal: "0.88",
    color: "#fff1bd",
  },
  {
    title: "Prompt Archaeology",
    category: "AI",
    summary: "Reading yesterday's prompt like an ancient civilization left product requirements behind.",
    tags: ["prompts", "llms"],
    signal: "0.84",
    color: "#e7e1ff",
  },
  {
    title: "The One-Line Fix",
    category: "Dev",
    summary: "A five-hour incident, a two-character patch, and a commit message trying to sound normal.",
    tags: ["debugging", "git"],
    signal: "0.91",
    color: "#d9f6fb",
  },
  {
    title: "Product Said Tiny Change",
    category: "Product",
    summary: "A small request that somehow contains permissions, billing, auth, and a new empty state.",
    tags: ["roadmap", "teams"],
    signal: "0.86",
    color: "#ffe3dd",
  },
  {
    title: "Evaluation Spreadsheet Era",
    category: "AI",
    summary: "When vibes become columns and the columns start asking difficult questions.",
    tags: ["evals", "quality"],
    signal: "0.89",
    color: "#e7f5d8",
  },
];

const categories = ["All", ...new Set(memes.map((meme) => meme.category))];
const categoryFilters = document.querySelector("#categoryFilters");
const memeGrid = document.querySelector("#memeGrid");
const emptyState = document.querySelector("#emptyState");
const feedSearch = document.querySelector("#feedSearch");
const heroSearch = document.querySelector(".hero-search");
const heroSearchInput = document.querySelector("#hero-search-input");

let activeCategory = "All";
let searchTerm = "";

function renderFilters() {
  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button type="button" data-category="${category}" aria-pressed="${category === activeCategory}">
          ${category}
        </button>
      `,
    )
    .join("");
}

function matchesSearch(meme) {
  const haystack = [meme.title, meme.category, meme.summary, ...meme.tags].join(" ").toLowerCase();
  return haystack.includes(searchTerm.trim().toLowerCase());
}

function renderMemes() {
  const visibleMemes = memes.filter((meme) => {
    const categoryMatch = activeCategory === "All" || meme.category === activeCategory;
    return categoryMatch && matchesSearch(meme);
  });

  memeGrid.innerHTML = visibleMemes
    .map(
      (meme) => `
        <article class="meme-card">
          <div class="card-top" style="--card-bg: ${meme.color}">
            <span class="card-tag">${meme.category}</span>
            <span class="card-signal">score ${meme.signal}</span>
          </div>
          <div class="card-body">
            <h3>${meme.title}</h3>
            <p>${meme.summary}</p>
            <div class="card-meta">
              ${meme.tags.map((tag) => `<span>${tag}</span>`).join("")}
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  emptyState.hidden = visibleMemes.length > 0;
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderMemes();
});

feedSearch.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderMemes();
});

heroSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  searchTerm = heroSearchInput.value;
  feedSearch.value = searchTerm;
  document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  renderMemes();
});

renderFilters();
renderMemes();
