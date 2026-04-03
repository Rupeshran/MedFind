// ── Categories ─────────────────────────────────────────────────────
const categories = [
  { name: 'Antibiotics', description: 'Medicines to treat bacterial infections', icon: '💊' },
  { name: 'Painkillers', description: 'Pain relief medicines', icon: '🩹' },
  { name: 'Vitamins & Supplements', description: 'Health supplements', icon: '🌿' },
  { name: 'Antidiabetics', description: 'Diabetes management', icon: '💉' },
  { name: 'Cardiovascular', description: 'Heart and blood pressure medicines', icon: '❤️' },
  { name: 'Antacids & GI', description: 'Digestive and acidity relief', icon: '🫃' },
  { name: 'Antiallergics', description: 'Allergy medicines', icon: '🌸' },
  { name: 'Respiratory', description: 'Asthma and respiratory care', icon: '🫁' },
  { name: 'Dermatology', description: 'Skin care and treatment', icon: '🧴' },
  { name: 'Ophthalmology', description: 'Eye care medicines', icon: '👁️' },
  { name: 'Hormonal', description: 'Hormonal and thyroid medicines', icon: '⚗️' },
  { name: 'Neurological', description: 'Brain and nerve medicines', icon: '🧠' },
  { name: 'Muscle Relaxants', description: 'Muscle pain and spasm relief', icon: '💪' },
];

