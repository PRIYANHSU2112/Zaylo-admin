import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from '@tanstack/react-router'
import { Globe, MapPin, CheckCircle2, FileText } from 'lucide-react'
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
  const [corporateValues, setCorporateValues] = useState({
    title: '',
    address: '',
    phone: '',
    email: '',
  })
  const [factoryValues, setFactoryValues] = useState({
    title: '',
    address: '',
    phone: '',
    email: '',
  })
  const [whatsapp, setWhatsapp] = useState('')
  const [cmsAbout, setCmsAbout] = useState({ story: '', mission: '', vision: '' })

  useEffect(() => {
    const s = settingsEnv?.data
    if (!s) return
    if (s.general) setGeneralValues((p) => ({ ...p, ...s.general }))
    if (s.corporate) setCorporateValues((p) => ({ ...p, ...s.corporate }))
    if (s.factory) setFactoryValues((p) => ({ ...p, ...s.factory }))
    if (s.whatsapp != null) setWhatsapp(s.whatsapp)
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
        corporate: corporateValues,
        factory: factoryValues,
        whatsapp,
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
      }).unwrap()
      flashSuccess()
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to save CMS')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Global Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure company endpoints, site defaults, and home CMS content.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-bold">
            <CheckCircle2 size={16} /> Saved successfully
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'general' ? 'primary' : 'secondary'} onClick={() => setTab('general')}>
          Settings
        </Button>
        <Button variant={tab === 'cms' ? 'primary' : 'secondary'} onClick={() => setTab('cms')}>
          Home CMS
        </Button>
      </div>

      {errorMsg && <p className="text-xs font-bold text-rose-600">{errorMsg}</p>}

      {tab === 'general' ? (
        <form onSubmit={handleSaveSettings} className="space-y-6">
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
            <Input name="whatsapp" label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Corporate Office
            </h3>
            <Input name="title" label="Title" value={corporateValues.title} onChange={(e) => setCorporateValues((p) => ({ ...p, title: e.target.value }))} />
            <Textarea name="address" label="Address" value={corporateValues.address} onChange={(e) => setCorporateValues((p) => ({ ...p, address: e.target.value }))} rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="phone" label="Phone" value={corporateValues.phone} onChange={(e) => setCorporateValues((p) => ({ ...p, phone: e.target.value }))} />
              <Input name="email" label="Email" value={corporateValues.email} onChange={(e) => setCorporateValues((p) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Factory
            </h3>
            <Input name="title" label="Title" value={factoryValues.title} onChange={(e) => setFactoryValues((p) => ({ ...p, title: e.target.value }))} />
            <Textarea name="address" label="Address" value={factoryValues.address} onChange={(e) => setFactoryValues((p) => ({ ...p, address: e.target.value }))} rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="phone" label="Phone" value={factoryValues.phone} onChange={(e) => setFactoryValues((p) => ({ ...p, phone: e.target.value }))} />
              <Input name="email" label="Email" value={factoryValues.email} onChange={(e) => setFactoryValues((p) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingSettings}>
              {savingSettings ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveCms} className="space-y-6">
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
          <div className="flex justify-end">
            <Button type="submit" disabled={savingCms}>
              {savingCms ? 'Saving…' : 'Save CMS'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
