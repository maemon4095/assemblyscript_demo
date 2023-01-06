//@ts-check
//@ts-ignore
define(() => {
    //@ts-check
    function init() {
        const wrapper = document.createElement('div');
        const container = document.createElement('div');
        container.style.display = 'block';
        container.style.width = container.style.height = 'min-content';
        container.style.position = 'absolute';
        container.style.pointerEvents = 'auto';
        container.classList.add('contextmenu-container');

        wrapper.style.position = 'absolute';
        wrapper.style.top = wrapper.style.left = '0px';
        wrapper.style.width = wrapper.style.height = '100%';
        wrapper.style.pointerEvents = 'none';
        wrapper.classList.add('contextmenu-wrapper');
        wrapper.append(container);

        window.addEventListener('pointerdown', (event) => {
            const rect = container.getBoundingClientRect();
            if (rect.left <= event.clientX && event.clientX <= rect.right && rect.top <= event.clientY && event.clientY <= rect.bottom) {
                return;
            }

            container.blur();
            container.replaceChildren();
            wrapper.remove();
        });

        return { wrapper, container };
    }

    /** @type {{ container: HTMLDivElement, wrapper:HTMLDivElement } | null} */
    let pair = null;

    /**
     * @param {number} x
     * @param {number} y
     * @param {HTMLElement} content
     * @param {{originX?: number, originY?: number}} [options]
     */
    function display(x, y, content, options) {
        const { container, wrapper } = pair ??= init();
        container.replaceChildren(content);
        document.body.append(wrapper);
        const { width, height } = container.getBoundingClientRect();
        const opts = { ...{ originX: 0, originY: 0 }, ...options };
        container.style.top = `${y - (height * opts.originY)}px`;
        container.style.left = `${x - (width * opts.originX)}px`;
        content.focus();
    }

    return {
        display
    };
});