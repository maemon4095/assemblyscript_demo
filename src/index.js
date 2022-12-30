
require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs" } });

let tseditor, aseditor;
require(["vs/editor/editor.main"], (monaco) => {
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
});
