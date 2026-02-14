import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

const Editor = forwardRef(({ onCodeChange, initialCode = "" }, ref) => {
  const editorContainerRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false);

  /* ===== Expose updateCode to parent ===== */
  useImperativeHandle(ref, () => ({
    updateCode(code) {
      if (!viewRef.current || code === undefined) return;

      const currentCode = viewRef.current.state.doc.toString();

      if (code === currentCode) return;

      isRemoteChange.current = true;

      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code,
        },
      });

      isRemoteChange.current = false;
    },
  }));

  /* ===== Initialize CodeMirror ===== */
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isRemoteChange.current) {
        const code = update.state.doc.toString();
        onCodeChange?.(code);
      }
    });
const state = EditorState.create({
  doc: initialCode,
  extensions: [
    lineNumbers(),
    keymap.of(defaultKeymap),
    javascript(),
    oneDark,
    EditorView.lineWrapping,
    updateListener,

    // 👇 THIS IS THE FIX
    EditorView.theme({
      "&": { height: "100%" },         // Makes .cm-editor full height
      ".cm-scroller": { overflow: "auto" },
    }),
  ],
});


    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return <div ref={editorContainerRef} className="w-full h-full" />;
});

export default Editor;