// ── Medicine generator (catIdx references index in categories array) ──
// Each entry: [name, brand, composition, catIdx, form, strength, mfr, rx, desc, uses[], sideEffects[], precautions, searchCount]
const medicineData = [
  // ── Antibiotics (0) ──
  ['Amoxicillin 500mg','Mox','Amoxicillin Trihydrate 500mg',0,'Capsule','500mg','Cipla Ltd',true,'Broad-spectrum antibiotic for bacterial infections.',['Bacterial infections','Ear infections','Urinary tract infections'],['Nausea','Diarrhea','Skin rash'],'Take with food. Complete the full course.',245],
  ['Azithromycin 500mg','Zithromax','Azithromycin 500mg',0,'Tablet','500mg','Pfizer',true,'Macrolide antibiotic for respiratory and skin infections.',['Respiratory infections','Skin infections','Pneumonia'],['Stomach pain','Nausea','Headache'],'Avoid antacids 2 hours before/after.',310],
  ['Ciprofloxacin 500mg','Ciplox','Ciprofloxacin Hydrochloride 500mg',0,'Tablet','500mg','Cipla Ltd',true,'Fluoroquinolone antibiotic for UTI and respiratory infections.',['UTI','Respiratory infections','Bone infections'],['Nausea','Dizziness','Tendon pain'],'Avoid sunlight. Drink plenty of water.',189],
  ['Cefixime 200mg','Taxim-O','Cefixime 200mg',0,'Tablet','200mg','Alkem Labs',true,'Third-generation cephalosporin antibiotic.',['Typhoid','Gonorrhea','Tonsillitis'],['Diarrhea','Stomach pain','Headache'],'Complete the prescribed course.',156],
  ['Doxycycline 100mg','Doxt-SL','Doxycycline Hyclate 100mg',0,'Capsule','100mg','Dr. Reddy\'s',true,'Tetracycline antibiotic for acne and infections.',['Acne','Malaria prophylaxis','Respiratory infections'],['Sun sensitivity','Nausea','Esophageal irritation'],'Take upright with water. Avoid dairy.',134],
  ['Levofloxacin 500mg','Levoflox','Levofloxacin 500mg',0,'Tablet','500mg','Cipla Ltd',true,'Fluoroquinolone antibiotic.',['Pneumonia','Sinusitis','UTI'],['Headache','Insomnia','Nausea'],'Avoid in children. Stay hydrated.',112],
  ['Metronidazole 400mg','Flagyl','Metronidazole 400mg',0,'Tablet','400mg','Abbott India',true,'Antibiotic for anaerobic bacterial and protozoal infections.',['Dental infections','Amoebiasis','Bacterial vaginosis'],['Metallic taste','Nausea','Dark urine'],'Avoid alcohol during treatment.',167],
  ['Augmentin 625mg','Augmentin','Amoxicillin 500mg + Clavulanate 125mg',0,'Tablet','625mg','GSK',true,'Combination antibiotic for resistant infections.',['Sinusitis','Pneumonia','Skin infections'],['Diarrhea','Nausea','Yeast infection'],'Take at start of meal.',198],

  // ── Painkillers (1) ──
  ['Paracetamol 650mg','Dolo 650','Paracetamol 650mg',1,'Tablet','650mg','Micro Labs',false,'For fever and mild to moderate pain relief.',['Fever','Headache','Body pain','Toothache'],['Rare allergic reactions','Liver damage (overdose)'],'Do not exceed 4g/day. Avoid alcohol.',890],
  ['Paracetamol 500mg','Crocin','Paracetamol 500mg',1,'Tablet','500mg','GSK Consumer',false,'Common painkiller and antipyretic.',['Fever','Cold','Headache'],['Nausea (rare)','Skin rash (rare)'],'Safe in recommended doses.',820],
  ['Ibuprofen 400mg','Brufen','Ibuprofen 400mg',1,'Tablet','400mg','Abbott India',false,'Anti-inflammatory and pain relief.',['Arthritis','Muscle pain','Menstrual cramps'],['Stomach upset','Heartburn','Dizziness'],'Take with food. Avoid if kidney issues.',412],
  ['Diclofenac 50mg','Voveran','Diclofenac Sodium 50mg',1,'Tablet','50mg','Novartis India',true,'NSAID for inflammation and pain.',['Joint pain','Back pain','Post-surgical pain'],['Stomach ulcer risk','Nausea','Headache'],'Take after meals. Short-term use only.',345],
  ['Aceclofenac 100mg','Zerodol','Aceclofenac 100mg',1,'Tablet','100mg','Ipca Labs',true,'NSAID for pain and inflammation.',['Osteoarthritis','Rheumatoid arthritis','Dental pain'],['Gastric irritation','Dizziness','Skin rash'],'Avoid in peptic ulcer patients.',278],
  ['Tramadol 50mg','Ultracet','Tramadol 50mg',1,'Tablet','50mg','Johnson & Johnson',true,'Opioid analgesic for moderate to severe pain.',['Post-surgical pain','Chronic pain'],['Drowsiness','Constipation','Nausea'],'Habit-forming. Doctor supervision required.',123],
  ['Naproxen 500mg','Naprosyn','Naproxen 500mg',1,'Tablet','500mg','RPG Life Sciences',true,'Long-acting NSAID for chronic pain.',['Arthritis','Gout','Menstrual pain'],['Stomach pain','Headache','Edema'],'Take with food or milk.',95],
  ['Combiflam','Combiflam','Ibuprofen 400mg + Paracetamol 325mg',1,'Tablet','400/325mg','Sanofi India',false,'Combination painkiller.',['Headache','Toothache','Body ache','Fever'],['Stomach upset','Drowsiness'],'Do not use with other NSAIDs.',756],

  // ── Vitamins & Supplements (2) ──
  ['Vitamin D3 60000 IU','D3-Must','Cholecalciferol 60000 IU',2,'Capsule','60000 IU','Sun Pharma',false,'Vitamin D3 supplement for bone health.',['Vitamin D deficiency','Bone health','Calcium absorption'],['Hypercalcemia (overdose)','Nausea'],'Take once weekly as directed.',423],
  ['Calcium + Vitamin D3','Shelcal 500','Calcium Carbonate 500mg + Vitamin D3 250IU',2,'Tablet','500mg','Torrent Pharma',false,'Calcium supplement for bones.',['Calcium deficiency','Osteoporosis prevention'],['Constipation','Gas'],'Take after meals.',389],
  ['Vitamin B Complex','Becosules','B-Complex with Folic Acid',2,'Capsule','Multi','Pfizer',false,'B-vitamin supplement for energy and nerve health.',['B-vitamin deficiency','Fatigue','Mouth ulcers'],['Urine discoloration','Mild nausea'],'Take after breakfast.',445],
  ['Iron + Folic Acid','Autrin','Ferrous Fumarate 300mg + Folic Acid 1.5mg',2,'Capsule','300mg','GlaxoSmithKline',false,'Iron supplement for anemia.',['Iron deficiency anemia','Pregnancy supplementation'],['Constipation','Dark stools','Nausea'],'Take on empty stomach with vitamin C.',267],
  ['Multivitamin','Supradyn','Multivitamin + Multimineral',2,'Tablet','Multi','Bayer',false,'Daily multivitamin supplement.',['General wellness','Nutritional deficiency'],['Mild GI upset'],'Take with breakfast.',512],
  ['Omega-3 Fish Oil','Maxepa','EPA 180mg + DHA 120mg',2,'Capsule','1000mg','Merck',false,'Omega-3 fatty acid supplement.',['Heart health','Joint health','Brain function'],['Fishy burps','Mild nausea'],'Take with meals.',198],
  ['Vitamin C 500mg','Limcee','Ascorbic Acid 500mg',2,'Tablet','500mg','Abbott India',false,'Vitamin C for immunity.',['Immunity boost','Scurvy prevention','Wound healing'],['Stomach upset (high doses)'],'Chewable. Safe in normal doses.',534],
  ['Zinc 50mg','Zincovit','Zinc Sulphate 50mg',2,'Tablet','50mg','Apex Labs',false,'Zinc supplement for immunity.',['Zinc deficiency','Immunity','Acne'],['Nausea','Metallic taste'],'Take on empty stomach.',223],

  // ── Antidiabetics (3) ──
  ['Metformin 500mg','Glycomet','Metformin Hydrochloride 500mg',3,'Tablet','500mg','USV Private Ltd',true,'First-line medication for type 2 diabetes.',['Type 2 diabetes','PCOS','Insulin resistance'],['Nausea','Diarrhea','Lactic acidosis (rare)'],'Take with meals. Monitor kidney function.',334],
  ['Metformin 1000mg','Glycomet GP','Metformin 1000mg',3,'Tablet','1000mg','USV Private Ltd',true,'Extended-release metformin for diabetes.',['Type 2 diabetes'],['GI upset','Vitamin B12 deficiency'],'Swallow whole, do not crush.',211],
  ['Glimepiride 2mg','Amaryl','Glimepiride 2mg',3,'Tablet','2mg','Sanofi India',true,'Sulfonylurea for type 2 diabetes.',['Type 2 diabetes'],['Hypoglycemia','Weight gain','Nausea'],'Take with breakfast. Monitor blood sugar.',178],
  ['Sitagliptin 100mg','Januvia','Sitagliptin 100mg',3,'Tablet','100mg','MSD',true,'DPP-4 inhibitor for diabetes.',['Type 2 diabetes'],['Headache','Upper respiratory infection'],'Can be taken with or without food.',145],
  ['Insulin Glargine','Lantus','Insulin Glargine 100IU/ml',3,'Injection','100IU/ml','Sanofi India',true,'Long-acting insulin for diabetes.',['Type 1 & 2 diabetes'],['Hypoglycemia','Injection site reaction'],'Inject subcutaneously. Rotate sites.',98],
  ['Gliclazide 80mg','Diamicron','Gliclazide 80mg',3,'Tablet','80mg','Serdia Pharma',true,'Sulfonylurea for blood sugar control.',['Type 2 diabetes'],['Hypoglycemia','GI upset','Headache'],'Take with breakfast.',132],
  ['Voglibose 0.3mg','Volix','Voglibose 0.3mg',3,'Tablet','0.3mg','Ranbaxy',true,'Alpha-glucosidase inhibitor.',['Type 2 diabetes','Post-meal blood sugar control'],['Flatulence','Diarrhea','Abdominal pain'],'Take just before meals.',89],

  // ── Cardiovascular (4) ──
  ['Atorvastatin 10mg','Lipitor','Atorvastatin Calcium 10mg',4,'Tablet','10mg','Pfizer',true,'Statin for lowering cholesterol.',['High cholesterol','Heart disease prevention'],['Muscle pain','Headache','GI upset'],'Take at night. Monitor liver function.',178],
  ['Amlodipine 5mg','Norvasc','Amlodipine Besylate 5mg',4,'Tablet','5mg','Pfizer',true,'Calcium channel blocker for hypertension.',['Hypertension','Angina'],['Ankle swelling','Headache','Flushing'],'Once daily. Monitor blood pressure.',201],
  ['Losartan 50mg','Cozaar','Losartan Potassium 50mg',4,'Tablet','50mg','MSD',true,'ARB for blood pressure management.',['Hypertension','Diabetic nephropathy'],['Dizziness','Hyperkalemia','Fatigue'],'Monitor potassium levels.',156],
  ['Telmisartan 40mg','Telma','Telmisartan 40mg',4,'Tablet','40mg','Glenmark',true,'ARB for hypertension.',['Hypertension','Heart failure prevention'],['Dizziness','Back pain','Sinusitis'],'Take same time daily.',189],
  ['Atenolol 50mg','Tenormin','Atenolol 50mg',4,'Tablet','50mg','AstraZeneca',true,'Beta-blocker for heart conditions.',['Hypertension','Angina','Arrhythmia'],['Fatigue','Cold hands','Bradycardia'],'Do not stop suddenly.',145],
  ['Rosuvastatin 10mg','Crestor','Rosuvastatin 10mg',4,'Tablet','10mg','AstraZeneca',true,'Statin for high cholesterol.',['High cholesterol','Cardiovascular prevention'],['Muscle pain','Headache','Nausea'],'Take at any time of day.',167],
  ['Clopidogrel 75mg','Plavix','Clopidogrel 75mg',4,'Tablet','75mg','Sanofi India',true,'Antiplatelet for blood clot prevention.',['Heart attack prevention','Stroke prevention'],['Bleeding','Bruising','GI upset'],'Do not stop without consulting doctor.',134],
  ['Ecosprin 75mg','Ecosprin','Aspirin 75mg',4,'Tablet','75mg','USV Private Ltd',true,'Low-dose aspirin for heart protection.',['Heart attack prevention','Blood thinning'],['GI bleeding','Stomach upset'],'Take after food.',456],

  // ── Antacids & GI (5) ──
  ['Omeprazole 20mg','Omez','Omeprazole 20mg',5,'Capsule','20mg','Dr. Reddy\'s',false,'Proton pump inhibitor for acidity and GERD.',['GERD','Peptic ulcer','Hyperacidity'],['Headache','Nausea','Diarrhea'],'Take 30 min before meals.',567],
  ['Pantoprazole 40mg','Pantop','Pantoprazole Sodium 40mg',5,'Tablet','40mg','Aristo Pharma',false,'For treatment of gastric ulcers and GERD.',['GERD','Gastric ulcers','Zollinger-Ellison syndrome'],['Headache','Flatulence','Diarrhea'],'Take before breakfast.',389],
  ['Ranitidine 150mg','Zinetac','Ranitidine 150mg',5,'Tablet','150mg','GlaxoSmithKline',false,'H2 blocker for acid reduction.',['Acidity','Peptic ulcer','Heartburn'],['Headache','Constipation','Dizziness'],'Take before meals.',234],
  ['Domperidone 10mg','Domstal','Domperidone 10mg',5,'Tablet','10mg','Torrent Pharma',false,'Anti-emetic for nausea and vomiting.',['Nausea','Vomiting','Bloating'],['Dry mouth','Headache'],'Take 15-30 min before meals.',312],
  ['Ondansetron 4mg','Emeset','Ondansetron 4mg',5,'Tablet','4mg','Cipla Ltd',true,'Anti-emetic for severe nausea.',['Chemotherapy-induced nausea','Post-surgical vomiting'],['Headache','Constipation','Fatigue'],'Take as directed by doctor.',145],
  ['Sucralfate 1g','Sucralfate','Sucralfate 1g',5,'Tablet','1g','Abbott India',true,'Mucosal protective agent.',['Gastric ulcers','Duodenal ulcers'],['Constipation','Dry mouth'],'Take on empty stomach. 1 hour before meals.',98],
  ['Rabeprazole 20mg','Rabesec','Rabeprazole 20mg',5,'Tablet','20mg','Cadila Healthcare',false,'PPI for acid-related disorders.',['GERD','Peptic ulcer','Acid reflux'],['Headache','Diarrhea','Flatulence'],'Take before breakfast.',278],
  ['Loperamide 2mg','Imodium','Loperamide 2mg',5,'Capsule','2mg','Johnson & Johnson',false,'Anti-diarrheal.',['Acute diarrhea','Chronic diarrhea'],['Constipation','Abdominal cramps','Dizziness'],'Do not use if bloody diarrhea.',167],

  // ── Antiallergics (6) ──
  ['Cetirizine 10mg','Zyrtec','Cetirizine Hydrochloride 10mg',6,'Tablet','10mg','UCB India',false,'Antihistamine for allergy relief.',['Allergic rhinitis','Urticaria','Hay fever'],['Drowsiness','Dry mouth','Headache'],'Avoid driving if drowsy.',299],
  ['Levocetirizine 5mg','Xyzal','Levocetirizine 5mg',6,'Tablet','5mg','UCB India',false,'Non-sedating antihistamine.',['Allergic rhinitis','Chronic urticaria'],['Drowsiness (mild)','Dry mouth'],'Take in the evening.',345],
  ['Fexofenadine 120mg','Allegra','Fexofenadine 120mg',6,'Tablet','120mg','Sanofi India',false,'Non-drowsy antihistamine.',['Seasonal allergies','Chronic urticaria'],['Headache','Nausea','Dizziness'],'Does not cause drowsiness.',267],
  ['Montelukast 10mg','Montair','Montelukast 10mg',6,'Tablet','10mg','Cipla Ltd',true,'Leukotriene antagonist for allergies and asthma.',['Allergic rhinitis','Asthma','Exercise-induced bronchospasm'],['Headache','Abdominal pain','Mood changes'],'Take in the evening.',198],
  ['Chlorpheniramine 4mg','Avil','Chlorpheniramine Maleate 4mg',6,'Tablet','4mg','Sanofi India',false,'First-generation antihistamine.',['Cold','Allergic reactions','Itching'],['Strong drowsiness','Dry mouth','Blurred vision'],'Causes significant drowsiness.',189],
  ['Hydroxyzine 25mg','Atarax','Hydroxyzine Hydrochloride 25mg',6,'Tablet','25mg','UCB India',true,'Antihistamine with anxiolytic properties.',['Anxiety','Urticaria','Pruritus'],['Drowsiness','Dry mouth','Dizziness'],'Avoid alcohol.',112],

  // ── Respiratory (7) ──
  ['Salbutamol Inhaler','Asthalin','Salbutamol Sulphate 100mcg/dose',7,'Inhaler','100mcg','Cipla Ltd',true,'Bronchodilator for asthma and COPD.',['Asthma','COPD','Exercise-induced bronchospasm'],['Tremor','Tachycardia','Headache'],'Shake before use. Rinse mouth after.',156],
  ['Budesonide Inhaler','Budecort','Budesonide 200mcg/dose',7,'Inhaler','200mcg','Sun Pharma',true,'Corticosteroid inhaler for asthma.',['Chronic asthma','COPD maintenance'],['Oral thrush','Hoarseness','Cough'],'Rinse mouth after use.',123],
  ['Montelukast+Levocetirizine','Montair-LC','Montelukast 10mg + Levocetirizine 5mg',7,'Tablet','10/5mg','Cipla Ltd',true,'Combination for allergic rhinitis and asthma.',['Allergic rhinitis with asthma','Seasonal allergies'],['Drowsiness','Headache'],'Take in evening.',234],
  ['Theophylline 300mg','Theo-Asthalin','Theophylline 300mg SR',7,'Tablet','300mg','Cipla Ltd',true,'Bronchodilator for chronic asthma.',['Chronic asthma','COPD'],['Nausea','Insomnia','Palpitations'],'Monitor blood levels. Avoid caffeine.',78],
  ['Dextromethorphan Syrup','Benadryl DR','Dextromethorphan 10mg/5ml',7,'Syrup','10mg/5ml','Johnson & Johnson',false,'Cough suppressant.',['Dry cough','Throat irritation'],['Drowsiness','Dizziness','Nausea'],'Do not use with other cough medicines.',345],
  ['Ambroxol 30mg','Mucolite','Ambroxol Hydrochloride 30mg',7,'Tablet','30mg','Sanofi India',false,'Mucolytic for productive cough.',['Productive cough','Bronchitis','COPD'],['Nausea','Diarrhea','Rash (rare)'],'Drink plenty of water.',267],

  // ── Dermatology (8) ──
  ['Clotrimazole Cream','Candid','Clotrimazole 1% w/w',8,'Cream','1%','Glenmark',false,'Antifungal cream for skin infections.',['Fungal infections','Ringworm','Athlete\'s foot'],['Burning sensation','Redness','Itching'],'Apply thin layer twice daily.',234],
  ['Betamethasone Cream','Betnovate','Betamethasone Valerate 0.1%',8,'Cream','0.1%','GlaxoSmithKline',true,'Topical steroid for skin conditions.',['Eczema','Dermatitis','Psoriasis'],['Skin thinning','Stretch marks','Acne'],'Short-term use only. Do not use on face.',189],
  ['Ketoconazole Shampoo','Nizral','Ketoconazole 2%',8,'Other','2%','Johnson & Johnson',false,'Antifungal shampoo.',['Dandruff','Seborrheic dermatitis','Fungal scalp infections'],['Dry scalp','Irritation','Hair texture change'],'Use twice weekly. Leave on for 3-5 min.',178],
  ['Mupirocin Ointment','T-Bact','Mupirocin 2%',8,'Cream','2%','GlaxoSmithKline',true,'Topical antibiotic for skin infections.',['Impetigo','Minor wounds','Infected cuts'],['Burning','Itching','Rash'],'Apply to affected area 3 times daily.',145],
  ['Adapalene Gel','Deriva','Adapalene 0.1%',8,'Cream','0.1%','Glenmark',true,'Retinoid for acne.',['Acne vulgaris','Comedonal acne'],['Dryness','Peeling','Sun sensitivity'],'Apply at night. Use sunscreen during day.',167],
  ['Permethrin Cream','Permithin','Permethrin 5%',8,'Cream','5%','GlaxoSmithKline',true,'Topical for scabies.',['Scabies','Head lice'],['Burning','Itching','Redness'],'Apply overnight and wash off after 8-14 hours.',89],

  // ── Ophthalmology (9) ──
  ['Tobramycin Eye Drops','Tobrex','Tobramycin 0.3%',9,'Drops','0.3%','Novartis India',true,'Antibiotic eye drops.',['Bacterial conjunctivitis','Eye infections'],['Burning','Blurred vision','Itching'],'Do not touch dropper tip to eye.',134],
  ['Moxifloxacin Eye Drops','Vigamox','Moxifloxacin 0.5%',9,'Drops','0.5%','Alcon',true,'Fluoroquinolone eye drops.',['Bacterial conjunctivitis','Corneal ulcers'],['Burning','Eye irritation','Headache'],'Use as prescribed. Discard opened bottle after 28 days.',112],
  ['Artificial Tears','Refresh Tears','Carboxymethylcellulose 0.5%',9,'Drops','0.5%','Allergan',false,'Lubricant eye drops.',['Dry eyes','Computer eye strain','Contact lens discomfort'],['Temporary blurring','Mild stinging'],'Use as needed throughout the day.',456],
  ['Olopatadine Eye Drops','Pataday','Olopatadine 0.1%',9,'Drops','0.1%','Alcon',false,'Anti-allergic eye drops.',['Allergic conjunctivitis','Eye itching','Seasonal allergies'],['Headache','Blurred vision','Burning'],'Use once daily.',178],

  // ── Hormonal (10) ──
  ['Levothyroxine 50mcg','Thyronorm','Levothyroxine Sodium 50mcg',10,'Tablet','50mcg','Abbott India',true,'Thyroid hormone replacement.',['Hypothyroidism','Thyroid deficiency'],['Palpitations','Weight loss','Insomnia'],'Take on empty stomach, 30 min before breakfast.',389],
  ['Levothyroxine 100mcg','Eltroxin','Levothyroxine Sodium 100mcg',10,'Tablet','100mcg','GlaxoSmithKline',true,'Thyroid hormone for hypothyroidism.',['Hypothyroidism','Myxedema'],['Tachycardia','Tremor','Sweating'],'Consistent daily timing. Avoid with calcium/iron.',234],
  ['Prednisolone 10mg','Wysolone','Prednisolone 10mg',10,'Tablet','10mg','Pfizer',true,'Corticosteroid for inflammation.',['Allergic reactions','Autoimmune conditions','Asthma exacerbation'],['Weight gain','Mood changes','Increased appetite'],'Taper gradually. Do not stop suddenly.',167],
  ['Dexamethasone 0.5mg','Dexona','Dexamethasone 0.5mg',10,'Tablet','0.5mg','Zydus Cadila',true,'Potent corticosteroid.',['Severe allergies','Inflammation','Cerebral edema'],['Insomnia','Increased blood sugar','Osteoporosis'],'Short-term use preferred.',123],
  ['Progesterone 200mg','Susten','Progesterone 200mg',10,'Capsule','200mg','Sun Pharma',true,'Hormone supplement.',['Hormone replacement','Pregnancy support','Menstrual irregularities'],['Drowsiness','Bloating','Breast tenderness'],'Take at bedtime.',98],

  // ── Neurological (11) ──
  ['Gabapentin 300mg','Gabapin','Gabapentin 300mg',11,'Capsule','300mg','Intas Pharma',true,'Anticonvulsant for neuropathic pain.',['Neuropathic pain','Epilepsy','Restless leg syndrome'],['Drowsiness','Dizziness','Fatigue'],'Do not stop suddenly. Taper off.',145],
  ['Pregabalin 75mg','Lyrica','Pregabalin 75mg',11,'Capsule','75mg','Pfizer',true,'For nerve pain and epilepsy.',['Neuropathic pain','Fibromyalgia','Epilepsy'],['Dizziness','Drowsiness','Weight gain'],'May impair driving. Taper to discontinue.',189],
  ['Amitriptyline 25mg','Tryptomer','Amitriptyline 25mg',11,'Tablet','25mg','Merck',true,'Tricyclic antidepressant.',['Depression','Chronic pain','Migraine prevention'],['Drowsiness','Weight gain','Dry mouth'],'Take at bedtime. Do not stop suddenly.',134],
  ['Escitalopram 10mg','Nexito','Escitalopram 10mg',11,'Tablet','10mg','Sun Pharma',true,'SSRI antidepressant.',['Depression','Generalized anxiety','Panic disorder'],['Nausea','Insomnia','Sexual dysfunction'],'Takes 2-4 weeks for full effect.',167],
  ['Alprazolam 0.5mg','Alprax','Alprazolam 0.5mg',11,'Tablet','0.5mg','Torrent Pharma',true,'Benzodiazepine for anxiety.',['Anxiety disorders','Panic attacks','Insomnia'],['Drowsiness','Dependency risk','Memory impairment'],'Short-term use only. Habit-forming.',112],
  ['Sumatriptan 50mg','Suminat','Sumatriptan 50mg',11,'Tablet','50mg','Sun Pharma',true,'Triptan for migraine relief.',['Migraine','Cluster headache'],['Tingling','Chest tightness','Drowsiness'],'Take at onset of migraine.',98],

  // ── Muscle Relaxants (12) ──
  ['Thiocolchicoside 4mg','Myoril','Thiocolchicoside 4mg',12,'Capsule','4mg','Sanofi India',true,'Muscle relaxant for spasms.',['Muscle spasm','Back pain','Torticollis'],['Drowsiness','Diarrhea','Nausea'],'Short-term use only (7 days max).',156],
  ['Chlorzoxazone 500mg','Flexon MR','Chlorzoxazone 500mg + Diclofenac + Paracetamol',12,'Tablet','500mg','Aristo Pharma',true,'Muscle relaxant combination.',['Muscle spasm','Sprains','Strains'],['Drowsiness','Dizziness','GI upset'],'Avoid alcohol. May cause drowsiness.',189],
  ['Tizanidine 2mg','Sirdalud','Tizanidine 2mg',12,'Tablet','2mg','Novartis India',true,'Central-acting muscle relaxant.',['Muscle spasticity','Multiple sclerosis spasm','Back pain'],['Drowsiness','Dry mouth','Low blood pressure'],'Avoid with fluvoxamine. Monitor liver.',123],
  ['Etoricoxib 90mg','Arcoxia','Etoricoxib 90mg',12,'Tablet','90mg','MSD',true,'COX-2 inhibitor for pain.',['Osteoarthritis','Rheumatoid arthritis','Gouty arthritis'],['Edema','Hypertension','GI upset'],'Take with or without food.',145],
];

