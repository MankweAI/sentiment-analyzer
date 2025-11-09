"use client"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

// Helper to de-assemble the leaks array
const deassembleLeaks = (leaks = []) => {
  return {
    trafficLeak: leaks.find(l => l.startsWith('Traffic:'))?.split(': ')[1] || 'Medium',
    trustLeak: leaks.find(l => l.startsWith('Trust:'))?.split(': ')[1] || 'Medium',
    enquiryLeak: leaks.find(l => l.startsWith('Enquiry:'))?.split(': ')[1] || 'Medium',
  }
}

export default function EditProspect() {
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      fetchProspect(id)
    }
  }, [id])

  const fetchProspect = async (prospectId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single()
    
    if (error) {
      setError(error.message)
    } else {
      const leakData = deassembleLeaks(data.leaks)
      setFormData({ ...data, ...leakData })
    }
    setLoading(false)
  }

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

    const { error }_ = await supabase.from('prospects')
      .update({
        businessName: formData.businessName,
        website: formData.website,
        phone: formData.phone,
        location: formData.location,
        competitor: formData.competitor,
        pain_data: formData.pain_data,
        leaks: finalLeaks,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${formData.businessName}?`)) {
      setSubmitting(true)
      
      // First, delete associated logs
      await supabase.from('outreach_logs').delete().eq('prospect_id', id)
      
      // Then, delete the prospect
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id)
      
      if (error) {
        setError(error.message)
        setSubmitting(false)
      } else {
        router.push('/dashboard')
      }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-600 animate-pulse">Loading prospect data...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-danger-light border border-danger-dark text-danger-dark px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 font-medium">
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Prospect List
      </Link>
      
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Edit: {formData.businessName}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-bold border-b pb-2">Business Details</h3>
          <TextField name="businessName" label="Business Name" formData={formData} onChange={handleChange} />
          <TextField name="website" label="Website URL" formData={formData} onChange={handleChange} />
          <TextField name="phone" label="Phone Number" formData={formData} onChange={handleChange} />
          <TextField name="location" label="Location/Suburb" formData={formData} onChange={handleChange} />
          <TextField name="competitor" label="Direct Competitor" formData={formData} onChange={handleChange} />
          <TextField name="pain_data" label="Pain Data (for Hook)" formData={formData} onChange={handleChange} />

          <h3 className="text-lg font-bold border-b pb-2 pt-4">Leak Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <LeakDropdown name="trafficLeak" label="Traffic Leak" formData={formData} onChange={handleChange} />
            <LeakDropdown name="trustLeak" label="Trust Leak" formData={formData} onChange={handleChange} />
            <LeakDropdown name="enquiryLeak" label="Enquiry Leak" formData={formData} onChange={handleChange} />
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-sm font-semibold text-danger-dark hover:text-danger-DEFAULT disabled:opacity-50"
            >
              <TrashIcon className="w-5 h-5" />
              Delete Prospect
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- Reusable Form Components ---
const LeakDropdown = ({ name, label, formData, onChange }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    <select id={name} name={name} value={formData[name]} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-dark focus:border-primary-dark">
      <option>High</option><option>Medium</option><option>Low</option>
    </select>
  </div>
)

const TextField = ({ name, label, formData, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      type="text" id={name} name={name} value={formData[name]}
      onChange={onChange} required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-dark focus:border-primary-dark"
    />
  </div>
)