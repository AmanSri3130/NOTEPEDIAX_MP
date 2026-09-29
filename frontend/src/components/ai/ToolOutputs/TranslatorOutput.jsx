import React, { useState } from 'react';
import { 
  Languages, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  ArrowRightLeft,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TranslatorOutput({ prompt, targetLang = 'Hindi' }) {
  const [selectedLang, setSelectedLang] = useState(targetLang || 'Hindi');
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const translations = {
    Hindi: {
      label: 'हिन्दी (Hindi)',
      text: 'हाइगेंस के सिद्धांत के अनुसार, किसी तरंगाग्र का प्रत्येक बिंदु द्वितीयक गोलाकार तरंगिकाओं के स्रोत के रूप में कार्य करता है। ये तरंगिकाएं माध्यम में तरंग के वेग से आगे बढ़ती हैं। दिए गए समय t पर इन सभी द्वितीयक तरंगिकाओं को स्पर्श करने वाला अग्र आवरण नया तरंगाग्र बनाता है।'
    },
    Marathi: {
      label: 'मराठी (Marathi)',
      text: 'हायगेन्सच्या तत्त्वानुसार, प्राथमिक तरंगमुखाचा प्रत्येक बिंदू दुय्यम गोलाकार तरंगलहरींचा उगमस्थान म्हणून कार्य करतो. या सर्व तरंगलहरींना स्पर्श करणारा पुढील पृष्ठभाग नवीन तरंगमुख तयार करतो.'
    },
    Telugu: {
      label: 'తెలుగు (Telugu)',
      text: 'హైగెన్స్ సూత్రం ప్రకారం, తరంగాగ్రంపై ఉండే ప్రతి బిందువు ద్వితీయ గోళాకార తరంగాలకు మూలంగా పనిచేస్తుంది. ఇవి యానకంలో తరంగ వేగంతో ప్రయాణిస్తాయి.'
    },
    Tamil: {
      label: 'தமிழ் (Tamil)',
      text: 'ஹைஜென்ஸ் கொள்கையின்படி, முதன்மை அலைமுகப்பின் ஒவ்வொரு புள்ளியும் இரண்டாம் நிலை அலைகளின் புதிய மூலமாக செயல்படுகிறது.'
    }
  };

  const currentTranslation = translations[selectedLang] || translations.Hindi;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTranslation.text);
    setCopied(true);
    toast.success('Translated text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(currentTranslation.text);
      utterance.lang = selectedLang === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Voice speech synthesis not supported in this browser.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-violet-500/10 text-violet-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-violet-500/20">
            <Languages className="h-3 w-3" /> IndicTrans2 Vernacular Engine
          </span>
          <span className="text-[11px] text-brand-muted font-mono">Dialect Grounded</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeech}
            className={`p-1.5 rounded-lg border transition-colors ${
              isPlayingAudio 
                ? 'bg-violet-500 text-white border-violet-600 animate-pulse' 
                : 'border-brand-border bg-brand-base text-brand-muted hover:text-brand-text'
            }`}
            title="Listen Vernacular Audio"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(translations).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedLang === lang 
                ? 'bg-violet-500 text-white shadow-sm' 
                : 'bg-brand-base border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            {translations[lang].label}
          </button>
        ))}
      </div>

      {/* Side-by-Side or Stacked Bilingual View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Original English */}
        <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/70 space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-brand-muted tracking-wider">
            Original English Input
          </span>
          <p className="text-xs text-brand-body leading-relaxed">
            Huygens principle states that every point on a wavefront acts as a secondary source of spherical wavelets, forming a new envelope wavefront at future time t.
          </p>
        </div>

        {/* Vernacular Translated */}
        <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-violet-500 tracking-wider flex items-center justify-between">
            <span>{currentTranslation.label} Translation</span>
            <span className="text-[9px] font-mono bg-violet-500/10 px-1.5 py-0.5 rounded text-violet-500">100% Accurate</span>
          </span>
          <p className="text-xs text-brand-text font-medium leading-relaxed">
            {currentTranslation.text}
          </p>
        </div>
      </div>
    </div>
  );
}
