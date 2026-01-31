import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

const Editor = forwardRef(({ onCodeChange, initialCode = "" }, ref) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false);

  useImperativeHandle(ref, () => ({
    updateCode(code) {
      if (!viewRef.current || code === undefined) return;

      // Prevent triggering onCodeChange loop
      isRemoteChange.current = true;
      
      const currentCode = viewRef.current.state.doc.toString();
      if (code !== currentCode) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: code,
          },
        });
      }
      
      isRemoteChange.current = false;
    },
  }));

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isRemoteChange.current) {
        const code = update.state.doc.toString();
        onCodeChange?.(code);
      }
    });

    const state = EditorState.create({
      doc: initialCode, // This handles the very first load
      extensions: [
        lineNumbers(),
        keymap.of(defaultKeymap),
        javascript(),
        oneDark,
        EditorView.lineWrapping,
        updateListener,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only run on mount

  return <div ref={editorRef} className="w-full h-full" />;
});

export default Editor;