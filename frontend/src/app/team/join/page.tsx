'use client';
import React, { useState } from 'react';

export default function TeamJoinPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('role', role);
    fd.append('bio', bio);
    fd.append('facebook', facebook);
    fd.append('twitter', twitter);
    fd.append('instagram', instagram);
    fd.append('linkedin', linkedin);
    fd.append('whatsapp', whatsapp);
    if (image) fd.append('image', image);
    const res = await fetch('http://localhost:5001/team', { method: 'POST', body: fd });
    if (res.ok) { setMsg('Submitted'); setName(''); setRole(''); setBio(''); setImage(null); }
    else setMsg('Failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Join Team</h1>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full border p-2" required />
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role" className="w-full border p-2" required />
        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="w-full border p-2" />
        <input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" className="w-full border p-2" />
        <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="Twitter URL" className="w-full border p-2" />
        <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" className="w-full border p-2" />
        <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className="w-full border p-2" />
        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp number (e.g. 08012345678)" className="w-full border p-2" />
        <p className="text-xs text-gray-500">Do not include +234; type the number normally (e.g. 08012345678).</p>
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
        <p className="text-xs text-gray-500">Upload a public profile picture (visible to everyone).</p>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}