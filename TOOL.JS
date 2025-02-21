let currentIndex = 0;
const toolsPerPage = 10;
let userPrefs = { budget: "", skill: "", goal: "" };

function updateRecommendations() {
  userPrefs.budget = document.querySelector('input[name="budget"]:checked')?.value || "";
  userPrefs.skill = document.querySelector('input[name="skill"]:checked')?.value || "";
  userPrefs.goal = document.querySelector('input[name="goal"]:checked')?.value || "";
  displayTools();
}

function calculateScore(tool) {
  let score = 100;
  if (userPrefs.budget === "free" && !tool.status.toLowerCase().includes("free")) score -= 40;
  if (userPrefs.skill === "beginner" && tool.desc.toLowerCase().includes("advanced")) score -= 30;
  if (userPrefs.goal === "speed" && tool.desc.toLowerCase().includes("creative")) score -= 20;
  return Math.max(score, 10);
}

function displayTools() {
  const category = document.getElementById("category-select").value;
  const freeOnly = document.getElementById("free-filter").checked;
  const toolList = document.getElementById("tool-list");
  toolList.innerHTML = "<div class='loader'>Loading...</div>";

  if (category) {
    fetch("https://github.com/m4dman699/AI-Tool-Finder/blob/main/tools.json") // Replace with your JSON URL
      .then(response => response.json())
      .then(data => {
        let tools = data[category] || [];
        if (freeOnly) tools = tools.filter(tool => tool.status.toLowerCase().includes("free"));
        toolList.innerHTML = "";
        if (tools.length === 0) {
          toolList.innerHTML = "<p>No tools found for this category.</p>";
          return;
        }

        currentIndex = 0;
        displayToolBatch(tools, toolList);

        if (tools.length > toolsPerPage) {
          const showMoreBtn = document.createElement("button");
          showMoreBtn.textContent = "Show More Tools";
          showMoreBtn.onclick = () => {
            currentIndex += toolsPerPage;
            displayToolBatch(tools, toolList);
            if (currentIndex + toolsPerPage >= tools.length) showMoreBtn.style.display = "none";
          };
          toolList.appendChild(showMoreBtn);
        }
      })
      .catch(error => {
        toolList.innerHTML = "<p>Error loading tools. Please try again later.</p>";
        console.error("Fetch error:", error);
      });
  }
}

function displayToolBatch(tools, toolList) {
  const endIndex = Math.min(currentIndex + toolsPerPage, tools.length);
  for (let i = currentIndex; i < endIndex; i++) {
    const tool = tools[i];
    const score = userPrefs.budget || userPrefs.skill || userPrefs.goal ? calculateScore(tool) : null;
    const toolCard = document.createElement("div");
    toolCard.className = "tool-card" + (i === currentIndex ? " featured" : "");
    toolCard.innerHTML = `
      ${i === currentIndex ? '<span class="featured-tag">Featured</span>' : ''}
      <h3>${tool.name} ${score ? `<span class="match-score">${score}% Match</span>` : ''}</h3>
      <p>${tool.desc}</p>
      <p><span class="rating">★★★★☆</span></p>
      <p><a href="${tool.url}" target="_blank">Visit Tool</a></p>
      <label><input type="checkbox" class="compare-checkbox" data-tool='${JSON.stringify(tool)}'> Compare</label>
    `;
    toolList.appendChild(toolCard);
  }
  const compareBtn = document.createElement("button");
  compareBtn.textContent = "Compare Selected Tools";
  compareBtn.style.display = "none";
  compareBtn.onclick = showComparison;
  toolList.appendChild(compareBtn);

  document.querySelectorAll(".compare-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = document.querySelectorAll(".compare-checkbox:checked").length;
      compareBtn.style.display = checked >= 2 ? "block" : "none";
    });
  });
}

function showComparison() {
  const selectedTools = Array.from(document.querySelectorAll(".compare-checkbox:checked"))
    .map(cb => JSON.parse(cb.dataset.tool));
  const comparison = selectedTools.map(tool => `
    <div class="compare-item">
      <h3>${tool.name}</h3>
      <p>${tool.desc}</p>
      <p>Status: ${tool.status}</p>
    </div>
  `).join("");
  document.getElementById("tool-list").innerHTML = `<div class="comparison">${comparison}</div><button onclick="displayTools()">Back</button>`;
}

function subscribe() {
  const email = document.getElementById("email").value;
  if (email) alert("Subscribed! You’ll get weekly AI tool updates."); // Integrate with Mailchimp later
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.getElementById("ai-tool-finder").classList.toggle("light-mode");
});