import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { supabase } from './lib/supabase'

const ADMIN_EMAIL = 'diieego.brz@gmail.com'
const softwareIcons = ['code', 'terminal', 'cloud_queue', 'database', 'groups', 'psychology']
const civilBadgeIcons = ['verified', 'location_on', 'engineering']

type Profile = {
  id: number
  user_id?: string | null
  brand_name: string
  full_name: string
  years_worked: number
  software_role: string
  software_headline: string
  software_intro: string
  software_about_title: string
  software_about_body: string
  software_photo_url: string
  software_version: string
  contact_email: string
  contact_title: string
  contact_description: string
  contact_location_label: string
  contact_availability: string
  contact_linkedin_url: string
  contact_github_url: string
  contact_resume_url: string
  civil_role: string
  civil_headline: string
  civil_intro: string
  civil_philosophy: string
  civil_focus: string
  civil_certification: string
  civil_certification_note: string
  civil_base: string
  civil_specialty: string
  civil_photo_url: string
}

type ProfileForm = Omit<Profile, 'years_worked'> & { years_worked: string }

type Skill = {
  id?: number
  user_id?: string | null
  sort_order: number
  category: string
  name: string
  level: string
  description: string
}

type Experiencia = {
  id?: number
  user_id?: string | null
  sort_order: number
  company: string
  role: string
  period: string
  location: string
  description: string
  achievements: string
  stack: string
}

type Repo = {
  id?: number
  user_id?: string | null
  sort_order: number
  name: string
  url: string
  description: string
  stack: string
  badge: string
  metrics: string
}

type CivilItem = {
  id?: number
  user_id?: string | null
  sort_order: number
  section_key: 'experience' | 'projects' | 'skills'
  title: string
  subtitle: string
  period: string
  description: string
  link: string
  stack: string
}

type EditableSkill = Skill & { localId: string }
type EditableExperiencia = Experiencia & { localId: string }
type EditableRepo = Repo & { localId: string }
type EditableCivilItem = CivilItem & { localId: string }
type AdminWorkspace = 'software' | 'civil' | 'settings' | 'analytics'
type AdminEntryPoint = 'profile' | 'skills' | 'experience' | 'repos' | 'civil' | AdminWorkspace
type ViewMode = 'software' | 'civil' | 'contact'

type FieldConfig = {
  label: string
  key: keyof ProfileForm
  multiline?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'number'
}

const profileFields: FieldConfig[] = [
  { label: 'Brand', key: 'brand_name' },
  { label: 'Nombre completo', key: 'full_name' },
  { label: 'Años de experiencia', key: 'years_worked', type: 'number' },
  { label: 'Rol de software', key: 'software_role' },
  { label: 'Titular de software', key: 'software_headline', multiline: true },
  { label: 'Introducción de software', key: 'software_intro', multiline: true },
  { label: 'Título de la sección', key: 'software_about_title' },
  { label: 'Cuerpo de la sección', key: 'software_about_body', multiline: true },
  { label: 'Foto de software', key: 'software_photo_url', type: 'url', placeholder: 'https://...' },
  { label: 'Versión de compilación', key: 'software_version' },
  { label: 'Correo de contacto', key: 'contact_email', type: 'email' },
  { label: 'Título de contacto', key: 'contact_title' },
  { label: 'Descripción de contacto', key: 'contact_description', multiline: true },
  { label: 'Ubicación de contacto', key: 'contact_location_label' },
  { label: 'Disponibilidad', key: 'contact_availability' },
  { label: 'URL de LinkedIn', key: 'contact_linkedin_url', type: 'url', placeholder: 'https://...' },
  { label: 'URL de GitHub', key: 'contact_github_url', type: 'url', placeholder: 'https://...' },
  { label: 'URL del CV', key: 'contact_resume_url', type: 'url', placeholder: 'https://...' },
  { label: 'Rol civil', key: 'civil_role' },
  { label: 'Titular civil', key: 'civil_headline', multiline: true },
  { label: 'Introducción civil', key: 'civil_intro', multiline: true },
  { label: 'Filosofía civil', key: 'civil_philosophy', multiline: true },
  { label: 'Enfoque civil', key: 'civil_focus', multiline: true },
  { label: 'Certificación civil', key: 'civil_certification' },
  { label: 'Nota de certificación', key: 'civil_certification_note', multiline: true },
  { label: 'Base civil', key: 'civil_base' },
  { label: 'Especialidad civil', key: 'civil_specialty' },
  { label: 'Foto de civil', key: 'civil_photo_url', type: 'url', placeholder: 'https://...' },
]

const fallbackProfile: Profile = {
  id: 1,
  brand_name: 'ARCHI-TECH',
  full_name: 'Diego Bardalez',
  years_worked: 8,
  software_role: 'Arquitecto de software sénior / ingeniero integral',
  software_headline: 'Diseñando\nlógica escalable.',
  software_intro: 'Construyo sistemas distribuidos con la misma integridad estructural que un rascacielos. Mi enfoque combina principios de ingeniería rigurosos con patrones modernos nativos de la nube para crear software rápido, resiliente y mantenible.',
  software_about_title: 'Sobre mí',
  software_about_body: 'Con más de 8 años en la industria tecnológica, me especializo en transformar requisitos de negocio complejos en soluciones técnicas elegantes. Creo que una buena arquitectura de software es invisible: simplemente funciona, escala sin esfuerzo y evoluciona sin romperse.',
  software_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUmV1E3VKW_yOZNGyiO6HU66bzLJEsd7hoNHeSZHgryYZb6BVIHcugPYXpqfaJjFS1i4LYMJD70wDcKkJ3EtLqHWrFG2HApYY2U6zGRuaitgkXZKElZ178K8xxMEWjsYZdJcyXjfyDeSmm2T4sdjer0iCOn_tpMbLUloTxAVnWs0ZPOY016lI7COqnnjAs1BC4p65EsNHlZZ42Mc7uSEsHMM9wZSVd_ol44W3OLQ-R47MA7waRxsc3JOEuQAGtP7S56BGE-gCK4UDe',
  software_version: 'BUILD_VER_2024.11',
  contact_email: ADMIN_EMAIL,
  contact_title: "Plasmemos juntos el futuro.",
  contact_description: "Ya sea que busques una arquitectura de software robusta o un diseño estructural con integridad física, mi mesa de trabajo está abierta.",
  contact_location_label: 'Lima, Perú',
  contact_availability: 'Lun — Vie | 09:00 - 18:00',
  contact_linkedin_url: 'https://www.linkedin.com/',
  contact_github_url: 'https://github.com/diego1998z',
  contact_resume_url: '#',
  civil_role: 'Ingeniero estructural y especialista en infraestructura',
  civil_headline: 'Definiendo el estándar estructural.',
  civil_intro: 'Con más de una década de experiencia en infraestructura civil pesada y análisis estructural computacional, me especializo en la intersección entre principios tradicionales de ingeniería y flujos de trabajo BIM modernos.',
  civil_philosophy: 'Integridad a través de la precisión. Cada cálculo es un compromiso con la seguridad pública y la longevidad de la obra.',
  civil_focus: 'Estabilización de núcleos en altura, sistemas de hormigón pretensado y auditoría estructural automatizada.',
  civil_certification: 'Ingeniero acreditado (CEng)',
  civil_certification_note: 'Acreditado con foco en integridad estructural, auditoría de obra y flujos de diseño resilientes.',
  civil_base: 'Base: Madrid / auditorías de obra globales',
  civil_specialty: 'Especialista en vibración y análisis sísmico',
  civil_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnZOrKckA5WpA6dnPiCT65i8nVP4bVZoFwjfXv-35EtzE1N7Z8xA_UM_IHtisKS5K1rFR-fPwmskSDUzGchnOVVK-ek8ma7EzrmN67MkSBJo0vCjGbqsZSQs2OEEvViiKZHuvngFt8l139oMGZ-HlItZboUjDLoJRZsRfUpPIZ_bi7R_R65hPys0cu69g8ukK8ZwnZuZzubhmjdfcOQMqLEEfziN3NeyTk_MQURcRF8_xZoXoXsXirR75AUfSNJ3Md7Rhj4mXkVegX',
}

