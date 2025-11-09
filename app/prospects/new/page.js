"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function AddNewProspect() {
  const [formData, setFormData] = useState({
    businessName: '', website: '', phone: '', location: '', competitor: '', pain_data: '',
    trafficLeak: 'Medium', trustLeak: 'Medium', enquiryLeak: 'Medium'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    const finalLeaks = [
      `Traffic: ${formData.trafficLeak}`,
      `Trust: ${formData.trustLeak}`,
      `Enquiry: ${formData.enquiryLeak}`,
    ]

    const { error }_ = await supabase.from('prospects').insert({
      businessName: formData.businessName,
      website: formData.website,
      phone: formData.phone,
      location: formData.location,
      competitor: formData.competitor,
      pain_data: formData.pain_data,
      leaks: finalLeaks,
      status: 'Pending'
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      router.push('/') // Go back to main prospect list
    }
  }

  const LeakDropdown = ({ name, label }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
      <select id={name} name={name} value={formData[name]} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option>High</option><option>Medium</option><option>Low</option>
      </select>
    </div>
  )

  const TextField = ({ name, label, placeholder, required = true }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text" id={name} name={name} value={formData[name]}
        onChange={handleChange} required={required} placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Prospect List
      </Link>
      
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Add New Prospect (Manual)</h2>
        
        {error && (
          <div className="bg-danger-light border border-danger-dark text-danger-dark px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-bold border-b pb-2">Business Details</h3>
          <TextField name="businessName" label="Business Name" placeholder="e.g., Apex Plumbing" />
          <TextField name="website" label="Website URL" placeholder="e.g., apexplumbing.co.za" />
          <TextField name="phone" label="Phone Number" placeholder="e.g., 082 554 8400" />
          <TextField name="location" label="Location/Suburb" placeholder="e.g., Northcliff, Randburg" />
          <TextField name="competitor" label="Direct Competitor" placeholder="e.g., Plumb Leak" />
          <TextField name="pain_data" label="Pain Data (for Hook)" placeholder="e.g., 4.1 stars vs 5.0" />

          <h3 className="text-lg font-bold border-b pb-2 pt-4">Leak Analysis (The Proof)</h3>
          <div className="grid grid-cols-3 gap-4">
            <LeakDropdown name="trafficLeak" label="Traffic Leak (SEO)" />
            <LeakDropdown name="trustLeak" label="Trust Leak (Reviews)" />
            <LeakDropdown name="enquiryLeak" label="Enquiry Leak (Capture)" />
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

