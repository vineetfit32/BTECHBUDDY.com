"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-ink">
          Contact & Academic Support
        </h1>
        <p className="text-sm sm:text-base text-ink-2 max-w-xl mx-auto">
          Need notes for a specific university or subject? Want to report an issue or contribute topper notes? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Get In Touch
            </h3>

            <div className="space-y-3 text-xs text-ink-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-ink-3 font-medium">Support Email</div>
                  <div className="font-bold text-ink">support@btechbuddy.in</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ok-soft text-ok flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-ink-3 font-medium">Student Helpline</div>
                  <div className="font-bold text-ink">+91 98765 43210 (10 AM - 6 PM IST)</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-ink-3 font-medium">Headquarters</div>
                  <div className="font-bold text-ink">New Delhi, India</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="md:col-span-2">
          <div className="p-8 rounded-3xl bg-surface border border-line shadow-md">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-ok mx-auto" />
                <h3 className="text-lg font-bold text-ink">
                  Message Dispatched Successfully!
                </h3>
                <p className="text-xs text-ink-3 max-w-sm mx-auto">
                  Thank you for reaching out. Our academic team reviews every inquiry and will respond within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-brand hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aniket Gupta"
                      className="w-full px-3.5 py-2.5 bg-surface-2 border border-line rounded-xl text-xs outline-hidden focus:border-brand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-2">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aniket@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-surface-2 border border-line rounded-xl text-xs outline-hidden focus:border-brand"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Request for AKTU 3rd Sem Mathematics Notes"
                    className="w-full px-3.5 py-2.5 bg-surface-2 border border-line rounded-xl text-xs outline-hidden focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-2">Message / Inquiry Details</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, university syllabus query, or resource request..."
                    className="w-full px-3.5 py-2.5 bg-surface-2 border border-line rounded-xl text-xs outline-hidden focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-strong shadow-md shadow-brand/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Message <Send className="w-3.5 h-3.5" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