const fallbackHabilidades: Skill[] = [
  { id: 1, sort_order: 1, category: 'Lenguajes y entornos de ejecución', name: 'Lenguajes y entornos de ejecución', level: 'Núcleo', description: 'Rust, Go, TypeScript, Node.js, Python, C++, Java.' },
  { id: 2, sort_order: 2, category: 'Arquitectura', name: 'Arquitectura', level: 'Sistemas', description: 'Microservicios, diseño orientado a eventos, DDD, GraphQL, REST, gRPC.' },
  { id: 3, sort_order: 3, category: 'Infraestructura como código (IaC)', name: 'Infraestructura como código (IaC)', level: 'Nube', description: 'Kubernetes, Docker, Terraform, AWS, Azure, CI/CD (acciones de GitHub).' },
  { id: 4, sort_order: 4, category: 'Ingeniería de datos', name: 'Ingeniería de datos', level: 'Datos', description: 'PostgreSQL, MongoDB, Redis, Kafka, ElasticSearch, Apache Spark.' },
  { id: 5, sort_order: 5, category: 'Liderazgo', name: 'Liderazgo', level: 'Equipos', description: 'Agile/Scrum, mentoría, estrategia tecnológica, auditoría de sistemas.' },
  { id: 6, sort_order: 6, category: 'Habilidades blandas', name: 'Habilidades blandas', level: 'Humanas', description: 'Resolución pragmática de problemas, foco profundo y diseño colaborativo.' },
]

const fallbackExperiencias: Experiencia[] = [
  { id: 1, sort_order: 1, company: 'Soluciones TechTonic (finanzas tecnológicas)', role: 'Líder sénior de infraestructura', period: '2022 — Actualidad', location: 'Berlín, DE', description: 'Registro profesional v4.0', achievements: 'Lideré la migración de un núcleo monolítico heredado hacia una arquitectura de microservicios basada en gRPC, reduciendo la latencia un 45%.\nOrquesté un despliegue multinube en Kubernetes sobre AWS, asegurando una disponibilidad del 99,99 % para más de 5 millones de usuarios activos mensuales.\nMentoricé a un equipo interdisciplinario de 15 ingenieros, implementando buenas prácticas de TDD y CI/CD.', stack: 'Kubernetes, Go, Terraform, AWS' },
  { id: 2, sort_order: 2, company: 'Dinámicas Urbanas (software como servicio)', role: 'Desarrollador full stack', period: '2019 — 2022', location: 'Madrid, ES', description: 'Registro profesional v3.1', achievements: 'Construí paneles complejos de visualización de datos con React y D3.js para monitoreo de sensores en tiempo real.\nDesarrollé consultas espaciales de alto rendimiento con PostGIS para procesar grandes volúmenes de datos geográficos.\nIntegré APIs BIM de terceros para conectar la arquitectura física con gemelos digitales de software.', stack: 'React, TypeScript, Python, PostgreSQL' },
]

const fallbackRepos: Repo[] = [
  { id: 1, sort_order: 1, name: 'infraestructura-como-plano', url: 'https://github.com/diego1998z', description: 'Un proveedor personalizado de Terraform para mapear infraestructura en la nube a restricciones arquitectónicas físicas.', stack: 'Go', badge: 'v1.2.0', metrics: '1.2k' },
  { id: 2, sort_order: 2, name: 'motor-de-analisis-estructural', url: 'https://github.com/diego1998z', description: 'Una biblioteca Rust de alto rendimiento para análisis FEM en tiempo real en entornos web usando WASM.', stack: 'Rust', badge: 'Activo', metrics: '840' },
  { id: 3, sort_order: 3, name: 'visor-bim', url: 'https://github.com/diego1998z', description: 'Marco de visualización avanzado para renderizar grandes volúmenes de datos arquitectónicos en el navegador.', stack: 'TypeScript', badge: 'En beta', metrics: '2.1k' },
]

