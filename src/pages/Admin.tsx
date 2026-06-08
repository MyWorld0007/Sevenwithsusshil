import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { Settings, LifePath, Testimonial, Faq } from '../Types';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [settings, setSettings] = useState<Settings | null>(null);
  const [lifePaths, setLifePaths] = useState<LifePath[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pages, setPages] = useState<{slug: string; title: string; content: string}[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  const [activeTab, setActiveTab] = useState<'settings' | 'testimonials' | 'lifepaths' | 'pages' | 'faqs' | 'profile'>('settings');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
     try {
       const [setRes, lpRes, testRes, pagesRes, faqsRes] = await Promise.all([
           apiFetch('/api/settings'),
           apiFetch('/api/life_paths'),
           apiFetch('/api/testimonials'),
           apiFetch('/api/pages'),
           apiFetch('/api/faqs')
       ]);
       const setResText = await setRes.json();
       const lpResText = await lpRes.json();
       const testResText = await testRes.json();
       const pagesResText = await pagesRes.json();
       const faqsResText = await faqsRes.json();

       setSettings(setResText.error ? null : setResText);
       setLifePaths(Array.isArray(lpResText) ? lpResText : []);
       setTestimonials(Array.isArray(testResText) ? testResText : []);
       setPages(Array.isArray(pagesResText) ? pagesResText : []);
       setFaqs(Array.isArray(faqsResText) ? faqsResText : []);
     } catch (err) {
         console.error(err);
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

  const addFaq = async (e: any) => {
      e.preventDefault();
      const form = e.target;
      const question = form.question.value;
      const answer = form.answer.value;
      
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
         fetchData();
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
             onClick={() => setActiveTab('settings')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'settings' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Contact Settings
           </button>
           <button 
             onClick={() => setActiveTab('testimonials')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'testimonials' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Testimonials
           </button>
           <button 
             onClick={() => setActiveTab('lifepaths')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'lifepaths' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Life Paths
           </button>
           <button 
             onClick={() => setActiveTab('pages')} 
             className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors rounded ${activeTab === 'pages' ? 'bg-gold text-bg-dark font-bold' : 'text-gold hover:bg-gold/10'}`}
           >
             Content Pages
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
             About Profile
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
                   <textarea value={settings.email_body} onChange={e=>setSettings({...settings, email_body: e.target.value})} className="w-full bg-bg-input border border-gold/20 p-3 h-32 outline-none focus:border-gold" />
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

              <button onClick={saveSettings} className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Save Settings</button>
            </div>
          </section>
        )}

        {activeTab === 'testimonials' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">Testimonials</h2>
               <span className="text-xs text-muted uppercase tracking-widest">{testimonials.length} / 7 Setup</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-bg-card border border-gold/20 p-6 relative flex flex-col">
                       <div className="flex justify-end mb-2">
                           <button onClick={() => deleteTestimonial(t.id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400">Delete</button>
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
                ))}
             </div>

             {testimonials.length < 7 && (
                 <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
                   <h3 className="text-lg font-serif text-gold mb-6">Add New Testimonial</h3>
                   <form onSubmit={addTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                           <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Testimonial Text</label>
                           <textarea name="text" required className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold min-h-[100px]" />
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
                           <button className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Add Testimonial</button>
                       </div>
                   </form>
                 </div>
             )}
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
                        <textarea value={lp.desc} placeholder="Description" onChange={e => {
                            setLifePaths(lifePaths.map(p => p.id === lp.id ? {...p, desc: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 h-28 outline-none focus:border-gold" />
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
                       <textarea name="desc" required className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold min-h-[100px]" placeholder="Detailed description..." />
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
                        <input type="text" value={page.title} placeholder="Title" onChange={e => {
                            setPages(pages.map(p => p.slug === page.slug ? {...p, title: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
                        
                        <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Page Content (HTML Supported)</label>
                        <textarea value={page.content} placeholder="Content" onChange={e => {
                            setPages(pages.map(p => p.slug === page.slug ? {...p, content: e.target.value} : p));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 h-64 outline-none focus:border-gold font-mono text-sm leading-relaxed" />
                    </div>
                ))}
             </div>
          </section>
        )}

        {activeTab === 'faqs' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif text-gold">FAQ (Questions & Answers)</h2>
             </div>
             <p className="text-sm text-muted mb-8 tracking-wide">
               These questions and answers will be displayed dynamically on the FAQ page.
             </p>
             <div className="space-y-6 mb-10">
                {faqs.map(faq => (
                    <div key={faq.id} className="bg-bg-card border border-gold/20 p-6 flex flex-col relative group">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm uppercase tracking-widest font-serif text-muted">ID: {faq.id}</h3>
                          <div className="space-x-4">
                            <button onClick={() => saveFaq(faq)} className="border border-gold/30 text-gold px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors rounded">Save Update</button>
                            <button onClick={() => deleteFaq(faq.id)} className="border border-red-500/30 text-red-400 px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 transition-colors rounded">Delete</button>
                          </div>
                        </div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Question</label>
                        <input type="text" value={faq.question} placeholder="Question" onChange={e => {
                            setFaqs(faqs.map(f => f.id === faq.id ? {...f, question: e.target.value} : f));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 mb-4 outline-none focus:border-gold" />
                        
                        <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Answer (HTML Supported)</label>
                        <textarea value={faq.answer} placeholder="Answer" onChange={e => {
                            setFaqs(faqs.map(f => f.id === faq.id ? {...f, answer: e.target.value} : f));
                        }} className="w-full bg-bg-input border border-gold/20 p-3 h-32 outline-none focus:border-gold leading-relaxed" />
                    </div>
                ))}
             </div>

             <div className="bg-bg-card border border-gold/20 p-8 shadow-sm">
               <h3 className="text-lg font-serif text-gold mb-6">Add New FAQ</h3>
               <form onSubmit={addFaq} className="grid grid-cols-1 gap-6">
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Question</label>
                       <input type="text" name="question" required placeholder="e.g. How accurate is Numerology?" className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold" />
                   </div>
                   <div>
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">Answer</label>
                       <textarea name="answer" required className="w-full bg-bg-input border border-gold/20 p-3 outline-none focus:border-gold min-h-[100px]" placeholder="Answer..." />
                   </div>
                   <div className="mt-2">
                       <button className="bg-gold text-bg-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded">Add FAQ</button>
                   </div>
               </form>
             </div>
          </section>
        )}
         {activeTab === 'profile' && settings && (
           <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-serif text-gold">About Profile Settings</h2>
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
               Update your homepage "About" section's display details, profile picture path, and descriptions for perfect paragraph alignment.
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
                     <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2 font-semibold font-serif text-gold">About Section Title</label>
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
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted font-semibold font-mono">About Description: Paragraph 1</label>
                       <span className="text-[10px] text-gold font-mono font-semibold">Better alignment view</span>
                     </div>
                     <textarea 
                       value={settings.about_para1 || ''} 
                       onChange={e => setSettings({...settings, about_para1: e.target.value})} 
                       placeholder="Structure your first introduction paragraph..." 
                       className="w-full bg-bg-input border border-gold/20 p-3 h-36 outline-none focus:border-gold text-sm text-text-main leading-relaxed resize-y" 
                     />
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs uppercase tracking-[0.1em] text-muted font-semibold font-mono">About Description: Paragraph 2</label>
                       <span className="text-[10px] text-gold font-mono font-semibold font-serif">Better alignment view</span>
                     </div>
                     <textarea 
                       value={settings.about_para2 || ''} 
                       onChange={e => setSettings({...settings, about_para2: e.target.value})} 
                       placeholder="Structure your second approach or philosophy paragraph..." 
                       className="w-full bg-bg-input border border-gold/20 p-3 h-36 outline-none focus:border-gold text-sm text-text-main leading-relaxed resize-y" 
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
        
       </main>
    </div>
  );
}
