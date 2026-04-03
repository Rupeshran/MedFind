const SearchLog = require('../models/SearchLog');
const { getTranslatedResponse } = require('../utils/chatbotTranslations');

// ── Health Q&A Knowledge Base ────────────────────────────────────
const healthKB = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening', 'help', 'pranam', 'vanakkam', 'namaskaram', 'sat sri akal'],
    response: {
      text: "Hello! 👋 I'm MedBot, your health assistant. I can help you with:\n\n💊 **Medicine Search** — Find any medicine\n🔍 **Symptom Guide** — Get medicine suggestions for symptoms\n⚠️ **Drug Interactions** — Check if medicines are safe together\n💰 **Price Compare** — Find the best prices\n📋 **Prescription Scan** — Scan your prescription\n🏥 **Nearby Pharmacies** — Find pharmacies near you\n\nWhat would you like to know?",
      type: 'greeting',
      quickActions: ['Search Medicine', 'Check Symptoms', 'Find Pharmacy', 'Check Interactions'],
    },
  },

  fever: {
    patterns: ['fever', 'temperature', 'bukhar', 'high temperature', 'body hot', 'jwara', 'suram', 'tap', 'taap', 'bukhar hai', 'badan garam hai', 'badi garmi', 'garam lag raha', 'tap aawat ba'],
    response: {
      text: "🌡️ **Fever Management Guide**\n\n**Common Medicines:**\n• Paracetamol (Dolo 650 / Crocin) — First choice\n• Ibuprofen (Brufen) — If inflammation present\n\n**Home Remedies:**\n• Drink plenty of fluids\n• Rest adequately\n• Sponge with lukewarm water\n• Wear light clothing\n\n**⚠️ See a Doctor If:**\n• Fever above 103°F (39.4°C)\n• Fever lasting more than 3 days\n• Accompanied by rash, stiff neck, or confusion\n• In infants below 3 months",
      type: 'health_advice',
      relatedMedicines: ['Paracetamol', 'Ibuprofen', 'Combiflam'],
      quickActions: ['Search Paracetamol', 'Search Ibuprofen', 'Find Pharmacy'],
    },
  },

  headache: {
    patterns: ['headache', 'head pain', 'sir dard', 'migraine', 'head ache', 'thalai vali', 'talanొప్పి', 'matha betha', 'sir dukh raha', 'sir bhari lag रहा', 'matha dukhata', 'matha dukh raha', 'sir phat', 'sir dard kar raha'],
    response: {
      text: "🤕 **Headache Relief Guide**\n\n**Types & Medicines:**\n• **Tension Headache** → Paracetamol 500mg\n• **Migraine** → Sumatriptan 50mg (needs prescription)\n• **Sinus Headache** → Paracetamol + Steam inhalation\n\n**Home Remedies:**\n• Apply cold/warm compress\n• Stay hydrated\n• Rest in a dark, quiet room\n• Gentle neck stretches\n\n**⚠️ See a Doctor If:**\n• Worst headache of your life\n• Headache with fever, stiff neck\n• After a head injury\n• Progressive worsening",
      type: 'health_advice',
      relatedMedicines: ['Paracetamol', 'Ibuprofen', 'Sumatriptan', 'Combiflam'],
      quickActions: ['Search Paracetamol', 'Search Combiflam', 'Check Interactions'],
    },
  },

  cold: {
    patterns: ['cold', 'common cold', 'sardi', 'runny nose', 'sneezing', 'congestion', 'jukam', 'jalubu', 'zukaam', 'naak beh', 'sardi ho', 'naak band', 'chik aa', 'chheenk', 'sukam'],
    response: {
      text: "🤧 **Cold & Congestion Guide**\n\n**Medicines:**\n• Cetirizine / Levocetirizine — For sneezing & runny nose\n• Paracetamol — For body ache & mild fever\n• Steam inhalation — For congestion\n• Ambroxol — For productive cough\n\n**Home Remedies:**\n• Warm drinks (ginger tea, honey water)\n• Steam inhalation with eucalyptus\n• Gargle with salt water\n• Rest well\n\n**Duration:** Usually 7-10 days. Antibiotics NOT needed for common cold.",
      type: 'health_advice',
      relatedMedicines: ['Cetirizine', 'Levocetirizine', 'Paracetamol', 'Ambroxol'],
      quickActions: ['Search Cetirizine', 'Search Paracetamol', 'Find Pharmacy'],
    },
  },

  cough: {
    patterns: ['cough', 'khansi', 'dry cough', 'wet cough', 'productive cough', 'khansi ho rahi', 'gala kharab', 'khokhi', 'khokhi aawat', 'khasi', 'khaasi'],
    response: {
      text: "😷 **Cough Management Guide**\n\n**Dry Cough:**\n• Dextromethorphan (Benadryl DR)\n• Honey + warm water\n• Avoid irritants\n\n**Wet/Productive Cough:**\n• Ambroxol (Mucolite) — thins mucus\n• Steam inhalation\n• Stay hydrated\n\n**⚠️ See a Doctor If:**\n• Cough lasting > 3 weeks\n• Blood in sputum\n• Difficulty breathing\n• Accompanied by weight loss",
      type: 'health_advice',
      relatedMedicines: ['Dextromethorphan', 'Ambroxol', 'Benadryl'],
      quickActions: ['Search Benadryl', 'Search Ambroxol', 'Find Pharmacy'],
    },
  },

  stomach: {
    patterns: ['stomach pain', 'acidity', 'gas', 'indigestion', 'pet dard', 'bloating', 'gastric', 'pait', 'dukhata', 'kadupu noppi', 'badikuthu', 'potta vali', 'pet me dard', 'pet kharab', 'gas ban', 'pet phool', 'khatti dakar', 'acidity ho rahi'],
    response: {
      text: "🫃 **Stomach & Acidity Guide**\n\n**For Acidity/GERD:**\n• Omeprazole / Pantoprazole — Before meals\n• Ranitidine — For occasional acidity\n• Antacid liquid — For quick relief\n\n**For Gas/Bloating:**\n• Domperidone — Before meals\n• Walk after meals\n• Avoid carbonated drinks\n\n**Home Remedies:**\n• Cold milk\n• Banana\n• Jeera/fennel water\n• Avoid spicy food",
      type: 'health_advice',
      relatedMedicines: ['Omeprazole', 'Pantoprazole', 'Domperidone', 'Ranitidine'],
      quickActions: ['Search Omeprazole', 'Search Pantoprazole', 'Find Pharmacy'],
    },
  },

  allergy: {
    patterns: ['allergy', 'allergic', 'itching', 'hives', 'rash', 'urticaria', 'khujli', 'badan pe rash', 'daane nikal', 'khujli ho', 'lal daane', 'allergy ho gayi'],
    response: {
      text: "🌸 **Allergy Management Guide**\n\n**Medicines:**\n• Cetirizine 10mg — Mild drowsiness\n• Levocetirizine 5mg — Less drowsy\n• Fexofenadine 120mg — Non-drowsy\n• Montelukast — For allergic rhinitis + asthma\n\n**For Skin Allergies:**\n• Calamine lotion\n• Mild steroid cream (short-term)\n\n**Prevention:**\n• Identify and avoid triggers\n• Keep antihistamine handy\n• Use air purifier if dust allergy",
      type: 'health_advice',
      relatedMedicines: ['Cetirizine', 'Levocetirizine', 'Fexofenadine', 'Montelukast'],
      quickActions: ['Search Cetirizine', 'Search Fexofenadine', 'Update Health Profile'],
    },
  },

  diabetes: {
    patterns: ['diabetes', 'sugar', 'blood sugar', 'madhumeh', 'diabetic', 'sugar badh gaya', 'sugar high', 'sugar level', 'cheeni ki bimari'],
    response: {
      text: "💉 **Diabetes Management Guide**\n\n**Common Medicines (Rx Required):**\n• Metformin — First-line treatment\n• Glimepiride — Stimulates insulin\n• Sitagliptin (Januvia) — DPP-4 inhibitor\n• Insulin — For Type 1 and advanced Type 2\n\n**Lifestyle:**\n• Regular blood sugar monitoring\n• Low-glycemic diet\n• 30 min daily exercise\n• Regular eye & kidney checkups\n\n**⚠️ Important:** All diabetes medicines require prescription. Consult your doctor for dosage.",
      type: 'health_advice',
      relatedMedicines: ['Metformin', 'Glimepiride', 'Sitagliptin'],
      quickActions: ['Search Metformin', 'Check Interactions', 'Update Health Profile'],
    },
  },

  high_bp: {
    patterns: ['hypertension', 'high bp', 'bp high', 'bp is high', 'high blood pressure', 'bp badh gaya', 'bp high lag raha'],
    response: {
      text: "📈 **High Blood Pressure (Hypertension) Guide**\n\n**Common Symptoms:**\n• Often symptomless (Silent Killer!)\n• Severe headache or blurred vision (in extreme cases)\n• Shortness of breath or nosebleeds\n• Chest pain or dizziness\n\n**Common Medicines (Rx Required):**\n• Amlodipine — Calcium channel blocker\n• Losartan / Telmisartan — ARBs\n• Atenolol — Beta blocker\n\n**Immediate Actions / Lifestyle:**\n• Sit down and rest\n• Reduce salt intake immediately (<5g/day)\n• Avoid caffeine and alcohol\n• Measure BP after 5 minutes of resting\n\n**⚠️ Go to Emergency If:** BP is over 180/120 reading, or accompanied by chest pain/stroke symptoms.",
      type: 'health_advice',
      relatedMedicines: ['Amlodipine', 'Losartan', 'Telmisartan', 'Atenolol'],
      quickActions: ['Search Amlodipine', 'Search Telmisartan', 'Check Interactions'],
    },
  },

  low_bp: {
    patterns: ['hypotension', 'low bp', 'bp low', 'low blood pressure', 'chakkar', 'dizzy from bp', 'chakkar aa', 'behosh', 'bp low lag', 'chakar aawat', 'aankh ke aage andhera', 'gir gaya'],
    response: {
      text: "📉 **Low Blood Pressure (Hypotension) Guide**\n\n**Common Symptoms:**\n• Dizziness or lightheadedness (especially when standing up)\n• Fainting (syncope) or extreme weakness\n• Blurred vision or confusion\n• Cold, clammy, or pale skin\n\n**Immediate Home Remedies:**\n• **CRITICAL:** Drink ORS or salted water with lemon immediately!\n• Sit or lie down and raise your legs above heart level\n• Drink plenty of fluids (water or electrolytes)\n• Eat a small, salty snack\n\n**Medicines (Rx Required):**\n• Fludrocortisone or Midodrine (Only if prescribed by a doctor for chronic low BP)\n\n**⚠️ See a Doctor If:**\n• You faint or lose consciousness\n• Accompanied by black stools or severe bleeding",
      type: 'health_advice',
      relatedMedicines: ['ORS', 'Electral'],
      quickActions: ['Search ORS', 'Call 108'],
    },
  },

  bp_general: {
    patterns: ['blood pressure', 'bp'],
    response: {
      text: "❤️ **Blood Pressure Guide**\n\nAre you looking for information on **High Blood Pressure** or **Low Blood Pressure**?\n\n• **Normal Range:** 90/60 mmHg to 120/80 mmHg\n• **High BP:** Typically over 130/80 mmHg\n• **Low BP:** Typically under 90/60 mmHg\n\nPlease reply with 'High BP' or 'Low BP' for specific guides and symptom combinations.",
      type: 'health_advice',
      relatedMedicines: [],
      quickActions: ['High BP', 'Low BP'],
    },
  },

  pain: {
    patterns: ['pain', 'body pain', 'joint pain', 'back pain', 'muscle pain', 'dard', 'pira', 'dukhata', 'novvu', 'vali', 'pair dukh', 'hath dukh', 'kamar dard', 'badan tut', 'joro me dard', 'dard kar raha'],
    response: {
      text: "🩹 **Pain Management Guide**\n\n**Mild Pain:** Paracetamol 500-650mg\n**Moderate Pain:** Ibuprofen 400mg or Combiflam\n**Joint/Muscle Pain:** Diclofenac gel (topical) + Oral NSAID\n**Back Pain:** Thiocolchicoside + Diclofenac combination\n\n**Important:**\n• Take NSAIDs (Ibuprofen, Diclofenac) with food\n• Don't combine multiple NSAIDs\n• Use for shortest duration possible\n• Ice for acute injury, heat for chronic pain",
      type: 'health_advice',
      relatedMedicines: ['Paracetamol', 'Ibuprofen', 'Diclofenac', 'Combiflam', 'Thiocolchicoside'],
      quickActions: ['Search Combiflam', 'Search Diclofenac', 'Check Interactions'],
    },
  },

  sleep: {
    patterns: ['sleep', 'insomnia', 'cant sleep', 'neend nahi', 'sleeping', 'neend nahi aa rahi', 'neend ud', 'neend khul', 'sone me dikkat'],
    response: {
      text: "😴 **Sleep Guide**\n\n**Note:** Sleeping pills require prescription and should only be used under medical supervision.\n\n**Sleep Hygiene Tips:**\n• Fixed sleep/wake times\n• No screens 1 hour before bed\n• Dark, cool, quiet room\n• No caffeine after 2 PM\n• Regular exercise (not before bed)\n\n**Natural Aids:**\n• Warm milk with turmeric\n• Chamomile tea\n• Melatonin (OTC in some areas)\n\n**⚠️ See a Doctor If:** Persistent insomnia > 2 weeks.",
      type: 'health_advice',
      relatedMedicines: [],
      quickActions: ['Search Melatonin', 'Find Pharmacy', 'Update Health Profile'],
    },
  },

  vitamin: {
    patterns: ['vitamin', 'supplement', 'weakness', 'fatigue', 'kamzori', 'tired', 'thakan', 'thakawat', 'thak gaya', 'kamjori', 'chakkar', 'himmat nahi'],
    response: {
      text: "🌿 **Vitamins & Supplements Guide**\n\n**Common Deficiencies:**\n• **Vitamin D3** — Bone health, immunity. Take 60000 IU weekly if deficient\n• **Vitamin B12** — Energy, nerves. Common in vegetarians\n• **Iron** — For anemia. Take with Vitamin C for better absorption\n• **Calcium** — Bone strength. Take with Vitamin D3\n• **Omega-3** — Heart and brain health\n\n**Daily Multivitamin:** Supradyn, Becosules\n\n**Tip:** Get blood work done before starting supplements.",
      type: 'health_advice',
      relatedMedicines: ['Vitamin D3', 'Vitamin B Complex', 'Iron', 'Calcium', 'Multivitamin'],
      quickActions: ['Search Vitamin D3', 'Search Multivitamin', 'Compare Prices'],
    },
  },

  emergency: {
    patterns: ['emergency', 'heart attack', 'stroke', 'unconscious', 'not breathing', 'chest pain severe'],
    response: {
      text: "🚨 **EMERGENCY — Call 108 / 112 Immediately!**\n\n**While Waiting:**\n• Keep the person calm and still\n• Loosen tight clothing\n• If chest pain: give Aspirin 325mg if available (chew, don't swallow)\n• If not breathing: Start CPR\n• Don't give food or water if unconscious\n\n**Emergency Numbers:**\n• Ambulance: 108\n• Emergency: 112\n• Poison Control: 1800-11-6117\n\n**⚠️ This is NOT a substitute for emergency medical care!**",
      type: 'emergency',
      relatedMedicines: [],
      quickActions: ['Call 108', 'Find Nearest Hospital'],
    },
  },

  nausea: {
    patterns: ['vomiting', 'vomit', 'nausea', 'feel sick', 'throwing up', 'ultiyan', 'ulti', 'jee machla', 'ulti aane jaisa', 'man ghabra', 'ulti jaisa', 'ulti aawat'],
    response: {
      text: "🤢 **Nausea & Vomiting Guide**\n\n**Common Medicines:**\n• Ondansetron (Ondem) — Fast relief from vomiting\n• Domperidone — Good if associated with indigestion\n\n**Home Remedies:**\n• Drink ORS (Oral Rehydration Solution) to prevent dehydration\n• Sip clear fluids slowly (ginger ale, water)\n• Eat bland foods (bananas, rice, toast)\n• Avoid strong smells and spicy/fatty foods\n\n**⚠️ See a Doctor If:**\n• Vomiting lasts much longer than 24 hours\n• Unable to keep any fluids down\n• Blood in vomit\n• Accompanied by severe stomach pain or high fever",
      type: 'health_advice',
      relatedMedicines: ['Ondansetron', 'Domperidone', 'ORS'],
      quickActions: ['Search Ondansetron', 'Search Domperidone', 'Check Interactions'],
    },
  },

  diarrhea: {
    patterns: ['diarrhea', 'loose motion', 'dast', 'watery stool', 'stomach bug', 'food poisoning', 'dast lag', 'bar bar bathroom', 'pet pani', 'jhaada'],
    response: {
      text: "🚽 **Diarrhea & Loose Motions Guide**\n\n**Common Medicines:**\n• Loperamide (Imodium) — Stops acute motion\n• Racecadotril — Reduces fluid secretion\n• Metronidazole / Ofloxacin — If bacterial (Rx needed)\n\n**Home Remedies:**\n• **CRITICAL:** Drink ORS constantly to prevent dehydration!\n• BRAT Diet (Bananas, Rice, Applesauce, Toast)\n• Probiotics (Curd/Yogurt or Sachet like Enterogermina)\n\n**⚠️ See a Doctor If:**\n• Blood in stool\n• High fever\n• Extreme weakness or dark urine",
      type: 'health_advice',
      relatedMedicines: ['Loperamide', 'ORS', 'Enterogermina', 'Racecadotril'],
      quickActions: ['Search ORS', 'Search Loperamide', 'Find Pharmacy'],
    },
  },

  constipation: {
    patterns: ['constipation', 'kabz', 'cannot poop', 'hard stool', 'pet saaf nahi', 'poop nahi ho', 'kabji', 'latrin nahi ho', 'shauch me dikkat'],
    response: {
      text: "🚽 **Constipation Relief Guide**\n\n**Common Medicines:**\n• Bisacodyl (Dulcolax) — Overnight relief tablet\n• Lactulose / Cremaffin — Gentle syrup\n• Isabgol (Psyllium husk) — Bulk-forming natural laxative\n\n**Home Remedies:**\n• Drink lots of warm water, especially in the morning\n• Eat high-fiber foods (papaya, oats, green veggies)\n• Exercise/walking stimulates bowel movement\n\n**⚠️ See a Doctor If:**\n• No bowel movement for more than 3-4 days\n• Severe abdominal pain\n• Blood in stool",
      type: 'health_advice',
      relatedMedicines: ['Bisacodyl', 'Dulcolax', 'Cremaffin', 'Isabgol'],
      quickActions: ['Search Dulcolax', 'Search Isabgol', 'Find Pharmacy'],
    },
  },

  throat_pain: {
    patterns: ['sore throat', 'throat pain', 'gala kharab', 'swallowing pain', 'tonsil'],
    response: {
      text: "🗣️ **Sore Throat Guide**\n\n**Common Medicines:**\n• Povidone Iodine Gargle (Betadine) — Kills throat bacteria\n• Strepsils / Vicks lozenges — Soothes pain\n• Paracetamol / Ibuprofen — Reduces throat swelling and pain\n\n**Home Remedies:**\n• Warm salt water gargles every 3-4 hours\n• Drink warm water with honey and ginger\n• Steam inhalation\n• Avoid cold water and spicy foods\n\n**⚠️ See a Doctor If:**\n• Difficulty breathing or swallowing saliva\n• White patches seen on tonsils\n• Lasts more than a week",
      type: 'health_advice',
      relatedMedicines: ['Betadine Gargle', 'Strepsils', 'Paracetamol'],
      quickActions: ['Search Betadine Gargle', 'Search Strepsils', 'Find Pharmacy'],
    },
  },

  skin_burn: {
    patterns: ['burn', 'burned', 'jal gaya', 'scald', 'hot water spill'],
    response: {
      text: "🔥 **Minor Skin Burn Guide**\n\n**First Aid (Immediate):**\n• Run cool (NOT ice cold) water over the burn for 10-15 minutes\n• Remove tight clothing/jewelry from the area before it swells\n• DO NOT pop blisters\n• DO NOT apply butter, toothpaste, or ice\n\n**Common Medicines:**\n• Silver Sulfadiazine cream (Burnol / Silverex) — Prevents infection\n• Paracetamol for pain\n\n**⚠️ Go to Emergency If:**\n• The burn is deep (third-degree)\n• Larger than 3 inches in diameter\n• Located on face, hands, feet, groin, or joints\n• Caused by chemicals or electricity",
      type: 'health_advice',
      relatedMedicines: ['Burnol', 'Silverex', 'Paracetamol'],
      quickActions: ['Search Burnol', 'Search Silverex', 'Call 108'],
    },
  },

  eye_infection: {
    patterns: ['pink eye', 'red eye', 'eye infection', 'aankh aana', 'conjunctivitis', 'eye pain'],
    response: {
      text: "👁️ **Eye Infection / Conjunctivitis Guide**\n\n**Common Medicines (Often requires Rx):**\n• Moxifloxacin / Tobramycin eye drops — For bacterial infection\n• Carboxymethylcellulose (Refresh Tears) — For dryness/irritation\n\n**Home Remedies & Care:**\n• Wash hands frequently\n• DO NOT rub your eyes\n• Use a warm or cool damp cloth as a compress\n• Do not share towels or pillows\n• Avoid wearing contact lenses\n\n**⚠️ See an Eye Doctor If:**\n• You experience severe eye pain\n• Blurry vision or sensitivity to light\n• Thick yellow/green discharge doesn't clear up",
      type: 'health_advice',
      relatedMedicines: ['Moxifloxacin Eye Drops', 'Refresh Tears'],
      quickActions: ['Search Refresh Tears', 'Find Pharmacy'],
    },
  },

  default: {
    response: {
      text: "I'm not sure I understand that query. Here's what I can help with:\n\n💊 **Medicine search** — Type a medicine name\n🤒 **Symptoms** — Describe your symptoms (e.g., 'headache', 'fever')\n⚠️ **Interactions** — Ask about drug combinations\n💰 **Prices** — Ask about medicine prices\n🏥 **Pharmacy** — Find nearby pharmacies\n\nTry asking: \"What should I take for a headache?\" or \"Is it safe to take aspirin with ibuprofen?\"",
      type: 'default',
      quickActions: ['Search Medicine', 'Check Symptoms', 'Find Pharmacy', 'Check Interactions'],
    },
  },
};

