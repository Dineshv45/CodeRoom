import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { closeBrackets } from "@codemirror/autocomplete";

import { Decoration, WidgetType } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

const setRemoteCursors = StateEffect.define();

class RemoteCursorWidget extends WidgetType {
  constructor(color) {
    super();
    this.color = color;
  }

  toDOM() {
    const el = document.createElement("span");
    el.style.borderLeft = `2px solid ${this.color}`;
    el.style.marginLeft = "-1px";
    el.style.height = "1em";
    el.style.pointerEvents = "none";
    return el;
  }

  ignoreEvent() {
    return true;
  }
}

const remoteCursorField = StateField.define({
  create() {
    return Decoration.none;
  },

  update(cursors, tr) {
    cursors = cursors.map(tr.changes);

    for (let effect of tr.effects) {
      if (effect.is(setRemoteCursors)) {
        const decorations = effect.value.map(({ position, color }) => {
          // 🔥 CRITICAL: Clamp position to prevent RangeError during race conditions
          const docLength = tr.state.doc.length;
          const safePosition = Math.min(Math.max(0, position), docLength);

          return Decoration.widget({
            widget: new RemoteCursorWidget(color),
            side: 1,
          }).range(safePosition);
        });

        return Decoration.set(decorations);
      }
    }

    return cursors;
  },

  provide: (f) => EditorView.decorations.from(f),
});

const Editor = forwardRef(
  ({ onCodeChange, onCursorChange, initialCode = "" }, ref) => {
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

      getCode() {
        return viewRef.current?.state.doc.toString();
      },

      updateRemoteCursor(cursors) {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
          effects: setRemoteCursors.of(cursors),
        });
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

        if (update.selectionSet) {
          const cursorPos = update.state.selection.main.head;
          onCursorChange?.(cursorPos);
        }
      });

      const state = EditorState.create({
        doc: initialCode,
        extensions: [
          lineNumbers(),
          keymap.of(defaultKeymap),
          javascript(),
          closeBrackets(),
          oneDark,
          EditorView.lineWrapping,
          updateListener,
          remoteCursorField,


          EditorView.theme({
            "&": { height: "100%" }, // Makes .cm-editor full height
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

    return (
      <div ref={editorContainerRef} className="w-full h-full overflow-hidden" />
    );
  },
);

export default Editor;
