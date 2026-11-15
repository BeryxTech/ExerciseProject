const tasksPerPage = 4;
let currentPage = 1;

const box = document.querySelector(".box");
const list = box.querySelector("ul");

// Inject the page counter and invisible arrow buttons into .box
box.insertAdjacentHTML(
  "beforeend",
  `
  <div class="page-nr" id="page-nr">Page 1 of 1</div>
  <button class="page-btn prev" id="prev-btn" aria-label="Previous page"></button>
  <button class="page-btn next" id="next-btn" aria-label="Next page"></button>
  `
);

const pageNr = document.getElementById("page-nr");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function renderPages() {
  const items = Array.from(list.querySelectorAll("li"));
  const totalPages = Math.max(1, Math.ceil(items.length / tasksPerPage));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * tasksPerPage;
  const end = start + tasksPerPage;

  // Only show the 4 tasks that belong to the current page
  items.forEach((li, index) => {
    li.style.display = index >= start && index < end ? "" : "none";
  });

  pageNr.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPages();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(list.querySelectorAll("li").length / tasksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPages();
  }
});

// Automatically creates & flips to a new page whenever todolist.js adds a 5th, 9th, etc. task
const watcher = new MutationObserver(() => {
  const items = list.querySelectorAll("li");
  const totalPages = Math.max(1, Math.ceil(items.length / tasksPerPage));
  currentPage = totalPages;
  renderPages();
});

watcher.observe(list, { childList: true });
renderPages();