// ── Intent classification ────────────────────────────────────────
function classifyIntent(query) {
  const q = query.toLowerCase().trim();

  // Check each knowledge base entry
  for (const [key, kb] of Object.entries(healthKB)) {
    if (key === 'default') continue;
    if (kb.patterns && kb.patterns.some(p => q.includes(p))) {
      return key;
    }
  }

  // Check for medicine search intent
  if (q.match(/search|find|look|price|cost|kitna|kharido|buy/)) {
    return 'medicine_search';
  }

  // Check for interaction intent
  if (q.match(/interaction|combine|together|safe.*with|mix|milake/)) {
    return 'interaction_check';
  }

  // Check for pharmacy intent
  if (q.match(/pharmacy|dawai ki dukan|medical store|near|nearby|close/)) {
    return 'pharmacy_finder';
  }

  return 'default';
}

// @POST /api/chatbot/query
exports.processQuery = async (req, res) => {
  try {
    const { message, context, lang = 'en' } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    const intent = classifyIntent(message);

    // Log the search
    await SearchLog.create({
      query: message.toLowerCase().trim(),
      userId: req.user?._id,
      type: 'chatbot',
    }).catch(() => {}); // Non-critical

    let response;

    if (intent === 'medicine_search') {
      const cleaned = message.replace(/(search|find|look for|price of|cost of|buy|get|show)/gi, '').trim();
      response = {
        text: `🔍 Searching for "${cleaned}"...\n\nUse the **Search** feature to find detailed information.`,
        type: 'redirect',
        action: 'search',
        searchQuery: cleaned,
        quickActions: [`Search ${cleaned}`, 'Compare Prices', 'Find Pharmacy'],
      };
    } else if (intent === 'interaction_check') {
      response = {
        text: "⚠️ To check drug interactions, go to the **Drug Interaction Checker**.\n\nSelect 2 or more medicines and I'll check if they're safe to take together.",
        type: 'redirect',
        action: 'interactions',
        quickActions: ['Open Interaction Checker', 'Search Medicine'],
      };
    } else if (intent === 'pharmacy_finder') {
      response = {
        text: "🏥 To find nearby pharmacies, go to the **Pharmacy Map**.",
        type: 'redirect',
        action: 'pharmacy_map',
        quickActions: ['Open Pharmacy Map', 'Search Medicine'],
      };
    } else if (healthKB[intent]) {
      // Overwrite the static text with dynamic translated text
      response = { 
        ...healthKB[intent].response, 
        text: getTranslatedResponse(intent, lang) 
      };
    } else {
      response = { 
        ...healthKB.default.response, 
        text: getTranslatedResponse('default', lang) 
      };
    }

    // Disclaimer translation
    let disclaimerText = '⚕️ This information is for educational purposes only. Always consult a healthcare professional for medical advice.';
    if (lang === 'hi') disclaimerText = '⚕️ यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। हमेशा डॉक्टर से सलाह लें।';
    else if (lang === 'bho') disclaimerText = '⚕️ ई जानकारी खाली सीखे खातिर बा। हमेशा डाक्टर से पूछ के दवाई लीं।';
    
    res.json({
      success: true,
      intent,
      response,
      disclaimer: intent !== 'greeting' && intent !== 'default' ? disclaimerText : undefined,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
