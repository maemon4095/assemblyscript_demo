
init(document.querySelector(".tabbed-menu-tabbar"));


function init(elem) {
    window.addEventListener('resize', () => {
        const { scrollWidth, scrollHeight, clientWidth, clientHeight } = elem;
        const isOverflow = scrollWidth > clientWidth || scrollHeight > clientHeight;

        console.log({ scrollWidth, scrollHeight, clientWidth, clientHeight });
        console.log(`overflow?: ${isOverflow}`);
    });
}