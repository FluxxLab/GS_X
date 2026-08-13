"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { FONT, PRIMARY } from "@/lib/ui/styles";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ Icon, label, onClick, isActive, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive ?? undefined}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-[6px] border-none p-[6px] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: isActive ? PRIMARY : "transparent",
      }}
    >
      <Icon size={16} color={isActive ? "#FFFFFF" : "#70768E"} />
    </button>
  );
}

/** Reusable controlled Tiptap rich-text editor with a small formatting toolbar. */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[200px] outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep the editor in sync when `value` changes externally (e.g. template switch).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DAE0EF]" style={{ fontFamily: FONT }}>
      <div className="flex items-center gap-[2px] border-b border-[#DAE0EF] bg-[#F4F6FB] px-3 py-2">
        <ToolbarButton
          Icon={Bold}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
        />
        <ToolbarButton
          Icon={Italic}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
        />
        <ToolbarButton
          Icon={Underline}
          label="Underline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive("underline")}
        />
        <div className="mx-[6px] h-5 w-px bg-[#DAE0EF]" />
        <ToolbarButton
          Icon={List}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
        />
        <ToolbarButton
          Icon={ListOrdered}
          label="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
        />
        <div className="mx-[6px] h-5 w-px bg-[#DAE0EF]" />
        <ToolbarButton
          Icon={Undo2}
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
        />
        <ToolbarButton
          Icon={Redo2}
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
        />
      </div>

      <div className="bg-[#FFFFFF] p-6 text-[14px] leading-[23px] text-[#081340]">
        <EditorContent editor={editor} data-placeholder={placeholder} />
      </div>
    </div>
  );
}
