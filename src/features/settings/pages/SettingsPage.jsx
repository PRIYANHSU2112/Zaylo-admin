import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from '@tanstack/react-router'
import {
  Globe,
  MapPin,
  CheckCircle2,
  FileText,
  Building2,
  Users,
  Share2,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetCmsQuery,
  useUpdateCmsMutation,
} from '../../../store/api/content.api'
import Button from '../../../components/ui/Button'
import { Input, Textarea } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import PageSkeleton from '../../../components/shared/PageSkeleton'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'brand', label: 'Brand' },
  { id: 'contact', label: 'Contact' },
  { id: 'sales', label: 'Sales team' },
  { id: 'social', label: 'Social + Footer' },
  { id: 'commerce', label: 'Shipping & Checkout' },
  { id: 'cms', label: 'CMS About' },
  { id: 'testimonials', label: 'Testimonials' },
]

const emptyOffice = { title: '', address: '', phone: '', email: '' }

export default function SettingsPage() {
  const role = useSelector((s) => s.auth.user?.role)
  const isAdmin = role === 'Admin'

  const { data: settingsEnv, isLoading: sLoading, isError: sErr, error: sError } = useGetSettingsQuery(undefined, {
    skip: !isAdmin,
  })
  const { data: cmsEnv, isLoading: cLoading } = useGetCmsQuery(undefined, { skip: !isAdmin })
  const [updateSettings, { isLoading: savingSettings }] = useUpdateSettingsMutation()
  const [updateCms, { isLoading: savingCms }] = useUpdateCmsMutation()

  const [tab, setTab] = useState('general')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [generalValues, setGeneralValues] = useState({
    siteName: '',
    siteTagline: '',
    themeDefault: 'emerald',
    modeDefault: 'light',
    allowRegistrations: true,
    maintenanceMode: false,
  })
  const [brandValues, setBrandValues] = useState({
    legalName: '',
    shortDescription: '',
    logoUrl: '',
    siteUrl: '',
    ogImageUrl: '',
  })
  const [corporateValues, setCorporateValues] = useState(emptyOffice)
  const [factoryValues, setFactoryValues] = useState(emptyOffice)
  const [whatsapp, setWhatsapp] = useState('')
  const [mapValues, setMapValues] = useState({ label: '', embedUrl: '' })
  const [salesTeam, setSalesTeam] = useState([])
  const [socialValues, setSocialValues] = useState({
    instagram: '',
    facebook: '',
    youtube: '',
    linkedin: '',
    twitter: '',
    instagramHandle: '',
  })
  const [footerValues, setFooterValues] = useState({
    copyrightText: '',
    privacyPolicyUrl: '',
    termsUrl: '',
  })
  const [commerceValues, setCommerceValues] = useState({
    shippingFee: 0,
    freeShippingThreshold: 0,
    codEnabled: true,
    codFee: 0,
    taxPercent: 0,
    minOrderAmount: 0,
    maxQtyPerItem: 50,
  })
  const [cmsAbout, setCmsAbout] = useState({ story: '', mission: '', vision: '' })
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    const s = settingsEnv?.data
    if (!s) return
    if (s.general) setGeneralValues((p) => ({ ...p, ...s.general }))
    if (s.brand) setBrandValues((p) => ({ ...p, ...s.brand }))
    if (s.corporate) setCorporateValues((p) => ({ ...p, ...s.corporate }))
    if (s.factory) setFactoryValues((p) => ({ ...p, ...s.factory }))
    if (s.whatsapp != null) setWhatsapp(s.whatsapp)
    if (s.map) setMapValues((p) => ({ ...p, ...s.map }))
    if (Array.isArray(s.salesTeam)) setSalesTeam(s.salesTeam.map((row) => ({ ...row })))
    if (s.social) setSocialValues((p) => ({ ...p, ...s.social }))
    if (s.footer) setFooterValues((p) => ({ ...p, ...s.footer }))
    if (s.commerce) setCommerceValues((p) => ({ ...p, ...s.commerce }))
  }, [settingsEnv])

  useEffect(() => {
    const cms = cmsEnv?.data
    if (cms?.about) {
      setCmsAbout({
        story: cms.about.story || '',
        mission: cms.about.mission || '',
        vision: cms.about.vision || '',
      })
    }
    if (Array.isArray(cms?.testimonials)) {
      setTestimonials(
        cms.testimonials.map((t, i) => ({
          name: t.name || '',
          role: t.role || '',
          rating: t.rating ?? 5,
          text: t.text || '',
          avatar: t.avatar || '',
          position: t.position ?? i,
        })),
      )
    }
  }, [cmsEnv])

  if (role && role !== 'Admin') return <Navigate to="/" />

  if (sLoading || cLoading) return <PageSkeleton />
  if (sErr) {
    return (
      <div className="text-sm font-bold text-rose-600">
        {sError?.data?.message || 'Failed to load settings'}
      </div>
    )
  }

  const flashSuccess = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      await updateSettings({
        general: generalValues,
        brand: brandValues,
        corporate: corporateValues,
        factory: factoryValues,
        whatsapp,
        map: mapValues,
        salesTeam,
        social: socialValues,
        footer: footerValues,
        commerce: {
          shippingFee: Number(commerceValues.shippingFee) || 0,
          freeShippingThreshold: Number(commerceValues.freeShippingThreshold) || 0,
          codEnabled: Boolean(commerceValues.codEnabled),
          codFee: Number(commerceValues.codFee) || 0,
          taxPercent: Number(commerceValues.taxPercent) || 0,
          minOrderAmount: Number(commerceValues.minOrderAmount) || 0,
          maxQtyPerItem: Math.max(1, Number(commerceValues.maxQtyPerItem) || 1),
        },
      }).unwrap()
      flashSuccess()
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to save settings')
    }
  }

  const handleSaveCms = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const current = cmsEnv?.data || {}
      await updateCms({
        about: {
          ...(current.about || {}),
          ...cmsAbout,
        },
        testimonials,
      }).unwrap()
      flashSuccess()
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to save CMS')
    }
  }

  const updateTestimonial = (index, field, value) => {
    setTestimonials((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const updateSalesRow = (index, field, value) => {
    setSalesTeam((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const addSalesRow = () => {
    setSalesTeam((prev) => [...prev, { name: '', contact: '', phone: '' }])
  }

  const removeSalesRow = (index) => {
    setSalesTeam((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Global Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Company identity, contact, footer, social links, and home CMS content.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-bold">
            <CheckCircle2 size={16} /> Saved successfully
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'primary' : 'secondary'}
            onClick={() => setTab(t.id)}
            className="text-xs"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}

      {tab === 'cms' || tab === 'testimonials' ? (
        <form onSubmit={handleSaveCms} className="space-y-6">
          {tab === 'cms' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Home / About CMS
              </h3>
              <Textarea
                label="Story"
                value={cmsAbout.story}
                onChange={(e) => setCmsAbout((p) => ({ ...p, story: e.target.value }))}
                rows={4}
              />
              <Textarea
                label="Mission"
                value={cmsAbout.mission}
                onChange={(e) => setCmsAbout((p) => ({ ...p, mission: e.target.value }))}
                rows={3}
              />
              <Textarea
                label="Vision"
                value={cmsAbout.vision}
                onChange={(e) => setCmsAbout((p) => ({ ...p, vision: e.target.value }))}
                rows={3}
              />
            </div>
          )}
          {tab === 'testimonials' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold font-display">What Our Clients Say</h3>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs gap-1.5"
                  onClick={() =>
                    setTestimonials((prev) => [
                      ...prev,
                      { name: '', role: '', rating: 5, text: '', avatar: '', position: prev.length },
                    ])
                  }
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
              {testimonials.length === 0 && (
                <p className="text-sm text-muted-foreground">No testimonials yet.</p>
              )}
              <div className="space-y-4">
                {testimonials.map((row, index) => (
                  <div key={index} className="border border-border rounded-xl p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input label="Name" value={row.name} onChange={(e) => updateTestimonial(index, 'name', e.target.value)} />
                      <Input label="Role" value={row.role} onChange={(e) => updateTestimonial(index, 'role', e.target.value)} />
                      <Input label="Avatar initials" value={row.avatar} onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)} />
                      <Input label="Rating" type="number" min={1} max={5} value={row.rating} onChange={(e) => updateTestimonial(index, 'rating', Number(e.target.value) || 5)} />
                      <Input label="Position" type="number" min={0} value={row.position} onChange={(e) => updateTestimonial(index, 'position', Number(e.target.value) || 0)} />
                      <Button type="button" variant="ghost" className="text-rose-500 self-end" onClick={() => setTestimonials((prev) => prev.filter((_, i) => i !== index))}>
                        <Trash2 size={16} /> Remove
                      </Button>
                    </div>
                    <Textarea label="Quote" value={row.text} onChange={(e) => updateTestimonial(index, 'text', e.target.value)} rows={2} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={savingCms}>
              {savingCms ? 'Saving…' : 'Save CMS'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {tab === 'commerce' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-display">Shipping & Checkout Rules</h3>
              <p className="text-xs text-muted-foreground">
                Applied server-side to every cart quote and order. Online payments (Razorpay) are controlled by the
                server environment (PAYMENTS_ENABLED) and cannot be switched on here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['shippingFee', 'Delivery fee (₹)'],
                  ['freeShippingThreshold', 'Free delivery above (₹, 0 = never)'],
                  ['codFee', 'COD fee (₹)'],
                  ['taxPercent', 'Tax added at checkout (%, 0 = prices include tax)'],
                  ['minOrderAmount', 'Minimum order value (₹)'],
                  ['maxQtyPerItem', 'Max quantity per product'],
                ].map(([key, label]) => (
                  <Input
                    key={key}
                    name={key}
                    type="number"
                    min="0"
                    step={key === 'taxPercent' ? '0.01' : '1'}
                    label={label}
                    value={commerceValues[key]}
                    onChange={(e) => setCommerceValues((p) => ({ ...p, [key]: e.target.value }))}
                  />
                ))}
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(commerceValues.codEnabled)}
                    onChange={(e) => setCommerceValues((p) => ({ ...p, codEnabled: e.target.checked }))}
                  />
                  Cash on Delivery enabled
                </label>
              </div>
            </div>
          )}
          {tab === 'general' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                General Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="siteName"
                  label="Site Name"
                  value={generalValues.siteName}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, siteName: e.target.value }))}
                />
                <Input
                  name="siteTagline"
                  label="Tagline"
                  value={generalValues.siteTagline}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, siteTagline: e.target.value }))}
                />
                <Select
                  name="themeDefault"
                  label="Default Theme"
                  value={generalValues.themeDefault}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, themeDefault: e.target.value }))}
                >
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </Select>
                <Select
                  name="modeDefault"
                  label="Default Mode"
                  value={generalValues.modeDefault}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, modeDefault: e.target.value }))}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={!!generalValues.allowRegistrations}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, allowRegistrations: e.target.checked }))}
                />
                Allow registrations
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={!!generalValues.maintenanceMode}
                  onChange={(e) => setGeneralValues((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                />
                Maintenance mode
              </label>
            </div>
          )}

          {tab === 'brand' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                Brand Identity
              </h3>
              <Input
                label="Legal name"
                value={brandValues.legalName}
                onChange={(e) => setBrandValues((p) => ({ ...p, legalName: e.target.value }))}
              />
              <Textarea
                label="Short description (footer blurb)"
                value={brandValues.shortDescription}
                onChange={(e) => setBrandValues((p) => ({ ...p, shortDescription: e.target.value }))}
                rows={3}
              />
              <Input
                label="Logo URL"
                value={brandValues.logoUrl}
                onChange={(e) => setBrandValues((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://… or leave blank for default asset"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Site URL"
                  value={brandValues.siteUrl}
                  onChange={(e) => setBrandValues((p) => ({ ...p, siteUrl: e.target.value }))}
                />
                <Input
                  label="OG image URL"
                  value={brandValues.ogImageUrl}
                  onChange={(e) => setBrandValues((p) => ({ ...p, ogImageUrl: e.target.value }))}
                />
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  Corporate Office
                </h3>
                <Input label="Title" value={corporateValues.title} onChange={(e) => setCorporateValues((p) => ({ ...p, title: e.target.value }))} />
                <Textarea label="Address" value={corporateValues.address} onChange={(e) => setCorporateValues((p) => ({ ...p, address: e.target.value }))} rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone" value={corporateValues.phone} onChange={(e) => setCorporateValues((p) => ({ ...p, phone: e.target.value }))} />
                  <Input label="Email" value={corporateValues.email} onChange={(e) => setCorporateValues((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  Factory
                </h3>
                <Input label="Title" value={factoryValues.title} onChange={(e) => setFactoryValues((p) => ({ ...p, title: e.target.value }))} />
                <Textarea label="Address" value={factoryValues.address} onChange={(e) => setFactoryValues((p) => ({ ...p, address: e.target.value }))} rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone" value={factoryValues.phone} onChange={(e) => setFactoryValues((p) => ({ ...p, phone: e.target.value }))} />
                  <Input label="Email" value={factoryValues.email} onChange={(e) => setFactoryValues((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display">Map</h3>
                <Input label="Map label" value={mapValues.label} onChange={(e) => setMapValues((p) => ({ ...p, label: e.target.value }))} />
                <Input label="Embed URL (optional)" value={mapValues.embedUrl} onChange={(e) => setMapValues((p) => ({ ...p, embedUrl: e.target.value }))} placeholder="https://maps.google.com/…" />
              </div>
            </>
          )}

          {tab === 'sales' && (
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Sales Team
                </h3>
                <Button type="button" variant="secondary" onClick={addSalesRow} className="text-xs gap-1.5">
                  <Plus size={14} /> Add region
                </Button>
              </div>
              {salesTeam.length === 0 && (
                <p className="text-sm text-muted-foreground">No sales regions yet. Add one to show on Contact.</p>
              )}
              <div className="space-y-4">
                {salesTeam.map((row, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end border border-border rounded-xl p-3">
                    <Input label="Region / name" value={row.name || ''} onChange={(e) => updateSalesRow(index, 'name', e.target.value)} />
                    <Input label="Contact email" value={row.contact || ''} onChange={(e) => updateSalesRow(index, 'contact', e.target.value)} />
                    <Input label="Phone" value={row.phone || ''} onChange={(e) => updateSalesRow(index, 'phone', e.target.value)} />
                    <Button type="button" variant="ghost" onClick={() => removeSalesRow(index)} className="text-rose-500 h-10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'social' && (
            <>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Share2 size={18} className="text-primary" />
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Instagram URL" value={socialValues.instagram} onChange={(e) => setSocialValues((p) => ({ ...p, instagram: e.target.value }))} />
                  <Input label="Instagram handle" value={socialValues.instagramHandle} onChange={(e) => setSocialValues((p) => ({ ...p, instagramHandle: e.target.value }))} />
                  <Input label="Facebook URL" value={socialValues.facebook} onChange={(e) => setSocialValues((p) => ({ ...p, facebook: e.target.value }))} />
                  <Input label="YouTube URL" value={socialValues.youtube} onChange={(e) => setSocialValues((p) => ({ ...p, youtube: e.target.value }))} />
                  <Input label="LinkedIn URL" value={socialValues.linkedin} onChange={(e) => setSocialValues((p) => ({ ...p, linkedin: e.target.value }))} />
                  <Input label="Twitter / X URL" value={socialValues.twitter} onChange={(e) => setSocialValues((p) => ({ ...p, twitter: e.target.value }))} />
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display">Footer legal</h3>
                <Input label="Copyright text" value={footerValues.copyrightText} onChange={(e) => setFooterValues((p) => ({ ...p, copyrightText: e.target.value }))} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Privacy policy URL" value={footerValues.privacyPolicyUrl} onChange={(e) => setFooterValues((p) => ({ ...p, privacyPolicyUrl: e.target.value }))} />
                  <Input label="Terms URL" value={footerValues.termsUrl} onChange={(e) => setFooterValues((p) => ({ ...p, termsUrl: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={savingSettings}>
              {savingSettings ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