// ── Users ──────────────────────────────────────────────────────────
const users = [
  { name: 'Admin User', email: 'admin@medfind.com', role: 'admin', phone: '9000000001' },
  // Pharmacy owners
  { name: 'Rajesh Sharma', email: 'rajesh@citymedical.com', role: 'pharmacy', phone: '9000000002' },
  { name: 'Priya Patel', email: 'priya@lifeline.com', role: 'pharmacy', phone: '9000000003' },
  { name: 'Suresh Kumar', email: 'suresh@wellness.com', role: 'pharmacy', phone: '9000000004' },
  { name: 'Meena Iyer', email: 'meena@apollopharmacy.com', role: 'pharmacy', phone: '9000000005' },
  { name: 'Vikram Singh', email: 'vikram@medplus.com', role: 'pharmacy', phone: '9000000006' },
  { name: 'Sunita Reddy', email: 'sunita@frank.com', role: 'pharmacy', phone: '9000000007' },
  { name: 'Anil Gupta', email: 'anil@netmeds.com', role: 'pharmacy', phone: '9000000008' },
  { name: 'Kavita Desai', email: 'kavita@guardian.com', role: 'pharmacy', phone: '9000000009' },
  { name: 'Ramesh Joshi', email: 'ramesh@medicare.com', role: 'pharmacy', phone: '9000000010' },
  { name: 'Deepa Nair', email: 'deepa@healthfirst.com', role: 'pharmacy', phone: '9000000011' },
  // Agartala pharmacy owners
  { name: 'Biplab Deb', email: 'biplab@agartalamedical.com', role: 'pharmacy', phone: '9000000012' },
  { name: 'Ritu Debnath', email: 'ritu@tripurapharma.com', role: 'pharmacy', phone: '9000000013' },
  { name: 'Suman Saha', email: 'suman@lifelineagt.com', role: 'pharmacy', phone: '9000000014' },
  { name: 'Papiya Das', email: 'papiya@apolloagt.com', role: 'pharmacy', phone: '9000000015' },
  { name: 'Arun Bhowmik', email: 'arun@medseva.com', role: 'pharmacy', phone: '9000000016' },
  // Regular users
  { name: 'Anita Verma', email: 'anita@gmail.com', role: 'user', phone: '9111111111' },
  { name: 'Mohan Das', email: 'mohan@gmail.com', role: 'user', phone: '9222222222' },
  { name: 'Sneha Kapoor', email: 'sneha@gmail.com', role: 'user', phone: '9333333333' },
  { name: 'Rohit Malhotra', email: 'rohit@gmail.com', role: 'user', phone: '9444444444' },
  { name: 'Divya Sharma', email: 'divya@gmail.com', role: 'user', phone: '9555555555' },
];

