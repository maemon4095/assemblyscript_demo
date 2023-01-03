let tseditor, aseditor;
require(['tab', "vs/editor/editor.main"], (tab, monaco) => {
    const options = {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {
            enabled: false,
        }
    };

    const model = monaco.editor.createModel("console.log(4)", "typescript");
    tseditor = monaco.editor.create(document.getElementById('tscontainer'), {
        model,
        ...options,
    });

    aseditor = monaco.editor.create(document.getElementById('ascontainer'), {
        model,
        ...options,
    });

    const menu = tab.create(document.getElementById('menu'), { collectChildren: true });
});
