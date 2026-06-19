import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "", className = "", label }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className={`rich-text-container w-full ${className}`}>
      {label && <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-2 font-semibold">{label}</label>}
      <div className="bg-bg-input">
        <ReactQuill 
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className="text-text-main"
        />
      </div>
    </div>
  );
}