// ── Pharmacies (ownerIdx refs pharmacy-owner index in users array) ──
const pharmacies = [
  { ownerIdx: 1, name: 'City Medical Store', regNo: 'PH-MH-2021-001', email: 'citymedical@store.com', phone: '022-11223344', address: { street: '12, MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }, coords: [72.8777, 19.0760], timings: { open: '08:00', close: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat'] }, is24h: false, verified: true, rating: 4.5, totalRatings: 128, desc: 'Trusted pharmacy in South Mumbai with over 20 years of service.' },
  { ownerIdx: 2, name: 'Lifeline Pharmacy', regNo: 'PH-MH-2020-045', email: 'lifeline@pharmacy.com', phone: '022-55667788', address: { street: '88, Linking Road, Bandra', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' }, coords: [72.8373, 19.0596], timings: { open: '09:00', close: '21:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.2, totalRatings: 89, desc: 'Full range of medicines, cosmetics, and health products.' },
  { ownerIdx: 3, name: 'Wellness Medicals', regNo: 'PH-MH-2022-112', email: 'wellness@med.com', phone: '022-99001122', address: { street: '5, Hill Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' }, coords: [72.8200, 19.0800], timings: { open: '07:00', close: '23:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 3.8, totalRatings: 45, desc: 'New pharmacy with competitive pricing.' },
  { ownerIdx: 4, name: 'Apollo Pharmacy - Andheri', regNo: 'PH-MH-2019-078', email: 'apollo.andheri@pharmacy.com', phone: '022-33445566', address: { street: '204, Lokhandwala Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400053' }, coords: [72.8296, 19.1398], timings: { open: '08:00', close: '23:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.6, totalRatings: 234, desc: 'Apollo Pharmacy chain outlet with wide medicine availability.' },
  { ownerIdx: 5, name: 'MedPlus Health Mart', regNo: 'PH-DL-2020-034', email: 'medplus@health.com', phone: '011-44556677', address: { street: '56, Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' }, coords: [77.2195, 28.6315], timings: { open: '09:00', close: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.3, totalRatings: 167, desc: 'Delhi\'s trusted pharmacy chain in the heart of Connaught Place.' },
  { ownerIdx: 6, name: 'Frank Ross Pharmacy', regNo: 'PH-DL-2021-089', email: 'frank@ross.com', phone: '011-22334455', address: { street: '12A, Rajouri Garden', city: 'New Delhi', state: 'Delhi', pincode: '110027' }, coords: [77.1234, 28.6469], timings: { open: '08:00', close: '21:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat'] }, is24h: false, verified: true, rating: 4.0, totalRatings: 78, desc: 'Established pharmacy with home delivery service.' },
  { ownerIdx: 7, name: 'Netmeds Store - Koramangala', regNo: 'PH-KA-2021-156', email: 'netmeds@kora.com', phone: '080-11223344', address: { street: '100 Feet Road, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034' }, coords: [77.6245, 12.9352], timings: { open: '08:30', close: '22:30', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.4, totalRatings: 156, desc: 'Online-first pharmacy with a physical store in Koramangala.' },
  { ownerIdx: 8, name: 'Guardian Pharmacy - Indiranagar', regNo: 'PH-KA-2020-201', email: 'guardian@indira.com', phone: '080-55667788', address: { street: '12th Main, Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' }, coords: [77.6411, 12.9784], timings: { open: '00:00', close: '23:59', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: true, verified: true, rating: 4.7, totalRatings: 312, desc: '24/7 pharmacy with extensive range. Bangalore\'s most reliable.' },
  { ownerIdx: 9, name: 'Medicare Pharmacy - Powai', regNo: 'PH-MH-2022-067', email: 'medicare@powai.com', phone: '022-78901234', address: { street: 'Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076' }, coords: [72.9052, 19.1196], timings: { open: '09:00', close: '21:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat'] }, is24h: false, verified: true, rating: 4.1, totalRatings: 67, desc: 'Neighbourhood pharmacy serving Powai residents.' },
  { ownerIdx: 10, name: 'HealthFirst Pharmacy - HSR', regNo: 'PH-KA-2023-045', email: 'healthfirst@hsr.com', phone: '080-99001122', address: { street: '27th Main, HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102' }, coords: [77.6500, 12.9116], timings: { open: '08:00', close: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.3, totalRatings: 98, desc: 'Modern pharmacy with health checkup facility.' },
  // ── Agartala Pharmacies ──
  { ownerIdx: 11, name: 'Agartala Medical Store', regNo: 'PH-TR-2021-001', email: 'agartalamedical@store.com', phone: '0381-2301234', address: { street: 'Hari Ganga Basak Road, Agartala', city: 'Agartala', state: 'Tripura', pincode: '799001' }, coords: [91.2868, 23.8315], timings: { open: '07:30', close: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.4, totalRatings: 156, desc: 'One of Agartala\'s oldest and most trusted pharmacies, located near City Centre.' },
  { ownerIdx: 12, name: 'Tripura Pharma Hub', regNo: 'PH-TR-2022-015', email: 'tripurapharma@hub.com', phone: '0381-2405678', address: { street: 'Motor Stand Road, Battala', city: 'Agartala', state: 'Tripura', pincode: '799001' }, coords: [91.2750, 23.8365], timings: { open: '08:00', close: '21:30', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.2, totalRatings: 89, desc: 'Well-stocked pharmacy near Battala market with competitive prices.' },
  { ownerIdx: 13, name: 'Lifeline Pharmacy - Agartala', regNo: 'PH-TR-2020-032', email: 'lifeline@agartala.com', phone: '0381-2509876', address: { street: 'GB Hospital Road, Kunjaban', city: 'Agartala', state: 'Tripura', pincode: '799006' }, coords: [91.2780, 23.8420], timings: { open: '00:00', close: '23:59', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: true, verified: true, rating: 4.6, totalRatings: 210, desc: '24/7 pharmacy near GB Hospital. Emergency medicines always available.' },
  { ownerIdx: 14, name: 'Apollo Pharmacy - Agartala', regNo: 'PH-TR-2023-008', email: 'apollo@agartala.com', phone: '0381-2607890', address: { street: 'Durjoynagar, Airport Road', city: 'Agartala', state: 'Tripura', pincode: '799012' }, coords: [91.3005, 23.8198], timings: { open: '08:00', close: '22:30', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.5, totalRatings: 134, desc: 'Apollo chain outlet near Agartala Airport with wide medicine range.' },
  { ownerIdx: 15, name: 'MedSeva Pharmacy', regNo: 'PH-TR-2022-041', email: 'medseva@pharmacy.com', phone: '0381-2712345', address: { street: 'Krishnanagar, Netaji Subhash Road', city: 'Agartala', state: 'Tripura', pincode: '799001' }, coords: [91.2920, 23.8280], timings: { open: '07:00', close: '23:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, is24h: false, verified: true, rating: 4.3, totalRatings: 112, desc: 'Modern pharmacy with home delivery in Agartala city.' },
];

module.exports = { categories, medicineData, users, pharmacies };
