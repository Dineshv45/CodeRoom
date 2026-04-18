import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentMore, indentLess } from "@codemirror/commands";
import { keymap } from "@codemirror/view";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

import { color, oneDark } from "@codemirror/theme-one-dark";
import { closeBrackets } from "@codemirror/autocomplete";

import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { yCollab } from "y-codemirror.next";

const Editor = forwardRef(
  ({ fileId, fileName, username, runCode, setIsTerminalOpen }, ref) => {
    const editorContainerRef = useRef(null);
    const viewRef = useRef(null);
    const providerRef = useRef(null);
    const ydocRef = useRef(null);

    /* ===== Expose getCode to parent (for compilation) ===== */
    useImperativeHandle(ref, () => ({
      getCode() {
        return viewRef.current?.state.doc.toString();
      },
    }));

    /* ===== Language Detection Helper ===== */
    const getLanguageExtension = (name) => {
      const ext = name.toLowerCase().split('.').pop();
      switch (ext) {
        case "js":
        case "jsx": return javascript();
        case "py": return python();
        case "java": return java();
        case "cpp":
        case "h":
        case "hpp": return cpp();
        case "html": return html();
        case "css": return css();
        case "c": return c();
        default: return javascript();
      }
    }

    const getUserColor = (name) => {
      const colors = [
        "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
        "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
        "#a855f7", "#db2777", "#0ea5e9", "#d97706",
      ];
      let hash = 0;
      const safeName = name || "Anonymous";
      for (let i = 0; i < safeName.length; i++) {
        hash += safeName.charCodeAt(i);
      }
      return colors[hash % colors.length];
    }

    /* ===== Initialize CodeMirror with Yjs ===== */
    useEffect(() => {
      if (!editorContainerRef.current || !fileId) return;

      // 1. Setup Yjs Doc and Provider
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      const provider = new SocketIOProvider(
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
        fileId,
        ydoc,
        { auth: { token: localStorage.getItem("accessToken") } }
      );
      provider.awareness.setLocalStateField("user", {
        name: username,
        color: getUserColor(username)
      })
      providerRef.current = provider;

      const ytext = ydoc.getText("codemirror");

      // 2. Setup CodeMirror
      const state = EditorState.create({
        extensions: [
          lineNumbers(),
          history(),
          keymap.of([
            {
              key: "Tab",
              run: (view) => {
                if (view.state.selection.ranges.some((r) => !r.empty)) return indentMore(view);
                view.dispatch(view.state.replaceSelection("    "));
                return true;
              },
              shift: indentLess,
            },
            {
              key: "control-Enter",
              run: (view) =>{
                runCode();
                return true;
              }
            },
            {
              key: "control-`",
              run: (view) => {
                setIsTerminalOpen(prev => !prev);
                return true;
              }
            },
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          closeBrackets(),
          oneDark,
          EditorView.lineWrapping,

          // Collaborative Editing Extension
          yCollab(ytext, provider.awareness),

          // Dynamic Language Selection
          getLanguageExtension(fileName),

          EditorView.theme({
            "&": { height: "100%" },
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
        provider.destroy();
        ydoc.destroy();
        viewRef.current = null;
        providerRef.current = null;
        ydocRef.current = null;
      };
    }, [fileId]); // Only re-init if fileId changes

    return (
      <div ref={editorContainerRef} className="w-full h-full overflow-hidden" />
    );
  },
  
);

export default Editor;
