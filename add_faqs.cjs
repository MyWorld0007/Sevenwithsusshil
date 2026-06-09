const jwt = require('jsonwebtoken');

const faqs = [
  {
    question: "What is Astro-Numerology?",
    answer: "<p>Astro-Numerology is the combined study of numbers, planetary influences, names, and life vibrations. It helps uncover your strengths, challenges, opportunities, relationship patterns, career potential, business growth prospects, and life purpose.</p>"
  },
  {
    question: "How can Numerology help me?",
    answer: "<p>Numerology can provide insights into:</p><ul><li>Career and business decisions</li><li>Relationship compatibility</li><li>Marriage timing tendencies</li><li>Name correction and optimization</li><li>Financial growth opportunities</li><li>Personal strengths and weaknesses</li><li>Child naming and life path analysis</li><li>Spiritual growth and self-awareness</li></ul><p>Numerology is a guidance tool that helps you make more informed decisions.</p>"
  },
  {
    question: "Is Numerology scientifically proven?",
    answer: "<p>Numerology is an ancient metaphysical science practiced for centuries across different cultures. While it is not recognized as a conventional scientific discipline, many individuals use it as a self-discovery and decision-support tool.</p>"
  },
  {
    question: "What information do I need to provide for a consultation?",
    answer: "<p>Depending on the service selected, you may be required to provide:</p><ul><li>Full Name</li><li>Date of Birth</li><li>Time of Birth (if available)</li><li>Place of Birth</li><li>Specific questions or areas of concern</li></ul><p>For business consultations, incorporation dates, brand names, and business details may also be required.</p>"
  },
  {
    question: "What is Name Correction and how does it work?",
    answer: "<p>Name Correction involves analyzing the vibrational value of your current name and identifying potential modifications that may better align with your birth numbers and life objectives.</p><p>The process does not change your identity—it aims to optimize the energetic and numerical resonance associated with your name.</p>"
  },
  {
    question: "Can changing my name guarantee success?",
    answer: "<p>No. Success depends on multiple factors including actions, mindset, skills, effort, timing, opportunities, and circumstances.</p><p>Name alignment is intended to support your journey by creating a more harmonious energetic vibration, but no guarantees of specific outcomes are made.</p>"
  },
  {
    question: "What is included in the Birth Date & Name Analysis?",
    answer: "<p>The analysis may cover:</p><ul><li>Personality traits</li><li>Strengths and challenges</li><li>Life path tendencies</li><li>Career suitability</li><li>Relationship dynamics</li><li>Health awareness indicators</li><li>Financial patterns</li><li>Spiritual inclinations</li><li>Name compatibility and optimization suggestions</li></ul>"
  },
  {
    question: "How can Business Numerology benefit my business?",
    answer: "<p>Business Numerology evaluates:</p><ul><li>Business name vibration</li><li>Brand alignment</li><li>Incorporation date influence</li><li>Growth potential</li><li>Leadership compatibility</li><li>Prosperity and stability indicators</li></ul><p>It can help entrepreneurs make more aligned decisions regarding branding and business identity.</p>"
  },
  {
    question: "How accurate are the readings?",
    answer: "<p>The quality of insights depends on the information provided and the interpretation of energetic patterns. Many clients find the guidance highly relevant and transformative, though results and experiences vary from person to person.</p>"
  },
  {
    question: "What is Reiki Healing?",
    answer: "<p>Reiki is a holistic energy healing practice that promotes relaxation, stress reduction, emotional balance, and overall well-being through the channeling of universal life force energy.</p>"
  },
  {
    question: "Can Reiki heal diseases?",
    answer: "<p>Reiki is not a substitute for medical treatment and does not diagnose, treat, cure, or prevent any disease. It is a complementary wellness practice intended to support relaxation and energetic balance.</p>"
  },
  {
    question: "Are online consultations as effective as in-person consultations?",
    answer: "<p>Yes. Numerology, spiritual guidance, and Reiki distance healing sessions can be conducted remotely. Many clients from different cities and countries successfully receive guidance online.</p>"
  },
  {
    question: "How long does a consultation take?",
    answer: "<p>Consultation duration varies depending on the service selected:</p><ul><li>Single Question Guidance: Usually 10–15 minutes</li><li>Career or Relationship Guidance: 30–60 minutes</li><li>Comprehensive Analysis Sessions: 60–120 minutes</li></ul><p>Specific timelines will be communicated during booking.</p>"
  },
  {
    question: "Do you offer emergency or urgent consultations?",
    answer: "<p>Subject to availability, priority consultations may be accommodated. Additional charges may apply for urgent requests.</p>"
  },
  {
    question: "Can I ask multiple questions during a Single Question Guidance session?",
    answer: "<p>The Single Question Guidance service is designed to address one specific question only. Additional questions may require a separate booking or a comprehensive consultation.</p>"
  },
  {
    question: "Is my information kept confidential?",
    answer: "<p>Absolutely. All personal details, consultation discussions, and reports are treated with strict confidentiality and are never shared with third parties unless required by law.</p>"
  },
  {
    question: "Do you provide remedies?",
    answer: "<p>Where appropriate, recommendations may include:</p><ul><li>Name alignment suggestions</li><li>Numerological corrections</li><li>Spiritual practices</li><li>Affirmations</li><li>Reiki guidance</li><li>Lifestyle recommendations</li><li>Color and number alignment guidance</li></ul><p>All remedies are optional and should be followed at your discretion.</p>"
  },
  {
    question: "What makes SEVEN – Evolve with Divine Secrets different?",
    answer: "<p>SEVEN combines:</p><ul><li>✨ Astro-Numerology Insights</li><li>✨ Name Vibration Analysis</li><li>✨ Business Numerology Expertise</li><li>✨ Reiki Energy Healing</li><li>✨ Spiritual Guidance & Mentorship</li><li>✨ Practical Life Application</li></ul><p>Our approach focuses not only on predictions but on helping individuals and businesses align with their highest potential.</p>"
  },
  {
    question: "What if I am skeptical?",
    answer: "<p>Healthy skepticism is welcome. Our objective is not to convince but to provide meaningful insights that you can evaluate and apply based on your own judgment and experience.</p>"
  },
  {
    question: "What is your refund policy?",
    answer: "<p>Due to the personalized nature of our services, all consultations, reports, analyses, and energy healing sessions are non-refundable once booked or delivered. Please review our Terms & Conditions before making a purchase.</p>"
  }
];

async function addFaqs() {
  const token = jwt.sign({ admin: true }, "supersecret123", { expiresIn: "10h" });
  
  // Note: we'd also want to delete existing ones first if needed
  const listReq = await fetch('http://localhost:3000/api/faqs');
  const existingFaqs = await listReq.json();
  
  for (const faq of existingFaqs) {
    await fetch(`http://localhost:3000/api/faqs/${faq.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
  }

  for (const faq of faqs) {
    const res = await fetch('http://localhost:3000/api/faqs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(faq)
    });
    console.log(faq.question, res.status);
  }
}

addFaqs().catch(err => console.error(err));
