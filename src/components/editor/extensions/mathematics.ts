import { cn } from "@/lib/utils";
import { Node, mergeAttributes } from "@tiptap/core";
import { EditorState } from "@tiptap/pm/state";
import katex, { KatexOptions } from "katex";

export interface MathematicsOptions {
  shouldRender: (state: EditorState, pos: number) => boolean;
  katexOptions?: KatexOptions;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customCommand: {
      setLatex: ({ latex }: { latex: string }) => ReturnType;
      unsetLatex: () => ReturnType;
    };
  }
}

export const Mathematics = Node.create<MathematicsOptions>({
  name: "math",
  inline: true,
  group: "inline",
  atom: true,
  selectable: true,
  marks: "",

  addAttributes() {
    return {
      latex: "",
    };
  },

  addOptions() {
    return {
      shouldRender: (state, pos) => {
        const $pos = state.doc.resolve(pos);

        if (!$pos.parent.isTextblock) {
          return false;
        }
        
        return $pos.parent.type.name !== "codeBlock";
      },
      katexOptions: {
        throwOnError: false,
      },
      HTMLAttributes: {
        class: cn("text-foreground rounded p-1"),
      },
    };
  },

  addCommands() {
    return {
      setLatex:
        ({ latex }) =>
        ({ chain, state }) => {
          if (!latex) {
            return false;
          }
          const { from, to, $anchor } = state.selection;

          if (!this.options.shouldRender(state, $anchor.pos)) {
            return false;
          }

          return chain()
            .insertContentAt(
              { from: from, to: to },
              {
                type: "math",
                attrs: {
                  latex: latex,
                },
              }
            )
            .setTextSelection({ from: from, to: from + 1 })
            .run();
        },
      unsetLatex:
        () =>
        ({ editor, state, chain }) => {
          const latex = editor.getAttributes(this.name).latex;
          if (typeof latex !== "string") {
            return false;
          }

          const { from, to } = state.selection;

          return chain()
            .command(({ tr }) => {
              tr.insertText(latex, from, to);
              return true;
            })
            .setTextSelection({
              from: from,
              to: from + latex.length,
            })
            .run();
        },
    };
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs["latex"] ?? "";
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": this.name,
      }),
      latex,
    ];
  },

  renderText({ node }) {
    return node.attrs["latex"] ?? "";
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement("span");
      const latex: string = node.attrs["latex"] ?? "";

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, value);
      });

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, value);
      });

      if (editor.isEditable) {
        dom.classList.add("hover:bg-accent", "cursor-pointer");
      }

      dom.addEventListener("click", (evt) => {
        if (editor.isEditable && typeof getPos === "function") {
          const pos = getPos();
          const nodeSize = node.nodeSize;
          editor.commands.setTextSelection({ from: pos, to: pos + nodeSize });
        }
      });

      dom.contentEditable = "false";

      dom.innerHTML = katex.renderToString(latex, this.options.katexOptions);

      return {
        dom: dom,
      };
    };
  },
});