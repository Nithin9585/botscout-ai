// components/Subscribersplans.js
"use client";
import React from 'react';
import { Button } from "./ui/button"; // Assuming you have this from ShadCN/UI or similar
import { CheckCircle, Zap, Bot, Brain, Star, FileText, Github, LibraryBig } from 'lucide-react';

const plans = [
  {
    name: "Explorer",
    price: "Rs 89",
    frequency: "/month",
    description: "Get the top 10 updates from one platform of your choice.",
    features: [
      "Top 10 weekly updates",
      "Choose 1 platform (GitHub, ArXiv, or Hugging Face)",
      "Direct email delivery",
    ],
    icon: <Star size={24} className="text-yellow-500" />,
    cta: "Choose Explorer",
    bgColor: "bg-slate-800",
    textColor: "text-white",
    highlight: false,
  },
  {
    name: "Innovator",
    price: "Rs 109",
    frequency: "/month",
    description: "Stay ahead with the top 10 from any two platforms.",
    features: [
      "Top 10 weekly updates",
      "Choose 2 platforms (GitHub, ArXiv, Hugging Face)",
      "Direct email delivery",
      "Early access to new features",
    ],
    icon: <Zap size={24} className="text-blue-500" />,
    cta: "Choose Innovator",
    bgColor: "bg-purple-600",
    textColor: "text-white",
    highlight: true, // To make this plan stand out
  },
  {
    name: "Visionary",
    price: "Rs 149",
    frequency: "/month",
    description: "Comprehensive coverage from all three major AI platforms.",
    features: [
      "Top 10 weekly updates from all 3 platforms",
      "GitHub, ArXiv, & Hugging Face covered",
      "Priority email support",
      "Community access badge",
    ],
    icon: <Brain size={24} className="text-pink-500" />,
    cta: "Choose Visionary",
    bgColor: "bg-slate-800",
    textColor: "text-white",
    highlight: false,
  },
  {
    name: "AI Pro",
    price: "RS 169",
    frequency: "/month",
    description: "Full coverage, plus insights and AI-powered summaries.",
    features: [
      "All Visionary plan features",
      "Detailed summaries of trending items",
      "Insights on AI tools used (e.g., 'Chat with AI' context)",
      "API access to trends (coming soon)",
    ],
    icon: <Bot size={24} className="text-green-500" />,
    cta: "Choose AI Pro",
    bgColor: "bg-slate-800",
    textColor: "text-white",
    highlight: false,
  }
];

const PlanCard = ({ plan, onSubscribe }) => (
  <div className={`rounded-xl shadow-xl p-6 flex flex-col ${plan.bgColor} ${plan.textColor} ${plan.highlight ? 'ring-4 ring-yellow-400 relative' : 'ring-1 ring-slate-700'}`}>
    {plan.highlight && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
        Most Popular
      </div>
    )}
    <div className="flex items-center mb-4">
      {plan.icon}
      <h3 className="text-2xl font-semibold ml-3">{plan.name}</h3>
    </div>
    <p className="text-3xl font-bold mb-1">
      {plan.price} <span className="text-lg font-normal opacity-80">{plan.frequency}</span>
    </p>
    <p className="text-sm opacity-90 mb-6 min-h-[40px]">{plan.description}</p>
    <ul className="space-y-2 mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle size={18} className="text-green-400 mr-2 mt-1 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      onClick={() => onSubscribe(plan.name)}
      className={`w-full mt-auto ${plan.highlight ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
    >
      {plan.cta}
    </Button>
  </div>
);

function Subscribersplans({ onSubscribe }) { // Added onSubscribe prop
  const handleSubscription = (planName) => {
    console.log(`Subscribing to ${planName}`);
    // Here you would typically integrate with a payment provider (Stripe, etc.)
    // and then update user's subscription status in Firebase/backend.
    if (onSubscribe) {
      onSubscribe(planName); // Call the callback passed from Dashboard
    }
  };

  return (
    <div className="bg-[#1A1625] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-white sm:text-5xl">
          Choose Your AI Edge
        </h2>
        <p className="mt-4 text-xl text-slate-300">
          Unlock weekly insights from the forefront of AI innovation.
        </p>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map(plan => (
          <PlanCard key={plan.name} plan={plan} onSubscribe={handleSubscription} />
        ))}
      </div>
    </div>
  );
}

export default Subscribersplans;