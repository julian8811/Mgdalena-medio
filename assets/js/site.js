document.addEventListener("DOMContentLoaded", function () {
 var toggle = document.getElementById("nav-toggle");
 var panel = document.getElementById("nav-panel");
 if (toggle && panel) {
 toggle.addEventListener("click", function () {
  panel.classList.toggle("hidden");
  if (window.innerWidth < 768) {
  var open = !panel.classList.contains("hidden");
  panel.classList.toggle("flex", open);
  panel.classList.toggle("flex-col", open);
  }
 });
 }
});