const fallbackCivilItems: CivilItem[] = [
  { id: 1, sort_order: 1, section_key: 'experience', title: 'Ingeniero estructural líder', subtitle: 'INFRA-TECH GLOBAL', period: 'Ene 2021 — Actualidad | Madrid / Global', description: 'Dirijo el departamento de diseño estructural, integro normas Eurocódigo en flujos de diseño a BIM y lidero equipos de entrega de infraestructura.', link: '', stack: 'Infraestructura de puentes y ferrocarril, BIM nivel 3, Eurocódigos' },
  { id: 2, sort_order: 2, section_key: 'experience', title: 'Especialista sénior de diseño', subtitle: 'VIA-STRUCTURA LTD.', period: '2017 — 2020 | Región mediterránea', description: 'Diseñé redes de puentes, sistemas de aislamiento sísmico y optimización estructural computacional para eficiencia de materiales.', link: '', stack: 'Aislamiento sísmico, Civil 3D' },
  { id: 3, sort_order: 3, section_key: 'experience', title: 'Inspector estructural de obra', subtitle: 'URBAN CONSTRUCTORS', period: '2014 — 2017 | Urban Hubs', description: 'Verificación estructural en obra, gestión de encofrados verticales y auditorías de cumplimiento para normas de hormigón armado.', link: '', stack: 'Inspección de obra, control de calidad y hormigón armado' },
  { id: 4, sort_order: 4, section_key: 'projects', title: 'Viaducto Nexus', subtitle: 'Infraestructura / diseño de puentes', period: 'DOC: S-092-A', description: 'Modelado estructural a escala completa para un viaducto curvo de 450 m, con análisis de cables postensados y simulación de expansión térmica.', link: 'https://example.com', stack: 'BIM nivel 3, Planos estructurales, análisis FEA' },
  { id: 5, sort_order: 5, section_key: 'projects', title: 'Diseño del núcleo de la Torre Vertex', subtitle: 'Comercial / rascacielos', period: 'DOC: T-104-B', description: 'Optimización del núcleo de hormigón para una torre de 52 pisos, con análisis dinámico de efectos aeroelásticos y redistribución de cargas verticales.', link: 'https://example.com', stack: 'Clase sísmica IV, Modelo 3D, refuerzo' },
  { id: 6, sort_order: 6, section_key: 'skills', title: 'Stack técnico principal', subtitle: 'Stack civil', period: 'Toolkit', description: 'Autodesk Revit BIM, CSI SAP2000, ETABS, Civil 3D, Rhino + Grasshopper, Eurocódigos / AASHTO', link: '', stack: 'Autodesk Revit BIM, CSI SAP2000, ETABS, Civil 3D, Rhino + Grasshopper, Eurocódigos / AASHTO' },
  { id: 7, sort_order: 7, section_key: 'skills', title: 'Habilidades blandas y gestión', subtitle: 'Coordinación', period: 'Liderazgo', description: 'Gestión del ciclo de vida del proyecto, cumplimiento normativo, coordinación interdisciplinaria e ingeniería de crisis', link: '', stack: 'Gestión del ciclo de vida del proyecto, cumplimiento normativo, coordinación interdisciplinaria e ingeniería de crisis' },
]

const byOrder = <T extends { sort_order: number }>(items: T[]) => [...items].sort((a, b) => a.sort_order - b.sort_order)
const toForm = (profile: Profile): ProfileForm => ({ ...profile, years_worked: String(profile.years_worked) })
const addLocalId = <T extends object>(items: T[]) => items.map((item) => ({ ...item, localId: crypto.randomUUID() }))
const splitLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean)
const splitChips = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)
const newSkill = (skill?: Partial<Skill>): Skill => ({ sort_order: skill?.sort_order ?? 1, category: skill?.category ?? '', name: skill?.name ?? '', level: skill?.level ?? '', description: skill?.description ?? '' })
const newExperiencia = (experience?: Partial<Experiencia>): Experiencia => ({ sort_order: experience?.sort_order ?? 1, company: experience?.company ?? '', role: experience?.role ?? '', period: experience?.period ?? '', location: experience?.location ?? '', description: experience?.description ?? '', achievements: experience?.achievements ?? '', stack: experience?.stack ?? '' })
const newRepo = (repo?: Partial<Repo>): Repo => ({ sort_order: repo?.sort_order ?? 1, name: repo?.name ?? '', url: repo?.url ?? '', description: repo?.description ?? '', stack: repo?.stack ?? '', badge: repo?.badge ?? '', metrics: repo?.metrics ?? '' })
const newCivilItem = (item?: Partial<CivilItem>): CivilItem => ({ sort_order: item?.sort_order ?? 1, section_key: item?.section_key ?? 'projects', title: item?.title ?? '', subtitle: item?.subtitle ?? '', period: item?.period ?? '', description: item?.description ?? '', link: item?.link ?? '', stack: item?.stack ?? '' })

