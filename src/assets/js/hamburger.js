/*
    <div class="menu-icon"><i class="las la-bars"></i></div>
    <aside class="aside">
        <div class="aside_close-icon"><i class="las la-times"></i></div>
        <div class="aside-card" id="side-info"></div>
        <div class="aside-card" id="wire"></div>
        <div class="aside-card" id="turnaround-gantts"></div>
    </aside>
 */

const menuIcon = document.querySelector(".menu-icon");
const aside = document.querySelector(".aside");
const asideClose = document.querySelector(".aside_close-icon");

function toggle(el, className) {
    if (el.classList.contains(className)) {
        el.classList.remove(className);
    } else {
        el.classList.add(className);
    }
}
menuIcon.addEventListener("click", function() {
    toggle(aside, "active");
});
asideClose.addEventListener("click", function() {
    toggle(aside, "active");
});