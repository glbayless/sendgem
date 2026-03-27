'use client';

// SendGem - Client Onboarding Wizard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useAuth } from '@/components/providers';

interface OnboardingStatus {
  profile_completed: boolean;
  documents_uploaded: boolean;
  website_linked: boolean;
  voice_samples_provided: boolean;
  competitors_added: boolean;
}

const steps = [
  {
    id: 'company',
    name: 'Company Profile',
    description: 'Tell us about your business',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Upload pitch decks, case studies, guides',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'website',
    name: 'Website',
    description: 'Link your website for context',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  {
    id: 'voice',
    name: 'Writing Style',
    description: 'Sample emails (optional)',
    icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
  },
  {
    id: 'competitors',
    name: 'Competitors',
    description: 'Who you compete against',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Company Profile State
  const [companyData, setCompanyData] = useState({
    name: '',
    tagline: '',
    industry: '',
    target_audience: '',
    pain_points: '',
    unique_value_proposition: '',
    website_url: '',
    linkedin_url: '',
  });

  // Document Upload State
  const [documents, setDocuments] = useState<{ name: string; category: string; file: File | null }[]>([]);

  // Voice Sample State
  const [voiceSample, setVoiceSample] = useState('');

  // Competitor State
  const [competitors, setCompetitors] = useState([{ name: '', website: '', notes: '' }]);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/onboarding/status');
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      if (res.ok) {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveDocuments = async () => {
    setSaving(true);
    try {
      // Upload each document
      for (const doc of documents) {
        if (!doc.file) continue;
        
        const formData = new FormData();
        formData.append('file', doc.file);
        formData.append('name', doc.name);
        formData.append('category', doc.category);

        await fetch('/api/onboarding/documents', {
          method: 'POST',
          body: formData,
        });
      }
      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving documents:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveWebsite = async () => {
    setSaving(true);
    try {
      await fetch('/api/onboarding/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: companyData.website_url }),
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving website:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveVoiceSample = async () => {
    setSaving(true);
    try {
      if (voiceSample.trim()) {
        await fetch('/api/onboarding/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: voiceSample }),
        });
      }
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving voice sample:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveCompetitors = async () => {
    setSaving(true);
    try {
      for (const comp of competitors) {
        if (comp.name.trim()) {
          await fetch('/api/onboarding/competitors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comp),
          });
        }
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving competitors:', error);
    } finally {
      setSaving(false);
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { name: '', category: 'pitch_deck', file: null }]);
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: '', website: '', notes: '' }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to SendGem</h1>
        <p className="text-gray-400">Let's set up your account so we can start crafting personalized emails.</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index < currentStep
                ? 'bg-green-600 border-green-600'
                : index === currentStep
                ? 'border-indigo-500 bg-indigo-500/20'
                : 'border-[#333] bg-[#111]'
            }`}>
              {index < currentStep ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium text-gray-400">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 ${index < currentStep ? 'bg-green-600' : 'bg-[#333]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#222]">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Company Profile</h2>
                <p className="text-sm text-gray-400">Tell us about your business so we can personalize outreach</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name"
                placeholder="Acme Corp"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              />
              <Input
                label="Industry"
                placeholder="SaaS, Healthcare, FinTech..."
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
              />
            </div>

            <Input
              label="Tagline / One-liner"
              placeholder="We help X do Y"
              value={companyData.tagline}
              onChange={(e) => setCompanyData({ ...companyData, tagline: e.target.value })}
            />

            <Input
              label="Target Audience"
              placeholder="Who are your ideal customers?"
              value={companyData.target_audience}
              onChange={(e) => setCompanyData({ ...companyData, target_audience: e.target.value })}
            />

            <Input
              label="Unique Value Proposition"
              placeholder="What makes you different from competitors?"
              value={companyData.unique_value_proposition}
              onChange={(e) => setCompanyData({ ...companyData, unique_value_proposition: e.target.value })}
            />

            <Input
              label="Pain Points You Solve"
              placeholder="What problems do you solve for customers? (comma-separated)"
              value={companyData.pain_points}
              onChange={(e) => setCompanyData({ ...companyData, pain_points: e.target.value })}
            />

            <div className="flex justify-end">
              <Button onClick={saveCompanyProfile} loading={saving}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#222]">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
                <p className="text-sm text-gray-400">Share pitch decks, case studies, product guides - anything that explains what you do</p>
              </div>
            </div>

            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-[#0a0a0a] rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Document Name"
                      placeholder="Q1 2024 Case Study"
                      value={doc.name}
                      onChange={(e) => {
                        const newDocs = [...documents];
                        newDocs[index].name = e.target.value;
                        setDocuments(newDocs);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                    <select
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-white"
                      value={doc.category}
                      onChange={(e) => {
                        const newDocs = [...documents];
                        newDocs[index].category = e.target.value;
                        setDocuments(newDocs);
                      }}
                    >
                      <option value="pitch_deck">Pitch Deck</option>
                      <option value="one_pager">One-Pager</option>
                      <option value="case_study">Case Study</option>
                      <option value="product_guide">Product Guide</option>
                      <option value="pricing">Pricing Sheet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">File</label>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg"
                      className="w-full px-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                      onChange={(e) => {
                        const newDocs = [...documents];
                        newDocs[index].file = e.target.files?.[0] || null;
                        setDocuments(newDocs);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="secondary" onClick={addDocument}>
              + Add Another Document
            </Button>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(0)}>Back</Button>
              <Button onClick={saveDocuments} loading={saving}>Continue</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#222]">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Your Website</h2>
                <p className="text-sm text-gray-400">Link your website so we can scrape key info about your business</p>
              </div>
            </div>

            <Input
              label="Website URL"
              placeholder="https://yourcompany.com"
              value={companyData.website_url}
              onChange={(e) => setCompanyData({ ...companyData, website_url: e.target.value })}
            />

            <div className="p-4 bg-[#0a0a0a] rounded-lg">
              <h3 className="text-sm font-medium text-white mb-2">What we'll extract:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Key services and products</li>
                <li>• Team member names & roles</li>
                <li>• Recent news or blog posts</li>
                <li>• Company description & tone</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={saveWebsite} loading={saving}>Continue</Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#222]">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Writing Style (Optional)</h2>
                <p className="text-sm text-gray-400">Paste a sample email you've sent - we'll use it to match your tone</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Sample Email</label>
              <textarea
                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 h-48"
                placeholder="Hi [Name],&#10;&#10;Saw your recent post about X and thought...&#10;&#10;Best,&#10;[Your Name]"
                value={voiceSample}
                onChange={(e) => setVoiceSample(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={saveVoiceSample} loading={saving}>Continue</Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#222]">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Competitor Intel</h2>
                <p className="text-sm text-gray-400">Who do you compete against? This helps us position you差异化</p>
              </div>
            </div>

            <div className="space-y-4">
              {competitors.map((comp, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-[#0a0a0a] rounded-lg">
                  <Input
                    label="Competitor Name"
                    placeholder="Competitor X"
                    value={comp.name}
                    onChange={(e) => {
                      const newComps = [...competitors];
                      newComps[index].name = e.target.value;
                      setCompetitors(newComps);
                    }}
                  />
                  <Input
                    label="Website"
                    placeholder="https://competitor.com"
                    value={comp.website}
                    onChange={(e) => {
                      const newComps = [...competitors];
                      newComps[index].website = e.target.value;
                      setCompetitors(newComps);
                    }}
                  />
                  <Input
                    label="Notes"
                    placeholder="Why we beat them..."
                    value={comp.notes}
                    onChange={(e) => {
                      const newComps = [...competitors];
                      newComps[index].notes = e.target.value;
                      setCompetitors(newComps);
                    }}
                  />
                </div>
              ))}
            </div>

            <Button variant="secondary" onClick={addCompetitor}>
              + Add Competitor
            </Button>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button onClick={saveCompetitors} loading={saving}>Complete Setup</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}