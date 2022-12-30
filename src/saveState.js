
for (const elem of document.querySelectorAll('*[data-savestate]')) {
    restoreAndEnableAutoSave(elem, false);
}

function restoreAndEnableAutoSave(elem, deep) {
    console.log(elem.id);
    const mode = elem.dataset.savestate;
    if ((!deep && !mode) || mode === "none") {
        return;
    }
    if (!!elem.id) {
        const data = localStorage.getItem(elem.id);
        switch (elem.nodeName) {
            case "INPUT": {
                let prop;
                switch (elem.type) {
                    case 'checkbox': {
                        prop = "checked";
                        break;
                    }
                    default: {
                        prop = "value";
                        break;
                    }
                }
                if (!!data) {
                    const val = JSON.parse(data);
                    elem[prop] = val;
                    console.log(`restore ${elem.id}[${prop}] = ${val}`);
                }

                elem.addEventListener('change', (e) => {
                    console.log(e.target[prop]);
                    const val = JSON.stringify(e.target[prop]);
                    localStorage.setItem(e.target.id, val);
                    console.log(`save ${e.target.id}[${prop}] = ${val}`);
                });
                break;
            }
        }
    }

    if (deep || (mode === "deep")) {
        for (const child of elem.children) {
            restoreAndEnableAutoSave(child, true);
        }
    }
}