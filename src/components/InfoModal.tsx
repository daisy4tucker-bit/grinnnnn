import React from 'react';
import { X, Heart, Shield, Users, Briefcase, HelpCircle, ExternalLink } from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';

export type InfoModalType = 
  | 'about' 
  | 'equality' 
  | 'careers' 
  | 'advertise' 
  | 'help' 
  | 'blog';

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const contentMap: Record<InfoModalType, {
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
    body: React.ReactNode;
  }> = {
    about: {
      title: 'About Grindr',
      subtitle: 'Connecting the global LGBTQ+ community since 2009.',
      badge: 'OUR MISSION',
      icon: <GrindrLogo iconOnly size={24} color="#000" />,
      body: (
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            Grindr is the world's leading social networking app for gay, bi, trans, and queer people. Since its launch in 2009, Grindr has grown to serve millions of daily active users in virtually every country across the globe.
          </p>
          <p>
            Whether looking for friends, dating, community, casual connections, or mutual support, Grindr makes it effortless to discover who is right around the corner or across oceans.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-white/5 p-3 rounded-xl">
              <strong className="block text-white text-base font-black">13M+</strong>
              <span className="text-neutral-400">Monthly Active Users</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl">
              <strong className="block text-white text-base font-black">190+</strong>
              <span className="text-neutral-400">Countries & Territories</span>
            </div>
          </div>
        </div>
      ),
    },
    equality: {
      title: 'Grindr for Equality',
      subtitle: 'Advancing health, safety, and human rights worldwide.',
      badge: 'GLOBAL ADVOCACY',
      icon: <Heart className="w-5 h-5 text-red-500 fill-red-500" />,
      body: (
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            <strong>Grindr for Equality (G4E)</strong> is an evergreen initiative that leverages Grindr's global reach to promote justice, health equity, and safety for LGBTQ+ communities everywhere.
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl">
              <span className="text-[#ffce00] font-bold">✓</span>
              <span><strong>Free at-home HIV test kits</strong> distributed to thousands across dozens of partner clinics.</span>
            </li>
            <li className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl">
              <span className="text-[#ffce00] font-bold">✓</span>
              <span><strong>Safety Alerts</strong> warning users when local regimes or hostilities threaten personal security.</span>
            </li>
            <li className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl">
              <span className="text-[#ffce00] font-bold">✓</span>
              <span><strong>Direct Relief & Asylum grants</strong> supporting grassroots queer activists worldwide.</span>
            </li>
          </ul>
        </div>
      ),
    },
    careers: {
      title: 'Careers at Grindr',
      subtitle: 'Build tech that connects millions with pride and purpose.',
      badge: 'WE ARE HIRING',
      icon: <Briefcase className="w-5 h-5 text-black" />,
      body: (
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            We are a passionate team distributed remotely around the world. We offer comprehensive health benefits, generous equity, parental leave, and an inclusive culture.
          </p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <strong className="text-white block">Senior Full-Stack Engineer</strong>
                <span className="text-neutral-400">Remote · Engineering</span>
              </div>
              <span className="px-2 py-1 bg-[#ffce00]/20 text-[#ffce00] rounded-lg font-bold">Apply</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <strong className="text-white block">Product Designer (Design Systems)</strong>
                <span className="text-neutral-400">Remote · Design</span>
              </div>
              <span className="px-2 py-1 bg-[#ffce00]/20 text-[#ffce00] rounded-lg font-bold">Apply</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <strong className="text-white block">Community Trust & Safety Manager</strong>
                <span className="text-neutral-400">London / Remote · Operations</span>
              </div>
              <span className="px-2 py-1 bg-[#ffce00]/20 text-[#ffce00] rounded-lg font-bold">Apply</span>
            </div>
          </div>
        </div>
      ),
    },
    advertise: {
      title: 'Advertise with Grindr',
      subtitle: 'Reach a hyper-engaged, loyal LGBTQ+ audience.',
      badge: 'PARTNERSHIPS',
      icon: <Users className="w-5 h-5 text-black" />,
      body: (
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            From native sponsored message cards and interstitial takeovers to geo-targeted event banners, Grindr connects brands with an audience of high purchasing power and cultural influence.
          </p>
          <div className="bg-white/5 p-4 rounded-2xl text-xs space-y-2">
            <p><strong>Over 80%</strong> of our users report high affinity for brands that authentically champion LGBTQ+ causes.</p>
            <p>Ready to launch your campaign? Contact our global brand solutions team at <strong>advertise@grindr.com</strong>.</p>
          </div>
        </div>
      ),
    },
    help: {
      title: 'Safety & Help Center',
      subtitle: 'Your privacy and security are our highest priority.',
      badge: 'SAFETY FIRST',
      icon: <Shield className="w-5 h-5 text-black" />,
      body: (
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            Here are essential tips to stay safe while meeting people online and in person:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="bg-white/5 p-3 rounded-xl">
              <strong className="text-white block mb-0.5">Meet in Public First</strong>
              <span>Always meet a new connection in a well-lit public space like a café or lounge before meeting privately.</span>
            </li>
            <li className="bg-white/5 p-3 rounded-xl">
              <strong className="text-white block mb-0.5">Protect Your Discretion</strong>
              <span>You control your location precision. Use the 'Show Distance' toggle in settings to hide exact meter distance.</span>
            </li>
            <li className="bg-white/5 p-3 rounded-xl">
              <strong className="text-white block mb-0.5">Block and Report Unwanted Behavior</strong>
              <span>Our 24/7 moderation team investigates reports within minutes to keep the community welcoming.</span>
            </li>
          </ul>
        </div>
      ),
    },
    blog: {
      title: 'Grindr Blog & Culture',
      subtitle: 'Stories, sex-positivity, queer art, and dating guides.',
      badge: 'EDITORIAL',
      icon: <GrindrLogo iconOnly size={24} color="#000" />,
      body: (
        <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-[#ffce00] font-bold uppercase">Guide</span>
            <h4 className="text-white font-bold text-sm">Navigating Digital Communities: A Member's Playbook</h4>
            <p className="text-xs text-neutral-400 mt-1">Tips on finding local spots, clubs, and community wherever you go.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-[#ffce00] font-bold uppercase">Health</span>
            <h4 className="text-white font-bold text-sm">The 2026 Guide to PrEP, Doxy-PEP & Sexual Health</h4>
            <p className="text-xs text-neutral-400 mt-1">Everything you need to know about proactive sexual wellness.</p>
          </div>
        </div>
      ),
    },
  };

  const current = contentMap[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ffce00] flex items-center justify-center font-black">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#ffce00] block">
              {current.badge}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">{current.title}</h2>
          </div>
        </div>

        <p className="text-neutral-400 text-xs mb-5">
          {current.subtitle}
        </p>

        {current.body}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
