import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Globe, MapPin, CheckCircle2 } from 'lucide-react'
import {
  updateGeneralSettings,
  updateCorporateSettings,
  updateFactorySettings
} from '../../../store/slices/settingsSlice'
import Button from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const settings = useSelector(state => state.settings)

  // Local form states
  const [generalValues, setGeneralValues] = useState(settings.general)
  const [corporateValues, setCorporateValues] = useState(settings.corporate)
  const [factoryValues, setFactoryValues] = useState(settings.factory)

  // Toast indicator
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target
    setGeneralValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCorporateChange = (e) => {
    const { name, value } = e.target
    setCorporateValues(prev => ({ ...prev, [name]: value }))
  }

  const handleFactoryChange = (e) => {
    const { name, value } = e.target
    setFactoryValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveAll = (e) => {
    e.preventDefault()
    
    // Dispatch settings to store
    dispatch(updateGeneralSettings(generalValues))
    dispatch(updateCorporateSettings(corporateValues))
    dispatch(updateFactorySettings(factoryValues))

    // Trigger success notification
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Global Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure company office endpoints, site themes, support lines, and registration filters.</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 size={16} /> Configuration Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Panel 1: Site Parameters */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            General Parameters & Skins
          </h3>
          <p className="text-xs text-muted-foreground -mt-2">Set general SEO metadata and default theme properties.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="siteName"
              label="FMCG Brand Name"
              value={generalValues.siteName}
              onChange={handleGeneralChange}
              required
            />
            <Input
              name="siteTagline"
              label="Brand Catchy Tagline"
              value={generalValues.siteTagline}
              onChange={handleGeneralChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="themeDefault"
              label="Default Theme Skin"
              value={generalValues.themeDefault}
              onChange={handleGeneralChange}
            >
              <option value="emerald">Emerald Green (Zaylo Original)</option>
              <option value="blue">Sapphire Blue (Corporate Skin)</option>
              <option value="purple">Amethyst Purple (Premium Select)</option>
              <option value="orange">Sunset Orange (Spicy Special)</option>
            </Select>

            <Select
              name="modeDefault"
              label="Default Contrast Mode"
              value={generalValues.modeDefault}
              onChange={handleGeneralChange}
            >
              <option value="light">Always Light Mode</option>
              <option value="dark">Always Dark Mode</option>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                name="allowRegistrations"
                checked={generalValues.allowRegistrations}
                onChange={handleGeneralChange}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              Allow Public Distributor Registrations
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={generalValues.maintenanceMode}
                onChange={handleGeneralChange}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              Enable Global Maintenance Mode
            </label>
          </div>
        </div>

        {/* Panel 2: Corporate Office Info */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Corporate Headquarters
          </h3>
          
          <Input
            name="title"
            label="Location Name"
            value={corporateValues.title}
            onChange={handleCorporateChange}
            required
          />

          <Input
            name="address"
            label="Office Street Address"
            value={corporateValues.address}
            onChange={handleCorporateChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="phone"
              label="Support Telephone"
              value={corporateValues.phone}
              onChange={handleCorporateChange}
            />
            <Input
              name="email"
              label="Support Inbox"
              value={corporateValues.email}
              onChange={handleCorporateChange}
              required
            />
          </div>
        </div>

        {/* Panel 3: Factory Unit Info */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Sonipat Manufacturing Plant
          </h3>
          
          <Input
            name="title"
            label="Factory Name"
            value={factoryValues.title}
            onChange={handleFactoryChange}
            required
          />

          <Input
            name="address"
            label="Plant Street Address"
            value={factoryValues.address}
            onChange={handleFactoryChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="phone"
              label="Plant Line Contact"
              value={factoryValues.phone}
              onChange={handleFactoryChange}
            />
            <Input
              name="email"
              label="Plant Support Inbox"
              value={factoryValues.email}
              onChange={handleFactoryChange}
              required
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="submit" className="px-8">
            Save All Configurations
          </Button>
        </div>
      </form>
    </div>
  )
}
