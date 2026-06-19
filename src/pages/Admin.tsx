import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Settings, LifePath, Testimonial, Faq, PricingService, PathwayCard, Partner } from '../Types';
import { GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { PhoneInput } from '../components/PhoneInput';

// Register custom fonts on the global Quill instance
const QuillInstance = (ReactQuill as any).Quill || Quill;
if (QuillInstance) {
  const Font = QuillInstance.import('formats/font');
  Font.whitelist = ['serif', 'monospace', 'times-new-roman', 'arial', 'calibri'];
  QuillInstance.register(Font, true);
}

const quillModules = {
  toolbar: [
    [{ 'font': [false, 'serif', 'monospace', 'times-new-roman', 'arial', 'calibri'] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ]
};

const quillFormats = [
  'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align', 'link'
];

function AdminRichText({ name, required, value: initialValue, onChange, onBlur, placeholder, className }: any) {
  const [content, setContent] = useState(initialValue || '');
  
  useEffect(() => {
    if (initialValue !== undefined) {
      if (initialValue !== content) {
        setContent(initialValue);
      }
    }
  }, [initialValue]);

  const handleChange = (val: string) => {
    setContent(val);
    if (onChange) {
      // Simulate event if needed by parent
      onChange({ target: { value: val, name } });
    }
  };

  return (
    <div className="relative">
      {name && <textarea name={name} className="hidden" value={content || ''} readOnly />}
      <ReactQuill 
        theme="snow"
        modules={quillModules}
        formats={quillFormats}
        value={content || ''}
        onChange={handleChange}
        onBlur={(_range, _source, _quill) => { if (onBlur) onBlur(); }}
        placeholder={placeholder}
        className={className || "w-full bg-bg-input border border-gold/20 text-text-main pb-10 font-sans"}
      />
    </div>
  );
}

function FaqAdminItem({ 
  faq, 
  isSelected,
  onToggleSelect,
  onChangeQuestion, 
  onChangeAnswer, 
  onSave, 
  onDelete 
}: {
  faq: Faq;
  isSelected: boolean;
  onToggleSelect: (checked: boolean) => void;
  onChangeQuestion: (q: string) => void;
  onChangeAnswer: (a: string) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  key?: React.Key;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={faq} 
      dragListener={false} 
      dragControls={controls}
      className={`bg-bg-card border ${isSelected ? 'border-gold/60' : 'border-gold/20'} p-6 flex flex-col relative group transition-colors`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
           <div 
             className="cursor-grab active:cursor-grabbing p-1 text-gold/50 hover:text-gold"
             onPointerDown={(e) => controls.start(e)}
             style={{ touchAction: "none" }}
             title="Drag to reorder"
           >
             <GripVertical size={20} />
           </div>
           
           <input 
             type="checkbox" 
             className="accent-gold w-4 h-4"
             checked={isSelected}
             onChange={(e) => onToggleSelect(e.target.checked)}
           />
           <h3 className="text-sm uppercase tracking-widest font-serif text-muted">ID: {faq.id}</h3>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={onSave} className="border border-gold/30 text-gold px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors rounded">Save</button>
           <button onClick={onDelete} className="border border-red-500/30 text-red-400 px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors rounded">Delete</button>
        </div>
      </div>
      
      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Question</label>
      <input type="text" value={faq.question || ''} placeholder="Question" onChange={e => {
        onChangeQuestion(e.target.value);
      }} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
      
      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Answer</label>
      <ReactQuill 
        theme="snow"
        modules={quillModules}
        formats={quillFormats}
        value={faq.answer || ''} 
        onChange={(content) => {
          onChangeAnswer(content);
        }} 
        className="w-full bg-bg-input border border-gold/20 text-text-main h-48 mb-12 font-sans pb-10" 
      />
    </Reorder.Item>
  );
}

function PathwayAdminItem({
  pathway,
  onChange,
  onSave,
  onDelete
}: {
  pathway: PathwayCard;
  onChange: (updated: PathwayCard) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  key?: React.Key;
}) {
  return (
    <div className="bg-bg-card border border-gold/20 p-6 rounded shadow-sm flex flex-col justify-between h-full relative group">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onSave} className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 bg-emerald-400/10 rounded">Save</button>
        <button onClick={onDelete} className="text-[10px] uppercase tracking-widest text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-400/10 rounded">Delete</button>
      </div>
      <div className="space-y-4 flex-grow pr-16 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Number</label>
            <input
              type="text"
              value={pathway.card_number || ''}
              onChange={e => onChange({ ...pathway, card_number: e.target.value })}
              className="w-full bg-bg-input border border-gold/20 p-2 outline-none focus:border-gold rounded font-mono text-sm text-text-main"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Slug</label>
            <input
              type="text"
              value={pathway.slug || ''}
              onChange={e => onChange({ ...pathway, slug: e.target.value })}
              className="w-full bg-bg-input border border-gold/20 p-2 outline-none focus:border-gold rounded text-sm text-text-main"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Title</label>
          <input
            type="text"
            value={pathway.title || ''}
            onChange={e => onChange({ ...pathway, title: e.target.value })}
            className="w-full bg-bg-input border border-gold/20 p-2 outline-none focus:border-gold rounded text-sm text-text-main"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Short Description</label>
          <AdminRichText
            value={pathway.short_desc || ''}
            onChange={(e: any) => onChange({ ...pathway, short_desc: e.target.value })}
            className="w-full bg-bg-input border border-gold/20 pb-10 rounded text-sm min-h-[140px]"
          />
        </div>
      </div>
    </div>
  );
}

function ServiceAdminItem({
  service,
  partners,
  onChange,
  onSave,
  onDelete
}: {
  service: PricingService;
  partners: Partner[];
  onChange: (updated: PricingService) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  key?: React.Key;
}) {
  const [featureInput, setFeatureInput] = useState(() => {
    let parsedFeatures: string[] = [];
    if (typeof service.features === 'string') {
      try {
        parsedFeatures = JSON.parse(service.features);
      } catch (e) {
        parsedFeatures = service.features.split(',').map((f: string) => f.trim());
      }
    } else if (Array.isArray(service.features)) {
      parsedFeatures = service.features;
    }
    return parsedFeatures.join('\n');
  });

  const handleFeaturesChange = (text: string) => {
    setFeatureInput(text);
    const parsed = text.split('\n').map((x: string) => x.trim()).filter(Boolean);
    onChange({
      ...service,
      features: JSON.stringify(parsed)
    });
  };

  return (
    <div className="bg-bg-card border border-gold/20 p-6 flex flex-col relative group transition-colors rounded">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={service.iconText || '✨'}
            onChange={e => onChange({ ...service, iconText: e.target.value })}
            className="w-12 bg-bg-input border border-gold/20 p-2 text-center text-xl rounded outline-none focus:border-gold"
            title="Emoji / Icon text"
          />
          <h3 className="text-sm uppercase tracking-widest font-serif text-muted">ID: {service.id || 'NEW'}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onSave} className="border border-gold/30 text-gold px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors rounded">Save</button>
          <button onClick={onDelete} className="border border-red-500/30 text-red-400 px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors rounded">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Service Title</label>
          <input
            type="text"
            value={service.title || ''}
            placeholder="e.g. Astro-Numerology Correction"
            onChange={e => onChange({ ...service, title: e.target.value })}
            className="w-full bg-bg-input border border-gold/20 p-2.5 outline-none focus:border-gold rounded text-sm text-text-main"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Price (Formatted)</label>
            <input
              type="text"
              value={service.price || ''}
              placeholder="e.g. ₹51,000"
              onChange={e => onChange({ ...service, price: e.target.value })}
              className="w-full bg-bg-input border border-gold/20 p-2.5 outline-none focus:border-gold rounded text-sm text-text-main font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold font-mono font-bold text-gold">Short Charge</label>
            <input
              type="text"
              value={service.rawPrice || ''}
              placeholder="e.g. ₹51k"
              onChange={e => onChange({ ...service, rawPrice: e.target.value })}
              className="w-full bg-bg-input border border-gold/20 p-2.5 outline-none focus:border-gold rounded text-sm text-text-main font-mono"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Service Description</label>
        <AdminRichText
          value={service.description || ''}
          placeholder="Detailed service explanation..."
          onChange={(e: any) => onChange({ ...service, description: e.target.value })}
          className="w-full bg-bg-input border border-gold/20 pb-10 rounded text-sm min-h-[140px]"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Operator</label>
        <select
          value={service.operator_id || ''}
          onChange={(e) => onChange({ ...service, operator_id: e.target.value ? parseInt(e.target.value, 10) : null })}
          className="w-full bg-bg-input border border-gold/20 p-2.5 outline-none focus:border-gold rounded text-sm text-text-main"
        >
          <option value="">Admin (Default)</option>
          {partners.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.1em] text-muted mb-1 font-semibold">Highlights / Features (One per line)</label>
        <textarea
          value={featureInput}
          placeholder="Astro Compatibility&#10;Correct Placement Remedies&#10;Ideal Path Plan"
          onChange={e => handleFeaturesChange(e.target.value)}
          className="w-full bg-bg-input border border-gold/20 p-2.5 outline-none h-24 focus:border-gold rounded text-xs text-text-main font-mono"
        />
      </div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPartnerWhatsapp, setNewPartnerWhatsapp] = useState('');
  const [loginError, setLoginError] = useState('');

  const [settings, setSettings] = useState<Settings | null>(null);
  const [lifePaths, setLifePaths] = useState<LifePath[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pages, setPages] = useState<{slug: string; title: string; content: string}[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [selectedFaqs, setSelectedFaqs] = useState<number[]>([]);
  const [newFaqAnswer, setNewFaqAnswer] = useState<string>('');
  const [services, setServices] = useState<PricingService[]>([]);
  const [pathways, setPathways] = useState<PathwayCard[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [activeTab, setActiveTab] = useState<string>('settings');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
     try {
       const calls = [
           apiFetch('/api/settings'),
           apiFetch('/api/life_paths'),
           apiFetch('/api/admin/testimonials', { headers: { 'Authorization': `Bearer ${token}` } }),
           apiFetch('/api/pages'),
           apiFetch('/api/faqs'),
           apiFetch('/api/services'),
           apiFetch('/api/pathway_cards'),
           apiFetch('/api/partners')
       ];
       const results = await Promise.allSettled(calls);
       
       const resolveRes = async (res: any) => {
          if (res.status !== 'fulfilled') return { error: 'failed' };
          const response = res.value;
          if (response.status === 401) {
              setToken('');
              localStorage.removeItem('admin_token');
              return { error: 'Unauthorized' };
          }
          if (!response.ok) return { error: 'not ok' };
          try {
             const data = await response.json();
             if (data.error === 'Invalid token' || data.error === 'Unauthorized') {
                 setToken('');
                 localStorage.removeItem('admin_token');
             }
             return data;
          } catch(e) {
             return { error: 'json parsing failed' };
          }
       };

       // Check token invalidation specifically for testimonials (index 2)
       if (results[2].status === 'fulfilled' && results[2].value.status === 401) {
           setToken('');
           localStorage.removeItem('admin_token');
           return;
       }

       // Resolve all promises
       const setResText = await resolveRes(results[0]);
       const lpResText = await resolveRes(results[1]);
       
       let testResText = await resolveRes(results[2]);
       
       // Fallback for testimonials if the user hasn't deployed the latest api.php to their server yet
       // The new route returns 404 Not Found if api.php is outdated.
       if (!Array.isArray(testResText) && testResText?.error === 'not ok' || testResText?.error === 'API Not Found') {
           try {
               const fallbackRes = await apiFetch('/api/testimonials', { headers: { 'Authorization': `Bearer ${token}` } });
               if (fallbackRes.ok) {
                   testResText = await fallbackRes.json();
               }
           } catch(e) {}
       }

       const pagesResText = await resolveRes(results[3]);
       const faqsResText = await resolveRes(results[4]);
       const servicesResText = await resolveRes(results[5]);
       const pathwaysResText = await resolveRes(results[6]);
       const partnersResText = await resolveRes(results[7]);

       // Fallback for settings to null, rest to array. Provide default empty values if error
       setSettings(setResText?.error ? null : setResText);
       setLifePaths(Array.isArray(lpResText) ? lpResText : []);
       
       // CRITICAL DEBUG: force store whatever raw text came back to find the issue
       setTestimonials(testResText as any);
       
       setPages(Array.isArray(pagesResText) ? pagesResText : []);
       setFaqs(Array.isArray(faqsResText) ? faqsResText : []);
       setServices(Array.isArray(servicesResText) ? servicesResText : []);
       setPathways(Array.isArray(pathwaysResText) ? pathwaysResText : []);
       setPartners(Array.isArray(partnersResText) ? partnersResText : []);
     } catch (err) {
         console.error("fetchData error:", err);
     }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        if (responseText.includes("<!doctype html>") || responseText.includes("<html")) {
           throw new Error("The API backend is not running. Your server is returning the frontend HTML instead of the API. Please ensure you have deployed and started the Node.js backend (server.ts) on your hosting provider.");
        }
        throw new Error(`Server returned non-JSON: ${res.status} ${responseText.substring(0, 50)}...`);
      }
      
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || "Invalid login credentials");
      }
    } catch (err: any) {
      console.error(err);
      setLoginError("Connection error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
  };

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [partnerSaveSuccess, setPartnerSaveSuccess] = useState<number | null>(null);

  const saveSettings = async () => {
     if (!settings) return;
     setSaving(true);
     setSaveSuccess(false);
     setSaveError('');
     try {
       const res = await apiFetch('/api/settings', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify(settings)
       });
       if (!res.ok) {
         const serverText = await res.text();
         throw new Error(serverText || 'Failed to update settings');
       }
       setSaveSuccess(true);
       setTimeout(() => setSaveSuccess(false), 4000);
     } catch (err: any) {
       console.error("Save settings error:", err);
       setSaveError(err.message || 'Failed to save settings');
     } finally {
       setSaving(false);
     }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const isHostinger = typeof window !== 'undefined' && !window.location.hostname.includes('.run.app') && !window.location.hostname.includes('localhost');
      const endpoint = isHostinger ? '/api.php?route=upload' : '/api/upload';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'Upload failed';
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.url) {
        setSettings(prev => prev ? { ...prev, profile_photo: data.url } : null);
      } else {
        throw new Error('Server did not return file URL');
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const saveLifePath = async (lp: LifePath) => {
      await apiFetch(`/api/life_paths/${lp.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ name: lp.name, desc: lp.desc })
     });
     alert(`Life Path ${lp.id} updated!`);
  };

  const savePage = async (page: {slug: string; title: string; content: string}) => {
      await apiFetch(`/api/pages/${page.slug}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ title: page.title, content: page.content })
     });
     alert(`Page ${page.title} updated!`);
  };

  const deleteLifePath = async (id: number) => {
      if (!confirm(`Delete Life Path ${id}?`)) return;
      await apiFetch(`/api/life_paths/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
     });
     fetchData();
  };

  const addLifePath = async (e: any) => {
      e.preventDefault();
      const form = e.target;
      const id = form.id_num.value;
      const name = form.name.value;
      const desc = form.desc.value;
      
      const res = await apiFetch('/api/life_paths', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ id, name, desc })
     });
     const data = await res.json();
     if (data.error) {
         alert(data.error);
     } else {
         form.reset();
         fetchData();
     }
  };

  const deleteTestimonial = async (id: number) => {
      await apiFetch(`/api/testimonials/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
     });
     fetchData();
  };

  const updateTestimonialStatus = async (id: number, status: string) => {
      await apiFetch(`/api/testimonials/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ status })
     });
     fetchData();
  };

  const addTestimonial = async (e: any) => {
      e.preventDefault();
      const form = e.target;
      const text = form.text.value;
      const name = form.name.value;
      const loc = form.loc.value;
      const initial = form.initial.value;
      const date = form.date.value;
      const rating = form.rating.value;
      
      const res = await apiFetch('/api/testimonials', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ text, name, loc, initial, date, rating: parseInt(rating) })
     });
     const data = await res.json();
     if (data.error) {
         alert(data.error);
     } else {
         form.reset();
         fetchData();
     }
  };

  const saveFaq = async (faq: Faq) => {
      await apiFetch(`/api/faqs/${faq.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ question: faq.question, answer: faq.answer })
     });
     alert(`FAQ updated!`);
  };

  const deleteFaq = async (id: number) => {
      if (!confirm(`Delete FAQ?`)) return;
      await apiFetch(`/api/faqs/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
     });
     fetchData();
  };

  const deleteSelectedFaqs = async () => {
    if (selectedFaqs.length === 0) return;
    if (!confirm(`Delete ${selectedFaqs.length} selected FAQs?`)) return;
    
    for (const id of selectedFaqs) {
      await apiFetch(`/api/faqs/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    fetchData();
    setSelectedFaqs([]);
  };

  const handleFaqReorder = async (newOrder: Faq[]) => {
    setFaqs(newOrder);
    
    try {
      await apiFetch('/api/faqs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderIds: newOrder.map(f => f.id) })
      });
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const addFaq = async (e: any) => {
      e.preventDefault();
      const form = e.target;
      const question = form.question.value;
      const answer = newFaqAnswer;
      
      const res = await apiFetch('/api/faqs', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ question, answer })
     });
     const data = await res.json();
     if (data.error) {
         alert(data.error);
     } else {
         form.reset();
         setNewFaqAnswer('');
         fetchData();
     }
  };

  const addService = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const price = form.price.value;
    const rawPrice = form.rawPrice.value;
    const description = form.description.value;
    const iconText = form.iconText.value || "✨";
    const operator_id = form.operator_id.value ? parseInt(form.operator_id.value, 10) : null;
    const features = []; // initially empty, user can add on list

    const res = await apiFetch('/api/services', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, price, rawPrice, description, iconText, features, operator_id })
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      form.reset();
      fetchData();
    }
  };

  const saveService = async (service: PricingService) => {
    if (!service.id) return;
    const res = await apiFetch(`/api/services/${service.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(service)
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert("Pricing service saved successfully!");
      fetchData();
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pricing service?")) return;
    const res = await apiFetch(`/api/services/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      fetchData();
    }
  };

  const savePathway = async (pathway: PathwayCard) => {
    if (!pathway.id) return;
    const res = await apiFetch(`/api/pathway_cards/${pathway.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(pathway)
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert("Pathway card saved successfully!");
      fetchData();
    }
  };

  const deletePathway = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pathway card?")) return;
    const res = await apiFetch(`/api/pathway_cards/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      fetchData();
    }
  };

  const addPathway = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const card_number = form.card_number.value;
    const title = form.title.value;
    const slug = form.slug.value;
    const short_desc = form.short_desc.value;

    const res = await apiFetch('/api/pathway_cards', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ card_number, title, slug, short_desc })
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      form.reset();
      fetchData();
    }
  };


  const savePartner = async (partner: Partner, showMessage: boolean = true) => {
    try {
      const res = await apiFetch(`/api/partners/${partner.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(partner)
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        fetchData();
        if (showMessage) {
          setPartnerSaveSuccess(partner.id!);
          setTimeout(() => setPartnerSaveSuccess(null), 3000);
          alert("Changes saved successfully!");
        }
      }
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  };

  const deletePartner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    const res = await apiFetch(`/api/partners/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else fetchData();
  };

  const addPartner = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const gratitude = form.gratitude?.value || '';
    const whatsapp = form.whatsapp?.value || '';
    const title = form.title.value;
    const description = form.description.value;
    
    let profile_photo = '';
    const fileInput = form.profile_photo;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('photo', fileInput.files[0]);
      try {
        const uploadRes = await apiFetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          profile_photo = uploadData.url;
        } else if (uploadData.error) {
          alert('Error uploading photo: ' + uploadData.error);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const res = await apiFetch('/api/partners', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, gratitude, title, description, profile_photo, whatsapp })
    });
    const data = await res.json();
    if (data.error) {
      if (data.error === 'Invalid token' || data.error === 'Unauthorized') {
        alert('Your session has expired. Please log in again.');
        setToken('');
        localStorage.removeItem('admin_token');
      } else {
        alert(data.error);
      }
    } else {
      setNewPartnerWhatsapp('');
      form.reset();
      fetchData();
    }
  };

  const handlePartnerPhotoUpload = async (file: File, id: number, partner: Partner) => {
    if(!file) return;
    const formData = new FormData();
    formData.append('photo', file);

    const res = await apiFetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (data.error) {
       alert(data.error);
       return;
    }
    const updated = { ...partner, profile_photo: data.url };
    const copy = [...partners];
    const index = copy.findIndex(p => p.id === id);
    if(index > -1) {
      copy[index] = updated;
      setPartners(copy);
      savePartner(updated);
    }
  };


  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark text-text-main">
        <form onSubmit={handleLogin} className="bg-bg-card p-8 border border-gold/20 max-w-sm w-full">
            <h2 className="text-2xl font-serif text-gold mb-6 text-center">Admin Access</h2>
            {loginError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 mb-4 text-sm rounded">{loginError}</div>}
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-bg-input border border-gold/20 p-3 mb-6 outline-none focus:border-gold" />
            <button className="w-full bg-gold text-bg-dark py-3 font-bold uppercase tracking-[0.2em] hover:bg-gold-lt rounded mb-4">Login</button>
            <a href="/" className="block w-full text-center text-[10px] text-muted hover:text-gold transition-colors uppercase tracking-widest">← Back to Home</a>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-dark text-text-main font-sans overflow-hidden">
      {/* Sidebar Navbar */}
      <aside className="w-64 border-r border-gold/10 bg-bg-card flex flex-col py-8 px-6 overflow-y-auto">
        <img src="/logo.png" alt="SEVEN 7" className="w-24 mb-10 mx-auto" />
        <nav className="w-full space-y-2 flex-grow">
           <button 
             onClick={() => setActiveTab('pricing')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'pricing' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Energy Exchange
           </button>
           <button 
             onClick={() => setActiveTab('settings')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'settings' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Contact Settings
           </button>
           <button 
             onClick={() => setActiveTab('testimonials')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'testimonials' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Success Stories
           </button>
           <button 
             onClick={() => setActiveTab('lifepaths')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'lifepaths' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Life Paths
           </button>
           <button 
             onClick={() => setActiveTab('pathways')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'pathways' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Pathways to Clarity
           </button>
           <button 
             onClick={() => setActiveTab('pages')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'pages' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Content Pages
           </button>
           <button 
             onClick={() => setActiveTab('process')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'process' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Process
           </button>
           <button 
             onClick={() => setActiveTab('faqs')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'faqs' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             FAQs Details
           </button>
           <button 
             onClick={() => setActiveTab('profile')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'profile' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             About SEVEN Profile
           </button>
           <button 
             onClick={() => setActiveTab('partners')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'partners' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Guiding Lights
           </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-gold/10">
           <button onClick={handleLogout} className="w-full border border-gold/30 text-gold px-4 py-3 uppercase tracking-[0.1em] text-xs hover:bg-gold/10 rounded">Logout</button>
        </div>
      </aside>

      {/* Main Content Areas */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-bg-dark">
        {activeTab === 'settings' && settings && (
          <section className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif mb-8 text-gold">Contact Settings</h2>
            <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">WhatsApp Number</label>
                   <input type="text" value={settings.whatsapp} onChange={e=>setSettings({...settings, whatsapp: e.target.value})} className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                </div>
                <div>
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">WhatsApp Message</label>
                   <input type="text" value={settings.whatsapp_message} onChange={e=>setSettings({...settings, whatsapp_message: e.target.value})} className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                </div>
                <div>
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Email Address</label>
                   <input type="email" value={settings.email} onChange={e=>setSettings({...settings, email: e.target.value})} className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                </div>
                <div>
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Email Subject</label>
                   <input type="text" value={settings.email_subject} onChange={e=>setSettings({...settings, email_subject: e.target.value})} className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Email Body</label>
                   <AdminRichText value={settings.email_body} onChange={(e: any)=>setSettings({...settings, email_body: e.target.value})} className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[160px]" />
                </div>
              </div>

              {/* ═══ GEMINI API KEY SECTION ═══ */}
              <div className="border-t border-gold/10 pt-6 mt-8 mb-6">
                <h3 className="text-lg font-serif mb-2 text-gold">Gemini AI Setup</h3>
                <p className="text-[11px] text-muted mb-4 leading-relaxed max-w-xl">
                  Configure your Gemini API Key to enable AI intelligence, conversational assistance, and personalized content generations. Keeps API keys protected server-side.
                </p>
                <div className="max-w-xl">
                   <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Gemini API Key</label>
                   <input 
                     type="password" 
                     placeholder="Enter Gemini API Key (keep empty to use default env key)" 
                     value={settings.gemini_api_key || ''} 
                     onChange={e=>setSettings({...settings, gemini_api_key: e.target.value})} 
                     className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold font-mono text-sm tracking-wide rounded-sm" 
                   />
                </div>
              </div>

              {/* ═══ SMTP OUTBOUND CONFIGURATION ═══ */}
              <div className="border-t border-gold/10 pt-6 mt-8 mb-6">
                <h3 className="text-lg font-serif mb-2 text-gold">Outbound SMTP Mailer Setup</h3>
                <p className="text-[11px] text-muted mb-4 leading-relaxed max-w-xl">
                  Configure SMTP server details to permit the celestial engine to send live consultation inquiries directly to your registered administrator email.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="e.g. smtp.gmail.com" 
                      value={settings.smtp_host || ''} 
                      onChange={e=>setSettings({...settings, smtp_host: e.target.value})} 
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold text-sm rounded-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">SMTP Port</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 587 or 465" 
                      value={settings.smtp_port || ''} 
                      onChange={e=>setSettings({...settings, smtp_port: e.target.value})} 
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold text-sm rounded-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">SMTP Username</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 7s.evolve@gmail.com" 
                      value={settings.smtp_user || ''} 
                      onChange={e=>setSettings({...settings, smtp_user: e.target.value})} 
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold text-sm rounded-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">SMTP Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••" 
                      value={settings.smtp_pass || ''} 
                      onChange={e=>setSettings({...settings, smtp_pass: e.target.value})} 
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold font-mono text-sm rounded-sm" 
                    />
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded text-sm mb-4">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded text-sm mb-4 font-semibold">
                  Settings and SMTP configurations saved successfully!
                </div>
              )}

              <button onClick={saveSettings} className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Save Settings</button>
            </div>
          </section>
        )}

        {activeTab === 'testimonials' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">Success Stories</h2>
             </div>
             
             {!testimonials ? (
                <div className="text-muted italic mb-10 text-sm">Loading or empty...</div>
             ) : !Array.isArray(testimonials) ? (
                <div className="bg-red-500/10 text-red-500 border border-red-500/30 p-4 mb-4 text-xs font-mono overflow-auto">
                    DEBUG RESPONSE: {JSON.stringify(testimonials, null, 2)}
                </div>
             ) : testimonials.length === 0 ? (
                <div className="text-muted italic mb-10 text-sm">No stories found.</div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                   {testimonials.map(t => {
                      const isPending = t.status === 'pending';
                      return (
                       <div key={t.id} className={`bg-bg-card border ${isPending ? 'border-red-500/50' : 'border-gold/20'} p-6 relative flex flex-col`}>
                          <div className="flex justify-between mb-2">
                           {isPending ? (
                              <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Pending Approval</span>
                           ) : (
                              <span className="text-[10px] text-gold/60 uppercase tracking-widest font-bold">Approved</span>
                           )}
                           <div className="flex gap-4">
                             {isPending && (
                               <button onClick={() => updateTestimonialStatus(t.id, 'approved')} className="text-[10px] uppercase tracking-widest text-green-500 hover:text-green-400">Approve</button>
                             )}
                             <button onClick={() => deleteTestimonial(t.id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400">Delete</button>
                           </div>
                       </div>
                       <p className="italic text-[13px] text-muted mb-6 flex-grow">"{t.text}"</p>
                       <div className="flex justify-between items-center">
                           <p className="font-medium text-[11px] uppercase tracking-wider text-gold">{t.name} <span className="text-muted/60 ml-1">({t.loc})</span></p>
                           <div className="text-right">
                             {t.date && <p className="text-[10px] text-dim tracking-widest uppercase mb-1">{t.date}</p>}
                             <p className="text-gold text-[10px] tracking-[0.12em]">{'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}</p>
                           </div>
                       </div>
                    </div>
                )})}
             </div>
             )}

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
                   <h3 className="text-lg font-serif text-gold mb-6">Add New Story</h3>
                   <form onSubmit={addTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Story Text</label>
                           <AdminRichText name="text" required className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]" />
                       </div>
                       <div>
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Reviewer Name</label>
                           <input type="text" name="name" required className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                       </div>
                       <div>
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Location</label>
                           <input type="text" name="loc" required placeholder="e.g. Mumbai, India" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                       </div>
                       <div>
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Date</label>
                           <input type="text" name="date" required placeholder="e.g. October 2023" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                       </div>
                       <div>
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Initial (for avatar bubble)</label>
                           <input type="text" name="initial" required maxLength={1} placeholder="A" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                       </div>
                       <div>
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Rating (1-5)</label>
                           <select name="rating" required className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold">
                               <option value="5">5 Stars</option>
                               <option value="4">4 Stars</option>
                               <option value="3">3 Stars</option>
                               <option value="2">2 Stars</option>
                               <option value="1">1 Star</option>
                           </select>
                       </div>
                       <div className="md:col-span-2 mt-4">
                           <button className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Add Story</button>
                       </div>
                   </form>
                 </div>
          </section>
        )}

        {activeTab === 'lifepaths' && (
          <section className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">Life Path Contents</h2>
             </div>
             <div className="space-y-6 mb-10">
                {lifePaths.map(lp => (
                    <div key={lp.id} className="bg-bg-card border border-gold/20 p-6 flex flex-col relative group">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-serif text-gold">Number {lp.id}</h3>
                          <div className="space-x-4">
                            <button onClick={() => deleteLifePath(lp.id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400">Delete</button>
                            <button onClick={() => saveLifePath(lp)} className="border border-gold/30 text-gold px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors rounded">Save Update</button>
                          </div>
                        </div>
                        <input type="text" value={lp.name} placeholder="Title (e.g. The Leader)" onChange={e => {
                            setLifePaths(lifePaths.map(p => p.id === lp.id ? {...p, name: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
                        <AdminRichText value={lp.desc} placeholder="Description" onChange={(e: any) => {
                            setLifePaths(lifePaths.map(p => p.id === lp.id ? {...p, desc: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[160px]" />
                    </div>
                ))}
             </div>

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
               <h3 className="text-lg font-serif text-gold mb-6">Add New Life Path</h3>
               <form onSubmit={addLifePath} className="grid grid-cols-1 gap-6">
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Life Path Number</label>
                       <input type="number" name="id_num" required min="1" max="99" placeholder="e.g. 10" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                   </div>
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Title</label>
                       <input type="text" name="name" required placeholder="e.g. The Master" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                   </div>
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Description</label>
                       <AdminRichText name="desc" required className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]" placeholder="Detailed description..." />
                   </div>
                   <div className="mt-2">
                       <button className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Add Life Path</button>
                   </div>
               </form>
             </div>
          </section>
        )}

        {activeTab === 'pages' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">Content Pages</h2>
             </div>
             <p className="text-sm text-muted mb-8 tracking-wide">
               Use this section to edit static layout copy if needed. HTML is supported. For FAQ Question and Answers, use the separate "FAQs Details" tab.
             </p>
             <div className="space-y-6 mb-10">
                {pages.map(page => (
                    <div key={page.slug} className="bg-bg-card border border-gold/20 p-6 flex flex-col relative group">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-serif text-gold">/{page.slug}</h3>
                          <div className="space-x-4">
                            <button onClick={() => savePage(page)} className="border border-gold/30 text-gold px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors rounded">Save Update</button>
                          </div>
                        </div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Page Title</label>
                        <input type="text" value={page.title || ''} placeholder="Title" onChange={e => {
                            setPages(pages.map(p => p.slug === page.slug ? {...p, title: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
                        
                        <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Page Content</label>
                        <AdminRichText
                          value={page.content || ''} 
                          onChange={(e: any) => {
                            setPages(pages.map(p => p.slug === page.slug ? {...p, content: e.target.value} : p));
                          }} 
                          className="w-full bg-bg-input border border-gold/20 text-text-main mb-12 font-sans pb-10 min-h-[300px]" 
                        />
                    </div>
                ))}
             </div>
          </section>
        )}

        {activeTab === 'faqs' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">FAQ (Questions & Answers)</h2>
               {selectedFaqs.length > 0 && (
                 <button onClick={deleteSelectedFaqs} className="bg-red-900/50 text-red-200 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-800/80 transition-colors rounded border-red-500/50 border">
                    Delete Selected ({selectedFaqs.length})
                 </button>
               )}
             </div>
             <p className="text-sm text-muted mb-8 tracking-wide">
               These questions and answers will be displayed dynamically on the FAQ page.
             </p>
             <Reorder.Group axis="y" values={faqs} onReorder={handleFaqReorder} className="space-y-6 mb-10">
                {faqs.map((faq) => (
                    <FaqAdminItem 
                      key={faq.id} 
                      faq={faq} 
                      isSelected={selectedFaqs.includes(faq.id!)}
                      onToggleSelect={(checked) => {
                        if (checked) setSelectedFaqs([...selectedFaqs, faq.id!]);
                        else setSelectedFaqs(selectedFaqs.filter(id => id !== faq.id));
                      }}
                      onChangeQuestion={(q) => {
                        setFaqs(faqs.map(f => f.id === faq.id ? {...f, question: q} : f));
                      }}
                      onChangeAnswer={(a) => {
                        setFaqs(faqs.map(f => f.id === faq.id ? {...f, answer: a} : f));
                      }}
                      onSave={() => saveFaq(faq)}
                      onDelete={() => deleteFaq(faq.id!)}
                    />
                ))}
             </Reorder.Group>

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
               <h3 className="text-lg font-serif text-gold mb-6">Add New FAQ</h3>
               <form onSubmit={addFaq} className="grid grid-cols-1 gap-6">
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Question</label>
                       <input type="text" name="question" required placeholder="e.g. How accurate is Numerology?" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                   </div>
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Answer</label>
                       <ReactQuill 
                          theme="snow" 
                          value={newFaqAnswer} 
                          onChange={(content) => { setNewFaqAnswer(content); }} modules={quillModules} formats={quillFormats} 
                          className="w-full bg-bg-input border border-gold/20 text-text-main h-48 mb-8 font-sans pb-10" 
                        />
                   </div>
                   <div className="mt-2">
                       <button className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Add FAQ</button>
                   </div>
               </form>
             </div>
          </section>
        )}
         {activeTab === 'process' && settings && (
           <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-serif text-gold">Your Journey in Three Steps (Process)</h2>
               <div className="flex items-center gap-4">
                 {saveSuccess && <span className="text-emerald-400 font-mono text-xs animate-pulse">✓ Saved Successfully</span>}
                 {saveError && <span className="text-rose-400 font-mono text-xs">Error: {saveError}</span>}
                 <button 
                   onClick={saveSettings}
                   disabled={saving}
                   className="bg-gold hover:bg-gold-lt text-bg-dark font-bold px-6 py-3 text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                 >
                   {saving ? "Saving..." : "Save Process"}
                 </button>
               </div>
             </div>
             
             <p className="text-sm text-muted mb-8 tracking-wide max-w-2xl leading-relaxed">
               Update the titles and descriptions for the three-step process shown on the homepage.
             </p>
             
             <div className="space-y-8">
               {/* Step 1 */}
               <div className="bg-bg-card border border-gold/20 p-6 rounded">
                 <h3 className="text-sm uppercase tracking-widest text-gold mb-4">Step 1 details</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Title</label>
                     <input
                       type="text"
                       value={settings.journey_step1_title || ''}
                       onChange={e => setSettings({ ...settings, journey_step1_title: e.target.value })}
                       placeholder="e.g. Book Your Session"
                       className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-sans"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Description</label>
                     <AdminRichText
                       value={settings.journey_step1_desc || ''}
                       onChange={(e: any) => setSettings({ ...settings, journey_step1_desc: e.target.value })}
                       className="w-full bg-bg-input border border-gold/20 pb-10 rounded min-h-[140px]"
                     />
                   </div>
                 </div>
               </div>

               {/* Step 2 */}
               <div className="bg-bg-card border border-gold/20 p-6 rounded">
                 <h3 className="text-sm uppercase tracking-widest text-gold mb-4">Step 2 details</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Title</label>
                     <input
                       type="text"
                       value={settings.journey_step2_title || ''}
                       onChange={e => setSettings({ ...settings, journey_step2_title: e.target.value })}
                       placeholder="e.g. Receive Your Session"
                       className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-sans"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Description</label>
                     <AdminRichText
                       value={settings.journey_step2_desc || ''}
                       onChange={(e: any) => setSettings({ ...settings, journey_step2_desc: e.target.value })}
                       className="w-full bg-bg-input border border-gold/20 pb-10 rounded min-h-[140px]"
                     />
                   </div>
                 </div>
               </div>

               {/* Step 3 */}
               <div className="bg-bg-card border border-gold/20 p-6 rounded">
                 <h3 className="text-sm uppercase tracking-widest text-gold mb-4">Step 3 details</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Title</label>
                     <input
                       type="text"
                       value={settings.journey_step3_title || ''}
                       onChange={e => setSettings({ ...settings, journey_step3_title: e.target.value })}
                       placeholder="e.g. Continue Your Healing Path"
                       className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-sans"
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Description</label>
                     <AdminRichText
                       value={settings.journey_step3_desc || ''}
                       onChange={(e: any) => setSettings({ ...settings, journey_step3_desc: e.target.value })}
                       className="w-full bg-bg-input border border-gold/20 pb-10 rounded min-h-[140px]"
                     />
                   </div>
                 </div>
               </div>
             </div>
           </section>
         )}
         {activeTab === 'profile' && settings && (
           <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-serif text-gold">About SEVEN Profile Settings</h2>
               <div className="flex items-center gap-4">
                 {saveSuccess && <span className="text-emerald-400 font-mono text-xs animate-pulse">✓ Saved Successfully</span>}
                 {saveError && <span className="text-rose-400 font-mono text-xs">Error: {saveError}</span>}
                 <button 
                   onClick={saveSettings}
                   disabled={saving}
                   className="bg-gold hover:bg-gold-lt text-bg-dark font-bold px-6 py-3 text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                 >
                   {saving ? "Saving..." : "Save Profile"}
                 </button>
               </div>
             </div>
             
             <p className="text-sm text-muted mb-8 tracking-wide max-w-2xl leading-relaxed">
               Update your homepage "About SEVEN" section's display details, profile picture path, and descriptions for perfect paragraph alignment.
              </p>
               {/* Profile Editor Grid */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
               {/* Preview Side */}
               <div className="md:col-span-4 space-y-6">
                 <div className="bg-bg-card border border-gold/20 p-6 rounded">
                   <h3 className="text-xs uppercase tracking-wider text-gold mb-4 font-mono font-bold">Live Photo Preview</h3>
                   <div className="w-full aspect-[3/4] bg-bg-input border border-gold/15 rounded overflow-hidden flex items-center justify-center relative shadow-inner">
                     <img 
                       src={settings.profile_photo || '/profile.jpeg'} 
                       alt="Profile Preview" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = '/profile.jpeg';
                       }}
                     />
                   </div>
                   <div className="text-[10px] text-muted mt-3 font-mono text-center break-all">
                     Current Picture: {settings.profile_photo || '/profile.jpeg'}
                   </div>
                 </div>
               </div>

               {/* Editor Side */}
               <div className="md:col-span-8 space-y-6">
                 <div className="bg-bg-card border border-gold/20 p-8 space-y-6 rounded shadow-sm">
                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-mono">Profile Photo Path or URL</label>
                      
                      {/* Direct Upload Option */}
                      <div className="mb-6 mt-2">
                        <div className="border border-dashed border-gold/30 hover:border-gold/60 bg-bg-input/20 p-6 rounded text-center transition-all relative cursor-pointer group mb-3">
                          <input 
                            type="file" 
                            id="profile-upload" 
                            accept="image/*" 
                            onChange={handleUpload} 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            disabled={uploading}
                          />
                          <div className="space-y-2">
                            <div className="text-gold/85 group-hover:text-gold flex justify-center text-xl font-bold">
                              {uploading ? "⌛" : "↑"}
                            </div>
                            <div>
                              <span className="text-xs text-text-main block font-semibold">
                                {uploading ? "Uploading, please wait..." : "Click or Drag & Drop to Upload Photo"}
                              </span>
                              <span className="text-[10px] text-muted font-mono block mt-0.5">
                                JPG, PNG, WEBP or GIF up to 5MB
                              </span>
                            </div>
                          </div>
                        </div>

                        {uploadError && (
                          <p className="text-xs text-rose-400 font-mono mb-2">❌ {uploadError}</p>
                        )}
                      </div>

                      <label className="block text-[10px] uppercase tracking-[0.05em] text-gold/80 mb-2 font-semibold font-mono">Or specify Image URL / Path manually</label>
                     <input 
                       type="text" 
                       value={settings.profile_photo || ''}
                        onChange={e => setSettings({...settings, profile_photo: e.target.value})} 
                       placeholder="e.g. /profile.jpeg or https://images.com/..." 
                       className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold text-sm text-text-main" 
                     />
                     <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
                       Specify absolute filename path (e.g. <code className="text-gold font-mono">/profile.jpeg</code>) or an external image link.
                     </p>
                   </div>

                   <div>
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-serif text-gold">About SEVEN Section Title</label>
                     <input 
                       type="text" 
                       value={settings.about_title || ''} 
                       onChange={e => setSettings({...settings, about_title: e.target.value})} 
                       placeholder="Bridging ancient wisdom with modern life guidance" 
                       className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold text-sm text-text-main font-serif" 
                     />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted font-semibold font-mono">About SEVEN Description: Paragraph 1</label>
                       <span className="text-[10px] text-gold font-mono font-semibold">Better alignment view</span>
                     </div>
                     <AdminRichText 
                       value={settings.about_para1 || ''} 
                       onChange={(e: any) => setSettings({...settings, about_para1: e.target.value})} 
                       placeholder="Structure your first introduction paragraph..." 
                       className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]" 
                     />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted font-semibold font-mono">About SEVEN Description: Paragraph 2</label>
                       <span className="text-[10px] text-gold font-mono font-semibold font-serif">Better alignment view</span>
                     </div>
                     <AdminRichText 
                       value={settings.about_para2 || ''} 
                       onChange={(e: any) => setSettings({...settings, about_para2: e.target.value})} 
                       placeholder="Structure your second approach or philosophy paragraph..." 
                       className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]" 
                     />
                   </div>

                   <div className="pt-2">
                     <button 
                       onClick={saveSettings}
                       className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded w-full" disabled={saving}
                     >
                       <>
                          <span className="block">{saving ? "Saving Profile..." : "Save Profile Settings & Align Content"}</span>
                          {saveSuccess && (
                            <span className="block bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-2 rounded text-center text-xs font-mono mt-2 normal-case tracking-normal">
                              ✓ Profile settings saved and homepage aligned!
                            </span>
                          )}
                          {saveError && (
                            <span className="block bg-rose-500/20 border border-rose-500/30 text-rose-300 p-2 rounded text-center text-xs font-mono mt-2 normal-case tracking-normal">
                              ❌ Save failed: {saveError}
                            </span>
                          )}
                        </>
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </section>
         )}
        
          {activeTab === 'pricing' && (
            <section className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans p-2">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-gold mb-2">Service Modalities &amp; Energy Exchange</h2>
                  <p className="text-sm text-muted leading-relaxed max-w-xl">
                    Adjust active price plans, titles, descriptions, and highlights for divine booking exchange alignment.
                  </p>
                </div>
                <span className="text-xs text-muted uppercase tracking-widest">{services.length} Services Active</span>
              </div>

              {/* Existing Services Grid */}
              <div className="space-y-6 mb-12">
                <h3 className="text-lg font-serif text-gold border-b border-gold/10 pb-2 mb-4">Active Services</h3>
                {services.length === 0 ? (
                  <p className="text-xs uppercase tracking-widest text-muted py-6">No services loaded</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                      <ServiceAdminItem
                        key={service.id || index}
                        service={service}
                        partners={partners}
                        onChange={(updated) => {
                          const copy = [...services];
                          copy[index] = updated;
                          setServices(copy);
                        }}
                        onSave={() => saveService(service)}
                        onDelete={() => service.id && deleteService(service.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Create Service Section */}
              <div className="bg-bg-card border border-gold/20 p-8 rounded shadow-sm max-w-3xl">
                <h3 className="text-lg font-serif text-gold mb-6 border-b border-gold/15 pb-2">Add New Modality / Plan</h3>
                <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Service Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Relationship Compatibility Analysis"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-mono">Price (Formatted)</label>
                      <input
                        type="text"
                        name="price"
                        required
                        placeholder="e.g. ₹51,000"
                        className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-mono text-sm text-text-main"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold text-gold font-mono font-bold">Short Cost</label>
                      <input
                        type="text"
                        name="rawPrice"
                        required
                        placeholder="e.g. ₹51k"
                        className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-mono text-sm text-text-main"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Emoji / Icon text</label>
                    <input
                      type="text"
                      name="iconText"
                      placeholder="e.g. 💑"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Operator</label>
                    <select
                      name="operator_id"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                    >
                      <option value="">Admin (Default)</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-serif">Service Description</label>
                    <AdminRichText
                      name="description"
                      required
                      placeholder="Summarize this service vibration in few elegant lines..."
                      className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded-sm w-full font-semibold">
                      Add Service Modality
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
          {activeTab === 'pathways' && (
            <section className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans p-2">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-gold mb-2">Pathways to Clarity</h2>
                  <p className="text-sm text-muted leading-relaxed max-w-xl">
                    Manage the pathway cards shown on the services page.
                  </p>
                </div>
                <span className="text-xs text-muted uppercase tracking-widest">{pathways.length} Pathways Active</span>
              </div>

              {/* Existing Pathways Grid */}
              <div className="space-y-6 mb-12">
                <h3 className="text-lg font-serif text-gold border-b border-gold/10 pb-2 mb-4">Active Cards</h3>
                {pathways.length === 0 ? (
                  <p className="text-xs uppercase tracking-widest text-muted py-6">No pathway cards loaded</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pathways.map((pathway, index) => (
                      <PathwayAdminItem
                        key={pathway.id || index}
                        pathway={pathway}
                        onChange={(updated) => {
                          const copy = [...pathways];
                          copy[index] = updated;
                          setPathways(copy);
                        }}
                        onSave={() => savePathway(pathway)}
                        onDelete={() => pathway.id && deletePathway(pathway.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Create Pathway Section */}
              <div className="bg-bg-card border border-gold/20 p-8 rounded shadow-sm max-w-3xl">
                <h3 className="text-lg font-serif text-gold mb-6 border-b border-gold/15 pb-2">Add New Pathway Card</h3>
                <form onSubmit={addPathway} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Card Number</label>
                    <input
                      type="text"
                      name="card_number"
                      required
                      placeholder="e.g. 14"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-mono text-sm text-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      placeholder="e.g. new-service"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Past Life Regression Analysis"
                      className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-serif">Short Description</label>
                    <AdminRichText
                      name="short_desc"
                      required
                      placeholder="Describe this pathway..."
                      className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded-sm w-full font-semibold">
                      Add Pathway Card
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
          {activeTab === 'partners' && (
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <h2 className="text-2xl font-serif text-gold">My Guiding Lights</h2>
              </div>
              <div className="bg-bg-card border border-gold/20 p-8 rounded shadow-sm max-w-4xl">
                <h3 className="text-lg font-serif text-gold mb-6 border-b border-gold/15 pb-2">Existing Guides</h3>
                {partners.length === 0 ? (
                  <p className="text-sm text-muted italic">No guides configured yet.</p>
                ) : (
                  <Reorder.Group axis="y" values={partners} onReorder={async (newOrder) => {
                    setPartners(newOrder);
                    await apiFetch('/api/partners/reorder', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ orderIds: newOrder.map(c => c.id) })
                    });
                  }} className="space-y-4">
                    {partners.map((partner, index) => (
                      <PartnerAdminItem
                        key={partner.id}
                        partner={partner}
                        index={index}
                        savePartner={savePartner}
                        deletePartner={deletePartner}
                        setPartners={setPartners}
                        partners={partners}
                        handlePartnerPhotoUpload={handlePartnerPhotoUpload}
                        partnerSaveSuccess={partnerSaveSuccess}
                      />
                    ))}

                  </Reorder.Group>
                )}
              </div>

              <div className="bg-bg-card border border-gold/20 p-8 rounded shadow-sm max-w-3xl">
                <h3 className="text-lg font-serif text-gold mb-6 border-b border-gold/15 pb-2">Add New Guide / Healer</h3>
                <form onSubmit={addPartner} className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Gratitude</label>
                    <AdminRichText
                      name="gratitude"
                      placeholder="e.g. With Gratitude"
                      className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. John Doe"
                        className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded font-serif text-sm text-text-main"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Title</label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g. Senior Healer & Guide"
                        className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold rounded text-sm text-text-main"
                      />
                    </div>
                  </div>
                  <div>
                    <input type="hidden" name="whatsapp" value={newPartnerWhatsapp} />
                    <PhoneInput 
                      label="WhatsApp Number (Booking Contact)"
                      className="w-full"
                      value={newPartnerWhatsapp}
                      onChange={setNewPartnerWhatsapp}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold">Profile Photo</label>
                    <input
                      type="file"
                      name="profile_photo"
                      accept="image/*"
                      className="w-full bg-bg-input border border-gold/20 p-2 outline-none focus:border-gold rounded text-sm text-muted file:bg-gold file:text-bg-dark file:border-none file:px-4 file:py-1 file:mr-4 file:rounded-sm file:text-xs file:uppercase file:tracking-wider file:font-bold hover:file:bg-gold-lt cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-serif">Description</label>
                    <AdminRichText
                      name="description"
                      required
                      placeholder="Brief bio or description here..."
                      className="w-full bg-bg-input border border-gold/20 pb-10 min-h-[140px]"
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded-sm w-full font-semibold">
                      Add Guide
                    </button>
                    <p className="text-[10px] uppercase text-gold/60 tracking-wider text-center pt-3">You can upload the profile photo from the list above after creation.</p>
                  </div>
                </form>
              </div>
            </section>
          )}
       </main>
    </div>
  );
}
