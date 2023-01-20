require(["vs/editor/editor.main", 'js/selectablePane', 'js/reorderableList', 'js/contextmenu'], (monaco, pane, list, contextmenu) => {
    const options = {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {
            enabled: false,
        }
    };
    const model = monaco.editor.createModel("console.log(4)", "typescript");
    monaco.editor.create(document.getElementById('tscontainer'), {
        model,
        ...options,
    });
    monaco.editor.create(document.getElementById('ascontainer'), {
        model,
        ...options,
    });


    const menu = document.getElementById('menu');
    const children = [...menu.children];
    menu.innerHTML = '';

    const tabbar = document.createElement('div');
    tabbar.classList.add('tabbar');
    list.create(tabbar);
    const container = document.createElement('div');
    container.id = 'main';

    const selectable = pane.create(container);

    tabbar.addEventListener('contextmenu', (event) => {
        console.log(event);
        const menu = {
            aaa: (e) => { alert(e) },
            bbb: {
                ccc: (e) => alert(e),
                ddd: (e) => alert(e)
            }
        };
        contextmenu.displayObject(event.clientX, event.clientY, menu, { originX: 0.5 });
        event.preventDefault();
    });
    let lastSelected = null;
    for (const child of children) {
        const id = selectable.add(child);
        const labelText = child.getAttribute('data-tab-label');
        const label = document.createElement('button');
        label.textContent = labelText;
        label.classList.add('tabbar-tab-label');
        label.dataset.paneId = id;
        label.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) {
                return;
            }
            const id = event.target.getAttribute('data-pane-id');
            selectable.select(parseInt(id));
            lastSelected?.setAttribute('data-tab-state', 'none');
            label.setAttribute('data-tab-state', 'selected');
            lastSelected = label;
        });
        tabbar.append(label);
    }
    tabbar.addEventListener('wheel', (event) => {
        tabbar.scrollBy(event.deltaY, event.deltaX);
    });

    menu.append(tabbar, container);
});
