// "Other exams" menu: opens on hover (desktop) and on tap (phones)
document.querySelectorAll(".dd").forEach(function (dd) {
  var btn = dd.querySelector(".dd-btn");
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = dd.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});
document.addEventListener("click", function () {
  document.querySelectorAll(".dd.open").forEach(function (d) {
    d.classList.remove("open");
    d.querySelector(".dd-btn").setAttribute("aria-expanded", "false");
  });
});
