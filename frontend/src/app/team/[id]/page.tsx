'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Users, MessageCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function TeamMemberPage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    fetch(`http://localhost:5001/team/${params.id}`).then(r => { if(!r.ok) throw new Error('not found'); return r.json(); }).then(setMember).catch(e => setErr(e.message));
  }, [params.id]);

  if (err) return <div className="p-6">Error: {err}</div>;
  if (!member) return <div className="p-6">Loading...</div>;

  const share = () => {
    if (navigator.share) navigator.share({ title: member.name, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      {member.image && <Image src={member.image} alt={member.name} width={400} height={300} className="w-full h-64 object-cover rounded-xl mb-4" />}
      <h1 className="text-3xl font-bold">{member.name}</h1>
      <p className="text-primary-600 font-medium mb-3">{member.role}</p>
      <p className="text-gray-600 mb-4">{member.bio}</p>
      <div className="flex gap-2 mb-4">
        {member.socials && Object.entries(member.socials).map(([key, url]) => {
          if (!url) return null;
          let href = String(url);
          const icons: any = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, whatsapp: MessageCircle };
          const Icon = icons[key] || Users;
          if (key === 'whatsapp') href = `https://wa.me/${href.replace(/\D/g, '')}`;
          return <a key={key} href={href} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-colors"><Icon className="h-4 w-4" /></a>;
        })}
      </div>
      <button onClick={share} className="px-4 py-2 bg-blue-600 text-white rounded">Share</button>
    </div>
  );
}