import { motion } from 'framer-motion'
import { Heart, Target, Users, Award } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-24 bg-gradient-to-br from-slate-50 to-brand-50/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title mb-4">About MedFind</h1>
            <p className="section-sub mx-auto">
              Born from a real problem — we built MedFind to end the frustration of searching for medicines.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-display font-bold text-3xl text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-500 leading-relaxed mb-4">
                Every year, thousands of patients — especially the elderly and those in emergencies — waste hours visiting pharmacy after pharmacy, only to find medicines are out of stock.
              </p>
              <p className="text-slate-500 leading-relaxed">
                MedFind is our solution: a centralized, real-time platform that connects patients with verified pharmacies, making medicine access instant and stress-free.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, color: 'bg-red-50 text-red-500', label: 'Patient First', val: 'Always' },
                { icon: Target, color: 'bg-brand-50 text-brand-500', label: 'Accuracy', val: '99.2%' },
                { icon: Users, color: 'bg-blue-50 text-blue-500', label: 'Users Served', val: '50K+' },
                { icon: Award, color: 'bg-amber-50 text-amber-500', label: 'Partner Pharmacies', val: '200+' },
              ].map(({ icon: Icon, color, label, val }) => (
                <div key={label} className="card p-5 text-center">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="font-display font-bold text-2xl text-slate-800">{val}</p>
                  <p className="text-sm text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-10 text-white text-center">
            <h3 className="font-display font-bold text-2xl mb-3">This is a Final Year Project</h3>
            <p className="text-brand-100 text-sm max-w-xl mx-auto">
              Built with ❤️ as a full-stack healthcare solution demonstrating real-world application development with React, Node.js, MongoDB, and Google Maps integration.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