export default function App() {
  const [view, setView] = useState<ViewMode>('software')
  const [openAdmin, setOpenAdmin] = useState(false)
  const [adminWorkspace, setAdminWorkspace] = useState<AdminWorkspace>('software')
  const [profile, setProfile] = useState(fallbackProfile)
  const [profileForm, setProfileForm] = useState<ProfileForm>(toForm(fallbackProfile))
  const [skills, setHabilidades] = useState(fallbackHabilidades)
  const [experiences, setExperiencias] = useState(fallbackExperiencias)
  const [repos, setRepos] = useState(fallbackRepos)
  const [civilItems, setCivilItems] = useState(fallbackCivilItems)
  const [editableHabilidades, setEditableHabilidades] = useState<EditableSkill[]>(addLocalId(fallbackHabilidades))
  const [editableExperiencias, setEditableExperiencias] = useState<EditableExperiencia[]>(addLocalId(fallbackExperiencias))
  const [editableRepos, setEditableRepos] = useState<EditableRepo[]>(addLocalId(fallbackRepos))
  const [editableCivilItems, setEditableCivilItems] = useState<EditableCivilItem[]>(addLocalId(fallbackCivilItems))
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [status, setStatus] = useState('Listo.')
  const [error, setError] = useState('')

  const isAdmin = sessionEmail?.toLowerCase() === ADMIN_EMAIL
  const canEdit = Boolean(isAdmin)

  const civilExperiencia = useMemo(() => byOrder(civilItems.filter((item) => item.section_key === 'experience')), [civilItems])
  const civilProjects = useMemo(() => byOrder(civilItems.filter((item) => item.section_key === 'projects')), [civilItems])
  const civilHabilidades = useMemo(() => byOrder(civilItems.filter((item) => item.section_key === 'skills')), [civilItems])

  useEffect(() => {
    if (!supabase) {
      setStatus('Supabase no configurado. Se usan datos locales de demostración.')
      return
    }

    let alive = true
    ;(async () => {
      const [profileResponse, skillsResponse, experiencesResponse, reposResponse, civilResponse, sessionResponse] = await Promise.all([
        supabase.from('portfolio_profile').select('*').eq('id', 1).maybeSingle(),
        supabase.from('portfolio_skills').select('*').order('sort_order', { ascending: true }),
        supabase.from('portfolio_experiences').select('*').order('sort_order', { ascending: true }),
        supabase.from('portfolio_repos').select('*').order('sort_order', { ascending: true }),
        supabase.from('portfolio_civil_items').select('*').order('sort_order', { ascending: true }),
        supabase.auth.getSession(),
      ])

      if (!alive) return

      const nextProfile = (profileResponse.data as Profile | null) ?? fallbackProfile
      const nextHabilidades = ((skillsResponse.data as Skill[] | null) ?? []).length ? (skillsResponse.data as Skill[]) : fallbackHabilidades
      const nextExperiencias = ((experiencesResponse.data as Experiencia[] | null) ?? []).length ? (experiencesResponse.data as Experiencia[]) : fallbackExperiencias
      const nextRepos = ((reposResponse.data as Repo[] | null) ?? []).length ? (reposResponse.data as Repo[]) : fallbackRepos
      const nextCivilItems = ((civilResponse.data as CivilItem[] | null) ?? []).length ? (civilResponse.data as CivilItem[]) : fallbackCivilItems
      const session = sessionResponse.data.session

      setProfile(nextProfile)
      setProfileForm(toForm(nextProfile))
      setHabilidades(byOrder(nextHabilidades))
      setExperiencias(byOrder(nextExperiencias))
      setRepos(byOrder(nextRepos))
      setCivilItems(byOrder(nextCivilItems))
      setEditableHabilidades(addLocalId(byOrder(nextHabilidades)))
      setEditableExperiencias(addLocalId(byOrder(nextExperiencias)))
      setEditableRepos(addLocalId(byOrder(nextRepos)))
      setEditableCivilItems(addLocalId(byOrder(nextCivilItems)))
      setSessionEmail(session?.user?.email ?? null)
      setSessionUserId(session?.user?.id ?? null)
      setStatus('Datos sincronizados con Supabase.')
    })().catch(() => setStatus('No se pudieron cargar los datos de Supabase.'))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null)
      setSessionUserId(session?.user?.id ?? null)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  const openLogin = (entry: AdminEntryPoint = 'software') => {
    const nextWorkspace: AdminWorkspace =
      entry === 'civil'
        ? 'civil'
        : entry === 'analytics'
          ? 'analytics'
          : entry === 'settings' || entry === 'profile'
            ? 'settings'
            : 'software'
    setAdminWorkspace(nextWorkspace)
    setOpenAdmin(true)
  }

  const handleProfileField = (key: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [key]: value }))
  }

  const handleEditableUpdate = <T extends { localId: string }>(setter: Dispatch<SetStateAction<T[]>>, localId: string, patch: Partial<T>) => {
    setter((current) => current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)))
  }

  const replaceList = async (table: 'portfolio_skills' | 'portfolio_experiences' | 'portfolio_repos' | 'portfolio_civil_items', rows: Record<string, unknown>[]) => {
    if (!supabase || !canEdit) {
      setError('Necesitás iniciar sesión con tu correo autorizado para guardar cambios.')
      return false
    }
    if (!sessionUserId) {
      setError('No se pudo leer tu user_id.')
      return false
    }

    const { error: deleteError } = await supabase.from(table).delete().gte('id', 0)
    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    if (rows.length) {
      const { error: insertError } = await supabase.from(table).insert(rows)
      if (insertError) {
        setError(insertError.message)
        return false
      }
    }
    return true
  }

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setError('Configurá Supabase para autenticar acceso administrativo.')
      return
    }
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (loginError) {
      setError(loginError.message)
      return
    }
    setStatus('Acceso autorizado.')
    setLoginPassword('')
  }

  const saveProfile = async () => {
    if (!supabase || !canEdit || !sessionUserId) {
      setError('Necesitás autenticarte con el correo autorizado.')
      return
    }
    const { id: _profileId, ...rest } = profileForm
    const payload: Profile = { id: 1, ...rest, years_worked: Number(profileForm.years_worked || 0), user_id: sessionUserId }
    const { error: saveError } = await supabase.from('portfolio_profile').upsert(payload, { onConflict: 'id' })
    if (saveError) {
      setError(saveError.message)
      return
    }
    setProfile(payload)
    setProfileForm(toForm(payload))
    setError('')
    setStatus('Perfil editorial actualizado.')
  }

  const saveHabilidades = async () => {
    const rows = editableHabilidades.map((item, index) => ({ user_id: sessionUserId, sort_order: index + 1, category: item.category.trim(), name: item.name.trim(), level: item.level.trim(), description: item.description.trim() }))
    const ok = await replaceList('portfolio_skills', rows)
    if (!ok) return
    const next = rows.map((item) => newSkill(item))
    setHabilidades(next)
    setEditableHabilidades(addLocalId(next))
    setStatus('Habilidades actualizadas.')
    setError('')
  }

  const saveExperiencias = async () => {
    const rows = editableExperiencias.map((item, index) => ({ user_id: sessionUserId, sort_order: index + 1, company: item.company.trim(), role: item.role.trim(), period: item.period.trim(), location: item.location.trim(), description: item.description.trim(), achievements: item.achievements.trim(), stack: item.stack.trim() }))
    const ok = await replaceList('portfolio_experiences', rows)
    if (!ok) return
    const next = rows.map((item) => newExperiencia(item))
    setExperiencias(next)
    setEditableExperiencias(addLocalId(next))
    setStatus('Experiencia log actualizado.')
    setError('')
  }

  const saveRepos = async () => {
    const rows = editableRepos.map((item, index) => ({ user_id: sessionUserId, sort_order: index + 1, name: item.name.trim(), url: item.url.trim(), description: item.description.trim(), stack: item.stack.trim(), badge: item.badge.trim(), metrics: item.metrics.trim() }))
    const ok = await replaceList('portfolio_repos', rows)
    if (!ok) return
    const next = rows.map((item) => newRepo(item))
    setRepos(next)
    setEditableRepos(addLocalId(next))
    setStatus('Repositorios actualizados.')
    setError('')
  }

  const saveCivilItems = async () => {
    const rows = editableCivilItems.map((item, index) => ({ user_id: sessionUserId, sort_order: index + 1, section_key: item.section_key, title: item.title.trim(), subtitle: item.subtitle.trim(), period: item.period.trim(), description: item.description.trim(), link: item.link.trim(), stack: item.stack.trim() }))
    const ok = await replaceList('portfolio_civil_items', rows)
    if (!ok) return
    const next = rows.map((item) => newCivilItem(item))
    setCivilItems(next)
    setEditableCivilItems(addLocalId(next))
    setStatus('Contenido civil actualizado.')
    setError('')
  }

  const resetDrafts = () => {
    setProfileForm(toForm(profile))
    setEditableHabilidades(addLocalId(skills))
    setEditableExperiencias(addLocalId(experiences))
    setEditableRepos(addLocalId(repos))
    setEditableCivilItems(addLocalId(civilItems))
    setStatus('Borrador restaurado desde el último guardado.')
    setError('')
  }

  const renderProfileField = (field: FieldConfig) => {
    const value = profileForm[field.key]
    if (field.multiline) {
      return (
        <label className="editor-field editor-field--full" key={String(field.key)}>
          <span>{field.label}</span>
          <textarea rows={field.key.toString().includes('description') ? 3 : 4} value={String(value)} placeholder={field.placeholder} onChange={(event) => handleProfileField(field.key, event.target.value)} />
        </label>
      )
    }
    return (
      <label className="editor-field" key={String(field.key)}>
        <span>{field.label}</span>
        <input type={field.type ?? 'text'} value={String(value)} placeholder={field.placeholder} onChange={(event) => handleProfileField(field.key, event.target.value)} />
      </label>
    )
  }

  return (
    <div className="archi-app">
      <div className="archi-grid" aria-hidden="true" />
      <header className="archi-topbar">
        <div className="archi-topbar__inner">
          <button className="brand-mark" type="button" onClick={() => setView('software')}>{profile.brand_name}</button>
          <nav className="archi-nav" aria-label="Primary">
            <button className={`archi-nav__link ${view === 'software' ? 'is-active' : ''}`} type="button" onClick={() => setView('software')}>Ingeniería de software</button>
            <button className={`archi-nav__link ${view === 'civil' ? 'is-active' : ''}`} type="button" onClick={() => setView('civil')}>Ingeniería civil</button>
            <button className={`archi-nav__link ${view === 'contact' ? 'is-active' : ''}`} type="button" onClick={() => setView('contact')}>Contacto</button>
          </nav>
          <div className="archi-topbar__actions">
            <button className="admin-link" type="button" onClick={() => openLogin('profile')}>{sessionEmail ? 'Acceso admin' : 'Iniciar sesión'}</button>
            <button className="primary-cta" type="button" onClick={() => setView('contact')}>Trabajemos juntos</button>
          </div>
        </div>
      </header>

      <main className="archi-main">
        {view === 'software' ? (
          <>
            <section className="software-hero page-shell">
              <div className="software-hero__copy">
                <p className="section-kicker">{profile.software_role}</p>
                <h1>{profile.software_headline.split('\n').filter(Boolean).map((line) => (<span key={line}>{line}<br /></span>))}</h1>
                <div className="software-hero__body">
                  <p className="lead-text">{profile.software_intro}</p>
                  <div className="about-panel">
                    <h3>{profile.software_about_title}</h3>
                    <p>{profile.software_about_body}</p>
                  </div>
                </div>
              </div>
              <div className="software-hero__media">
                <div className="portrait-frame">
                  <img src={profile.software_photo_url} alt={`Retrato de ${profile.full_name}`} />
                  <span>{profile.software_version}</span>
                </div>
              </div>
            </section>

            <section className="software-experience">
              <div className="page-shell">
                <div className="section-header section-header--line">
                  <h2>Professional Experiencia</h2>
                  <span>REGISTRO PROFESIONAL v4.0</span>
                </div>
                <div className="software-log">
                  {experiences.map((item, index) => (
                    <article className={`software-log__item ${index === 0 ? 'software-log__item--accent' : ''}`} key={`${item.company}-${item.period}`}>
                      <div className="software-log__meta">
                        <p>{item.period}</p>
                        <span>{item.location}</span>
                      </div>
                      <div className="software-log__content">
                        <h3>{item.role}</h3>
                        <p className="software-log__company">{item.company}</p>
                        <ul>
                          {splitLines(item.achievements).map((line) => (
                            <li key={line}><span>/</span>{line}</li>
                          ))}
                        </ul>
                        <div className="chip-row">
                          {splitChips(item.stack).map((chip) => (<span key={chip}>{chip}</span>))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="software-skills page-shell">
              <div className="section-header section-header--split">
                <div>
                  <h2>Habilidades & Expertise</h2>
                  <p>A dual-layered approach to development. Robust backend thinking, scalable infrastructure, and product-facing frontend execution.</p>
                </div>
                <div className="structural-rule" />
              </div>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <article className="skill-tile" key={`${skill.name}-${index}`}>
                    <div className="skill-tile__head">
                      <span className="material-symbols-outlined">{softwareIcons[index % softwareIcons.length]}</span>
                      <h3>{skill.name}</h3>
                    </div>
                    <p>{skill.description}</p>
                    <small>{skill.level}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="software-repos">
              <div className="page-shell">
                <div className="section-header section-header--repos">
                  <div>
                    <h2>Repositorios</h2>
                    <p>Código fuente público e investigación</p>
                  </div>
                  <a href={profile.contact_github_url} target="_blank" rel="noreferrer">Ver perfil completo de GitHub</a>
                </div>
                <div className="repos-grid">
                  {repos.map((repo) => (
                    <a className="repo-tile" href={repo.url} target="_blank" rel="noreferrer" key={repo.name}>
                      <div className="repo-tile__top">
                        <span className="material-symbols-outlined">folder_open</span>
                        <em>{repo.badge}</em>
                      </div>
                      <h3>{repo.name}</h3>
                      <p>{repo.description}</p>
                      <div className="repo-tile__meta">
                        <span>{repo.stack}</span>
                        <small>{repo.metrics}</small>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="software-cta page-shell">
              <h2>Let's build something solid.</h2>
              <div className="cta-row">
                <a className="secondary-cta" href={profile.contact_resume_url} target="_blank" rel="noreferrer">Descargar CV técnico</a>
                <button className="outline-cta" type="button" onClick={() => setView('contact')}>Iniciar colaboración</button>
              </div>
            </section>
          </>
        ) : null}

        {view === 'civil' ? (
          <>
            <section className="civil-hero page-shell">
              <div className="civil-hero__copy">
                <p className="section-kicker">{profile.civil_role}</p>
                <h1>Defining the <span>Structural</span> Standard.</h1>
                <p className="lead-text">{profile.civil_intro}</p>
                <div className="civil-notes">
                  <article>
                    <h4>Filosofía central</h4>
                    <p>{profile.civil_philosophy}</p>
                  </article>
                  <article>
                    <h4>Enfoque técnico</h4>
                    <p>{profile.civil_focus}</p>
                  </article>
                </div>
              </div>
              <aside className="civil-hero__meta">
                <div className="civil-badge">
                  <div>
                    <p>{profile.civil_certification}</p>
                    <span>{profile.civil_certification_note}</span>
                  </div>
                  <span className="material-symbols-outlined">{civilBadgeIcons[0]}</span>
                </div>
                <div className="civil-hero__markers">
                  <div><span className="material-symbols-outlined">{civilBadgeIcons[1]}</span><p>{profile.civil_base}</p></div>
                  <div><span className="material-symbols-outlined">{civilBadgeIcons[2]}</span><p>{profile.civil_specialty}</p></div>
                </div>
                <div className="civil-portrait"><img src={profile.civil_photo_url} alt={`Retrato civil de ${profile.full_name}`} /></div>
              </aside>
            </section>

            <section className="civil-experience">
              <div className="page-shell">
                <div className="section-header section-header--line">
                  <h2>Trayectoria Profesional</h2>
                  <span>01 / EXPERIENCE</span>
                </div>
                <div className="civil-log">
                  {civilExperiencia.map((item, index) => (
                    <article className={`civil-log__item ${index === 0 ? 'civil-log__item--accent' : ''}`} key={`${item.title}-${item.period}`}>
                      <div className="civil-log__meta"><p>{item.period.split('|')[0]?.trim() ?? item.period}</p><span>{item.period.split('|')[1]?.trim() ?? item.subtitle}</span></div>
                      <div className="civil-log__content">
                        <h3>{item.title}</h3>
                        <p className="civil-log__company">{item.subtitle}</p>
                        <p>{item.description}</p>
                        <div className="chip-row chip-row--light">{splitChips(item.stack).map((chip) => (<span key={chip}>{chip}</span>))}</div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="civil-skills-inline">
                  {civilHabilidades.map((item) => (
                    <article key={item.title}>
                      <h4>{item.title}</h4>
                      <div className="chip-row chip-row--light">{splitChips(item.stack).map((chip) => (<span key={chip}>{chip}</span>))}</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="civil-projects page-shell">
              <div className="section-header section-header--projects">
                <h2>Proyectos</h2>
                <span>02 / PORTFOLIO</span>
              </div>
              <div className="civil-projects__grid">
                {civilProjects.map((item, index) => (
                  <article className="civil-project" key={`${item.title}-${index}`}>
                    <div className="civil-project__image">
                      <div className="civil-project__overlay"><span>{splitChips(item.stack)[0] ?? 'Plano'}</span></div>
                    </div>
                    <div className="civil-project__copy">
                      <small>{item.subtitle}</small>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <div className="civil-project__foot"><span>{item.period}</span>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">Ver dossier</a> : null}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {view === 'contact' ? (
          <section className="contact-view page-shell">
            <div className="contact-layout">
              <div className="contact-layout__form">
                <header>
                  <span className="section-kicker">Fase de contacto</span>
                  <h1>{profile.contact_title}</h1>
                  <p>{profile.contact_description}</p>
                </header>
                <div className="contact-card">
                  <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
                    <div className="contact-form__grid">
                      <label><span>Nombre completo</span><input placeholder="Nombre y apellido" type="text" /></label>
                      <label><span>Correo electrónico</span><input placeholder="correo@ejemplo.com" type="email" /></label>
                    </div>
                    <label><span>Tipo de consulta</span><select defaultValue="software"><option value="software">Arquitectura de software</option><option value="civil">Ingeniería civil y estructuras</option><option value="general">Colaboración general</option></select></label>
                    <label><span>Proyecto / mensaje</span><textarea rows={4} placeholder="Describí el alcance de tu visión..." /></label>
                    <button className="primary-cta primary-cta--full" type="submit">Enviar especificaciones</button>
                  </form>
                </div>
              </div>

              <aside className="contact-layout__side">
                <div className="contact-identity">
                  <div className="contact-identity__avatar"><img src={profile.software_photo_url} alt={profile.full_name} /></div>
                  <h3>Conectate directamente</h3>
                  <p>Opero entre bits digitales y concreto físico.</p>
                  <div className="contact-links">
                    <a href={profile.contact_linkedin_url} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">link</span><span>LinkedIn</span></a>
                    <a href={profile.contact_github_url} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">code</span><span>GitHub</span></a>
                    <a href={profile.contact_resume_url} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">description</span><span>CV</span></a>
                  </div>
                </div>
                <div className="contact-meta">
                  <h4>Coordenadas regionales</h4>
                  <div><strong>Núcleo central</strong><span>{profile.contact_location_label}</span></div>
                  <div><strong>Disponibilidad</strong><span>{profile.contact_availability}</span></div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="archi-footer">
        <div>{view === 'civil' ? 'Archi-Tech Civil Editorial' : 'Archi-Tech Editorial'}</div>
        <p>© 2024 {profile.brand_name}. Construido con precisión.</p>
        <div className="archi-footer__links">
          <a href={profile.contact_github_url} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.contact_linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>
          <button type="button" onClick={() => openLogin('profile')}>Administrar</button>
        </div>
      </footer>

      {openAdmin ? (
        <div className="admin-shell" role="presentation" onClick={() => setOpenAdmin(false)}>
          <aside className="admin-shell__panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            {!sessionEmail ? (
              <div className="login-editorial">
                <div className="login-editorial__header">
                  <div>
                    <p>Terminal administrativa</p>
                    <h2>Autorizar acceso</h2>
                  </div>
                  <span className="material-symbols-outlined">lock_open</span>
                </div>
                <form className="login-editorial__form" onSubmit={login}>
                  <label>
                    <span>Correo de admin</span>
                    <input type="email" value={loginEmail} placeholder="admin@archi-tech.com" onChange={(event) => setLoginEmail(event.target.value)} required />
                  </label>
                  <label>
                    <span>Clave de acceso / contraseña</span>
                    <input type="password" value={loginPassword} placeholder="••••••••••••" onChange={(event) => setLoginPassword(event.target.value)} required />
                  </label>
                  <button className="primary-cta primary-cta--full" type="submit">Autorizar acceso</button>
                  {error ? <small className="error-copy">{error}</small> : null}
                </form>
                <div className="login-editorial__footer"><span>Túnel cifrado de extremo a extremo</span></div>
              </div>
            ) : (
              <div className="editorial-workspace architect-admin">
                <aside className="architect-admin__sidebar">
                  <div className="architect-admin__brand">
                    <h2>Administrador ARCHI-TECH</h2>
                    <p>Plano &amp; Bit v1.0</p>
                  </div>
                  <div className="architect-admin__nav">
                    <button className={adminWorkspace === 'software' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('software')}><span className="material-symbols-outlined">code</span><span>Sección software</span></button>
                    <button className={adminWorkspace === 'civil' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('civil')}><span className="material-symbols-outlined">architecture</span><span>Sección civil</span></button>
                    <button className={adminWorkspace === 'settings' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('settings')}><span className="material-symbols-outlined">settings</span><span>Configuración general</span></button>
                    <button className={adminWorkspace === 'analytics' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('analytics')}><span className="material-symbols-outlined">analytics</span><span>Analíticas</span></button>
                  </div>
                  <div className="architect-admin__logout">
                    <button className="ghost-admin" type="button" onClick={async () => { await supabase?.auth.signOut(); setSessionEmail(null); setSessionUserId(null); setStatus('Sesión cerrada.'); }}><span className="material-symbols-outlined">logout</span><span>Cerrar sesión</span></button>
                  </div>
                </aside>

                <div className="architect-admin__main">
                  <div className="editorial-workspace__top architect-admin__topbar">
                    <div>
                      <p>{adminWorkspace === 'software' ? 'Panel: contenido de ingeniería de software' : adminWorkspace === 'civil' ? 'Panel: contenido de ingeniería civil' : adminWorkspace === 'analytics' ? 'Panel de analíticas' : 'Panel de configuración general'}</p>
                      <h2>{adminWorkspace === 'software' ? 'Editor de contenido de software' : adminWorkspace === 'civil' ? 'Editor de contenido civil' : adminWorkspace === 'analytics' ? 'Resumen de analíticas' : 'Configuración general'}</h2>
                    </div>
                    <div className="editorial-workspace__actions">
                      <span>{sessionEmail}</span>
                      <button className="ghost-admin" type="button" onClick={() => setOpenAdmin(false)}>Ver sitio</button>
                      <button className="ghost-admin" type="button" onClick={resetDrafts}>Descartar cambios</button>
                    </div>
                  </div>

                {!canEdit ? <div className="editor-warning">Acceso autorizado, pero no coincide con el correo administrador permitido en RLS: {ADMIN_EMAIL}</div> : null}

                <div className="architect-admin__quickbar">
                  <button className={adminWorkspace === 'software' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('software')}>Software</button>
                  <button className={adminWorkspace === 'civil' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('civil')}>Civil</button>
                  <button className={adminWorkspace === 'settings' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('settings')}>Ajustes</button>
                  <button className={adminWorkspace === 'analytics' ? 'is-active' : ''} type="button" onClick={() => setAdminWorkspace('analytics')}>Analíticas</button>
                </div>

                {adminWorkspace === 'settings' ? (
                  <section className="editor-card">
                    <div className="editor-card__head"><h3>Perfil general</h3><button className="ghost-admin" type="button" onClick={() => setProfileForm(toForm(profile))}>Restablecer</button></div>
                    <div className="editor-grid">{profileFields.map(renderProfileField)}</div>
                    <div className="editor-actions"><button className="primary-cta" type="button" disabled={!canEdit} onClick={saveProfile}>Guardar perfil</button></div>
                  </section>
                ) : null}

                {adminWorkspace === 'software' ? (
                  <section className="editor-card editor-card--hero">
                    <div className="editor-card__head"><h3>Perfil de ingeniería de software</h3><button className="ghost-admin" type="button" disabled={!canEdit} onClick={saveProfile}>Guardar cambios</button></div>
                    <label className="editor-field editor-field--full"><span>CV profesional</span><textarea rows={6} value={profileForm.software_about_body} onChange={(event) => handleProfileField('software_about_body', event.target.value)} /></label>
                  </section>
                ) : null}

                {adminWorkspace === 'software' ? (
                  <section className="editor-card">
                    <div className="editor-card__head"><h3>Tarjetas de habilidades de software</h3><button className="ghost-admin" type="button" onClick={() => setEditableHabilidades((current) => [...current, { ...newSkill({ sort_order: current.length + 1 }), localId: crypto.randomUUID() }])}>Agregar</button></div>
                    <div className="editor-list">
                      {editableHabilidades.map((item, index) => (
                        <article className="editor-block" key={item.localId}>
                          <div className="editor-block__head"><strong>Habilidad {index + 1}</strong><button className="ghost-admin" type="button" onClick={() => setEditableHabilidades((current) => current.filter((entry) => entry.localId !== item.localId))}>Eliminar</button></div>
                          <div className="editor-grid editor-grid--compact">
                            <label className="editor-field"><span>Título</span><input value={item.name} onChange={(event) => handleEditableUpdate(setEditableHabilidades, item.localId, { name: event.target.value })} /></label>
                            <label className="editor-field"><span>Nivel</span><input value={item.level} onChange={(event) => handleEditableUpdate(setEditableHabilidades, item.localId, { level: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Descripción</span><textarea rows={3} value={item.description} onChange={(event) => handleEditableUpdate(setEditableHabilidades, item.localId, { description: event.target.value })} /></label>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="editor-actions"><button className="primary-cta" type="button" disabled={!canEdit} onClick={saveHabilidades}>Guardar skills</button></div>
                  </section>
                ) : null}

                {adminWorkspace === 'software' ? (
                  <section className="editor-card">
                    <div className="editor-card__head"><h3>Experiencia de software</h3><button className="ghost-admin" type="button" onClick={() => setEditableExperiencias((current) => [...current, { ...newExperiencia({ sort_order: current.length + 1 }), localId: crypto.randomUUID() }])}>Agregar</button></div>
                    <div className="editor-list">
                      {editableExperiencias.map((item, index) => (
                        <article className="editor-block" key={item.localId}>
                          <div className="editor-block__head"><strong>Experiencia {index + 1}</strong><button className="ghost-admin" type="button" onClick={() => setEditableExperiencias((current) => current.filter((entry) => entry.localId !== item.localId))}>Eliminar</button></div>
                          <div className="editor-grid editor-grid--compact">
                            <label className="editor-field"><span>Empresa</span><input value={item.company} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { company: event.target.value })} /></label>
                            <label className="editor-field"><span>Rol</span><input value={item.role} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { role: event.target.value })} /></label>
                            <label className="editor-field"><span>Periodo</span><input value={item.period} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { period: event.target.value })} /></label>
                            <label className="editor-field"><span>Ubicación</span><input value={item.location} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { location: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Bullets (una línea por item)</span><textarea rows={4} value={item.achievements} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { achievements: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Chips (separados por coma)</span><input value={item.stack} onChange={(event) => handleEditableUpdate(setEditableExperiencias, item.localId, { stack: event.target.value })} /></label>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="editor-actions"><button className="primary-cta" type="button" disabled={!canEdit} onClick={saveExperiencias}>Guardar experiencia</button></div>
                  </section>
                ) : null}

                {adminWorkspace === 'software' ? (
                  <section className="editor-card">
                    <div className="editor-card__head"><h3>Tarjetas de repositorios</h3><button className="ghost-admin" type="button" onClick={() => setEditableRepos((current) => [...current, { ...newRepo({ sort_order: current.length + 1 }), localId: crypto.randomUUID() }])}>Agregar</button></div>
                    <div className="editor-list">
                      {editableRepos.map((item, index) => (
                        <article className="editor-block" key={item.localId}>
                          <div className="editor-block__head"><strong>Repositorio {index + 1}</strong><button className="ghost-admin" type="button" onClick={() => setEditableRepos((current) => current.filter((entry) => entry.localId !== item.localId))}>Eliminar</button></div>
                          <div className="editor-grid editor-grid--compact">
                            <label className="editor-field"><span>Nombre</span><input value={item.name} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { name: event.target.value })} /></label>
                            <label className="editor-field"><span>Badge</span><input value={item.badge} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { badge: event.target.value })} /></label>
                            <label className="editor-field"><span>Stack</span><input value={item.stack} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { stack: event.target.value })} /></label>
                            <label className="editor-field"><span>Métrica</span><input value={item.metrics} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { metrics: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>URL</span><input value={item.url} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { url: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Descripción</span><textarea rows={3} value={item.description} onChange={(event) => handleEditableUpdate(setEditableRepos, item.localId, { description: event.target.value })} /></label>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="editor-actions"><button className="primary-cta" type="button" disabled={!canEdit} onClick={saveRepos}>Guardar repositorios</button></div>
                  </section>
                ) : null}

                {adminWorkspace === 'civil' ? (
                  <section className="editor-card editor-card--civil-bento">
                    <div className="editor-card__head"><h3>Sobre mí: perfil de ingeniería civil</h3><button className="ghost-admin" type="button" disabled={!canEdit} onClick={saveProfile}>Guardar bio</button></div>
                    <div className="editor-grid editor-grid--civil">
                      <label className="editor-field editor-field--full"><span>Introducción civil</span><textarea rows={6} value={profileForm.civil_intro} onChange={(event) => handleProfileField('civil_intro', event.target.value)} /></label>
                      <label className="editor-field"><span>Años totales</span><input value={profileForm.years_worked} onChange={(event) => handleProfileField('years_worked', event.target.value)} /></label>
                      <label className="editor-field"><span>Proyectos entregados</span><input value={String(civilProjects.length)} readOnly /></label>
                    </div>
                  </section>
                ) : null}

                {adminWorkspace === 'civil' ? (
                  <section className="editor-card">
                    <div className="editor-card__head"><h3>Bloques de contenido civil</h3><button className="ghost-admin" type="button" onClick={() => setEditableCivilItems((current) => [...current, { ...newCivilItem({ sort_order: current.length + 1 }), localId: crypto.randomUUID() }])}>Agregar</button></div>
                    <div className="editor-list">
                      {editableCivilItems.map((item, index) => (
                        <article className="editor-block" key={item.localId}>
                          <div className="editor-block__head"><strong>Ítem civil {index + 1}</strong><button className="ghost-admin" type="button" onClick={() => setEditableCivilItems((current) => current.filter((entry) => entry.localId !== item.localId))}>Eliminar</button></div>
                          <div className="editor-grid editor-grid--compact">
                            <label className="editor-field"><span>Sección</span><select value={item.section_key} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { section_key: event.target.value as CivilItem['section_key'] })}><option value="experience">experience</option><option value="projects">projects</option><option value="skills">skills</option></select></label>
                            <label className="editor-field"><span>Título</span><input value={item.title} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { title: event.target.value })} /></label>
                            <label className="editor-field"><span>Subtítulo</span><input value={item.subtitle} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { subtitle: event.target.value })} /></label>
                            <label className="editor-field"><span>Período / etiqueta</span><input value={item.period} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { period: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Descripción</span><textarea rows={3} value={item.description} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { description: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Enlace</span><input value={item.link} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { link: event.target.value })} /></label>
                            <label className="editor-field editor-field--full"><span>Etiquetas (coma)</span><input value={item.stack} onChange={(event) => handleEditableUpdate(setEditableCivilItems, item.localId, { stack: event.target.value })} /></label>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="editor-actions"><button className="primary-cta" type="button" disabled={!canEdit} onClick={saveCivilItems}>Guardar civil</button></div>
                  </section>
                ) : null}

                {adminWorkspace === 'analytics' ? (
                  <section className="editor-card analytics-view">
                    <div className="analytics-view__metrics">
                      <article><span>01 // Interacción del perfil</span><strong>{(profile.years_worked * 1200).toLocaleString()}</strong><small>+12,4% vs mes anterior</small></article>
                      <article><span>02 // Descargas de especificaciones civiles</span><strong>{civilProjects.length * 214}</strong><small>Actividad estable</small></article>
                      <article><span>03 // Redirecciones a GitHub</span><strong>{repos.length * 703}</strong><small>+5,8% de actividad</small></article>
                      <article><span>04 // Duración media de sesión</span><strong>04:12</strong><small>-0:15 de caída</small></article>
                    </div>
                    <div className="analytics-view__grid">
                      <article className="editor-block analytics-chart-card">
                        <div className="editor-card__head"><h3>Embudo de conversión y tráfico</h3><span>Mapa de interés interdisciplinario</span></div>
                        <div className="analytics-chart-card__canvas">
                          <svg viewBox="0 0 800 200" preserveAspectRatio="none">
                            <path d="M0,150 Q100,140 200,80 T400,100 T600,40 T800,60" fill="none" stroke="#183241" strokeWidth="3"></path>
                            <path d="M0,180 Q100,170 200,150 T400,130 T600,160 T800,140" fill="none" stroke="#9f402d" strokeDasharray="4 6" strokeWidth="2"></path>
                          </svg>
                        </div>
                      </article>
                      <article className="editor-block analytics-map-card">
                        <div className="editor-card__head"><h3>Origen de visitantes</h3><span>Distribución geoespacial</span></div>
                        <div className="analytics-map-card__visual"><strong>REGIÓN_PRINCIPAL</strong><span>{profile.contact_location_label}</span></div>
                        <div className="analytics-map-card__list">
                          <div><span>Estados Unidos</span><strong>42%</strong></div>
                          <div><span>Alemania</span><strong>18%</strong></div>
                          <div><span>Reino Unido</span><strong>12%</strong></div>
                          <div><span>Singapur</span><strong>9%</strong></div>
                        </div>
                      </article>
                    </div>
                    <article className="editor-block analytics-terminal">
                      <div className="editor-card__head"><h3>Salida de terminal en tiempo real</h3><span className="analytics-terminal__live"></span></div>
                      <table>
                        <thead><tr><th>Marca de tiempo</th><th>Evento de acción</th><th>Nodo de origen</th><th>Resultado</th></tr></thead>
                        <tbody>
                          <tr><td>14:22:09</td><td>DESC_DOC: Norma_Civil_v2.pdf</td><td>82.12.19.44</td><td><span className="terminal-chip terminal-chip--success">ÉXITO</span></td></tr>
                          <tr><td>14:18:55</td><td>REPOS_GIT: Plantillas_Terraform</td><td>104.22.4.1</td><td><span className="terminal-chip terminal-chip--success">ÉXITO</span></td></tr>
                          <tr><td>13:45:12</td><td>FALLA_AUTENTICACIÓN: Portal_Administrador</td><td>192.168.1.1</td><td><span className="terminal-chip terminal-chip--error">DENEGADO</span></td></tr>
                        </tbody>
                      </table>
                    </article>
                  </section>
                ) : null}

                <footer className="editor-status"><small>{status}</small>{error ? <small className="error-copy">{error}</small> : null}</footer>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  )
}









